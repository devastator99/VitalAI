### **App Overview**
Build a comprehensive healthcare and wellness mobile application called "Cura Health" that provides AI-powered health assistance, habit tracking, personalized meal planning, and exercise integration. The app should feature real-time chat with an AI health assistant, detailed user profiling through questionnaires, and role-based access control for users, doctors, dieticians, and admins.

### **Core Features**
1. **🤖 AI-Powered Health Assistant**
   - Real-time chat interface with AI integration (OpenAI + Google Generative AI)
   - Personalized health advice and support
   - Message persistence with media sharing capabilities
   - Context-aware conversations

2. **📊 Habit Tracking System**
   - Custom habit creation with categories (boolean, numeric, categorical)
   - Progress visualization and streak tracking
   - Daily habit entries with notes
   - Achievement system and analytics

3. **🍎 Personalized Meal Planning**
   - Comprehensive meal database with nutritional information
   - Recipe management with ingredients and instructions
   - Daily meal plans assigned by dieticians
   - Calorie tracking and nutritional analysis
   - Dietary preferences and restrictions support

4. **💪 Exercise Integration**
   - Exercise library with categories (strength, cardio, flexibility, balance)
   - Workout plans and progress tracking
   - Video tutorials and equipment requirements
   - Completion tracking and statistics

5. **👥 User Management & Authentication**
   - Secure authentication with Clerk
   - Role-based access (user, doctor, dietician, admin)
   - User approval workflow
   - Profile management with detailed health information

### **Technical Architecture**

#### **Frontend Stack**
- **Framework**: React Native with Expo
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation with Expo Router
  - Stack navigation for auth flows
  - Tab navigation for main app sections
  - Drawer navigation for secondary features
- **Animations**: React Native Reanimated
- **UI Components**: 
  - React Native Paper for Material Design
  - React Native Gifted Chat for messaging
  - Custom animated components
- **State Management**: Zustand
- **Icons**: Expo Vector Icons

#### **Backend Stack**
- **Primary Backend**: Convex (real-time backend as a service)
- **Authentication**: Clerk with custom auth configuration
- **AI Integration**: 
  - OpenAI API for chat completion
  - Google Generative AI as backup
- **File Storage**: Convex storage for media files
- **Payment Processing**: Razorpay integration

### **Navigation Structure**

#### **App Router Structure**
```
app/
├── _layout.tsx (Root layout with auth providers)
├── index.tsx (Landing page)
├── login.tsx (Login modal)
├── roleselect.tsx (Role selection for admins)
├── (onboarding)/
│   ├── _layout.tsx
│   ├── Questionnaire.tsx
│   └── waiting.tsx (Approval waiting screen)
├── (auth)/
│   ├── _layout.tsx (Tab navigation)
│   ├── HabitDashboard.tsx
│   ├── Profile.tsx
│   └── (drawer)/
│       ├── _layout.tsx (Drawer layout)
│       ├── (ai-chat)/
│       │   ├── new.tsx
│       │   └── [chatId].tsx
│       ├── nextmeal.tsx
│       └── exercise.tsx
├── (admin)/
│   ├── _layout.tsx
│   ├── dashboard.tsx
│   └── settings.tsx
└── (details)/
    ├── _layout.tsx
    ├── createHabit.tsx
    └── [habitId].tsx
```

#### **Navigation Flow**
1. **Unauthenticated Users**: Redirected to login
2. **New Users**: Onboarding questionnaire → Approval waiting
3. **Approved Users**: Main app with tab navigation
4. **Admins**: Admin dashboard with role management

### **Data Model Schema**

#### **Core Tables**
```typescript
// Users with comprehensive profiling
users: {
  userId: string (Clerk ID)
  role: "user" | "doctor" | "dietician" | "ai"
  isAdmin?: boolean
  name?: string
  defaultChatId?: chatId
  busy: boolean
  createdAt: number
  isApproved?: boolean
  profileDetails?: {
    email?: string
    picture?: storageId
    height?: number
    weight?: number
    phone?: string
  }
  questionnaire?: {
    // Comprehensive health questionnaire data
    gender, age, height, weight, occupation, goals, healthConditions,
    symptoms, allergies, habits, dietStyle, spiceLevel, texturePreferences,
    foodsToAvoid, cookingLevel, wakeUpTime, sleepTime, mealTimes,
    heaviestMeal, activityLevel, workouts, location, homeCuisine,
    otherCuisines, primaryGoal, completedAt
  }
}

// Real-time chat system
chats: {
  chatownerId: userId
  createdAt: number
  updatedAt: number
  isAi: boolean
  participants: userId[]
  lastMessageId?: messageId
  type: "group" | "private"
}

messages: {
  chatId: chatId
  senderId: userId
  content: string
  isAi: boolean
  type: "text" | "image" | "video" | "audio" | "file"
  attachId?: storageId
  replyTo?: userId
  createdAt: number
  readBy: userId[]
  updatedAt: number
}

// Meal planning system
meals: {
  title: string
  description: string[]
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  cuisine?: string
  tags?: string[]
  servings: number
  portionSize: { amount: number, unit: string }
  prepTime: number
  cookTime: number
  totalTime: number
  calories: number
  nutritionFacts: {
    protein: number, carbs: number, fats: number, fiber: number,
    sugar?: number, sodium?: number, cholesterol?: number
  }
  micronutrients?: {
    vitaminA?: number, vitaminC?: number, calcium?: number, iron?: number
  }
  ingredients: string[]
  instructions: string[]
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  allergens?: string[]
  costPerServing?: number
  sourceUrl?: string
  imageIds?: storageId[]
  videoUrl?: string
  rating?: number
  timesCooked?: number
  favoriteCount?: number
  createdAt: number
  updatedAt: number
  attachId?: storageId
}

// Exercise management
exercises: {
  title: string
  description: string
  category: "strength" | "cardio" | "flexibility" | "balance"
  difficulty: "beginner" | "intermediate" | "advanced"
  targetedMuscleGroups: string[]
  equipment: string[]
  sets?: number
  reps?: number
  duration?: number
  durationUnit?: "seconds" | "minutes"
  restPeriod?: number
  videoUrl?: string
  attachId?: storageId
  createdAt: number
  updatedAt: number
}

// Habit tracking
habits: {
  userId: userId
  name: string
  description?: string
  type: "boolean" | "numeric" | "categorical"
  target?: number
  unit?: string
  frequency: string[]
  color: string
  icon: string
  streak: number
  progress: { current: number }
}

habitEntries: {
  habitId: habitId
  date: string
  value: boolean | number | string
  notes?: string
}

// Daily plans and completions
dailyplan: {
  userId: userId
  dietitianId: userId
  date: string
  meals: {
    breakfast: mealId[]
    lunch: mealId[]
    dinner: mealId[]
    snacks: mealId[]
  }
  exercises: exerciseId[]
}

completions: {
  userId: userId
  date: string
  completedMeals: mealId[]
  completedExercises: exerciseId[]
}
```

### **Key Implementation Details**

#### **Authentication & Authorization**
- Implement Clerk authentication with custom providers
- Create middleware for role-based routing
- Handle user approval workflow
- Implement admin role management

#### **AI Integration**
- Set up OpenAI API client with proper error handling
- Implement streaming responses for chat
- Create fallback to Google Generative AI
- Handle message formatting and context management

#### **Real-time Features**
- Use Convex subscriptions for live chat updates
- Implement optimistic updates for better UX
- Handle offline/online state management
- Real-time notifications system

#### **UI/UX Design**
- Dark theme with blue accent colors (#539DF3)
- Animated tab bar with liquid button effects
- Custom chat bubbles with neon styling for AI messages
- Blur effects and smooth transitions
- Responsive design for various screen sizes

#### **Performance Optimizations**
- Implement proper indexing in Convex schema
- Use React Native Fast Image for media
- Optimize re-renders with memoization
- Implement proper loading states and skeletons

### **Development Setup**

#### **Environment Variables**
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EXPO_PUBLIC_CONVEX_URL=your_convex_url
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

#### **Build Configuration**
- Expo Application Services (EAS) for builds
- Separate environments (development, staging, production)
- iOS and Android native builds
- Over-the-air updates configuration

### **Deployment Strategy**
1. **Development**: Local Expo development server
2. **Staging**: EAS build for internal testing
3. **Production**: App Store and Google Play deployment
4. **Backend**: Convex deployment with proper environment setup
