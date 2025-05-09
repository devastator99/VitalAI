import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(), //convex subject id
    role: v.union(
      v.literal("user"),
      v.literal("doctor"),
      v.literal("dietician"),
      v.literal("ai")
    ),
    isAdmin: v.optional(v.boolean()),
    name: v.optional(v.string()),
    defaultChatId: v.optional(v.id("chats")),
    busy: v.boolean(), // if role is admin , then this is compulsory
    createdAt: v.number(),
    isApproved: v.optional(v.boolean()),
    // optional fields
    profileDetails: v.optional(
      v.object({
        email: v.optional(v.string()),
        picture: v.optional(v.id("_storage")),
        height: v.optional(v.number()),
        weight: v.optional(v.number()),
        phone: v.optional(v.string()),
      })
    ),
    questionnaire: v.optional(v.object({
      gender: v.string(),
      age: v.string(),
      height: v.string(),
      weight: v.string(),
      occupation: v.string(),
      goals: v.array(v.string()),
      healthConditions: v.array(v.string()),
      symptoms: v.array(v.string()),
      allergies: v.array(v.string()),
      habits: v.array(v.string()),
      dietStyle: v.string(),
      spiceLevel: v.string(),
      texturePreferences: v.array(v.string()),
      foodsToAvoid: v.array(v.string()),
      cookingLevel: v.string(),
      wakeUpTime: v.union(v.string(), v.null()),
      sleepTime: v.union(v.string(), v.null()),
      mealTimes: v.object({
        breakfast: v.union(v.string(), v.null()),
        lunch: v.union(v.string(), v.null()),
        snack: v.union(v.string(), v.null()),
        dinner: v.union(v.string(), v.null())
      }),
      heaviestMeal: v.string(),
      activityLevel: v.string(),
      workouts: v.object({
        doWorkouts: v.boolean(),
        days: v.array(v.string()),
        time: v.union(v.string(), v.null()),
        type: v.string(),
        duration: v.string()
      }),
      location: v.string(),
      homeCuisine: v.string(),
      otherCuisines: v.array(v.string()),
      primaryGoal: v.string(),
      completedAt: v.string()
    })),
  })
    // .index("by_userId", [_id])
    .index("by_role_and_busy", ["role", "busy"])
    .index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"])
    .index("by_email", ["profileDetails.email"]),

  chats: defineTable({
    chatownerId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    isAi: v.boolean(),
    participants: v.array(v.id("users")),
    lastMessageId: v.optional(v.id("messages")), //ensure proper consistency in logic
    type: v.union(v.literal("group"), v.literal("private")),
  })
    .index("by_participants", ["participants"])
    .index("by_senderId", ["chatownerId"])
    .index("by_updated", ["updatedAt"]),

  messages: defineTable({
    // messageId: v.string(),
    chatId: v.id("chats"),
    senderId: v.id("users"),
    content: v.string(),
    isAi: v.boolean(),
    type: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("file")
    ),
    attachId: v.optional(v.id("_storage")),
    replyTo: v.optional(v.id("users")),
    createdAt: v.number(),
    readBy: v.array(v.id("users")),
    updatedAt: v.number(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_senderId", ["senderId"])
    .index("by_attachId", ["attachId"]),

  contacts: defineTable({
    userId: v.id("users"), // Reference to the user , convex id
    doctors: v.optional(v.array(v.id("users"))), // List of assigned doctors
    dieticians: v.optional(v.array(v.id("users"))), // List of assigned dieticians
  }).index("by_userId", ["userId"]),

  media: defineTable({
    storageId: v.id("_storage"),
    mimeType: v.string(),
    authorId: v.id("users"),
    // type: v.union(
    //   v.literal("image"),
    //   v.literal("video"),
    //   v.literal("audio"),
    //   v.literal("file")
    // ),
    // type : v.string(),
    createdAt: v.number(),
    messageId: v.optional(v.id("messages")),
    size: v.optional(v.number()),
    duration: v.optional(v.number()), //absolutely required for video and audio
    metadata: v.optional(
      v.object({
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        resolution: v.optional(v.string()),
        bitRate: v.optional(v.number()),
      })
    ),
  }).index("by_messageId", ["messageId"]),

  orders: defineTable({
    orderId: v.string(), // Razorpay order ID
    amount: v.number(), // Amount in smallest currency unit (e.g., paise)
    status: v.string(), // e.g., "created", "paid", "failed"
    createdAt: v.number(), // Timestamp of creation
  }).index("by_orderId", ["orderId"]),

  dailyplan: defineTable({
    userId: v.id("users"),
    dietitianId: v.id("users"),
    date: v.string(),
    meals: v.object({
      breakfast: v.array(v.id("meals")),
      lunch: v.array(v.id("meals")),
      dinner: v.array(v.id("meals")),
      snacks: v.array(v.id("meals")),
    }),
    exercises: v.array(v.id("exercises")),
  }).index("by_userId_and_date", ["userId", "date"]),

  meals: defineTable({
    title: v.string(),
    description: v.array(v.string()),
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack")
    ),
    cuisine: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    servings: v.number(),
    portionSize: v.object({
      amount: v.number(),
      unit: v.string(),
    }),
    prepTime: v.number(),
    cookTime: v.number(),
    totalTime: v.number(),
    calories: v.number(),
    nutritionFacts: v.object({
      protein: v.number(),
      carbs: v.number(),
      fats: v.number(),
      fiber: v.number(),
      sugar: v.optional(v.number()),
      sodium: v.optional(v.number()),
      cholesterol: v.optional(v.number()),
    }),
    micronutrients: v.optional(
      v.object({
        vitaminA: v.optional(v.number()),
        vitaminC: v.optional(v.number()),
        calcium: v.optional(v.number()),
        iron: v.optional(v.number()),
      })
    ),
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()),
    isVegetarian: v.boolean(),
    isVegan: v.boolean(),
    isGlutenFree: v.boolean(),
    allergens: v.optional(v.array(v.string())),
    costPerServing: v.optional(v.number()),
    sourceUrl: v.optional(v.string()),
    imageIds: v.optional(v.array(v.id("_storage"))),
    videoUrl: v.optional(v.string()),
    rating: v.optional(v.number()),
    timesCooked: v.optional(v.number()),
    favoriteCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    attachId: v.optional(v.id("_storage")),
  })
    .index("by_title", ["title"])
    .index("by_mealType", ["mealType"])
    .index("by_tag", ["tags"]),

  exercises: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("strength"),
      v.literal("cardio"),
      v.literal("flexibility"),
      v.literal("balance")
    ),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    targetedMuscleGroups: v.array(v.string()),
    equipment: v.array(v.string()),
    sets: v.optional(v.number()),
    reps: v.optional(v.number()),
    duration: v.optional(v.number()),
    durationUnit: v.optional(
      v.union(v.literal("seconds"), v.literal("minutes"))
    ),
    restPeriod: v.optional(v.number()),
    videoUrl: v.optional(v.string()),
    attachId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_title", ["title"])
    .index("by_category", ["category"])
    .index("by_muscle", ["targetedMuscleGroups"])
    .index("by_description", ["description"]),

  completions: defineTable({
    userId: v.id("users"),
    date: v.string(),
    completedMeals: v.array(v.id("meals")),
    completedExercises: v.array(v.id("exercises")),
  }).index("by_userId_and_date", ["userId", "date"]),

  habits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.union(v.literal("boolean"), v.literal("numeric"), v.literal("categorical")),
    target: v.optional(v.number()),
    unit: v.optional(v.string()),
    frequency: v.array(v.string()),
    color: v.string(),
    icon: v.string(),
    streak:v.number(),
    progress:v.object({
      current:v.number(),
    }),
  }).index("by_user", ["userId"]),

  habitEntries: defineTable({
    habitId: v.id("habits"),
    date: v.string(),
    value: v.union(v.boolean(), v.number(), v.string()),
    notes: v.optional(v.string())
  }).index("by_habit_date", ["habitId", "date"]),

  notifications: defineTable({
    notificationId: v.string(),
    userId: v.id("users"), // Clerk user ID
    type: v.union(v.literal("message"), v.literal("reminder")),
    content: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  profiles: defineTable({
    userId: v.id("users"), // Foreign key reference to users
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    bloodGroup: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())), // Array of allergy names
    chronicConditions: v.optional(v.array(v.string())), // Diabetes, Hypertension, etc.
    medications: v.optional(v.array(v.string())), // List of current medications
    lifestyle: v.optional(
      v.object({
        smoking: v.optional(v.boolean()),
        alcohol: v.optional(v.boolean()),
        dietType: v.optional(
          v.union(
            v.literal("veg"),
            v.literal("non-veg"),
            v.literal("vegan"),
            v.literal("other")
          )
        ),
        activityLevel: v.optional(
          v.union(
            v.literal("sedentary"),
            v.literal("moderate"),
            v.literal("active")
          )
        ),
      })
    ),
    immunizationStatus: v.optional(v.array(v.string())), // List of vaccines taken
    familyHistory: v.optional(v.array(v.string())), // Family disease history
  }).index("by_userId", ["userId"]),

  appointments: defineTable({
    appointmentId: v.string(),
    userId: v.id("users"), // Foreign key reference
    consultantId: v.id("users"), // Reference to doctor/dietician
    date: v.number(), // Unix timestamp
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("canceled")
    ),
    notes: v.optional(v.string()), // Consultation notes
  })
    .index("by_userId", ["userId"])
    .index("by_doctorId", ["consultantId"]),
});
