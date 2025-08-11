import { currentUser as getCurrentUser } from "@clerk/nextjs/server";
import db from "./prismadb";

export const checkUserAuthDB = async () => {
  // This function checks if the user is authenticated & present in the clear auth and returns the user data
  const currentUser = await getCurrentUser();

  console.log("Checking user in database...", currentUser);

  // If the user is not authenticated, return null
  if (!currentUser) {
    return null;
  }

  // If the user is authenticated, check if the user exists in the supabase database
  try {
    // If the user exists db, return the user data
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: currentUser.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // If the user does not exist in the db, create a new user
    const name = currentUser.firstName + " " + currentUser.lastName;
    const newUser = await db.user.create({
      data: {
        clerkUserId: currentUser.id,
        email: currentUser.emailAddresses[0].emailAddress,
        name,
        imageUrl: currentUser.imageUrl,
      },
    });
    console.log("Checking user in database... newUser", newUser);
    // Return the newly created user
    return newUser;
  } catch (error) {
    console.log("Error checking user in database:", error);
  }
};
