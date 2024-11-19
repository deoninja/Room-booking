'use server';

import { createSessionClient } from "@/config/appwite";
import { cookies } from "next/headers"; 
import { Query } from "node-appwrite";
import { redirect } from "next/navigation";

async function getMyRooms() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('appwrite-session');
    // const sessionCookie = await cookies().get('appwrite-session');
    if(!sessionCookie){
        redirect('login')
    }

    try {
        const {account, databases } = await createSessionClient(sessionCookie?.value);

        // Get user ID
        const user = await account.get();
        const userId =user.$id;

        // Fetch user's rooms
        const { documents: rooms } = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
            [Query.equal('user_id', userId)]
        );

        // Return rooms without revalidating in the same scope
        return rooms;
    } catch (error) {
        console.error('Failed to get user rooms:', error);
        redirect('/error');
    }
}

// Function to handle revalidation separately
export async function revalidateRooms() {
    try {
        revalidatePath('/', 'layout');
    } catch (error) {
        console.error('Failed to revalidate path:', error);
    }
}

export default getMyRooms;