import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Database from 'better-sqlite3';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Database setup
const db = new Database('prompt2learn.db');
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    day_index INTEGER NOT NULL,
    day_title TEXT NOT NULL,
    lesson_index INTEGER NOT NULL,
    lesson_title TEXT NOT NULL,
    lesson_description TEXT,
    FOREIGN KEY(course_id) REFERENCES courses(id)
);
`);

// Helpers
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in environment');
  }
  return new GoogleGenerativeAI(apiKey);
}

// Auth endpoints (simple username/password, no sessions; frontend will store user id)
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    const info = stmt.run(username, passwordHash);
    return res.json({ id: info.lastInsertRowid, username });
  } catch (e) {
    if (e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'username already exists' });
    }
    return res.status(500).json({ error: 'failed to register' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  return res.json({ id: user.id, username: user.username });
});

// Generate study plan with Gemini
// Expected response JSON structure:
// {
//   "courseTitle": string,
//   "days": [
//     {
//       "dayIndex": number,
//       "dayTitle": string,
//       "lessons": [
//         { "title": string, "description": string }
//       ]
//     }, ... up to 7 days
//   ]
// }
app.post('/api/courses/generate', async (req, res) => {
  const { userId, prompt } = req.body || {};
  if (!userId || !prompt) return res.status(400).json({ error: 'userId and prompt required' });
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'user not found' });

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are Prompt2Learn, an expert course designer. Create a concise 7-day study plan with a compelling courseTitle. For each day 1..7, include a dayTitle and 3-5 short lessons with title and 1-2 sentence description. Return ONLY valid JSON following this schema: {"courseTitle": string, "days": [{"dayIndex": number, "dayTitle": string, "lessons": [{"title": string, "description": string}]}]}. Keep it actionable, no markdown.`;

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

    if (!plan || !Array.isArray(plan.days) || plan.days.length !== 7) {
      return res.status(502).json({ error: 'invalid plan structure from model' });
    }

    const insertCourse = db.prepare('INSERT INTO courses (user_id, prompt, title) VALUES (?, ?, ?)');
    const courseInfo = insertCourse.run(userId, prompt, plan.courseTitle || '7-Day Study Plan');
    const courseId = courseInfo.lastInsertRowid;

    const insertLesson = db.prepare(`INSERT INTO lessons (course_id, day_index, day_title, lesson_index, lesson_title, lesson_description) VALUES (?, ?, ?, ?, ?, ?)`);
    const insertMany = db.transaction((days) => {
      for (const day of days) {
        const dayIndex = day.dayIndex;
        const dayTitle = day.dayTitle || `Day ${dayIndex}`;
        for (let i = 0; i < day.lessons.length; i++) {
          const lesson = day.lessons[i];
          insertLesson.run(courseId, dayIndex, dayTitle, i + 1, lesson.title, lesson.description || '');
        }
      }
    });
    insertMany(plan.days);

    return res.json({ courseId, title: plan.courseTitle, days: plan.days });
  } catch (e) {
    return res.status(500).json({ error: 'generation failed', details: e.message });
  }
});

// List user courses
app.get('/api/courses', (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) return res.status(400).json({ error: 'userId query required' });
  const rows = db.prepare('SELECT id, title, prompt, created_at FROM courses WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  return res.json(rows);
});

// Get course with lessons
app.get('/api/courses/:courseId', (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = db.prepare('SELECT id, title, prompt, created_at FROM courses WHERE id = ?').get(courseId);
  if (!course) return res.status(404).json({ error: 'course not found' });
  const daysMap = new Map();
  const lessons = db.prepare('SELECT day_index, day_title, lesson_index, lesson_title, lesson_description FROM lessons WHERE course_id = ? ORDER BY day_index ASC, lesson_index ASC').all(courseId);
  for (const l of lessons) {
    if (!daysMap.has(l.day_index)) {
      daysMap.set(l.day_index, { dayIndex: l.day_index, dayTitle: l.day_title, lessons: [] });
    }
    daysMap.get(l.day_index).lessons.push({ title: l.lesson_title, description: l.lesson_description });
  }
  const days = Array.from(daysMap.values()).sort((a, b) => a.dayIndex - b.dayIndex);
  return res.json({ ...course, days });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Prompt2Learn backend running on http://localhost:${PORT}`);
});


