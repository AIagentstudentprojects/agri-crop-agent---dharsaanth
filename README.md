# Agri Crop Advisor & Weather Intelligence System

A full-stack agricultural decision support and crop advisory web application built with React, TypeScript, Tailwind CSS, Vite, Node.js/Express, and Open-Meteo & Gemini AI integration.

## Key Features

- **Mock Authentication & Farmer Profiles**: Complete built-in authentication system with localStorage persistence, user roles (Landowner, Smallholder, Commercial Grower, Agronomist, Researcher), 1-click demo profiles, and personalized farm dashboard calibration.
- **Dynamic Weather Intelligence**: Real-time atmospheric metrics, 72-hour forecasts, rainfall probabilities, and agronomic thresholds via Open-Meteo API.
- **Multilingual Farm Advisory**: Full localization in English, Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Punjabi (ਪੰਜਾਬੀ), and Spanish (Español).
- **Comprehensive Crop Catalog**: Extensive profiles covering field crops, pulses, oilseeds, cash crops, horticulture, fruits, and vegetables with agronomic requirements, soil preferences, and growth stages.
- **Crop Lifecycle Management**: Stage-by-stage monitoring, Days After Planting (DAP), irrigation schedules, pest/disease alerts, and harvesting recommendations.
- **Weather Suitability Engine**: Automated suitability scoring matching current and forecasted temperature, precipitation, and soil moisture against crop tolerances.
- **Field-Ready Calculators**: Irrigation water depth requirements, fertilizer dosage calculators (NPK), and spray timing advisors.

## Mock Authentication & Demo Profiles

The app includes ready-to-test mock authentication with zero external auth configuration needed:

| Profile | Role | Region | Land Area & Soil | Primary Crop |
|---|---|---|---|---|
| **Ramesh Patel** | Farmer / Landowner | Ludhiana, Punjab | 6 Acres, Loamy | Paddy (Rice) |
| **Kavitha Murugan** | Smallholder Farmer | Coimbatore, Tamil Nadu | 3.5 Acres, Red Soil | Banana |
| **Sukhwinder Singh** | Commercial Grower | Amritsar, Punjab | 14 Acres, Clayey | Wheat |
| **Dr. Anita Deshmukh** | Agronomist / Extension Officer | Nashik, Maharashtra | 25 Acres, Black Soil | Cotton |

You can also use custom credentials or create new farmer accounts via the **Sign In / Demo** modal.


## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Build Tool**: Vite
- **Backend**: Node.js, Express, Google GenAI SDK (`@google/genai`)
- **APIs**: Open-Meteo Weather API, Gemini Flash AI Advisory

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and provide your Gemini API key (optional for AI-augmented recommendations; core agronomic rules and Open-Meteo work out-of-the-box):

```bash
cp .env.example .env
```

Edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```
