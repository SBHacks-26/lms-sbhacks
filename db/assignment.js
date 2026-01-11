const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    instructions: { type: String, required: true }, // Original instructions written by professor
    dueDate: { type: Date, required: true },
    maxScore: { type: Number, default: 100 },
    isPublished: { type: Boolean, default: false }, // Whether assignment is published to students
    status: {
        type: String,
        enum: ['draft', 'instructions_saved', 'modifications_generated', 'pdf_generated', 'published'],
        default: 'draft'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
