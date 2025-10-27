import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
// 1. IMPORT pg client for PostgreSQL
import pg from 'pg';

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173', // Development frontend
    'https://prompt2learn.netlify.app', // Your actual Netlify domain
    'https://*.netlify.app' // Allow all Netlify domains (including previews)
  ],
  credentials: true
}));
app.use(express.json());

// =======================================================
// 2. DATABASE SETUP: Use pg.Pool instead of better-sqlite3
// =======================================================
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Reads from .env
  ssl: {
    rejectUnauthorized: false, // May be required for some Neon setups, though their string should handle it
  }
});

// Test connection and create tables
(async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL via Pool.');

    // 3. POSTGRES TABLE CREATION LOGIC
    // Using BIGSERIAL for auto-incrementing IDs and TEXT/TIMESTAMP types
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Useful for creating UUIDs later, but not strictly needed for this schema
      
      -- USERS TABLE
      CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- COURSES TABLE
      CREATE TABLE IF NOT EXISTS courses (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL,
          prompt TEXT NOT NULL,
          title TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- LESSONS TABLE
      CREATE TABLE IF NOT EXISTS lessons (
          id BIGSERIAL PRIMARY KEY,
          course_id BIGINT NOT NULL,
          day_index INTEGER NOT NULL,
          day_title TEXT NOT NULL,
          lesson_index INTEGER NOT NULL,
          lesson_title TEXT NOT NULL,
          lesson_description TEXT,
          FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);
    client.release();
    console.log('PostgreSQL tables checked/created successfully.');
  } catch (err) {
    console.error('PostgreSQL connection or table creation failed:', err.message);
    process.exit(1);
  }
})();
// =======================================================

// Helpers
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in environment');
  }
  return new GoogleGenerativeAI(apiKey);
}

// =======================================================
// 4. API HANDLER MODIFICATIONS (Using Pool for queries)
// =======================================================

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    // Use parameterized query with $1, $2, etc.
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
      [username, passwordHash]
    );
    // PostgreSQL returns new ID in `rows[0].id`
    return res.json({ id: result.rows[0].id, username });
  } catch (e) {
    // Check for PostgreSQL unique constraint violation (Error code 23505)
    if (e.code === '23505') {
      return res.status(409).json({ error: 'username already exists' });
    }
    return res.status(500).json({ error: 'failed to register', details: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  // Use parameterized query
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];

  if (!user) return res.status(401).json({ error: 'User not registered' });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid Credentials' });

  return res.json({ id: user.id, username: user.username });
});

// Generate study plan with Gemini
app.post('/api/courses/generate', async (req, res) => {
  const { userId, prompt } = req.body || {};
  if (!userId || !prompt) return res.status(400).json({ error: 'userId and prompt required' });

  const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
  if (userResult.rowCount === 0) return res.status(404).json({ error: 'user not found' });

  let client;
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are Prompt2Learn, an expert course designer. Your goal is to create a high-quality, comprehensive learning path based on the user's request.

1. **Duration:** Analyze the user's learning goal and **consider the number of days given by the user to determine the optimal path** for a comprehensive study plan. If no timeline is given, give the optimal plan for 7 days.
2. **Structure:** Create this day-by-day study plan with a compelling courseTitle. For each day, include a dayTitle and 3-5 distinct lessons.
3. **Detail Requirement:** The 'description' field for each lesson **must follow the user's prompt
strictly and the length and content should be appropriate to that**. This description should provide an in-depth summary 
of the topic, practical application goals, and key concepts or tasks for that specific lesson.
    **Do NOT use short or brief descriptions.**

    Crucial Denial Rules
    This is key: If a prompt violates our standards, you must deny it.

    i. Deny Vulgar or Inappropriate Content: If the prompt is vulgar, contains hate speech, or is generally inappropriate for a professional learning environment, or asks for **explicit sexual content**, reject it immediately.

    ii. Deny Unrelated or Non-Educational Prompts: If the user asks for something completely unrelated to creating a detailed lesson summary—like a joke, a life philosophy, or general conversation—it must be denied. Our sole purpose here is education and content creation.

    iii. Deny Vague or Undetailed Prompts: If a prompt is too vague to create a substantial, in-depth description, or if the user explicitly asks you to violate the detail requirement (e.g., 'give me a one-sentence description'), you must deny it.

    In case of denial, you are not supposed to return any JSON format, return nothing to the client.

Return ONLY valid JSON following this schema when the request is valid: 
{"courseTitle": string, "days": [{"dayIndex": number, "dayTitle": string, 
"lessons": [{"title": string, "description": string}]}]}. Keep the JSON content clean and actionable, with no markdown or extra text.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `User prompt: ${prompt}` }
    ]);
    const text = result.response.text();
    // Attempt to parse JSON from response (strip code fences if any)
    const jsonString = text.replace(/^```json\n?|\n?```$/g, '').trim();
    let plan;
    try {
      plan = JSON.parse(jsonString);
    } catch (e) {
      // Try to extract JSON via simple heuristic
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        plan = JSON.parse(text.slice(firstBrace, lastBrace + 1));
      } else {
        throw new Error('Model did not return valid JSON');
      }
    }

    if (!plan || !Array.isArray(plan.days) || plan.days.length === 0) {
      return res.status(502).json({ error: 'invalid plan structure from model' });
    }

    // Start a transaction for inserting course and lessons
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Insert Course
    const insertCourseQuery = 'INSERT INTO courses (user_id, prompt, title) VALUES ($1, $2, $3) RETURNING id';
    const courseResult = await client.query(insertCourseQuery, [userId, prompt, plan.courseTitle || '7-Day Study Plan']);
    const courseId = courseResult.rows[0].id;

    // 2. Prepare for Lesson Inserts
    const insertLessonQuery = `INSERT INTO lessons (course_id, day_index, day_title, lesson_index, lesson_title, lesson_description) 
                               VALUES ($1, $2, $3, $4, $5, $6)`;

    // 3. Insert all Lessons
    for (const day of plan.days) {
      const dayIndex = day.dayIndex;
      const dayTitle = day.dayTitle || `Day ${dayIndex}`;
      for (let i = 0; i < day.lessons.length; i++) {
        const lesson = day.lessons[i];
        await client.query(insertLessonQuery, [
          courseId,
          dayIndex,
          dayTitle,
          i + 1,
          lesson.title,
          lesson.description || ''
        ]);
      }
    }

    await client.query('COMMIT');

    return res.json({ courseId, title: plan.courseTitle, days: plan.days });
  } catch (e) {
    if (client) {
      await client.query('ROLLBACK'); // Rollback on any error
    }
    return res.status(500).json({ error: 'generation or database transaction failed', details: e.message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// List user courses
app.get('/api/courses', async (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) return res.status(400).json({ error: 'userId query required' });

  try {
    // Use parameterized query and standard column names
    const result = await pool.query(
      'SELECT id, title, prompt, created_at FROM courses WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    // PostgreSQL returns rows in the `rows` property
    return res.json(result.rows);
  } catch (e) {
    return res.status(500).json({ error: 'failed to fetch courses', details: e.message });
  }
});

app.delete('/api/courses/:courseId', async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);
  if (isNaN(courseId)) {
    return res.status(400).json({ success: false, message: 'Invalid course ID format' });
  }

  let client;
  try {
    // Start a transaction
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Delete from the 'lessons' table (dependent table)
    // The ON DELETE CASCADE constraint added during table creation would handle this automatically,
    // but manually deleting lessons first is safer and mirrors the original intent.
    await client.query('DELETE FROM lessons WHERE course_id = $1', [courseId]);

    // 2. Delete the course itself
    const deleteCourseResult = await client.query('DELETE FROM courses WHERE id = $1', [courseId]);

    await client.query('COMMIT'); // Commit the transaction

    if (deleteCourseResult.rowCount > 0) {
      res.json({ success: true, message: 'Course and all related data deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Course not found' });
    }
  } catch (error) {
    if (client) await client.query('ROLLBACK'); // Rollback on error
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
});

// Get course with lessons
app.get('/api/courses/:courseId', async (req, res) => {
  const courseId = Number(req.params.courseId);

  try {
    // Get the course details
    const courseResult = await pool.query('SELECT id, title, prompt, created_at FROM courses WHERE id = $1', [courseId]);
    const course = courseResult.rows[0];
    if (!course) return res.status(404).json({ error: 'course not found' });

    // Get all lessons for the course
    const lessonsResult = await pool.query(
      'SELECT day_index, day_title, lesson_index, lesson_title, lesson_description FROM lessons WHERE course_id = $1 ORDER BY day_index ASC, lesson_index ASC',
      [courseId]
    );
    const lessons = lessonsResult.rows;

    // Reconstruct the nested structure
    const daysMap = new Map();
    for (const l of lessons) {
      if (!daysMap.has(l.day_index)) {
        daysMap.set(l.day_index, { dayIndex: l.day_index, dayTitle: l.day_title, lessons: [] });
      }
      daysMap.get(l.day_index).lessons.push({ title: l.lesson_title, description: l.lesson_description });
    }
    const days = Array.from(daysMap.values()).sort((a, b) => a.dayIndex - b.dayIndex);

    return res.json({ ...course, days });
  } catch (e) {
    return res.status(500).json({ error: 'failed to fetch course details', details: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Prompt2Learn backend running on http://localhost:${PORT}`);
});