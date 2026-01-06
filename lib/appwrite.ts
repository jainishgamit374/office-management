import { SignInParams, SignUpParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Storage } from "react-native-appwrite";


export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    Platform: "com.infinitesoftech.employmanagement",
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '693a966a00028fde5a38',
    userCollecionId: 'user',
};

export const client = new Client();
client
    .setEndpoint(appwriteConfig.endpoint!)
    .setProject(appwriteConfig.projectID!)
    .setPlatform(appwriteConfig.Platform!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

export const createUser = async ({ name, email, phone, password }: SignUpParams) => {
    try {
        console.log('📝 Creating account for:', email);

        // Appwrite account.create expects: (ID, email, password, name)
        const newAccount = await account.create(ID.unique(), email, password, name);
        if (!newAccount) throw new Error('Failed to create account');
        console.log('✅ Account created:', newAccount.$id);

        // Automatically sign in the user to send verification email
        console.log('🔐 Signing in to send verification email...');
        await signIn({ email, password });
        console.log('✅ Signed in successfully');

        // Send email verification
        try {
            console.log('📧 Sending verification email...');
            // You need to set up your verification URL in Appwrite console
            // The URL should redirect back to your app
            await account.createVerification('https://your-app-url.com/verify');
            console.log('✅ Verification email sent');
        } catch (verificationError) {
            console.error('❌ Failed to send verification email:', verificationError);
            // Don't throw error here - account is created, just verification failed
        }

        // Sign out the user immediately - they must verify email before signing in
        console.log('🚪 Signing out user...');
        await signOut();
        console.log('✅ User signed out - must verify email to sign in');

        return newAccount;

    } catch (error: any) {
        console.error('❌ Create user error:', error);
        throw new Error(error.message || 'Failed to create user')
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        if (!session) throw new Error('Failed to create session');
        return session;
    } catch (error: any) {
        console.error('Sign in error:', error);
        throw new Error(error.message || 'Failed to sign in')
    }
}

export const signOut = async () => {
    try {
        await account.deleteSession('current');
        console.log('✅ Sign out successful');
    } catch (error: any) {
        console.error('Sign out error:', error);
        // Don't throw error - user might already be signed out
    }
};