'use server';

import { createAdminClient } from "@/config/appwite";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getSingleRoom(id) {
    const { databases } = await createAdminClient();

    try {
        // Fetch rooms
        const room = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
            id
        );

        // Return rooms without revalidating in the same scope
        return room;
    } catch (error) {
        console.error('Failed to get room:', error);
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

export default getSingleRoom;