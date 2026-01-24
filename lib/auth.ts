import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // Simple internal auth - in production, verify against database
        const validUsers = [
          { id: "1", email: "admin@company.com", name: "Admin User", role: "Admin" },
          { id: "2", email: "manager@company.com", name: "Account Manager", role: "Account Manager" }
        ];
        
        const user = validUsers.find(u => u.email === credentials.email);
        if (user && credentials.password === "password") {
          return user;
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
};
