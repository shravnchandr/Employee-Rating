# Janhavi Medicals - Employee Rating Portal

![Janhavi Medicals Logo](public/janhavi-logo.jpg)

**Since 1984**

A modern, Material 3 Expressive design employee performance evaluation system built specifically for Janhavi Medicals pharmacy.

## About Janhavi Medicals

Janhavi Medicals has been serving the community since 1984, providing quality pharmaceutical services and healthcare products. This employee rating portal helps maintain our high standards by facilitating comprehensive performance evaluations.

## Features

### 🎨 Material 3 Expressive Design
- **Asymmetric shapes** for visual interest
- **Expressive typography** with bold headlines
- **Gradient backgrounds** and decorative elements
- **Fluid animations** with spring physics
- **Ocean Blue & Teal** color palette

### � Employee Management
- Add and manage pharmacy staff
- Upload employee photos
- Track performance metrics
- View employee rankings

### ⭐ Rating System
- **Admin ratings** (60% weight) - Management evaluations
- **Peer ratings** (40% weight) - Colleague feedback
- **Weighted scoring** for comprehensive assessment
- **Category-based evaluation**: Communication, Teamwork, Quality, Productivity

### 📊 Analytics & Insights
- Performance trend charts
- Historical rating data
- Feedback tracking
- Individual employee analytics

### 🔒 Security
- Password-protected admin access
- Sensitive data protection
- Secure rating sessions

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with Material 3 Expressive design
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend**: JSON Server (for development)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

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
│   ├── janhavi-logo.jpg          # Company logo
│   └── janhavi-signage.jpg       # Store signage
├── src/
│   ├── components/
│   │   ├── auth/                 # Login components
│   │   ├── common/               # Reusable components
│   │   ├── dashboard/            # Admin dashboard
│   │   ├── history/              # Rating history
│   │   ├── rating/               # Rating interface
│   │   └── trends/               # Analytics charts
│   ├── services/                 # API services
│   ├── theme/                    # Material 3 theme config
│   ├── types/                    # TypeScript definitions
│   └── App.tsx                   # Main application
├── server/
│   └── index.js                  # JSON Server backend
└── package.json
```

## Available Scripts

- `npm run dev` - Start frontend only
- `npm run dev:server` - Start backend only
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Design System

### Colors (Ocean Blue & Teal)
- **Primary**: #0277BD (Ocean Blue)
- **Secondary**: #00897B (Teal)
- **Tertiary**: #00ACC1 (Cyan)
- **Surface**: #F1F8FB (Light Blue)
- **Backgrounds**: Gradients from #E3F2FD to #B3E5FC

### Typography
- **Display**: 52px, font-black
- **Headlines**: 32-36px, font-bold
- **Titles**: 24px, font-bold
- **Body**: 14-16px, font-normal

### Shapes
- **Asymmetric corners** for visual interest
- **Rounded elements** for approachability
- **Varied radii** for dynamic layouts

## Contributing

This is a proprietary system for Janhavi Medicals. For internal development inquiries, please contact the IT department.

## License

© 2024 Janhavi Medicals. All rights reserved.

---

**Janhavi Medicals** - Serving the community since 1984 🏥
