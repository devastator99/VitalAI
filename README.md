<!-- markdownlint-disable MD041 MD032 -->

<div align="center">

# VitalAI

[![Expo](https://img.shields.io/badge/Expo%20SDK-52+-000029?style=for-the-badge&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.76%2B-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-Private-FF6B6B?style=for-the-badge)](LICENSE)

A private, proprietary, cross-platform mobile app built with React Native & Expo that unites AI-powered health guidance, habit tracking, meal and exercise planning, and real-time data sync.

</div>

---

## Table of Contents

1. [About VitalAI](#about-vitalai)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Getting Started](#getting-started)
   - [Clone the Repository](#clone-the-repository)
   - [Install Dependencies](#install-dependencies)
   - [Environment Variables](#environment-variables)
   - [Convex Development Server](#convex-development-server)
   - [Running the App](#running-the-app)
6. [Available Scripts](#available-scripts)
7. [Project Structure](#project-structure)
8. [Development Workflow](#development-workflow)
9. [Code Style](#code-style)
10. [Linting \& Formatting](#linting--formatting)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Roadmap](#roadmap)
14. [Contributing](#contributing)
15. [License](#license)
16. [Contact](#contact)

---

## About VitalAI

VitalAI is a comprehensive health and wellness mobile application that combines artificial intelligence with modern mobile technology to deliver personalized health guidance, habit tracking, meal planning, and exercise scheduling.

### Why VitalAI?

- **AI-Powered Health Assistant**: Instant, personalized health advice via chat with GPT-4 & Google GenAI
- **Habit Analytics**: Track and analyze habit streaks with heat maps and one-tap logging
- **Meal & Workout Planners**: AI-suggested menus, calorie tracking, and workout plans
- **Real-Time Sync**: Convex backend guarantees updates across iOS, Android & web
- **Secure Authentication**: Clerk for secure login with role-based access
- **Modern UI**: Beautiful Tailwind-styled components with Lottie animations

---

## Features

| Feature | Description |
|---------|-------------|
| **AI Health Assistant** | Instant, personalized health advice via chat with GPT-4 & Google GenAI |
| **Habit Tracker** | Create, monitor, and analyze habit streaks & heat-maps |
| **Meal Planner** | AI-suggested menus, calorie tracking, grocery list integration |
| **Exercise Scheduler** | Workout plans, progress badges, data sync with Wearables |
| **Real-Time Sync** | Convex backend guarantees updates across iOS, Android & web |
| **Authentication** | Clerk for secure login, role-based access |
| **Cross-Platform** | Expo + React Native, works on iOS, Android & web |
| **Modern UI** | Tailwind-styled components, Lottie animations, Material Design |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-------------|---------|
| React Native | Core UI framework |
| Expo | Development & build tooling |
| NativeWind | Tailwind CSS for RN |
| React Navigation | Navigation and routing |
| React Native Reanimated | Smooth animations |
| React Native Paper | Material components |
| React Native Gifted Chat | Chat UI |
| Lottie | Vector animations |
| Expo Vector Icons | Iconography |

### Backend

| Technology | Purpose |
|-------------|---------|
| Convex | Real-time database & serverless functions |
| Clerk | Auth & user management |
| OpenAI | GPT-4 chat endpoint |
| Google Generative AI | Alternate AI models |

### Utilities

| Technology | Purpose |
|-------------|---------|
| TypeScript | Static typing |
| ESLint | Linting |
| Prettier | Formatting |
| Jest | Unit testing |
| Detox | E2E testing |
| EAS | Expo Application Services for builds |

---

## Prerequisites

| Requirement | Version | Check Command |
|--------------|--------|---------------|
| **Node.js** | 16+ | `node -v` |
| **npm** | Latest | `npm -v` |
| **Expo CLI** | Latest | `npm i -g expo-cli` |
| **Git** | 2.x | `git --version` |

> **Tip**: For a smoother experience, install the Expo Go client on your phone.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/vitalai.git
cd vitalai
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file at the project root (copy from `.env.example`):

```env
CLERK_PUBLISHABLE_KEY=pk_test_*************
CLERK_SECRET_KEY=sk_secret_*************
CONVEX_URL=https://<your-domain>.convex.dev
OPENAI_API_KEY=sk-*************
GOOGLE_AI_API_KEY=AIzaSy*************
```

> **Note**: Do not commit your `.env` file. It is listed in `.gitignore`.

### 4. Convex Development Server

```bash
npx convex dev
```

This spins up a local Convex instance that your app will communicate with during development.

### 5. Running the App

```bash
npm run dev
```

The app automatically launches in the Expo Go client or the default simulator.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Expo dev server (iOS) |
| `npm run dev:web` | Launch web build (localhost:19006) |
| `npm run dev:android` | Launch Android emulator |
| `npm run ios` | Run on iOS simulator (legacy) |
| `npm run android` | Run on Android emulator (legacy) |
| `npm run web` | Open web build |
| `npm run clean` | Remove node_modules & clear Expo cache |
| `npm run lint` | Lint the codebase |
| `npm run format` | Auto-format with Prettier |
| `npm run test` | Run unit tests (Jest) |
| `npm run e2e` | Run Detox end-to-end tests |

---

## Project Structure

```
vitalai/
├── app/                  # Screens & navigation (Expo router)
│   ├── (auth)/          # Auth stack
│   │   ├── (drawer)/    # Drawer navigation
│   │   └── HabitDashboard.tsx
│   ├── (onboarding)/   # Onboarding flow
│   ├── (details)/      # Detail screens
│   └── (admin)/         # Admin dashboard
├── components/           # UI widgets
│   ├── ui/              # Base components
│   └── habit_components/
├── convex/               # Convex functions & schema
├── constants/           # Shared constants & enums
├── lib/                  # Custom hooks & utilities
├── utils/                # Helper functions
├── assets/               # Images, fonts, Lottie files
├── .env.example          # Sample env file
├── package.json
├── README.md
└── tsconfig.json
```

---

## Development Workflow

### Code Style

All code is written in TypeScript. React Native components follow the Atom-Component pattern.

### Linting & Formatting

```bash
npm run lint   # Runs ESLint (reports errors)
npm run format # Formats code with Prettier
```

> **Tip**: Pre-commit hook (if set up with Husky) will ensure you cannot commit code that fails lint or format checks.

### Branching Strategy

- `main` – production-ready code
- `dev` – integration branch
- `feature/short-description` – Feature branches

---

## Testing

| Type | Tool | Command |
|------|------|---------|
| Unit | Jest | `npm run test` |
| E2E | Detox | `npm run e2e` |

> **Tip**: Add `--watch` to Jest for interactive test runs.

---

## Deployment

VitalAI is built with Expo Application Services (EAS) for native builds.

```bash
# Login to EAS
eas login

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android
```

Generated artifacts are available in the EAS dashboard or in `./artifacts/`.

You may also deploy OTA updates via Expo's OTA service or via your chosen CI/CD pipeline.

---

## Roadmap

| Phase | Feature | Target |
|-------|---------|--------|
| 1 | Advanced AI Health Insights | Q3 2026 |
| 2 | Wearable Integration | Q4 2026 |
| 3 | Community & Social Features | Q1 2027 |
| 4 | Premium Subscription Tier | Q2 2027 |
| 5 | Offline Functionality | Q3 2027 |

Roadmap is adjustable based on stakeholder feedback & resource availability.

---

## Contributing

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/awesome-feature
   ```
3. Commit your changes
4. Push to your fork:
   ```bash
   git push origin feature/awesome-feature
   ```
5. Open a Pull Request (PR) against main

### Pull Request Checklist

- [ ] Descriptive merge title (e.g., `feat: add meal planner integration`)
- [ ] Tests added or updated
- [ ] Lint and format passes (`npm run lint && npm run format`)
- [ ] Documentation updated (README, comments)

> **Note**: Early feedback on PRs is appreciated – please ask questions or request clarification in the PR discussion.

---

## License

This project is private and proprietary. All rights reserved by the owning organization. Do not redistribute or publish.

---

## Contact

For questions or feedback, please open an issue on GitHub.

</div>