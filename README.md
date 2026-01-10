# 🌟 Employee Rating Application

A modern, high-performance employee performance management system built with **React**, **Vite**, and **Material 3 Expressive Design**. This platform enables organizations to manage employee information, conduct performance reviews, and visualize data-driven trends.

---

## ✨ Key Features

- **🚀 Expressive UI**: Leveraging Material 3 principles for a premium, accessible, and fluid user experience.
- **📊 Performance Analytics**: Visual representation of rating trends using Recharts.
- **🛠 Admin Dashboard**: Comprehensive management of employees and rating categories.
- **👥 Dual Perspectives**: Supports both admin and peer rating systems for balanced feedback.
- **📱 Responsive Design**: Works seamlessly across desktop and mobile browsers.
- **🔒 Secure View**: Password-protected sensitive data toggles in the admin view.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

### Backend
- **Server**: [Express](https://expressjs.com/)
- **Storage**: JSON-based persistent storage (`server/data/db.json`)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee-rating-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   The application uses `concurrently` to run both the frontend and backend servers with a single command:
   ```bash
   npm run dev:full
   ```

The app will be available at `http://localhost:5173` and the API at `http://localhost:3001`.

---

## 📂 Project Structure

```text
├── server/            # Express backend server
│   ├── data/          # JSON database storage
│   └── index.js       # Server entry point
├── src/               # React frontend source
│   ├── components/    # Modular UI components
│   ├── services/      # API communication layer
│   ├── theme/         # Material 3 tokens and styling
│   └── types/         # TypeScript interfaces
└── public/            # Static assets
```

---

## 🔧 Core Workflows

- **Login**: Accessed via employee name. Admin login uses `admin` as the name.
- **Rating**: Select an employee, rate across categories (Teamwork, Communication, etc.), and provide optional feedback.
- **Admin**: Toggle sensitive data with password `admin123` to view weighted scores and historical trends.

---

## 📄 License

This project is private and intended for internal use.
