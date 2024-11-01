'use server';

import { createAdminClient } from "@/config/appwite";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getAllRooms() {
    const { databases } = await createAdminClient();

    try {
        // Fetch rooms
        const { documents: rooms } = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
        );

        // Return rooms without revalidating in the same scope
        return rooms;
    } catch (error) {
        console.error('Failed to get rooms:', error);
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

export default getAllRooms;