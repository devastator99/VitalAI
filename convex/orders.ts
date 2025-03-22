import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const insertData = internalMutation({
  args: {
    amount: v.number(),
    orderId: v.string(), // Amount in smallest currency unit (e.g., 50000 paise = ₹500)
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("orders", {
      orderId: args.orderId,
      amount: args.amount,
      status: "created",
      createdAt: Date.now(),
    });

    console.log('internal mutation orders triggered.')
  },
});

export const verifyDrill = internalMutation({
  args: {
    orderId: v.string(), // Amount in smallest currency unit (e.g., 50000 paise = ₹500)
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .unique();

    if (!order) {
      throw new Error("Order not found.");
    }

    // Update order status to "paid" if verification succeeds
    await ctx.db.patch(order._id, { status: "paid" });
  },
});


// Add to your convex/orders.ts
export const get = internalQuery({
  args: { orderId: v.string() },
  handler: async (ctx, { orderId }) => {
    return await ctx.db
      .query("orders")
      .filter(q => q.eq(q.field("orderId"), orderId))
      .unique();
  }
});