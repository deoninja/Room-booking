'use server';

import { createSessionClient } from "@/config/appwite";
import { cookies } from "next/headers"; 
import { Query } from "node-appwrite";
import { redirect } from "next/navigation";
import checkAuth from "./checkAuth";


async function getMyBookings() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('appwrite-session');
    // const sessionCookie = await cookies().get('appwrite-session');
    if(!sessionCookie){
        redirect('login')
    }

    try {
        const {databases } = await createSessionClient(sessionCookie?.value);

        // Get user ID
        const {user} = await checkAuth();

        if(!user) {
            return {
                error: 'You must be logged in to view bookings'
            }
        }

        // Fetch user's bookings
        const { documents: bookings } = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
            [Query.equal('user_id', user.id)]
        );

        // Return rooms without revalidating in the same scope
        return bookings;
    } catch (error) {
        console.error('Failed to get user rooms:', error);
        return {
            error: 'Failed to get user bookings'
        }
    }
}


export default getMyBookings;