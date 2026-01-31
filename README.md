# Janhavi Medicals - Employee Rating Portal

![Janhavi Medicals Logo](public/janhavi-logo.jpg)

**Since 1984**

A modern, Material 3 Expressive design employee performance evaluation system built specifically for Janhavi Medicals pharmacy.

## About Janhavi Medicals

Janhavi Medicals has been serving the community since 1984, providing quality pharmaceutical services and healthcare products. This employee rating portal helps maintain our high standards by facilitating comprehensive performance evaluations.

## Features

### Employee Management
- Add, edit, and remove pharmacy staff
- Upload and update employee photos
- Configure default monthly leave allocation per employee
- Track performance metrics and rankings (sorted by weighted score)

### Performance Rating System
- **Admin ratings** (60% weight) - Management evaluations
- **Peer ratings** (40% weight) - Colleague feedback
- **Weighted scoring** for comprehensive assessment
- **Category-based evaluation**: Teamwork, Communication, Quality of Work, Reliability

### Monitoring (Integrated with Ratings)
During both admin and peer rating sessions, raters can:
- **Report Rule Violations** - Select rules that may have been broken
- **Report Incomplete Tasks** - Flag tasks that weren't completed
- **Provide Feedback** - Optional text feedback for each employee

This monitoring approach provides visibility from multiple perspectives.

### Rules Compliance
- Define workplace rules
- View violations reported by peers
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
- Feedback tracking
- Individual employee analytics

### Data Export
- Export all data to Excel (XLSX format)
- Summary sheet with statistics
- Individual sheets for employees, ratings, violations, task reports, leave records
- Per-employee detailed reports

### Security
- Password-protected admin access (changeable via UI)
- Secure rating sessions

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
│   │   ├── dashboard/            # Admin dashboard
│   │   ├── employees/            # Employee management
│   │   ├── history/              # Rating history
│   │   ├── rating/               # Rating interface
│   │   ├── rules/                # Rules compliance
│   │   ├── tasks/                # Daily tasks
│   │   └── trends/               # Analytics charts
│   ├── services/                 # API services
│   ├── theme/                    # Material 3 theme config
│   ├── types/                    # TypeScript definitions
│   ├── utils/                    # Utility functions (export)
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
- ID, Name, Photo, Avatar color, Leaves per month

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
