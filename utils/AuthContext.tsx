// // AuthContext.tsx
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import type { Session, User } from "@supabase/supabase-js";

// interface AuthContextType {
//   user: User | null;
//   session: Session | null;
//   signUp: (email: string, password: string) => Promise<void>;
//   signIn: (email: string, password: string) => Promise<void>;
//   signInWithOtp: (phone: string) => Promise<void>;
//   verifyOtp: (phone: string, token: string) => Promise<void>;
//   signOut: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType>(null!);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [session, setSession] = useState<Session | null>(null);
//   const [user, setUser] = useState<User | null>(null);

//   // On mount: fetch current session & listen for changes
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setUser(session?.user ?? null);
//     });

//     const { data: listener } = supabase.auth.onAuthStateChange((_, s) => {
//       setSession(s);
//       setUser(s?.user ?? null);
//     });

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   const signUp = async (email: string, password: string) => {
//     const { error } = await supabase.auth.signUp({ email, password });
//     if (error) throw error;
//     // Supabase will send a confirmation email automatically
//   };

//   const signIn = async (email: string, password: string) => {
//     const { error } = await supabase.auth.signInWithPassword({ email, password });
//     if (error) throw error;
//   };

//   const signInWithOtp = async (phone: string) => {
//     const { error } = await supabase.auth.signInWithOtp({ phone });
//     if (error) throw error;
//   };

//   const verifyOtp = async (phone: string, token: string) => {
//     // Supabase-js v2 uses verifyOtp for SMS; adjust if using a different version
//     const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
//     if (error) throw error;
//   };

//   const signOut = async () => {
//     await supabase.auth.signOut();
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, session, signUp, signIn, signInWithOtp, verifyOtp, signOut }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Hook for easy access
// export const useAuth = () => useContext(AuthContext);
