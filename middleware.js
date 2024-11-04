import { NextResponse } from "next/server"; 

export async function middleware(request) {
    const isAuthenticated = true;

    if(!isAuthenticated){
        return NextResponse.redirect(new URL('/login', request.url))
    }
    // const {pathname} = request.nextUrl;

    // console.log(`Request Page: ${pathname}`);

    return NextResponse.next();
}

// run only on /bookings
export const config = {
    matcher: ['/bookings'],
}