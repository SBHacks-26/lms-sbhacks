const mongoose = require("mongoose");

// IMPORT MODELS
const User = require("./db/user");
const Assignment = require("./db/assignment");
const ModifiedAssignment = require("./db/modifiedAssignment");
const DetectionResult = require("./db/detectionResult");

// CONNECT TO MONGODB
const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://admin:JfxU7wYYrQEaAkXR@lms.atwxuvd.mongodb.net/?appName=lmsn";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Promise.all([
      User.deleteMany({}),
      Assignment.deleteMany({}),
      ModifiedAssignment.deleteMany({}),
      DetectionResult.deleteMany({})
    ]);

    const teacher = await User.create({
      name: "Test Teacher",
      email: "teacher@test.com",
      password: "password",
      role: "professor"
    });

    const student = await User.create({
        name:"Test Student",
        email:"student@test.com",
        password:"Password",
        role: "student"
    })

    const assignment = await Assignment.create({
      title: "AI Detection Test",
      teacherId: teacher._id,
      originalPdfUrl: "https://example.com/original.pdf"
    });

    const modified = await ModifiedAssignment.create({
      assignmentId: assignment._id,
      fingerprintId: "FP-12345",
      modifiedPdfUrl: "https://example.com/modified.pdf"
    });

    await DetectionResult.create({
      assignmentId: assignment._id,
      fingerprintId: "FP-12345",
      aiLikelihoodScore: 0.18
    });

    console.log("🌱 Database seeded!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
