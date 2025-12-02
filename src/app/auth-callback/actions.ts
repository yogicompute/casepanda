"use server";

import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";

export const getAuthStatus = async () => {
  const user = await currentUser();

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress;

  if (!user?.id || !email) {
    throw new Error("Invalid user data");
  }

  const existingUser = await db.user.findUnique({
    where: { id: user.id },
  });
  if (!existingUser) {
    await db.user.create({
      data: {
        id: user.id,
        email,
      },
    });
  }
  return { success: true };
};
