'use server';

import { createSessionClient } from "@/config/appwite";
import { cookies } from "next/headers"; 
import { Query } from "node-appwrite";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function deleteRoom(roomId) {
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

        // Find room to delete
        const roomTodelete = rooms.find((room) => room.$id === roomId);

        // Delete the room
        if(roomTodelete) {
            await databases.deleteDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
                process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
                roomTodelete.$id
            );

            // Revalidate my rooms and all rooms
            revalidatePath('/rooms/my', 'layout');
            revalidatePath('/', 'layout');

            return {
                success : true
            }
        }else{
            return {
                error : 'Room not found',
            }
        }
    } catch (error) {
        console.error('Failed to delete rooms', error);
        return {
            error: 'Failed to delete room',
        }
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

export default deleteRoom;