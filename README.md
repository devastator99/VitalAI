# Cura Health App

A comprehensive healthcare and wellness mobile application built with React Native and Expo, featuring AI-powered chat, habit tracking, meal planning, and personalized health insights.

## Features

- 🤖 **AI-Powered Health Assistant**: Integrated chat system with AI for personalized health advice and support
- 📊 **Habit Tracking**: Monitor and build healthy habits with detailed analytics
- 🍎 **Meal Planning**: Personalized meal recommendations and tracking
- 💪 **Exercise Integration**: Workout planning and progress tracking
- 👥 **User Authentication**: Secure login with Clerk authentication
- 📱 **Cross-Platform**: Native iOS and Android support with Expo
- 🎨 **Modern UI**: Beautiful interface with NativeWind and Tailwind CSS
- 🔄 **Real-time Sync**: Convex backend for real-time data synchronization

## Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **NativeWind** - Tailwind CSS for React Native
- **React Navigation** - Navigation and routing
- **React Native Reanimated** - Smooth animations

### Backend & Services
- **Convex** - Real-time backend as a service
- **Clerk** - User authentication and management
- **OpenAI** - AI chat integration
- **Google Generative AI** - Additional AI capabilities

### UI Components
- **React Native Paper** - Material Design components
- **React Native Gifted Chat** - Chat UI components
- **Lottie** - Vector animations
- **Expo Vector Icons** - Icon library

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cura_base
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your API keys:
   ```env
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CONVEX_URL=your_convex_url
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Set up Convex**
   ```bash
   npx convex dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start Expo development server (iOS)
- `npm run dev:web` - Start web development server
- `npm run dev:android` - Start Android development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run on web browser
- `npm run clean` - Clean node_modules and Expo cache

## Project Structure

```
cura_base/
├── app/                    # Main application screens and layouts
│   ├── (admin)/           # Admin dashboard
│   ├── (auth)/            # Authentication screens
│   │   ├── (drawer)/      # Drawer navigation screens
│   │   └── HabitDashboard.tsx
│   ├── (details)/         # Detail screens
│   └── (onboarding)/      # Onboarding flow
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── habit_components/ # Habit-specific components
├── convex/               # Backend functions and schema
├── constants/            # App constants and styles
├── lib/                  # Utility functions and hooks
├── utils/                # Helper utilities
└── assets/               # Static assets (images, fonts)
```

## Key Features Implementation

### AI Chat System
- Integrated with OpenAI and Google Generative AI
- Real-time conversation with health-focused AI assistant
- Message persistence with Convex backend

### Habit Tracking
- Custom habit creation and management
- Progress visualization and analytics
- Streak tracking and achievements

### User Authentication
- Secure authentication with Clerk
- User profile management
- Role-based access control

## Development

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

### Testing
- Unit tests with Jest
- Integration tests for key features
- End-to-end testing with Detox

### Deployment
- Expo Application Services (EAS) for builds
- Over-the-air updates
- App Store and Google Play deployment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary. All rights reserved.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Roadmap

- [ ] Advanced AI health insights
- [ ] Wearable device integration
- [ ] Social features and community
- [ ] Premium subscription features
- [ ] Offline functionality improvements
