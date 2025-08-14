Prompt2Learn
=============

Full-stack app that generates 7-day AI study modules using Gemini and stores them in SQLite. Includes simple username/password login (no middleware), dashboard, and course viewer.

Setup
-----

Backend
- cd backend
- npm i
- Set env var GEMINI_API_KEY to your Gemini API key (PowerShell: `$env:GEMINI_API_KEY="YOUR_KEY"`)
- npm run dev

Frontend
- cd frontend
- npm i
- npm run dev

Local URLs
- Backend: http://localhost:4000
- Frontend: http://localhost:5173

API Response Shape (from Gemini)
- courseTitle: string
- days: array of 7 items, each with:
  - dayIndex: number 1..7
  - dayTitle: string
  - lessons: array of { title: string, description: string }


