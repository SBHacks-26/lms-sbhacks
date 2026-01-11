const mongoose = require('mongoose');

const modifiedAssignmentSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, unique: true },
    modifiedInstructions: { type: String, required: true }, // Instructions with hidden traps/modifications
    modifiedPdfUrl: { type: String }, // URL/path to PDF generated from modified instructions (generated after instructions are modified)
    modifiedPdfHash: { type: String }, // Hash of modified PDF for verification
    // Store the modifications made (hidden traps/markers)
    modifications: [{
        originalText: { type: String, required: true }, // What appears visually in original instructions (e.g., "6 apples")
        modifiedText: { type: String, required: true }, // What appears when pasted to AI (e.g., "11 apples")
        position: {
            startIndex: Number, // Character position in text
            endIndex: Number,
            page: Number // If PDF position is tracked
        },
        modificationType: { type: String, enum: ['number', 'word', 'phrase', 'character', 'punctuation'], default: 'number' },
        geminiSuggestion: { type: String } // Original suggestion from Gemini API
    }],
    totalModifications: { type: Number, required: true, default: 0 }, // Total count of modifications/traps
    // Gemini API integration fields
    geminiApiStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    geminiApiResponse: mongoose.Schema.Types.Mixed, // Store Gemini API response for reference
    pdfGenerationStatus: {
        type: String,
        enum: ['pending', 'generating', 'completed', 'failed'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ModifiedAssignment || mongoose.model('ModifiedAssignment', modifiedAssignmentSchema);
