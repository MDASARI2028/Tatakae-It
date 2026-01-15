<div align="center">

# TATAKAI IT

### "THE SYSTEM USES YOU — YOU USE THE SYSTEM"

**A comprehensive fitness and nutrition command center. Track workouts, log meals, monitor progress, and gamify your health journey.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-tatakai--it--web.vercel.app-22D3EE?style=for-the-badge)](https://tatakai-it-web.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)

---

</div>

## Overview

Tatakai IT is built with a **cyberpunk-inspired dark UI** that prioritizes both aesthetics and functionality. It features:
- Constellation particle backgrounds
- Glassmorphism UI elements
- Animated water-fill hydration tracking
- Neon glow effects
- Smooth, GPU-accelerated animations

---

## Key Features

### Fitness Tracking

| Feature | Description |
|---------|-------------|
| **Workout Logger** | Log sets, reps, weight, duration, and calories for any exercise |
| **Workout Templates** | Save custom workout routines for quick logging |
| **Body Metrics** | Track weight, body fat %, and body measurements |
| **Progress Charts** | Interactive visualizations of performance over time |
| **Progressive Overload** | Visual indicators for volume improvement vs decline |

### Nutrition Tracking

| Feature | Description |
|---------|-------------|
| **Meal Logger** | Track calories, protein, carbohydrates, and fats |
| **Food Search** | Integrated database for food lookup |
| **Recipe Manager** | Save frequently eaten meal combinations |
| **Nutrition History** | Detailed log view with daily summary cards |
| **Daily Goals** | Visual progress rings for macro targets |

### Hydration Tracker

A distinct module for tracking water intake featuring:
- Circular progress indicator with animated water fill
- Realistic water effects including bubbles and surface waves
- Glass container aesthetic with dynamic lighting
- Quick-add presets (+250ml, +500ml, +750ml)
- Daily hydration goal management

### Level Up Mode

Gamify your fitness consistency with an XP system. Logging workouts and improving performance earns XP to climb ranks.

**Ranking System:**
```
E (Beginner)     →  0 XP
D (Bronze)       →  8,000 XP
C (Silver)       →  20,000 XP
B (Gold)         →  40,000 XP
A (Emerald)      →  60,000 XP
S (Sapphire)     →  85,000 XP
National (Ruby)  →  115,000 XP
Monarch (Violet) →  150,000 XP
```

**XP Rules:**
- +25 XP: Logging a workout
- +15 XP: New exercise Personal Record (PR)
- +10 XP: Per 10% volume improvement
- Streak Bonuses: awarded at 7, 14, and 30 days
- Penalty: -50 XP per missed day (discourages inconsistency)

---

## Tech Stack

<div align="center">

| Frontend | Backend | Database | Auth |
|----------|---------|----------|------|
| React 19 | Node.js | MongoDB | JWT |
| Framer Motion | Express 5 | Mongoose | bcrypt |
| Chart.js | REST API | Atlas | Cookies |
| CSS3 (Custom) | | | |

</div>

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local instance or Atlas connection string)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MDASARI2028/Tatakai-It-Web-MVP.git
   cd Tatakai-It-Web-MVP
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_secret_key
   PORT=5000
   ```

3. **Setup Frontend**
   ```bash
   cd ../tatakai-web
   npm install
   ```

### Running the Application

Open two terminal instances:

**Terminal 1 (Backend)**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend)**
```bash
cd tatakai-web
npm start
```

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`

---

## Design System

The application follows a strict design philosophy:
- **Color Palette:** Deep blacks for background, Neon Cyan (#22D3EE) for primary accents, Vibrant Purple (#A855F7) for secondary elements.
- **Typography:** *Orbitron* for digital data displays, *Rajdhani* for UI text and labels.
- **Responsiveness:** Fully responsive design adapting to mobile, tablet, and desktop viewports.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add some NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## License

ISC License

---

<div align="center">

**Train Hard. Track Smart.**

[![Website](https://img.shields.io/badge/Visit-tatakai--it--web.vercel.app-22D3EE?style=for-the-badge)](https://tatakai-it-web.vercel.app)

</div>
