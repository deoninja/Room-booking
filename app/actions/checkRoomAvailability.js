'use server';

import { createSessionClient } from "@/config/appwite";
import { cookies } from "next/headers"; 
import { Query } from "node-appwrite";
import { redirect } from "next/navigation";
import { DateTime } from "luxon";

//Convert a date string to a luxon DateTime object in UTC
function toUTCDateTime(dateString){
    return DateTime.fromISO(dateString, {zone: 'utc'}).toUTC();
}

// Check for ovaerlapping date ranges
function dateRangeOverlap(checkInA, checkOutA, checkInB, checkOutB){
    return checkInA < checkOutB && checkOutA > checkInB;
}

async function checkRoomAvailability(roomId, checkIn, checkOut) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('appwrite-session');
    // const sessionCookie = await cookies().get('appwrite-session');
    if(!sessionCookie){
        redirect('login')
    }

    try {
        const {databases } = await createSessionClient(sessionCookie?.value);

        const checkInDateTime = toUTCDateTime(checkIn);
        const checkOutDateTime = toUTCDateTime(checkOut);

        // Fetch all booking for a given room
        const { documents: bookings } = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
            [Query.equal('room_id', roomId)]
        );

        console.log('Bookings:', bookings); // Log the bookings

        // Loop over bookings and check for overlaps
        for(const booking of bookings){
            const bookingCheckInDateTime = toUTCDateTime(booking.check_in);
            const bookingCheckOutDateTime = toUTCDateTime(booking.check_out);

            console.log('Checking overlap:', checkInDateTime, checkOutDateTime, bookingCheckInDateTime, bookingCheckOutDateTime); // Log the overlap check

            if(dateRangeOverlap(
                checkInDateTime,
                checkOutDateTime,
                bookingCheckInDateTime,
                bookingCheckOutDateTime
            )){
                console.log('Overlap found'); // Log if overlap is found
                return false; // Overlap found do not book
            }
        }

        console.log('No overlap found'); // Log if no overlap is found
        return true; // No overlap found, book the room

    } catch (error) {
        console.error('Failed to check availability', error);
        return {
            error: 'Failed to check availability'
        }
    }
}

export default checkRoomAvailability;