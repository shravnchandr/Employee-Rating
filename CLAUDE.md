# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev:full    # Start both frontend (port 5173) and backend (port 3001) concurrently
npm run dev         # Start frontend only
npm run server      # Start backend only
npm run build       # TypeScript compile + Vite build
npm run lint        # Run ESLint

# Electron Desktop App
npm run dev:electron    # Dev mode with hot reload
npm run build:electron  # Build Windows installer
npm run publish         # Build + publish to GitHub releases (requires GH_TOKEN)
```

Requires Node.js v18+.

## Architecture Overview

Employee management system with a React/TypeScript frontend and Express.js backend. Features include performance ratings, peer monitoring (rules & tasks), monthly leave management, and data export.

### Frontend (src/)
- **State Management**: Centralized in `App.tsx` using React hooks - no external state library
- **React Compiler**: Enabled via babel-plugin-react-compiler in vite.config.ts
- **Styling**: Tailwind CSS with Material 3 Expressive design system (`src/theme/index.ts`)
- **Charts**: Recharts for analytics visualization
- **Icons**: lucide-react
- **Export**: xlsx (SheetJS) for Excel export

### Backend (server/)
- Express.js server with JSON file storage (`server/data/db.json`)
- Two endpoints: `GET /api/data` and `POST /api/save`
- Frontend proxies `/api` requests to backend via Vite config
- Employee photos stored as base64 in db.json (5MB limit enforced in frontend)

### Electron Desktop App (electron/)
- **Main Process** (`electron/main.cjs`): Window management, IPC handlers, auto-updater
- **Preload** (`electron/preload.cjs`): Secure IPC bridge between main and renderer
- **Data Manager** (`electron/dataManager.cjs`): File operations for `%APPDATA%/employee-rating-app/data/db.json`
- **Auto-updates**: Uses electron-updater with GitHub releases; manual "Check for Updates" button in admin dashboard
- **Security**: Context isolation, sandbox mode, CSP, navigation blocking
- **Note**: Electron files use `.cjs` extension for CommonJS compatibility with `"type": "module"` in package.json

### Data Model
All data persisted to `server/data/db.json` (or `%APPDATA%` in Electron):
- `employees` - Staff members with photo (base64), avatar, `leavesPerMonth` allocation, and `isArchived` flag
- `ratings` - Performance ratings with weighted scoring (50% attendance, 30% admin, 20% peer)
- `categories` - Customizable rating categories (default: Teamwork, Communication, Quality of Work, Reliability)
- `taskTemplates` - Recurring task definitions assigned to employees
- `dailyTasks` - Auto-generated daily from active templates
- `rules` - Compliance rules (active/inactive)
- `violations` - Rule violations with `reportedBy` and `reporterName` (peer-reported)
- `taskIncompleteReports` - Tasks reported incomplete by peers during rating
- `monthlyLeaves` - Monthly leave records with allocated/taken counts and optional dates
- `adminPassword` - Hashed admin login password (SHA-256, default: `admin123`, changeable via UI)

### View Routing
String-based view state in `App.tsx`: `login` → `adminSelection` → module views (`admin`, `employees`, `tasks`, `rules`, `attendance`, `data`) → `employee`/`adminRating` for rating flow.

### Security
- **Password Hashing**: SHA-256 via Web Crypto API (see `src/utils/password.ts`)
- **Session Timeout**: 30 minutes of inactivity auto-logout
- **Rate Limiting**: 5 failed login attempts trigger 5-minute lockout
- Confirmation dialogs for destructive actions

## Key Files
- `src/App.tsx` - Main state container, all handlers, view routing
- `src/services/api.ts` - API communication layer
- `src/theme/index.ts` - Material 3 theme (colors, typography, shapes, animations)
- `src/types/index.ts` - TypeScript interfaces
- `src/utils/exportData.ts` - Excel export utility
- `src/utils/password.ts` - Password hashing (SHA-256)

## Important Patterns
- Data auto-saves on state change (after initial load completes via `isDataLoaded` flag)
- Daily tasks auto-populate from active templates each day
- **Peer Monitoring**: Rule violations and incomplete tasks can be reported during both admin and peer rating flows
- **Score Weightage**: 50% attendance (based on leaves), 30% admin ratings, 20% peer ratings
- Employee rankings in the ratings dashboard are sorted by weighted score (highest first)
- Monthly leave records are per-employee per-month with optional specific dates
- **Data Management**: Dedicated module for Export (XLSX), Backup (JSON), and Restore operations
- **Employee Archive**: Soft delete pattern - archived employees hidden from active views but data preserved
- **Category Management**: Admin can add/remove rating categories from the Employee Ratings dashboard
- Admin password hashed with SHA-256, changeable via "Change Password" in admin dashboard
- Ratings conducted periodically (every 3-4 months), not daily

## Component Structure
- `src/components/admin/` - Admin selection dashboard (module navigation)
- `src/components/attendance/` - LeaveTracker (monthly leave management)
- `src/components/auth/` - Login view with rate limiting
- `src/components/common/` - Reusable components (FloatingLabelInput, RatingButton)
- `src/components/dashboard/` - Employee ratings view with stats, search, and category management
- `src/components/data/` - Data Management (export/backup/restore)
- `src/components/employees/` - Employee management with archive/restore functionality
- `src/components/history/` - Rating history views
- `src/components/rating/` - Rating flow with peer monitoring
- `src/components/rules/` - Rules management and violation summary
- `src/components/tasks/` - Task templates and daily tasks view
- `src/components/trends/` - Performance trend charts
