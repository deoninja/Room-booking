import { NextResponse } from "next/server"; 

export async function middleware(request) {
    const {pathname} = request.nextUrl;

    console.log(`Request Page: ${pathname}`);

    return NextResponse.next();
}

// run only on login
export const config = {
    matcher: ['/login'],
}