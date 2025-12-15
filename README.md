# Tatakai IT

> **"THE SYSTEM USES YOU — YOU USE THE SYSTEM"**

Your personal fitness and nutrition command center. Track workouts, log meals, monitor progress, and level up your health game with style.

Built with a dark-themed UI that features glassmorphism effects, constellation particles, and smooth animations that make tracking your gains actually enjoyable.

---
Try it out at:
tatakai-it-web.onrender.com
---

## What It Does

### Fitness Tracking

**Workout Logger**  
Log everything from heavy compound lifts to cardio sessions. Track sets, reps, weight, duration, calories burned—whatever matters to your training.

**Workout Templates**  
Stop typing the same exercises every leg day. Save your favorite workouts as templates and log them in seconds.

**Body Metrics**  
Track weight, body fat percentage, and measurements (waist, chest, hips). Watch the numbers change as you transform.

**Progress Visualization**  
Interactive charts that actually show your gains over time. See your workout frequency, volume trends, and personal bests.

**History**  
Full workout history with the ability to edit or delete entries. Because sometimes you need to adjust that rep count you totally didn't exaggerate.

### Nutrition Tracking

**Meal Logger**  
Log breakfast, lunch, dinner, and snacks. Each food item includes calories, protein, carbs, and fats.

**Food Search**  
Integrated food database search. Find nutritional info for thousands of foods instead of Googling every ingredient.

**Daily Goals & Progress**  
Set your calorie and macro targets. Visual progress rings show how close you are to hitting your numbers each day.

**Recipe Manager**  
Eat the same protein shake every morning? Save it as a recipe. One click to log instead of entering 8 ingredients.

**Hydration Tracker**  
Because water matters. Track your daily intake and actually hit that gallon goal.

**Meal History**  
Review and edit past meals. Perfect for when you realize you logged the wrong serving size.

### Level Up Mode 🎮

**XP & Ranking System**  
Turn your fitness journey into a game. Earn XP for logging workouts and climb through the ranks:

| Rank | XP Required |
|------|-------------|
| E (Beginner) | 0 |
| D (Bronze) | 8,000 |
| C (Silver) | 20,000 |
| B (Gold) | 40,000 |
| A (Emerald) | 60,000 |
| S (Sapphire) | 85,000 |
| National (Ruby) | 115,000 |
| Monarch (Violet) | 150,000 |

**XP Earning (Fitness Only)**
- **Base XP**: +25 XP for logging any workout
- **New Exercise PR**: +15 XP per new exercise
- **Progressive Overload**: +10 XP per 10% volume improvement (max +25 per exercise)
- **Volume Decline**: -5 XP per 20% volume drop (max -15 per exercise)

**Streak Bonuses**
- 7-day streak: +100 XP
- 14-day streak: +300 XP  
- 30-day streak: +750 XP

**Missed Day Penalty**  
Skip a day? Lose -50 XP per missed day. Consistency is key.

**Rest Days**  
Have a scheduled rest day? Click "😴 Log Rest Day" in the Level Up dropdown to:
- Avoid the -50 XP penalty for that day
- Keep your streak intact
- Stay consistent with your training plan

**Progressive Overload Tracking**  
Every exercise shows a volume change indicator compared to your last performance:
- 🟢 Green arrow = Volume improved
- 🔴 Red arrow = Volume declined
- Each workout displays an average progressive overload percentage

**XP History**  
View your complete XP history with categorized entries showing all gains and losses.

### The Usual Stuff

JWT authentication keeps your data secure. Each user gets their own profile with customizable nutrition goals. Your workouts and meals stay private.

---

## Tech Stack

- **Frontend**: React 19, TailwindCSS, Framer Motion, Chart.js
- **Backend**: Node.js with Express 5
- **Database**: MongoDB
- **Auth**: JWT tokens with bcrypt hashing

---

## Getting Started

### What You Need

- Node.js v18 or newer
- MongoDB (running locally or use MongoDB Atlas)
- About 5 minutes

### Installation

**1. Grab the code**
```bash
git clone https://github.com/yourusername/Tatakai-It-Web.git
cd Tatakai-It-Web
```

**2. Set up the backend**
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
MONGO_URI=mongodb://localhost:27017/tatakai-it
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

If you're using MongoDB Atlas, your `MONGO_URI` will look like:
```
mongodb+srv://username:password@cluster.mongodb.net/tatakai-it
```

**3. Set up the frontend**
```bash
cd frontend
npm install
```

**4. Fire it up**

You need two terminals running:

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

**5. Open the app**
- Frontend runs at `http://localhost:3000`
- Backend API runs at `http://localhost:5000`

---

## How to Use This App

### First Time Setup

1. Hit the register page and create an account
2. Set your nutrition goals in your profile (or stick with the defaults)
3. Start logging from the dashboard

### Daily Workflow

The dashboard gives you two main sections: **Fitness** and **Nutrition**, plus **Level Up Mode** in the top-right.

**Fitness Side:**
- Click into Fitness to access the workout logger
- Log your exercises with sets, reps, and weight
- Save common workouts as templates for faster logging
- Check your history to see past sessions with progressive overload indicators
- View progress charts to track improvements
- Log body measurements in the metrics section

**Nutrition Side:**
- Open the nutrition page to log meals
- Search for foods or create custom entries
- Watch the progress rings fill up as you hit your macros
- Save recipes for meals you eat regularly
- Track water intake throughout the day
- Review meal history to see what you ate

**Level Up Mode:**
- Enable from the dashboard dropdown (top-right corner)
- Each workout logged earns XP based on progressive overload
- View your current rank and XP progress
- Check XP History page for detailed breakdown
- Reset XP if needed from the dropdown menu

### Pro Tips

- Templates are clutch for saving time on repeated workouts
- Recipes make meal logging way faster
- Log consistently—the charts look way cooler with more data
- Adjust your goals as needed, they're not set in stone
- **Enable Level Up Mode** to gamify your fitness journey
- **Focus on progressive overload** to maximize XP gains
- Check your **workout history** to see green/red arrows for each exercise
- Don't skip days—missing logging costs you 50 XP per day!

---

## The Visual Experience

Dark mode by default with purple and cyan accents. Glassmorphism effects throughout for that modern frosted glass look. Smooth animations powered by Framer Motion. The dashboard features an interactive particle constellation background because plain backgrounds are boring.

Fully responsive—works just as well on your phone as it does on desktop.

---

## Configuration Notes

### Environment Variables

Your backend needs these in a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=strong_random_string_here
PORT=5000
```

**Important:** Don't commit your `.env` file. Add it to `.gitignore` (already done). Use strong secrets in production.

### MongoDB Connection

**Local:** `mongodb://localhost:27017/tatakai-it`  
**Atlas:** `mongodb+srv://username:password@cluster.mongodb.net/tatakai-it`

---

## Building for Production

When you're ready to deploy:

```bash
cd frontend
npm run build
```

This creates an optimized build in the `frontend/build` folder. Serve it with any static file server.

---

## Contributing

Want to add features or fix bugs? Here's the flow:

1. Fork this repo
2. Create a branch: `git checkout -b feature/something-cool`
3. Make your changes
4. Commit: `git commit -m 'Added something cool'`
5. Push: `git push origin feature/something-cool`
6. Open a Pull Request

---

## License

ISC

---

Built for people who take their fitness seriously but want tracking to be painless.
