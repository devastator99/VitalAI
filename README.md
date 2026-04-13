VitalAI is a private, proprietary, cross‑platform mobile app built with React Native & Expo that unites AI‑powered health guidance, habit tracking, meal and exercise planning, and real‑time data sync.

📚 Table of Contents
Why VitalAI?
Features
Tech Stack
Prerequisites
Getting Started
Clone the repo
Install dependencies
Environment Variables
Convex Development Server
Running the App
Available Scripts
Project Structure
Development Workflow
Code Style
Linting & Formatting
Testing
Deployment
Roadmap
Contributing
License
Contact
✨ Why VitalAI?
Handy, in‑situ guidance	Anywhere, anytime AI assistant
Habit analytics with one tap	OpenAI & Google GenAI chat (real‑time)
Meal & workout planners	Continuous learning from user data
Secure, role‑based authentication	Clerk + Convex (real‑time sync)
Gorgeous, modern UI	NativeWind + Tailwind CSS
⚙️ Features
Feature	Description
🤖 AI Health Assistant	Instant, personalized health advice via chat with GPT‑4 & Google GenAI.
📈 Habit Tracker	Create, monitor, and analyze habit streaks & heat‑maps.
🍎 Meal Planner	AI‑suggested menus, calorie tracking, grocery list integration.
💪 Exercise Scheduler	Workout plans, progress badges, data sync with Wearables.
🚀 Real‑Time Sync	Convex backend guarantees updates across iOS, Android & web.
🔐 Authentication	Clerk for secure login, role‑based access.
🐦 Cross‑Platform	Expo + React Native, works on iOS, Android & web.
🎨 Modern UI	Tailwind‑styled components, Lottie animations, Material Design.
🛠️ Tech Stack
Layer	Technology	Purpose
Frontend	React Native	Core UI framework
Expo	Development & build tooling
NativeWind	Tailwind CSS for RN
React Navigation	Navigation and routing
React Native Reanimated	Smooth animations
React Native Paper	Material components
React Native Gifted Chat	Chat UI
Lottie	Vector animations
Expo Vector Icons	Iconography
Backend	Convex	Real‑time database & serverless functions
Clerk	Auth & user management
OpenAI	GPT‑4 chat endpoint
Google Generative AI	Alternate AI models
Utilities	TypeScript	Static typing
ESLint	Linting
Prettier	Formatting
Jest	Unit testing
Detox	E2E testing
EAS	Expo Application Services for builds
📦 Prerequisites
Node.js (v16⁺) – node -v
npm (latest) – npm -v or Yarn
Expo CLI – npm i -g expo-cli
iOS Simulator (macOS) or Android Studio (Windows/Linux)
Git – git --version
Tip: For a smoother experience, install the Expo Go client on your phone.

🚀 Getting Started
1️⃣ Clone the repository
git clone https://github.com/your-org/vitalai.git
cd vitalai
2️⃣ Install dependencies
npm install
# or
yarn install
3️⃣ Configure environment variables
Create a .env file at the project root (copy from .env.example):

CLERK_PUBLISHABLE_KEY=pk_test_*************
CLERK_SECRET_KEY=sk_secret_*************
CONVEX_URL=https://<your-domain>.convex.dev
OPENAI_API_KEY=sk-*************
GOOGLE_AI_API_KEY=AIzaSy*************
Do not commit your .env file. It is listed in .gitignore.

4️⃣ Start Convex locally
npx convex dev
This spins up a local Convex instance that your app will communicate with during development.

5️⃣ Run the Expo dev server
Open another terminal window/tab and start Expo:

npm run dev
The app automatically launches in the Expo Go client or the default simulator.

🔧 Available Scripts
Script	What it does
npm run dev	Start Expo dev server (iOS)
npm run dev:web	Launch web build (localhost:19006)
npm run dev:android	Launch Android emulator
npm run ios	Run on iOS simulator (legacy)
npm run android	Run on Android emulator (legacy)
npm run web	Open web build
npm run clean	Remove node_modules & clear Expo cache
npm run lint	Lint the codebase
npm run format	Auto‑format with Prettier
npm run test	Run unit tests (Jest)
npm run e2e	Run Detox end‑to‑end tests
Run a script by prefixing it with npm run.
For example: npm run format.

📁 Project Structure
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
📦 Development Workflow
Code Style
All code is written in TypeScript.
React Native components follow the Atom‑Component pattern.

Linting & Formatting
npm run lint   # Runs ESLint (reports errors)
npm run format # Formats code with Prettier
Pre‑commit hook (if set up with Husky) will ensure you cannot commit code that fails lint or format checks.

Branching Strategy
main – production‑ready code.
dev – integration branch.
Feature branches: feature/short‑description.
✅ Testing
Type	Tool	Command
Unit	Jest	npm run test
E2E	Detox	npm run e2e
Tip: Add --watch to Jest for interactive test runs.

📦 Deployment
VitalAI is built with Expo Application Services (EAS) for native builds.

# Login to EAS
eas login

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android
Generated artifacts are available in the EAS dashboard or in ./artifacts/.

You may also deploy OTA updates via Expo’s OTA service or via your chosen CI/CD pipeline.

🗺️ Roadmap
Phase	Feature	Release Target
1	Advanced AI Health Insights	Q3 2026
2	Wearable Integration	Q4 2026
3	Community & Social Features	Q1 2027
4	Premium Subscription Tier	Q2 2027
5	Offline Functionality	Q3 2027
Roadmap is adjustable based on stakeholder feedback & resource availability.

🤝 Contributing
Fork the repository.
Create your feature branch:
git checkout -b feature/awesome-feature
Commit your changes.
Push to your fork:
git push origin feature/awesome-feature
Open a Pull Request (PR) against main.
Pull Request Checklist

 Descriptive merge title (e.g., feat: add meal planner integration).
 Tests added or updated.
 Lint and format passes (npm run lint && npm run format).
 Documentation updated (README, comments).
Early feedback on PRs is appreciated – please ask questions or request clarification in the PR discussion.

📜 License
This project is private and proprietary.
All rights reserved by the owning organization.
Do not redistribute or publish.
