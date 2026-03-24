import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

const ADMIN_EMAILS = ["onlyvardan@gmail.com", "studywithpwno.1@gmail.com"]

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Guest",
      credentials: {},
      async authorize() {
        return { 
          id: "guest_1", 
          name: "Seeker (Guest)", 
          email: "guest@ashrama.edu", 
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vedic" 
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      console.log('JWT Callback - Token:', token, 'User:', user);
      if (user?.email && ADMIN_EMAILS.includes(user.email)) {
        token.role = "admin"
      } else if (user) {
        token.role = "student"
      }
      return token
    },
    session({ session, token, user }) {
      console.log('Session Callback - Session:', session, 'Token:', token);
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub || token.id || user?.id;
      }
      return session
    },
    authorized: async ({ auth }) => {
      return !!auth
    },
  },
} satisfies NextAuthConfig
