import { compare } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";

import { userRepository } from "@/lib/repositories";

export const credentialsProvider = Credentials({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const email =
      typeof credentials?.email === "string" ? credentials.email : undefined;
    const password =
      typeof credentials?.password === "string" ? credentials.password : undefined;

    if (!email || !password) return null;

    const user = await userRepository.findByEmailWithRole(email);
    if (!user || !user.isActive) return null;

    const valid = await compare(password, user.passwordHash);
    if (!valid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role.name,
    };
  },
});
