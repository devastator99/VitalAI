import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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

export const saveMediaFile = mutation({
  args: {
    storageId: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get user document
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Create new media entry
    await ctx.db.insert("media", {
      storageId: args.storageId as Id<"_storage">,
      mimeType: args.mimeType,
      authorId: user._id,
      createdAt: Date.now(),
    });
  },
});

// export const processImageWithSharp = action({
//   args: {
//     originalStorageId: v.string(),
//     options: v.object({
//       maxWidth: v.number(),
//       quality: v.number(),
//       format: v.union(v.literal("webp"), v.literal("jpeg"), v.literal("png")),
//     }),
//   },
//   handler: async (ctx, args) => {
//     // 1. Get original image
//     const originalFile = await ctx.storage.getUrl(
//       args.originalStorageId as Id<"_storage">
//     );
//     if (!originalFile) throw new Error("Original image not found");

//     // 2. Process with Sharp
//     const processor = sharp(await (await fetch(originalFile)).arrayBuffer())
//       .resize({
//         width: args.options.maxWidth,
//         withoutEnlargement: true,
//         fit: "inside",
//       })
//       .toFormat(args.options.format, {
//         quality: args.options.quality,
//         progressive: true,
//       });

//     // 3. For PNG/JPG convert to webp if requested
//     if (args.options.format === "webp") {
//       processor.webp({ quality: args.options.quality });
//     }

//     // 4. Process and store new image
//     const processedBuffer = await processor.toBuffer();
//     const blob = new Blob([processedBuffer], {
//       type: `image/${args.options.format}`,
//     });
//     const processedStorageId = await ctx.storage.store(blob);

//     // 5. Optionally delete original
//     // await ctx.storage.delete(args.originalStorageId);
//     // 6. Get metadata
//     const metadata = await sharp(processedBuffer).metadata();

//     return {
//       storageId: processedStorageId,
//       mimeType: `image/${args.options.format}`,
//       dimensions: {
//         width: metadata.width,
//         height: metadata.height,
//       },
//     };
//   },
// });
