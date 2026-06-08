import { prisma } from "../../lib/prisma.js";

export const bioAddService = async (userId: string, bio: string) => {
  
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      bio,
    },
  });

  return user;
}