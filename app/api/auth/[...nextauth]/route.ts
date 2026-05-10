import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {dbConnect} from "@/lib/db";
import { User } from "@/lib/models";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        
        // Find user by username
        const user = await User.findOne({ username: credentials?.username });

        // Production Check: Match plain text password (or use bcrypt.compare if hashed)
        if (user && user.password === credentials?.password) {
          return { 
            id: user._id.toString(), 
            name: user.username, 
            role: user.role 
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).name = token.username;
      }
      return session;
    }
  },
  pages: { signIn: '/login' },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };