from io import BytesIO
from flask import Flask, request, send_file, jsonify
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from pymongo import MongoClient
from bson import ObjectId
import pypdf
import os
from dotenv import load_dotenv

load_dotenv()

from gemini import mutate_prompt, detect_indicators

app = Flask(__name__)

# MongoDB setup
mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
mongo_client = MongoClient(mongo_uri)
db = mongo_client["lms"]
homeworks_col = db["homeworks"]
submissions_col = db["submissions"]


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from PDF bytes."""
    pdf_file = BytesIO(pdf_bytes)
    reader = pypdf.PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text


def build_secret_replacement_pdf(visible_text: str, secret_text: str, output_path: str) -> bytes:
    """
    Generate a PDF with visible text but with secret text replacement via marked content.
    The visible_text is what appears on screen, secret_text is what copy/paste/accessibility sees.
    """
    page_size = letter
    font_size = 12
    margin = 50
    line_height = font_size * 1.2
    font_name = "Times-Roman"  # Reason: common assignment font
    
    # Use BytesIO if no output path specified
    if output_path is None:
        output_buffer = BytesIO()
        c = canvas.Canvas(output_buffer, pagesize=page_size)
    else:
        c = canvas.Canvas(output_path, pagesize=page_size)
    
    c.setFont(font_name, font_size)
    
    # Clean and split visible text into words
    clean_text = " ".join(visible_text.split())
    words = clean_text.split()
    
    # Layout: wrap text to fit page width
    lines = []
    current_line = []
    current_width = 0
    max_width = page_size[0] - 2 * margin
    space_w = c.stringWidth(" ", font_name, font_size)
    
    for word in words:
        w_w = c.stringWidth(word, font_name, font_size)
        if current_width + w_w > max_width and current_line:
            lines.append(current_line)
            current_line = [word]
            current_width = w_w + space_w
        else:
            current_line.append(word)
            current_width += w_w + space_w
    if current_line:
        lines.append(current_line)
    
    c.saveState()
    
    num_lines = len(lines)
    if num_lines == 0:
        c.restoreState()
        c.save()
        if output_path is None:
            output_buffer.seek(0)
            return output_buffer.getvalue()
        return True
    
    # Distribute secret_text across lines respecting word boundaries
    target_words = secret_text.split()
    total_len = len(secret_text)
    ideal_len = total_len / num_lines if num_lines > 0 else 0
    
    chunks = []
    current_chunk_words = []
    current_len = 0
    word_idx = 0
    n_words = len(target_words)
    
    for i in range(num_lines - 1):
        if word_idx >= n_words:
            chunks.append("")
            continue
        
        # Fill current line
        while word_idx < n_words:
            word = target_words[word_idx]
            w_len = len(word)
            
            if len(current_chunk_words) == 0:
                current_chunk_words.append(word)
                current_len += w_len
                word_idx += 1
            elif current_len + 1 + w_len <= ideal_len * 1.2:
                current_chunk_words.append(word)
                current_len += 1 + w_len
                word_idx += 1
            else:
                break
        
        chunks.append(" ".join(current_chunk_words))
        current_chunk_words = []
        current_len = 0
    
    # Last line gets the rest
    if word_idx < n_words:
        chunks.append(" ".join(target_words[word_idx:]))
    else:
        chunks.append("")
    
    # Draw lines with ActualText marked content
    y = page_size[1] - margin
    for i, line_words in enumerate(lines):
        x = margin
        line_str = " ".join(line_words)
        chunk = chunks[i] if i < len(chunks) and chunks[i] else " "
        
        # Escape special PDF characters
        esc_chunk = chunk.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        
        # Inject marked content with ActualText
        c._code.append(f"/Span <</ActualText ({esc_chunk})>> BDC")
        c.drawString(x, y, line_str)
        c._code.append("EMC")
        
        y -= line_height
    
    c.restoreState()
    c.save()
    
    if output_path is None:
        output_buffer.seek(0)
        return output_buffer.getvalue()
    return True


@app.route("/generate", methods=["POST"])
def generate():
    """Generate a homework PDF with invisible mutation for integrity checking."""
    data = request.get_json(silent=True) or {}
    visible_text = data.get("visible_text")
    teacher_id = data.get("teacher_id")
    assignment_id = data.get("assignment_id")
    
    if not isinstance(visible_text, str) or len(visible_text) == 0:
        return jsonify({"error": "Provide JSON with 'visible_text': string, 'teacher_id': string, 'assignment_id': string"}), 400
    
    # Use Gemini to suggest mutations
    mutation_result = mutate_prompt(prompt_text=visible_text)
    mutated_text = mutation_result["mutated"]
    mutations = mutation_result["mutations"]
    changes = mutation_result["changes"]
    
    # Generate PDF with visible/invisible split
    pdf_bytes = build_secret_replacement_pdf(visible_text=visible_text, secret_text=mutated_text, output_path=None)
    
    # Store homework metadata in MongoDB
    homework_doc = {
        "teacher_id": teacher_id,
        "assignment_id": assignment_id,
        "original_prompt": visible_text,
        "mutated_prompt": mutated_text,
        "mutations": mutations,
        "changes": changes
    }
    result = homeworks_col.insert_one(homework_doc)
    homework_id = str(result.inserted_id)
    
    return jsonify({
        "homework_id": homework_id,
        "original_prompt": visible_text,
        "mutated_prompt": mutated_text,
        "mutations": mutations,
        "changes": changes,
        "pdf_download": "/download/" + homework_id
    })


@app.route("/submit", methods=["POST"])
def submit():
    """Student submits their response (PDF or text) for integrity analysis."""
    data = request.form.to_dict()
    homework_id = data.get("homework_id")
    student_id = data.get("student_id")
    
    # Get uploaded file (PDF or text)
    file = request.files.get("file")
    response_text = data.get("response_text", "")
    
    if not homework_id or not student_id:
        return jsonify({"error": "Provide homework_id and student_id"}), 400
    
    # Retrieve homework metadata
    try:
        homework = homeworks_col.find_one({"_id": ObjectId(homework_id)})
    except:
        return jsonify({"error": "Invalid homework ID"}), 400
    
    if not homework:
        return jsonify({"error": "Homework not found"}), 404
    
    # Extract text from file if provided, else use response_text
    if file:
        try:
            pdf_bytes = file.read()
            response_text = extract_text_from_pdf(pdf_bytes=pdf_bytes)
        except:
            return jsonify({"error": "Failed to extract text from PDF"}), 400
    
    if not response_text:
        return jsonify({"error": "No response text provided"}), 400
    
    # Detect indicators in submission
    analysis = detect_indicators(
        student_text=response_text,
        original_prompt=homework["original_prompt"],
        secret_prompt=homework["mutated_prompt"],
        changes=homework.get("changes", [])
    )
    
    # Store submission and analysis in MongoDB
    submission_doc = {
        "homework_id": homework_id,
        "student_id": student_id,
        "response_text": response_text,
        "analysis": analysis
    }
    submissions_col.insert_one(submission_doc)
    
    return jsonify(analysis)


@app.route("/download/<homework_id>", methods=["GET"])
def download(homework_id: str):
    """Download the homework PDF (for students)."""
    try:
        homework = homeworks_col.find_one({"_id": ObjectId(homework_id)})
    except:
        return jsonify({"error": "Invalid homework ID"}), 400
    
    if not homework:
        return jsonify({"error": "Homework not found"}), 404
    
    pdf_bytes = build_secret_replacement_pdf(
        visible_text=homework["original_prompt"],
        secret_text=homework["mutated_prompt"],
        output_path=None
    )
    return send_file(
        BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name="homework.pdf"
    )


@app.route("/detect", methods=["POST"])
def detect():
    """Analyze student submission for specific indicators of LLM use."""
    original_prompt = request.form.get("original_prompt")
    secret_prompt = request.form.get("secret_prompt")
    changes = request.form.getlist("changes")
    
    file = request.files.get("file")
    student_text = request.form.get("student_text", "")
    
    if not original_prompt or not secret_prompt or not changes:
        return jsonify({"error": "Provide original_prompt, secret_prompt, and changes (list)"}), 400
    
    # Extract text from file if provided, else use student_text
    if file:
        try:
            pdf_bytes = file.read()
            student_text = extract_text_from_pdf(pdf_bytes=pdf_bytes)
        except:
            return jsonify({"error": "Failed to extract text from PDF"}), 400
    
    if not student_text:
        return jsonify({"error": "No student text provided"}), 400
    
    # Detect indicators
    detection_result = detect_indicators(
        student_text=student_text,
        original_prompt=original_prompt,
        secret_prompt=secret_prompt,
        changes=changes
    )
    
    return jsonify(detection_result)


if __name__ == "__main__":
    mode = os.environ.get("MODE", "serve")
    if mode == "write":
        sample = build_secret_replacement_pdf(visible_text="Hello visible world", secret_text="Hello hidden world", output_path=None)
        with open("secret_replacement_sample.pdf", "wb") as f:
            f.write(sample)
        print("Wrote secret_replacement_sample.pdf")
    else:
        app.run(host="127.0.0.1", port=5000)
