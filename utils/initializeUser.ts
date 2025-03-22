import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";

export const useInitializeUser = () => {
  const createUser = useMutation(api.users.createUser);

  const initializeUser = async (user: {
    userId: string;
    name: string;
    email?: string;
    picture?: string;
  }) => {
    try {
      // await createUser({
      //   userId: user.userId as string,
      //   name: user.name,
      //   role: "user",
      //   busy: false,
      //   createdAt: Date.now(),
      //   profileDetails: {
      //     email: user.email,
      //   },
      // });
    } catch (error) {
      console.error("User initialization failed:", error);
    }
  };

  return { initializeUser };
};
