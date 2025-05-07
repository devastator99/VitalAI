import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getThreeDayPlan = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error("User is not authenticated.");
      throw new Error("User not authenticated");
    }

    // Get user document
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Generate dates (yesterday, today, tomorrow)
    const now = new Date();
    const dates = {
      yesterday: new Date(now),
      today: new Date(now),
      tomorrow: new Date(now),
    };
    dates.yesterday.setDate(now.getDate() - 1);
    dates.tomorrow.setDate(now.getDate() + 1);

    // Format dates as YYYY-MM-DD strings
    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    const dateStrings = [
      formatDate(dates.yesterday),
      formatDate(dates.today),
      formatDate(dates.tomorrow),
    ];

    // Fetch data for all three days
    const threeDayPlan = await Promise.all(
      dateStrings.map(async (dateStr) => {
        // Get daily plan
        const plan = await ctx.db
          .query("dailyplan")
          .withIndex("by_userId_and_date", (q) =>
            q.eq("userId", user._id).eq("date", dateStr)
          )
          .first();

        if (!plan) return { date: dateStr, exists: false }; // Mark missing plans

        // Get completion status
        const completion = await ctx.db
          .query("completions")
          .withIndex("by_userId_and_date", (q) =>
            q.eq("userId", user._id).eq("date", dateStr)
          )
          .first();

        // Resolve meals
        const meals: Record<string, any> = {};
        for (const [mealType, mealIds] of Object.entries(plan.meals)) {
          meals[mealType] = await Promise.all(
            (mealIds as string[]).map(async (mealId: any) => ({
              ...(await ctx.db.get(mealId)),
              isCompleted:
                completion?.completedMeals?.includes(mealId) || false,
            }))
          );
        }

        // Resolve exercises
        const exercises = await Promise.all(
          (plan.exercises as string[]).map(async (exerciseId: any) => ({
            ...(await ctx.db.get(exerciseId)),
            isCompleted:
              completion?.completedExercises?.includes(exerciseId) || false,
          }))
        );

        return {
          date: dateStr,
          exists: true,
          meals,
          exercises,
        };
      })
    );

    return threeDayPlan;
  },
});

//   export const markComplete = mutation({
//     args: { userId: v.id("users"), date: v.string(), mealId: v.id("meals") },
//     handler: async (ctx, args) => {
//       // Upsert: Create a completion entry if none exists, else update
//       let completion = await ctx.db.query("completions")
//         .filter(q => q.eq(q.field("userId"), args.userId))
//         .filter(q => q.eq(q.field("date"), args.date))
//         .first();

//       if (!completion) {
//         completion = await ctx.db.insert("completions", {
//           userId: args.userId,
//           date: args.date,
//           completedMeals: [args.mealId],
//           completedExercises: [],
//         });
//       } else {
//         await ctx.db.patch(completion._id, {
//           completedMeals: [...completion.completedMeals, args.mealId],
//         });
//       }
//     },
//   });


export const getMealById = query({
  args: { mealId: v.id("meals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mealId);
  },
});

export const getExerciseById = query({
  args: { exerciseId: v.id("exercises") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.exerciseId);
  },
});