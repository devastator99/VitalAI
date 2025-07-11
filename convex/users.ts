import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
const validator = require("validator");
import { filter } from "convex-helpers/server/filter";
import { Id } from "./_generated/dataModel";

// A D D  I N D E X E S  F O R  E A C H  F R E Q U E N T L Y  U S E D  Q U E R Y

// IF WE HAVE TO SEARCH A USER WE USE userID FIELD WHICH IS CLERK ID AND THE SEARCHING CAN ALSO BE DONE THROUGH CONVEX GENERATED _id BUT THERE'S NO
// WAY OF KNOWING THE ID EXCEPT JUST ACCESSING THE OBJECT AND EXTRACTING ...

// export const getOrAssignDoctor = mutation({
//   args: { userId: v.string() }, // Takes the user's ID as an argument
//   handler: async (ctx, args) => {
//     try {
//       // Find the user
//       const user = await ctx.db
//         .query("users")
//         .filter((q) => q.eq(q.field("userId"), args.userId))
//         .first();

//       if (!user) {
//         throw new Error("User not found.");
//       }

//       // Check if the user already has an assigned doctor
//       if (user.assignedDoctorId) {
//         const assignedDoctor = await ctx.db.get(user.assignedDoctorId);
//         if (assignedDoctor) {
//           return assignedDoctor.userId; // Return existing assigned doctor's userId
//         }
//       }

//       // Find an available doctor who is not busy
//       const doctor = await ctx.db
//         .query("users")
//         .filter((q) => q.eq(q.field("role"), "doctor"))
//         .filter((q) =>
//           q.or(
//             q.eq(q.field("busy"), false),
//             q.eq(q.field("busy"), null) // ✅ Handle null explicitly
//           )
//         )
//         .first(); // Fetch only one available doctor

//       if (!doctor) {
//         throw new Error("No available doctor found.");
//       }

//       // Assign the doctor to the user
//       await ctx.db.patch(user._id, { assignedDoctorId: doctor._id });

//       // Set the fetched doctor as busy
//       await ctx.db.patch(doctor._id, { busy: true });

//       // Return the newly assigned doctor's userId
//       return doctor.userId;
//     } catch (error) {
//       throw new Error(
//         `Fetching or assigning a doctor failed: ${(error as Error).message}`
//       );
//     }
//   },
// });

export const assignDoctor = mutation({
  args: { userId: v.string() }, // Takes the user's ID as an argument
  handler: async (ctx, args) => {
    try {
      // Step 1: Find the user
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first();

      if (!user) {
        throw new Error("User not found.");
      }

      // Step 2: Find the user's contact entry
      let userContacts = await ctx.db
        .query("contacts")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();

      // Step 3: Get all available doctors who are not busy
      const allAvailableDoctors = await ctx.db
        .query("users")
        .withIndex("by_role_and_busy", (q) =>
          q.eq("role", "doctor").eq("busy", false)
        )
        .collect(); // Resolves the query to an array

      // Step 4: Filter out already assigned doctors
      const availableDoctor = allAvailableDoctors.find(
        (doc) => !(userContacts?.doctors || []).includes(doc._id)
      );

      if (!availableDoctor) {
        throw new Error("No available doctor found.");
      }

      // Step 5: If user has no contact entry, create one and fetch the full object
      if (!userContacts) {
        const newContactId = await ctx.db.insert("contacts", {
          userId: user._id,
          doctors: [availableDoctor._id], // Store only the doctor ID
          dieticians: [],
        });

        // Fetch the full newly created contact document
        userContacts = await ctx.db.get(newContactId);
      } else {
        // Step 6: Update the user's contacts to add the new doctor (only by ID)
        await ctx.db.patch(userContacts._id, {
          doctors: [...(userContacts.doctors || []), availableDoctor._id],
        });
      }

      // Step 7: (Optional) Mark doctor as busy if needed (Uncomment in production)
      // await ctx.db.patch(availableDoctor._id, { busy: true });

      // Return the newly assigned doctor's userId
      return { assignedDoctorId: availableDoctor._id };
    } catch (error) {
      throw new Error(`Assigning a doctor failed: ${(error as Error).message}`);
    }
  },
});

export const getContacts = query({
  handler: async (ctx) => {
    try {
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

      // Step 2: Find the contacts entry using the internal `_id` from users table
      const userContacts = await ctx.db
        .query("contacts")
        .withIndex("by_userId", (q) => q.eq("userId", user._id)) // Now matching by correct Id<"users">
        .first();

      if (!userContacts) {
        return { doctors: [], dieticians: [] }; // Return empty lists if no contacts exist
      }

      // Step 3: Fetch doctor details
      const doctorObjects = await Promise.all(
        (userContacts.doctors || []).map(async (doctorId) => {
          const doctor = await ctx.db.get(doctorId);
          return doctor || null; // Ensure null values are handled
        })
      );

      // Step 4: Fetch dietician details
      const dieticianObjects = await Promise.all(
        (userContacts.dieticians || []).map(async (dieticianId) => {
          const dietician = await ctx.db.get(dieticianId);
          return dietician || null; // Ensure null values are handled
        })
      );

      // Step 5: Filter out null values (if any assigned users were deleted)
      return {
        doctors: doctorObjects.filter(Boolean), // Removes null values
        dieticians: dieticianObjects.filter(Boolean),
      };
    } catch (error) {
      throw new Error(`Fetching contacts failed: ${(error as Error).message}`);
    }
  },
});

// export const getOrAssignDietician = mutation({
//   args: { userId: v.string() }, // Takes the user's ID as an argument
//   handler: async (ctx, args) => {
//     try {
//       // Find the user
//       const user = await ctx.db
//         .query("users")
//         .filter((q) => q.eq(q.field("userId"), args.userId))
//         .first();

//       if (!user) {
//         throw new Error("User not found.");
//       }

//       // Check if the user already has an assigned dietician
//       if (user.assignedDieticianId) {
//         const assignedDietician = await ctx.db.get(user.assignedDieticianId);
//         if (assignedDietician) {
//           return assignedDietician.userId; // Return existing assigned dietician's userId
//         }
//       }

//       // Find an available dietician who is not busy
//       const dietician = await ctx.db
//         .query("users")
//         .filter((q) => q.eq(q.field("role"), "dietician"))
//         .filter((q) =>
//           q.or(
//             q.eq(q.field("busy"), false),
//             q.eq(q.field("busy"), null) // ✅ Handle null explicitly
//           )
//         )
//         .first(); // Fetch only one available dietician

//       if (!dietician) {
//         throw new Error("No available dietician found.");
//       }

//       // Assign the dietician to the user
//       await ctx.db.patch(user._id, { assignedDieticianId: dietician._id });

//       // Set the fetched dietician as busy
//       await ctx.db.patch(dietician._id, { busy: true });

//       // Return the newly assigned dietician's userId
//       return dietician.userId;
//     } catch (error) {
//       throw new Error(
//         `Fetching or assigning a dietician failed: ${(error as Error).message}`
//       );
//     }
//   },
// });

export const assignDietician = mutation({
  args: { userId: v.string() }, // Takes the user's ID as an argument
  handler: async (ctx, args) => {
    try {
      // Step 1: Find the user
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first();

      if (!user) {
        throw new Error("User not found.");
      }

      // Step 2: Find the user's contact entry
      let userContacts = await ctx.db
        .query("contacts")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();

      // Step 3: Get all available dieticians who are not busy
      const allAvailableDieticians = await ctx.db
        .query("users")
        .withIndex("by_role_and_busy", (q) =>
          q.eq("role", "dietician").eq("busy", false)
        )
        .collect(); // Resolves the query to an array

      // Step 4: Filter out already assigned dieticians
      const availableDietician = allAvailableDieticians.find(
        (doc) => !(userContacts?.dieticians || []).includes(doc._id)
      );

      if (!availableDietician) {
        throw new Error("No available dietician found.");
      }

      // Step 5: If user has no contact entry, create one and fetch the full object
      if (!userContacts) {
        const newContactId = await ctx.db.insert("contacts", {
          userId: user._id,
          doctors: [],
          dieticians: [availableDietician._id], // Store only the dietician ID
        });

        // Fetch the full newly created contact document
        userContacts = await ctx.db.get(newContactId);
      } else {
        // Step 6: Update the user's contacts to add the new dietician (only by ID)
        await ctx.db.patch(userContacts._id, {
          dieticians: [
            ...(userContacts.dieticians || []),
            availableDietician._id,
          ],
        });
      }

      // Step 7: (Optional) Mark dietician as busy if needed (Uncomment in production)
      // await ctx.db.patch(availableDietician._id, { busy: true });

      // Return the newly assigned dietician's userId
      return { assignedDieticianId: availableDietician._id };
    } catch (error) {
      throw new Error(
        `Assigning a dietician failed: ${(error as Error).message}`
      );
    }
  },
});

// returns the userID
export const getCurrentUser = query({
  handler: async (ctx) => {
    console.log("entered getcurrent user query conveX")
    const identity = await ctx.auth.getUserIdentity();
    console.log(identity , "getcurrentuser called");
    if (!identity) {
      console.error("User is not authenticated.");
      return null; // ✅ Return `null` instead of throwing an error
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!user) {
      console.warn("User not found in database.");
      return null; // ✅ Return `null` to avoid breaking UI
    }
    console.log(user._id , "user found");
    return user;
  },
});

// returns the user object
export const getuserbyId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!user) {
      console.warn("User not found in database.");
      return null; // ✅ Return `null` to avoid breaking UI
    }

    return user;
  },
});

// Utility function to validate email format
const validateEmail = (email: string | undefined) => {
  if (email && !validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
};

// Utility function to prepare profileDetails object with only defined fields
const prepareProfileDetails = (profileDetails: any) => {
  const details: Partial<{
    email: string;
    picture: string;
    height: number;
    weight: number;
  }> = {};

  if (profileDetails.email !== undefined) {
    validateEmail(profileDetails.email);
    details.email = profileDetails.email;
  }
  if (profileDetails.picture !== undefined) {
    details.picture = profileDetails.picture;
  }
  if (profileDetails.height !== undefined) {
    details.height = profileDetails.height;
  }
  if (profileDetails.weight !== undefined) {
    details.weight = profileDetails.weight;
  }

  return details;
};

// Create a new user
export const createUser = mutation({
  args: {
    role: v.union(
      v.literal("user"),
      v.literal("doctor"),
      v.literal("dietician"),
      v.literal("ai")
    ),
    busy: v.boolean(),
    name: v.optional(v.string()),
    profileDetails: v.optional(
      v.object({
        email: v.optional(v.string()),
        picture: v.optional(v.id("_storage")),
        height: v.optional(v.number()),
        weight: v.optional(v.number()),
        phone: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    try {
      // Validate email first
      if (args.profileDetails?.email) {
        validateEmail(args.profileDetails.email);
      }

      console.log("email address validated");

      // Check for existing user using guaranteed non-null identity
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject)) // Use index
        .first();

      if (existingUser) {
        return existingUser;
      }

      // 🔒 Enforce required userId from authenticated identity
      const newUser = await ctx.db.insert("users", {
        userId: identity.subject, // No optional chaining needed now
        role: args.role,
        createdAt: Date.now(),
        busy: args.busy,
        profileDetails: args.profileDetails,
      });

      console.log("new user --> from createuser:");
      console.log(newUser);
      return newUser;
    } catch (error) {
      throw new Error(`User creation failed: ${(error as Error).message}`);
    }
  },
});

export const createUserbyclerkID = mutation({
  args: {
    userId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("doctor"),
      v.literal("dietician"),
      v.literal("ai")
    ),
    busy: v.boolean(),
    name: v.optional(v.string()),
    profileDetails: v.optional(
      v.object({
        email: v.optional(v.string()),
        picture: v.optional(v.id("_storage")),
        height: v.optional(v.number()),
        weight: v.optional(v.number()),
        phone: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    try {
      // Validate email first
      if (args.profileDetails?.email) {
        validateEmail(args.profileDetails.email);
      }

      console.log("email address validated");

      // Check for existing user using guaranteed non-null identity
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId)) // Use index
        .first();

      if (existingUser) {
        return existingUser;
      }

      // 🔒 Enforce required userId from authenticated identity
      const newUser = await ctx.db.insert("users", {
        userId: args.userId, // No optional chaining needed now
        role: args.role,
        createdAt: Date.now(),
        busy: args.busy,
        profileDetails: args.profileDetails,
      });

      console.log("new user --> from createuser:");
      console.log(newUser);
      return newUser;
    } catch (error) {
      throw new Error(`User creation failed: ${(error as Error).message}`);
    }
  },
});

// Read user information by userId
export const readUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const userInfo = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .first();

      if (!userInfo) {
        throw new Error("User not found");
      }

      return userInfo;
    } catch (error) {
      throw new Error(`Reading user failed: ${(error as Error).message}`);
    }
  },
});

export const updateChatID = mutation({
  args: {
    defaultChatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    try {
      // Get the current user's identity
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      // Query the user based on a unique field, e.g., tokenIdentifier or subject
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject)) // Use index
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Update the user's defaultChatId
      await ctx.db.patch(user._id, { defaultChatId: args.defaultChatId });

      // Fetch and return the updated user
      const updatedUser = await ctx.db.get(user._id);
      return updatedUser;
    } catch (error) {
      throw new Error(`Updating user failed: ${(error as Error).message}`);
    }
  },
});

// Search users by name or email
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm) return [];

    const searchTermLower = args.searchTerm.toLowerCase();

    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("userId"), args.userId))
      .collect();

    return users
      .filter((user: any) => {
        const nameMatch = user?.name?.toLowerCase().includes(searchTermLower);
        const emailMatch = user?.profileDetails?.email
          ?.toLowerCase()
          .includes(searchTermLower);
        return nameMatch || emailMatch;
      })
      .slice(0, 10);
  },
});

// Update user profile details
export const updateProfileDetails = mutation({
  args: {
    name: v.optional(v.string()),
    profileDetails: v.optional(
      v.object({
        picture: v.optional(v.id("_storage")),
        height: v.optional(v.number()),
        weight: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    console.log("inside handler for ipdate profile details")
    const identity = await ctx.auth.getUserIdentity();
    console.log("identityxx", identity);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user using index
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Merge existing profile details with new updates
    const currentProfileDetails = user.profileDetails || {};
    const updateData: Partial<{ name: string; profileDetails: any }> = {};

    if (args.name) updateData.name = args.name;
    if (args.profileDetails) {
      updateData.profileDetails = {
        ...currentProfileDetails, // Keep existing fields
        ...prepareProfileDetails(args.profileDetails), // Apply updates
      };
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No update data provided");
    }

    // Perform update and return fresh data
    await ctx.db.patch(user._id, updateData);
    return await ctx.db.get(user._id);
  },
});

export const setRole = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Fetch the admin user
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", identity.subject))
      .unique();

    // Check admin privileges
    if (!adminUser || !adminUser.isAdmin) {
      throw new Error("Only admins can set roles");
    }

    // Fetch the TARGET user to modify
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .unique();

    if (!targetUser) {
      throw new Error("Target user not found");
    }

    // Update the TARGET user's role
    await ctx.db.patch(targetUser._id, { isAdmin: true });
  },
});

// Add user and associate with a chat
// export const addUserWithChat = mutation({
//   args: {
//     userId: v.string(),
//     name: v.string(),
//     chatId: v.string(),
//     role: v.union(
//       v.literal("user"),
//       v.literal("doctor"),
//       v.literal("dietician"),
//       v.literal("ai")
//     ),
//     createdAt: v.number(),
//   },
//   handler: async (ctx, args) => {
//     try {
//       // Check if user already exists
//       let user = await ctx.db
//         .query("users")
//         .filter((q) => q.eq(q.field("userId"), args.userId))
//         .first();

//       if (!user) {
//         const newUserId = await ctx.db.insert("users", {
//           userId: args.userId,
//           name: args.name,
//           role: args.role,
//           createdAt: args.createdAt,
//         });
//         user = await ctx.db.get(newUserId);
//         if (!user) throw new Error("Failed to create user");
//       }

//       // Find the chat
//       const chat = await ctx.db
//         .query("chats")
//         .filter((q) => q.eq(q.field("_id"), args.chatId))
//         .first();

//       if (!chat) {
//         throw new Error("Chat not found");
//       }

//       const participants = chat.participants || [];
//       if (!participants.some((participantId) => participantId === user._id)) {
//         await ctx.db.patch(chat._id, {
//           participants: [...participants, user._id],
//         });
//       }

//       return { success: true, userId: args.userId, chatId: args.chatId };
//     } catch (error) {
//       throw new Error(
//         `Failed to add user to chat: ${(error as Error).message}`
//       );
//     }
//   },
// });

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const checkAdmin = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return (identity.publicMetadata as { role?: string })?.role === "admin";
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    // 1. Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Authorization check - get current user first
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!currentUser?.isAdmin) {
      throw new Error("Unauthorized - Admin access required");
    }

    // 3. Query all users with proper indexing and schema fields
    const users = await ctx.db
      .query("users")
      .order("desc") // Use system timestamp for ordering
      .collect();

    // 4. Map to safe user objects with schema-appropriate fields
    return users.map((user) => ({
      _id: user._id,
      userId: user.userId, // Clerk ID
      name: user.name,
      role: user.role,
      busy: user.busy,
      isApproved: user.isApproved,
      profileDetails: {
        // Only include non-sensitive profile details
        email: user.profileDetails?.email,
        picture: user.profileDetails?.picture,
        height: user.profileDetails?.height,
        weight: user.profileDetails?.weight,
      },
      createdAt: user.createdAt, // User-provided timestamp
      _creationTime: user._creationTime, // System timestamp
    }));
  },
});

export const isAdmin = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Check if userId is null or undefined
      if (!args.userId) {
        throw new Error("userId must be provided"); // Throw an error if userId is not provided
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .unique();

      if (!user) {
        return null; // User not found, not admin
      }

      return !!user.isAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false; // Default to not admin in case of error
    }
  },
});

// In your Convex functions
export const getCurrentUserAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // Not logged in
    }

    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return user?.isAdmin || false;
  },
});

export const getStatus = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first();

      if (!user) {
        return null;
      }

      return !!user.isApproved;
    } catch (error) {
      console.log(`fetching user status failed: ${(error as Error).message}`);
      return false;
    }
  },
});

export const setStatus = mutation({
  args: {
    userId: v.string(),
    isApproved: v.boolean(), // status of the user - new or not
  },
  handler: async (ctx, args) => {
    try {
      // Get the current user's identity
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      // Query the user based on userId
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId)) // Use index
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Update the user's status
      await ctx.db.patch(user._id, { isApproved: args.isApproved });

      // Fetch and return the updated user
      const updatedUser = await ctx.db.get(user._id);
      return updatedUser;
    } catch (error) {
      throw new Error(
        `Updating user status failed: ${(error as Error).message}`
      );
    }
  },
});

export const checkProfileFilled = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!user) return false;

    // Check name exists and isn't empty
    const isNameFilled = !!user.name?.trim();

    // Check required profile fields (phone, height, weight)
    let isProfileFilled = false;
    if (user.profileDetails) {
      const { phone, height, weight } = user.profileDetails;
      isProfileFilled =
        (phone !== undefined && phone.trim() !== "") || // Phone exists and isn't empty
        height !== undefined || // Any height value (including 0)
        weight !== undefined; // Any weight value (including 0)
    }

    return isNameFilled && isProfileFilled;
  },
});

export const isNewUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user exists in database
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    // If user is null, they're a new user
    return user === null;
  },
});

export const infoStatus = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!user) {
      return false; // User not found
    }

    // Check if name exists and isn't empty
    const nameIsNotEmpty = Boolean(user.name?.trim());

    // Check if questionnaire exists and has been completed
    const hasCompletedQuestionnaire = Boolean(user.questionnaire?.completedAt);

    // Return true if both name is not empty AND questionnaire is completed
    if (nameIsNotEmpty && hasCompletedQuestionnaire) {
      return true;
    }

    return false;
  },
});

export const getUsersByIds = query({
  args: {
    userIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const users = await Promise.all(args.userIds.map((id) => ctx.db.get(id)));
    return users.filter((user) => user !== null);
  },
});

export const updateUserProfile = mutation({
  args: {
    questionnaire: v.object({
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
        dinner: v.union(v.string(), v.null()),
      }),
      heaviestMeal: v.string(),
      activityLevel: v.string(),
      workouts: v.object({
        doWorkouts: v.boolean(),
        days: v.array(v.string()),
        time: v.union(v.string(), v.null()),
        type: v.string(),
        duration: v.string(),
      }),
      location: v.string(),
      homeCuisine: v.string(),
      otherCuisines: v.array(v.string()),
      primaryGoal: v.string(),
      completedAt: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find the user by the authenticated identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update the user document with questionnaire data
    await ctx.db.patch(user._id, {
      questionnaire: args.questionnaire,
    });

    return user._id;
  },
});

export const helloWorld = query({
  handler: async () => {
    console.log("helloWorld handler called!");
    return "Hello from Convex!";
  },
});

// Create the AI user if it doesn't exist
export const createAIUser = mutation({
  handler: async (ctx) => {
    const AI_USER_ID = "AI_USER";
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), AI_USER_ID))
      .first();
    if (existingUser) {
      return;
    }
    await ctx.db.insert("users", {
      userId: AI_USER_ID,
      name: "AI Assistant",
      profileDetails: {
        email: "ai@example.com",
      },
      role: "ai",
      busy: false,
      createdAt: Date.now(),
    });
    return "AI user created successfully";
  },
});
