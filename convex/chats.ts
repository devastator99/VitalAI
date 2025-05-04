import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { filter } from "convex-helpers/server/filter";
import { useMutation, useQuery } from "convex/react";
import { api, internal } from "./_generated/api";
import { assignDoctor, getCurrentUser } from "./users";
// import { Document } from "convex/server";

//USER ID IS ALWAYS EMAIL FOR USERS AND THE VARIABLE BELOW FOR AI-CHATS

const AI_SYSTEM_USER_ID = "user_2sWWt40nyCmSKCgChxS4mNICePr";

type Contact = {
  _id: string; // Convex document ID
  userId: string;
  name: string;
  role: "doctor" | "dietician";
  email: string | null;
  picture: string | null;
};

// export const initAiChat = mutation({
//   args: { userId: v.string() },
//   handler: async (ctx, args) => {
//     const user = await ctx.db
//       .query("users")
//       .filter((q) => q.eq(q.field("userId"), args.userId))
//       .first();

//     if (!user) {
//       throw new Error("User not found");
//     }

//     // Instead of using ctx.runQuery, define a helper function
//     const contacts = await useQuery(api.users.getContacts, {userId:user.userId!});

//     if (!contacts || !contacts.doctors || !contacts.dieticians) {
//       throw new Error(
//         "Failed to fetch user contacts or contacts structure is invalid"
//       );
//     }

//     let doctorIds = contacts.doctors.map((doc) => doc._id);
//     let dieticianIds = contacts.dieticians.map((diet) => diet._id);

//     if (doctorIds.length === 0) {
//       doctorIds = [await assignDoctor(ctx, user._id)];
//     }

//     if (dieticianIds.length === 0) {
//       dieticianIds = [await assignDietician(ctx, user._id)];
//     }

//     const participantIds = [...new Set([...doctorIds, ...dieticianIds])].filter(
//       (id) => !!id
//     );

//     if (participantIds.length === 0) {
//       throw new Error("No valid participants for AI chat");
//     }

//     try {
//       return await getOrCreateChat(ctx, {
//         senderId: user._id,
//         participantIds,
//         isAi: true,
//         type: "group",
//       });
//     } catch (error) {
//       console.error("Chat creation failed:", error);
//       throw new Error("Failed to initialize AI chat session");
//     }
//   },
// });

// export const initAiChat = mutation({
//   args: { userId: v.string() },
//   handler: async (ctx, args): Promise<string> => {
//     const user = await ctx.db
//       .query("users")
//       .filter((q) => q.eq(q.field("userId"), args.userId))
//       .first();

//     if (!user) {
//       throw new Error("User not found");
//     }

//     // Instead of using ctx.runQuery, define a helper function
//     const contacts = await useQuery(api.users.getContacts, { userId: user.userId! });

//     if (!contacts || !contacts.doctors || !contacts.dieticians) {
//       throw new Error(
//         "Failed to fetch user contacts or contacts structure is invalid"
//       );
//     }

//     let doctorIds = contacts.doctors.map((doc) => doc._id);
//     let dieticianIds = contacts.dieticians.map((diet) => diet._id);

//     if (doctorIds.length === 0) {
//       const newDoctorId = await useMutation(api.users.assignDoctor)({ userId: user.userId! });
//       doctorIds = [newDoctorId];
//     }

//     if (dieticianIds.length === 0) {
//       const newDieticianId = await useMutation(api.users.assignDietician)({ userId: user.userId! });
//       dieticianIds = [newDieticianId];
//     }

//     const participantIds = [...new Set([...doctorIds, ...dieticianIds])].filter(
//       (id) => !!id
//     );

//     if (participantIds.length === 0) {
//       throw new Error("No valid participants for AI chat");
//     }

//     try {
//       return await getOrCreateChat(ctx, {
//         senderId: user._id,
//         participantIds,
//         isAi: true,
//         type: "group",
//       });
//     } catch (error) {
//       console.error("Chat creation failed:", error);
//       throw new Error("Failed to initialize AI chat session");
//     }
//   },
// });

export const initAiChat = mutation({
  // args: { userId: v.string() }, // Accepts a string userId
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error("User is not authenticated.");
      throw new Error("User not authenticated"); // ✅ Return `null` instead of throwing an error
    }
    // Step 1: Find the user by their `userId`
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Step 2: Fetch or create user contacts
    let contacts = await ctx.db
      .query("contacts")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (!contacts) {
      // Create an empty contacts entry if none exists
      const newContactId = await ctx.db.insert("contacts", {
        userId: user._id,
        doctors: [],
        dieticians: [],
      });

      contacts = await ctx.db.get(newContactId);
      if (!contacts) {
        throw new Error("Failed to create contacts entry.");
      }
    }

    let doctorIds = contacts.doctors || [];
    let dieticianIds = contacts.dieticians || [];

    // Step 3: Assign a doctor if none exists
    if (doctorIds.length === 0) {
      const availableDoctor = await ctx.db
        .query("users")
        .withIndex("by_role_and_busy", (q) =>
          q.eq("role", "doctor").eq("busy", false)
        )
        .first();

      if (availableDoctor) {
        doctorIds.push(availableDoctor._id);
        await ctx.db.patch(contacts._id, { doctors: doctorIds });
      }
    }

    // Step 4: Assign a dietician if none exists
    if (dieticianIds.length === 0) {
      const availableDietician = await ctx.db
        .query("users")
        .withIndex("by_role_and_busy", (q) =>
          q.eq("role", "dietician").eq("busy", false)
        )
        .first();

      if (availableDietician) {
        dieticianIds.push(availableDietician._id);
        await ctx.db.patch(contacts._id, { dieticians: dieticianIds });
      }
    }

    // Step 5: Fetch the AI user (`ai_id`)
    // let aiUser = await ctx.db
    //   .query("users")
    //   .withIndex("by_role_and_busy", (q) =>
    //     q.eq("role", "ai").eq("busy", false)
    //   )
    //   .first();

    // if (!aiUser) {
    //   throw new Error("AI user not found.");
    // }

    // const ai_id = aiUser._id; // Store AI user ID

    // Step 6: Combine participant IDs (doctors, dieticians, and AI user)
    const participantIds = [
      ...new Set([...doctorIds, ...dieticianIds]),
    ].filter((id) => !!id).map(id => id as Id<"users">);

    if (participantIds.length === 0) {
      throw new Error("No valid participants for AI chat");
    }

    try {
      // Step 7: Initialize AI chat
      const chatId:any = await ctx.runMutation(
        api.chats.getOrCreateChat,
        {
          participantIds: participantIds,
          isAi: true,
          type: "group",
        }
      );

      return chatId;
    } catch (error) {
      console.error("Chat creation failed:", error);
      throw new Error("Failed to initialize AI chat session");
    }
  },
});

const getAiUser = async (ctx: any) => {
  let aiUser = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("userId"), AI_SYSTEM_USER_ID))
    .first();
  if (!aiUser) {
    const aiId = await ctx.db.insert("users", {
      userId: AI_SYSTEM_USER_ID,
      role: "ai",
      busy:false,
      createdAt: Date.now(),
      name: "AI Assistant",
      profileDetails: {},
    });
    aiUser = await ctx.db.get(aiId); // Get the full user object
  }

  return aiUser;
};
// Utility function to get a user's Convex ID
// GET USERS BY USERID
const getUserById = async (ctx: any, userId: string) => {
  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("userId"), userId))
    .first();

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  return user;
};

const getUserByConvexId = async (ctx: any, userId: string) => {
  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("_id"), userId))
    .first();

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  return user;
};

// ... existing code ...

// Get a chat by its ID
// ... existing code ...

// Get a chat by its ID
export const getChatById = query({
  args: {
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .filter((q: any) => q.eq(q.field("_id"), args.chatId))
      .first();

    if (!chat) {
      throw new Error(`Chat with ID ${args.chatId} not found`);
    }

    return chat;
  },
});
// Get chats for a specific user
export const getChats = query({
  handler: async (ctx): Promise<any[]> => {
    try {
      const sender = await ctx.runQuery(api.users.getCurrentUser);
      // First get the convex user ID from clerk userId
      // const user = await ctx.db
      //   .query("users")
      //   .withIndex("by_userId", (q) => q.eq("userId", sender!.userId!))
      //   .first();
    if (!sender) {
      return []; // Return empty array if user not found
    }
    const sid = sender._id;

      // Now filter chats using convex _id
      const chats = await ctx.db
        .query("chats")
        .withIndex("by_participants", q => q.eq("participants", [sid]))
        .collect();

      const sortedChats = chats.sort((a, b) => b.createdAt - a.createdAt);
      return sortedChats;
    } catch (error) {
      console.error("Error fetching chats:", error);
      throw new Error("Failed to fetch chats");
    }
  },
});

// Create a new chat
// THIS FUNCTION IS NOT USED DIRECTLY
export const createChat = mutation({
  args: {
    // senderId: v.string(), // this is clerk subject
    participantIds: v.array(v.id("users")), // this is convex id array
    isAi: v.boolean(),
    type: v.union(v.literal("private"), v.literal("group")),
  },
  handler: async (ctx, args) => {
    // const sender = await getUserById(ctx, args.senderId);
    const sender = await ctx.runQuery(api.users.getCurrentUser);
    if (!sender) {
      throw new Error("User not authenticated");
    }
    // Add sender as first participant, followed by other unique participants
    const allParticipants = [
      sender._id,
      ...args.participantIds.filter((id) => id !== sender._id),
    ];

    // Validate private chat constraints
    if (args.type === "private" && allParticipants.length !== 2) {
      throw new Error("Private chats must have exactly 2 participants");
    }

    // Check for an existing private chat with the same participants
    if (args.type === "private") {
      const existingChat: any = await ctx.db
        .query("chats")
        .filter((q) => q.eq(q.field("type"), "private"))
        .filter((q) => q.eq(q.field("participants"), allParticipants))
        .first();

      if (existingChat) {
        return existingChat._id; // Return existing chat if found
      }
    }

    // Create a new chat
    const chatId: any = await ctx.db.insert("chats", {
      chatownerId: sender._id,
      createdAt: Date.now(),
      isAi: args.isAi,
      updatedAt: Date.now(),
      participants: allParticipants,
      type: args.type,
    });

    return chatId;
  },
});

// Get or create a chat
export const getOrCreateChat = mutation({
  args: {
    // senderId: v.string(), //this is email
    participantIds: v.array(v.id("users")), // this is an array of userids(email) , leave this empty for ai chats , should only include the receiver
    isAi: v.boolean(),
    type: v.union(v.literal("private"), v.literal("group")),
  },
  handler: async (ctx, args) => {
    const sender: any = await ctx.runQuery(api.users.getCurrentUser);
    if (!sender) {
      console.log("");
    }

    // AI chat logic
    if (args.isAi) {
      const aiUser = await getAiUser(ctx);
      if (!aiUser?.userId) {
        throw new Error("Failed to initialize AI user");
      }

      // Check if AI chat already exists
      const existingChat = await ctx.db
        .query("chats")
        .filter((q) => q.eq(q.field("type"), "group")) //VERY IMPORTANT : ORDER MATTERS IN THE PARTICIPANTS ARRAY
        .filter((q) =>
          q.eq(q.field("participants"), [
            sender._id,
            ...args.participantIds,
            aiUser._id,
          ])
        )
        .first();

      if (existingChat) {
        return existingChat._id;
      }

      // Create AI chat if it doesn't exist
      return await ctx.db.insert("chats", {
        chatownerId: sender._id, // this is the userId -- email
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isAi: true,
        participants: [sender._id, ...args.participantIds, aiUser._id],
        type: "group",
      });
    }

    const allParticipants = [
      sender._id,
      ...args.participantIds.filter((id) => id !== sender._id),
    ];

    // Check for existing chat with the same participants
    const existingChats = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();

    const existingChat = existingChats.find((chat) => {
      if (chat.participants.length !== allParticipants.length) return false;
      return allParticipants.every((participantId) =>
        chat.participants.includes(participantId)
      );
    });

    if (existingChat) {
      return existingChat._id; // Return existing chat if found
    }

    // Create a new chat if no existing one matches
     const chatID :any =  await ctx.runMutation(api.chats.createChat, args);
     return chatID;
  },
});

// Delete a chat and associated data
export const deleteChat = mutation({
  args: {
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("_id"), args.chatId))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Fetch and delete associated messages
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("chatId"), chat._id))
      .collect();

    await Promise.all(
      messages.map(async (message) => {
        if (message.type !== "text" && message.attachId) {
          const mediaDoc = await ctx.db
            .query("media")
            .filter((q) => q.eq(q.field("messageId"), message._id))
            .first();
          if (mediaDoc) {
            await ctx.db.delete(mediaDoc._id);
          }
        }
        await ctx.db.delete(message._id); // Delete message
      })
    );

    // Delete the chat
    await ctx.db.delete(chat._id);

    return {
      success: true,
      message: "Chat and associated data deleted successfully",
    };
  },
});

export const getChatWithParticipants = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    const participantsWithRoles = await Promise.all(
      chat.participants.map(async (participantId) => {
        const user = await ctx.db.get(participantId);
        return {
          id: participantId,
          role: user?.role
        };
      })
    );

    return {
      ...chat,
      participants: participantsWithRoles,
    };
  },
});
