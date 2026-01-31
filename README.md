# Janhavi Medicals - Employee Rating Portal

![Janhavi Medicals Logo](public/janhavi-logo.jpg)

**Since 1984**

A modern, Material 3 Expressive design employee performance evaluation system built specifically for Janhavi Medicals pharmacy.

## About Janhavi Medicals

Janhavi Medicals has been serving the community since 1984, providing quality pharmaceutical services and healthcare products. This employee rating portal helps maintain our high standards by facilitating comprehensive performance evaluations conducted periodically (every 3-4 months).

## Features

### Employee Management
- Add, edit, and archive pharmacy staff
- Upload and update employee photos
- Configure default monthly leave allocation per employee
- Archive employees (soft delete) - data preserved for historical records
- Restore archived employees when needed
- Track performance metrics and rankings (sorted by weighted score)

### Performance Rating System
- **Attendance** (50% weight) - Based on leave records
- **Admin ratings** (30% weight) - Management evaluations
- **Peer ratings** (20% weight) - Colleague feedback
- **Weighted scoring** for comprehensive assessment
- **Customizable categories** - Admin can add/remove rating categories (default: Teamwork, Communication, Quality of Work, Reliability)

### Monitoring (Integrated with Ratings)
During both admin and peer rating sessions, raters can:
- **Report Rule Violations** - Select rules that may have been broken
- **Report Incomplete Tasks** - Flag tasks that weren't completed
- **Provide Feedback** - Optional text feedback for each employee

This monitoring approach provides visibility from multiple perspectives.

### Rules Compliance
- Define workplace rules
- View violations reported by peers (violation summary)
- Track violation history with reporter information
- Toggle rules active/inactive

### Daily Tasks
- Create recurring task templates
- Auto-generate daily tasks from templates
- Assign tasks to specific employees
- View tasks flagged as incomplete by peers

### Monthly Leave Management
- Set default leave allocation per employee
- Record monthly leaves taken
- Optionally track specific leave dates
- Override allocation for specific months
- View remaining leaves

### Analytics & Insights
- Performance trend charts
- Historical rating data
- Dashboard statistics (total employees, average score, top performer)
- Employee search and filter
- Feedback tracking
- Individual employee analytics

### Data Management
- **Export to Excel** - XLSX format with date filtering
- **Backup Data** - Download complete JSON backup
- **Restore Data** - Restore from backup file
- Summary sheet with statistics
- Individual sheets for employees, ratings, violations, task reports, leave records

### Security
- Password-protected admin access (changeable via UI)
- **Password hashing** (SHA-256)
- **Session timeout** (30 minutes of inactivity)
- **Rate limiting** (5 login attempts, 5-minute lockout)
- Secure rating sessions
- Confirmation dialogs for destructive actions

### Desktop App (Windows)
- Standalone Electron application
- Auto-updates via GitHub releases
- Manual "Check for Updates" button
- Local data storage in AppData

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with Material 3 Expressive design
- **Icons**: Lucide React
- **Charts**: Recharts
- **Export**: SheetJS (xlsx)
- **Backend**: Express.js with JSON file storage
- **Desktop**: Electron with electron-builder and electron-updater

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/shravnchandr/Employee-Rating.git
cd employee-rating-app
```

2. Install dependencies
```bash
npm install
```

3. Start the development servers
```bash
npm run dev:full
```

This runs both the frontend (port 5173) and backend (port 3001) concurrently.

### Default Credentials
- **Admin Password**: `admin123`

## Project Structure

```
employee-rating-app/
├── public/
│   └── janhavi-logo.jpg          # Company logo
├── src/
│   ├── components/
│   │   ├── admin/                # Admin selection view
│   │   ├── attendance/           # Leave tracker
│   │   ├── auth/                 # Login components
│   │   ├── common/               # Reusable components
│   │   ├── dashboard/            # Admin dashboard with stats & search
│   │   ├── data/                 # Data management (export/backup/restore)
│   │   ├── employees/            # Employee management (with archive)
│   │   ├── history/              # Rating history
│   │   ├── rating/               # Rating interface
│   │   ├── rules/                # Rules compliance
│   │   ├── tasks/                # Daily tasks
│   │   └── trends/               # Analytics charts
│   ├── services/                 # API services
│   ├── theme/                    # Material 3 theme config
│   ├── types/                    # TypeScript definitions
│   ├── utils/                    # Utility functions (export, password)
│   └── App.tsx                   # Main application
├── server/
│   ├── data/
│   │   └── db.json               # JSON database (auto-created)
│   └── index.js                  # Express backend
├── electron/
│   ├── main.cjs                  # Electron main process
│   ├── preload.cjs               # Secure IPC bridge
│   └── dataManager.cjs           # Local file operations
└── package.json
```

## Available Scripts

- `npm run dev` - Start frontend only
- `npm run server` - Start backend only
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run dev:electron` - Run Electron app in dev mode
- `npm run build:electron` - Build Windows installer
- `npm run publish` - Build and publish to GitHub releases

## Data Model

### Employee
- ID, Name, Photo, Avatar color, Leaves per month, isArchived flag

### Rating
- Rater info, Rated employee, Category, Rating value, Feedback, Timestamp

### Rule & Violation
- Rule name, Active status
- Violation: Employee, Rule, Date, Reporter info

### Task & Incomplete Report
- Task templates (recurring) and daily tasks
- Incomplete reports: Task, Employee, Reporter info

### Monthly Leave Record
- Employee, Month, Allocated leaves, Leaves taken, Leave dates

## Design System

### Colors (Ocean Blue & Teal)
- **Primary**: #0277BD (Ocean Blue)
- **Secondary**: #00897B (Teal)
- **Tertiary**: #00ACC1 (Cyan)
- **Surface**: #F1F8FB (Light Blue)
- **Error/Violations**: #D32F2F (Red)
- **Warning/Tasks**: #E65100 (Orange)

### Typography
- **Display**: 52px, font-black
- **Headlines**: 32-36px, font-bold
- **Titles**: 24px, font-bold
- **Body**: 14-16px, font-normal

### Shapes
- Asymmetric corners for visual interest
- Rounded elements for approachability
- Varied radii for dynamic layouts

## License

Proprietary - Janhavi Medicals. All rights reserved.

---

**Janhavi Medicals** - Serving the community since 1984
