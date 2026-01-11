#!/usr/bin/env python3
"""
Seed script to populate MongoDB with sample LMS data.
Run with: python scripts/seed_db.py
"""

import os
import sys
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path to import from api
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'api'))

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")

def seed_database():
    """Populate the database with sample courses, assignments, and users."""
    
    client = MongoClient(MONGO_URI)
    db = client["lms"]
    
    # Clear existing data
    print("Clearing existing data...")
    db.courses.delete_many({})
    db.assignments.delete_many({})
    db.submissions.delete_many({})
    db.users.delete_many({})
    
    # Create sample teachers
    print("Creating sample teachers...")
    teacher1_id = ObjectId()
    teacher2_id = ObjectId()
    
    teachers = [
        {
            "_id": teacher1_id,
            "clerkId": "teacher_demo_1",
            "email": "sarah.chen@ucsd.edu",
            "name": "Dr. Sarah Chen",
            "role": "teacher",
            "createdAt": datetime.now()
        },
        {
            "_id": teacher2_id,
            "clerkId": "teacher_demo_2",
            "email": "michael.torres@ucsd.edu",
            "name": "Prof. Michael Torres",
            "role": "teacher",
            "createdAt": datetime.now()
        }
    ]
    db.users.insert_many(teachers)
    
    # Create sample students
    print("Creating sample students...")
    student_ids = [ObjectId() for _ in range(15)]
    
    students = [
        {"_id": student_ids[0], "clerkId": "student_1", "email": "alice.wong@ucsd.edu", "name": "Alice Wong", "role": "student"},
        {"_id": student_ids[1], "clerkId": "student_2", "email": "bob.kim@ucsd.edu", "name": "Bob Kim", "role": "student"},
        {"_id": student_ids[2], "clerkId": "student_3", "email": "carlos.rivera@ucsd.edu", "name": "Carlos Rivera", "role": "student"},
        {"_id": student_ids[3], "clerkId": "student_4", "email": "diana.patel@ucsd.edu", "name": "Diana Patel", "role": "student"},
        {"_id": student_ids[4], "clerkId": "student_5", "email": "ethan.zhang@ucsd.edu", "name": "Ethan Zhang", "role": "student"},
        {"_id": student_ids[5], "clerkId": "student_6", "email": "fiona.chen@ucsd.edu", "name": "Fiona Chen", "role": "student"},
        {"_id": student_ids[6], "clerkId": "student_7", "email": "george.lee@ucsd.edu", "name": "George Lee", "role": "student"},
        {"_id": student_ids[7], "clerkId": "student_8", "email": "hannah.silva@ucsd.edu", "name": "Hannah Silva", "role": "student"},
        {"_id": student_ids[8], "clerkId": "student_9", "email": "ivan.petrov@ucsd.edu", "name": "Ivan Petrov", "role": "student"},
        {"_id": student_ids[9], "clerkId": "student_10", "email": "jade.martinez@ucsd.edu", "name": "Jade Martinez", "role": "student"},
        {"_id": student_ids[10], "clerkId": "student_11", "email": "kevin.oconnor@ucsd.edu", "name": "Kevin O'Connor", "role": "student"},
        {"_id": student_ids[11], "clerkId": "student_12", "email": "lily.nguyen@ucsd.edu", "name": "Lily Nguyen", "role": "student"},
        {"_id": student_ids[12], "clerkId": "student_13", "email": "marco.rossi@ucsd.edu", "name": "Marco Rossi", "role": "student"},
        {"_id": student_ids[13], "clerkId": "student_14", "email": "nina.johnson@ucsd.edu", "name": "Nina Johnson", "role": "student"},
        {"_id": student_ids[14], "clerkId": "student_15", "email": "omar.hassan@ucsd.edu", "name": "Omar Hassan", "role": "student"},
    ]
    db.users.insert_many(students)
    
    # Create sample courses
    print("Creating sample courses...")
    course1_id = ObjectId()
    course2_id = ObjectId()
    course3_id = ObjectId()
    course4_id = ObjectId()
    
    courses = [
        {
            "_id": course1_id,
            "code": "CSE 101",
            "name": "Data Structures & Algorithms",
            "description": "Fundamental data structures and algorithms with analysis and implementation.",
            "professorId": teacher1_id,
            "semester": "Spring 2026",
            "enrolledStudents": student_ids[:12],
            "createdAt": datetime.now(),
        },
        {
            "_id": course2_id,
            "code": "CSE 142",
            "name": "Computer Architecture",
            "description": "Introduction to computer organization, assembly language, and digital logic.",
            "professorId": teacher1_id,
            "semester": "Spring 2026",
            "enrolledStudents": student_ids[3:15],
            "createdAt": datetime.now(),
        },
        {
            "_id": course3_id,
            "code": "BIOL 20",
            "name": "Introduction to Biology",
            "description": "Survey of biological principles including genetics, ecology, and evolution.",
            "professorId": teacher2_id,
            "semester": "Spring 2026",
            "enrolledStudents": student_ids[:10],
            "createdAt": datetime.now(),
        },
        {
            "_id": course4_id,
            "code": "HIST 110",
            "name": "American History Since 1865",
            "description": "Survey of American history from Reconstruction to the present.",
            "professorId": teacher2_id,
            "semester": "Spring 2026",
            "enrolledStudents": student_ids[5:],
            "createdAt": datetime.now(),
        },
    ]
    db.courses.insert_many(courses)
    
    # Create sample assignments
    print("Creating sample assignments...")
    now = datetime.now()
    
    assignments = [
        {
            "_id": ObjectId(),
            "courseId": course1_id,
            "professorId": teacher1_id,
            "title": "Binary Search Tree Implementation",
            "description": "Implement a balanced BST with insert, delete, and search operations.",
            "instructions": "Create a Python implementation of a self-balancing binary search tree (AVL or Red-Black). Include unit tests and document the time complexity of each operation.",
            "dueDate": now + timedelta(days=7),
            "maxScore": 100,
            "isPublished": True,
            "createdAt": now - timedelta(days=3),
        },
        {
            "_id": ObjectId(),
            "courseId": course1_id,
            "professorId": teacher1_id,
            "title": "Graph Algorithms Lab",
            "description": "Implement Dijkstra's and Bellman-Ford shortest path algorithms.",
            "instructions": "Write implementations of both algorithms and compare their performance on different graph types. Submit a report with runtime analysis.",
            "dueDate": now + timedelta(days=14),
            "maxScore": 100,
            "isPublished": True,
            "createdAt": now - timedelta(days=1),
        },
        {
            "_id": ObjectId(),
            "courseId": course2_id,
            "professorId": teacher1_id,
            "title": "MIPS Assembly Program",
            "description": "Write a MIPS assembly program for matrix multiplication.",
            "instructions": "Implement matrix multiplication in MIPS assembly language. Use proper register conventions and include comments explaining your logic.",
            "dueDate": now + timedelta(days=10),
            "maxScore": 100,
            "isPublished": True,
            "createdAt": now - timedelta(days=5),
        },
        {
            "_id": ObjectId(),
            "courseId": course3_id,
            "professorId": teacher2_id,
            "title": "Homework 3: Cellular Energy",
            "description": "Questions on cellular respiration and photosynthesis.",
            "instructions": "Answer the questions in the textbook (Chapter 8, problems 1-15). Show all work for calculation problems. Include diagrams where appropriate.",
            "dueDate": now + timedelta(days=5),
            "maxScore": 50,
            "isPublished": True,
            "createdAt": now - timedelta(days=2),
        },
        {
            "_id": ObjectId(),
            "courseId": course4_id,
            "professorId": teacher2_id,
            "title": "Essay draft: Reconstruction era",
            "description": "First draft of your research essay on Reconstruction.",
            "instructions": "Submit a 5-7 page draft analyzing the successes and failures of Reconstruction. Include a thesis statement and at least 5 scholarly sources.",
            "dueDate": now + timedelta(days=12),
            "maxScore": 100,
            "isPublished": True,
            "createdAt": now - timedelta(days=10),
        },
        {
            "_id": ObjectId(),
            "courseId": course4_id,
            "professorId": teacher2_id,
            "title": "Reflection: Week 5 progress",
            "description": "Self-assessment of your learning progress this week.",
            "instructions": "Write a 1-2 page reflection on what you learned this week, what challenged you, and how you plan to improve going forward.",
            "dueDate": now + timedelta(days=2),
            "maxScore": 20,
            "isPublished": True,
            "createdAt": now - timedelta(days=7),
        },
    ]
    db.assignments.insert_many(assignments)
    
    print(f"\n✓ Seed complete!")
    print(f"  - {len(teachers)} teachers created")
    print(f"  - {len(students)} students created")
    print(f"  - {len(courses)} courses created")
    print(f"  - {len(assignments)} assignments created")
    print(f"\nYou can now log in with Clerk using any teacher/student email above.")
    print(f"Teacher 1: sarah.chen@ucsd.edu (clerkId: teacher_demo_1)")
    print(f"Teacher 2: michael.torres@ucsd.edu (clerkId: teacher_demo_2)")
    
    client.close()

if __name__ == "__main__":
    seed_database()
