import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import type { DefaultSession } from "next-auth"

const ADMIN_EMAILS = ["onlyvardan@gmail.com", "studywithpwno.1@gmail.com"]

declare module "next-auth" {
  interface Session {
    user: { role?: string } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
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
      if (user?.email && ADMIN_EMAILS.includes(user.email)) {
        token.role = "admin"
      } else if (user) {
        token.role = "student"
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      return session
    },
    authorized: async ({ auth }) => {
      return !!auth
    },
  },
})
