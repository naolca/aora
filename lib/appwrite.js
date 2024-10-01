import { Avatars, Client, Databases, Query } from "react-native-appwrite";
import { Account, ID } from "react-native-appwrite";
// import SignIn from "../app/(auth)/sign-in";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.firaol.aora",
  projectId: "66f94e320027e33ea18a",
  databaseId: "66f94f6500285e00487e",
  userCollectionId: "66f94f84003349801718",
  videoCollectionId: "66f94fa0001e09658da8",
  storageId: "66f950be00110d6e64e3",
};
// Init your React Native SDK

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
  .setProject(appwriteConfig.projectId) // Your project ID
  .setPlatform(appwriteConfig.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
  // console.log("this did get called");
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) {
      throw new Error("Error creating account");
    }
    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    // console.log("the user the is created in the database", newUser);

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    await account.deleteSessions();
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    if (error.message === "Session already exists") {
      // Handle the error here

      console.log("A session already exists");
    } else {
      console.log(error);
      throw new Error(error);
    }
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) {
      throw new Error("Error getting account");
    }
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) {
      throw new Error("Error getting user");
    }

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};
