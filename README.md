# Pacer

Personal marathon training dashboard. Live Strava integration, training plan vs actuals, race countdowns, shoe tracking.

## Stack

- React (Create React App)
- Recharts for data visualization
- Strava API v3 (OAuth 2.0)
- Google Sheets API v4 (training plan, races, shoes)
- Deployed on Vercel

## Setup

### 1. Strava API

Create an app at [strava.com/settings/api](https://www.strava.com/settings/api). Set the callback domain to your Vercel URL.

### 2. Google Sheets API

Enable the Google Sheets API in [Google Cloud Console](https://console.cloud.google.com). Create an API key with Sheets read access. Make your sheets publicly readable (or use service account auth for private sheets).

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
REACT_APP_STRAVA_CLIENT_ID=
REACT_APP_STRAVA_CLIENT_SECRET=
REACT_APP_STRAVA_REDIRECT_URI=https://your-app.vercel.app/callback
REACT_APP_GOOGLE_SHEETS_API_KEY=
REACT_APP_TRAINING_PLAN_SHEET_ID=
REACT_APP_CONFIG_SHEET_ID=
```

In Vercel, add these same variables under Project Settings → Environment Variables.

### 4. Deploy

```bash
npm install
npm start         # local dev
npm run build     # production build
```

Connect repo to Vercel for automatic deploys on push.

## Data Sources

| Source | What it provides |
|--------|-----------------|
| Strava API | All run activities — distance, pace, HR, shoe, date |
| Training Plan Sheet | Planned sessions by date — miles, type, description, notes |
| Config Sheet (Races) | Upcoming races with goals and countdowns |
| Config Sheet (Shoes) | Shoe fleet with retirement mileage targets |

## Architecture

```
src/
  lib/
    strava.js     — OAuth flow, token management, activity fetching
    sheets.js     — Google Sheets read helpers
  hooks/
    useData.js    — React hooks for Strava + Sheets data
  components/
    Dashboard.js          — Main layout
    HeaderStats.js        — Top-line metrics strip
    WeeklyMileageChart.js — Recharts bar chart, plan vs actual
    RaceCountdowns.js     — Countdown cards per upcoming race
    WeekPlan.js           — This week's plan with Strava actuals overlay
    RecentActivities.js   — Last 10 runs feed
    ShoeHealth.js         — Shoe mileage progress bars
    LoginScreen.js        — Strava connect screen
    AuthCallback.js       — OAuth redirect handler
```
