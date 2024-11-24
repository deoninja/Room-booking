'use server';

import { createSessionClient } from "@/config/appwite";
import { cookies } from "next/headers"; 
import { redirect } from "next/navigation";
import {revalidatePath} from "next/cache";
import checkAuth from "./checkAuth";

async function cacelBooking(bookingId) {
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
            return{
                error: 'You must be logged in to cancel a booking'
            }
        }

        // Get the booking
        const booking = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
            bookingId
        );

        // Check if booking belong to current user
        if(booking.user_id !== user.id){
            return{
                error: 'You are not authorized to cancel this booking'
            }
        }

        // Delete booking
        await databases.deleteDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
            bookingId
        );

        revalidatePath('/bookings', 'layout');

        return{
            success: true,
        }

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
        console.error('Failed to cancel booking', error);
        return {
            error: 'Failed to cancel booking'
        }
    }
}

export default cacelBooking;