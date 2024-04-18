import { User, UserPreferences } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getPreferences(user: User) {
  return await prisma.userPreferences.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id }
  })
}

export async function savePreferences(preferences: UserPreferences) {
  await prisma.userPreferences.update({
    where: { id: preferences.id },
    data: {
      preferences
    }
  });
}
