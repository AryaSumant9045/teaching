import NextAuth from "next-auth"
import type { DefaultSession } from "next-auth"
import authConfig from "./auth.config"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"

const ADMIN_EMAILS = ["onlyvardan@gmail.com", "studywithpwno.1@gmail.com"]

declare module "next-auth" {
  interface Session {
    user: { role?: string } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') return true

      if (user.email) {
        try {
          await connectDB()
          const existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            await User.create({
              name: user.name || 'New Seeker',
              email: user.email,
              image: user.image || '',
              role: ADMIN_EMAILS.includes(user.email) ? 'admin' : 'student',
              provider: account?.provider || 'google'
            })
          }
        } catch (error) {
          console.error("Error saving user to DB during signIn", error)
        }
      }
      return true
    },
  },
})
