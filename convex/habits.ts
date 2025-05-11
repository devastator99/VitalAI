import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getHabits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const createHabit = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("boolean"),
      v.literal("numeric"),
      v.literal("categorical")
    ),
    
    target: v.optional(v.number()),
    unit: v.optional(v.string()),
    frequency: v.array(v.string()),
    color: v.string(),
    icon: v.string(),
    streak: v.number(),
    progress: v.object({
      current: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Step 1: Find user using authenticated identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found.");
    }

    return await ctx.db.insert("habits", {
      userId: user._id,
      name: args.name,
      type: args.type,
      target: args.target,
      unit: args.unit,
      frequency: args.frequency,
      color: args.color,
      icon: args.icon,
      streak: args.streak,
      progress: args.progress,
    });
  },
});

export const logEntry = mutation({
  args: {
    habitId: v.id("habits"),
    value: v.union(v.boolean(), v.number(), v.string()),
    notes: v.optional(v.string()),
    date: v.string()
  },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.habitId);
    if (!habit) throw new Error("Habit not found");

    const currentDate = new Date().toISOString().split('T')[0];
    const currentStreak = habit.streak;
    
    return await ctx.db.insert("habitEntries", {
      habitId: args.habitId,
      value: args.value,
      notes: args.notes,
      date: args.date
    });
  },
});

export const getHabit = query({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getHabitEntries = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_date", (q) => q.eq("habitId", args.habitId))
      .collect();
  },
});

export const updateHabit = mutation({
  args: {
    id: v.id("habits"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("boolean"), v.literal("numeric"), v.literal("categorical"))),
    target: v.optional(v.number()),
    unit: v.optional(v.string()),
    frequency: v.optional(v.array(v.string())),
    color: v.optional(v.string()),
    icon: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const habit = await ctx.db.get(id);
    if (!habit) throw new Error("Habit not found");
    
    // Only update fields that were provided
    const validUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    return await ctx.db.patch(id, validUpdates);
  },
});


