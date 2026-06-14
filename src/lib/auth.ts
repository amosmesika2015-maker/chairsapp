import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const ADMIN_PASSWORD_HASH = bcrypt.hashSync(
  process.env.ADMIN_PASSWORD ?? "admin123",
  10
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        password: { label: "סיסמה", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials?.password as string | undefined;
        if (!password) return null;
        const valid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
        if (!valid) return null;
        return { id: "admin", name: "Admin" };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
});
