// convex/images.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

//save the storage url  in _storage table and connect it with the user , 
// then use the id in storage in place of your image , so that you can 
// call it in client directly with the storage id with getimageurl query






export const saveProfilePicture = mutation({
  args: {
    picastorageId: v.id("_storage"),
    // Add other fields as needed
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Find existing user
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Update existing user's picture
    await ctx.db.patch(user._id, {
      profileDetails: {
        picture: args.picastorageId,
      },
    });
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
