# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev:full    # Start both frontend (port 5173) and backend (port 3001) concurrently
npm run dev         # Start frontend only
npm run server      # Start backend only
npm run build       # TypeScript compile + Vite build
npm run lint        # Run ESLint
```

Requires Node.js v18+.

## Architecture Overview

Employee management system with a React/TypeScript frontend and Express.js backend. Features include performance ratings, daily task management, attendance tracking, and rules compliance.

### Frontend (src/)
- **State Management**: Centralized in `App.tsx` using React hooks - no external state library
- **React Compiler**: Enabled via babel-plugin-react-compiler in vite.config.ts
- **Styling**: Tailwind CSS with Material 3 Expressive design system (`src/theme/index.ts`)
- **Charts**: Recharts for analytics visualization
- **Icons**: lucide-react

### Backend (server/)
- Express.js server with JSON file storage (`server/data/db.json`)
- Two endpoints: `GET /api/data` and `POST /api/save`
- Frontend proxies `/api` requests to backend via Vite config
- Employee photos stored as base64 in db.json (5MB limit enforced in frontend)

### Data Model
All data persisted to `server/data/db.json`:
- `employees` - Staff members with photo (base64) or auto-generated avatar
- `ratings` - Performance ratings with weighted scoring (admin 60%, peer 40%)
- `categories` - Rating categories (Teamwork, Communication, Quality of Work, Reliability)
- `taskTemplates` - Recurring task definitions assigned to employees
- `dailyTasks` - Auto-generated daily from active templates
- `rules` - Compliance rules
- `violations` - Rule violation records
- `attendance` - Daily attendance (auto-defaults to "present")

### View Routing
String-based view state in `App.tsx`: `login` → `adminSelection` → module views (`admin`, `employees`, `tasks`, `rules`, `attendance`) → `employee`/`adminRating` for rating flow.

## Key Files
- `src/App.tsx` - Main state container, all handlers, view routing
- `src/services/api.ts` - API communication layer
- `src/theme/index.ts` - Material 3 theme (colors, typography, shapes, animations)
- `src/types/index.ts` - TypeScript interfaces

## Important Patterns
- Data auto-saves on state change (after initial load completes via `isDataLoaded` flag)
- Daily tasks auto-populate from active templates each day
- Attendance defaults all employees to "present" when viewing a date
- `markAttendance` in App.tsx prevents duplicate records by checking employee+date
- Admin login password: `admin123`
