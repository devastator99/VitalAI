// import { createContext, useContext, useState } from "react";

// // 1️⃣ Create Context
// const UserContext = createContext<any>(null);

// // 2️⃣ User Provider Component (Wraps the App)
// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const [currentUser, setCurrentUser] = useState<string | null>(null);


//   // Example usage: You can set the current user when they log in
//   const loginUser = (userId: string) => {
//     setCurrentUser(userId);
//   };

//   return (
//     <UserContext.Provider value={{ currentUser, setCurrentUser, loginUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// }

// // 3️⃣ Hook to Use User Context in Components
// export function useConvexUser() {
//   return useContext(UserContext);
// }
