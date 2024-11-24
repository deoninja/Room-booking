'use client'
import { Toast, toast } from "react-toastify";
import cacelBooking from "@/app/actions/cacelBooking";

const CancelBookingButton = ({bookingId}) => {

    const handleCancelClick = async () => {
        if(!confirm('Are you sure you want to cancel the booking?')){
            return;
        }
        try {
            const result = await cacelBooking(bookingId)
            if(result.success) {
                toast.success('Booking cancelled successfully!')
            }
        } catch (error) {
            console.log('Failed to cacel booking', error);
            return {
                error:'Failed to cancel'
            }
        }
    }

    return (  
        <button
        onClick={handleCancelClick}
        className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto text-center hover:bg-red-700"
      >
        Cancel Booking
      </button>
    );
}
 
export default CancelBookingButton;