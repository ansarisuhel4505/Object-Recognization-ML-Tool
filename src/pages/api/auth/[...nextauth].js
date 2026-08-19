import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    // 1. Google Login Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // 2. Admin Generated Credentials Provider
    CredentialsProvider({
      name: "Company Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@company.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) throw new Error("Account not found!");
        if (user.status === 'blocked') throw new Error("Your account has been blocked by Admin.");
        if (!user.password) throw new Error("Please login using Google.");

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) throw new Error("Invalid password!");

        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    // Jab koi Google se login kare toh DB me check karna
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        await dbConnect();
        let dbUser = await User.findOne({ email: user.email });
        
        // Agar naya user hai toh DB me add kar do
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role: 'user', // Default user
            status: 'active'
          });
        }
        
        // Agar Admin ne block kiya hai toh login fail kar do
        if (dbUser.status === 'blocked') return false; 
        
        user.role = dbUser.role; // Role pass kar rahe hain
      }
      return true;
    },
    // Session me Role save karna taaki frontend par admin features dikha sakein
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) session.user.role = token.role;
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);