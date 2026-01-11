# Database Seeding Instructions

## Quick Start

Run the seed script to populate your MongoDB database with sample data:

```bash
python scripts/seed_db.py
```

## What Gets Created

The seed script creates:
- **2 teachers** (Dr. Sarah Chen, Prof. Michael Torres)
- **15 students** (various names)
- **4 courses** (CSE 101, CSE 142, BIOL 20, HIST 110)
- **6 assignments** across the courses

## Sample Login Credentials

After seeding, you can log in with Clerk using these emails:

### Teachers
- sarah.chen@ucsd.edu (Clerk ID: teacher_demo_1)
- michael.torres@ucsd.edu (Clerk ID: teacher_demo_2)

### Students
- alice.wong@ucsd.edu (Clerk ID: student_1)
- bob.kim@ucsd.edu (Clerk ID: student_2)
- (and 13 more students)

## How to Use

1. Make sure MongoDB is running
2. Run the seed script: `python scripts/seed_db.py`
3. Start the Flask API: `python api/app.py`
4. Start the Next.js frontend: `npm run dev`
5. Log in with Clerk using one of the sample emails above

## Re-seeding

The script clears existing data before seeding, so you can run it multiple times to reset your database to a clean state.

## Environment Variables

Make sure your `.env` file has:
```
MONGO_URI=mongodb://localhost:27017
```
