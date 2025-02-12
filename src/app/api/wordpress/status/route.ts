// app/api/wordpress/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personal_number } = body;

    if (!personal_number) {
      return NextResponse.json(
        { success: false, message: "Personal number is required" },
        { status: 400 }
      );
    }

    const WP_API_URL = process.env.WORDPRESS_API_URL;
    const response = await fetch(`${WP_API_URL}/wp-json/bankid/v1/login-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ personal_number }),
    });

    const data = await response.json();

    // Forward cookies from WordPress response
    const headers = new Headers();
    const cookies = response.headers.get("set-cookie");
    if (cookies) {
      headers.set("Set-Cookie", cookies);
    }

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("WordPress login error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to login user in WordPress" },
      { status: 500 }
    );
  }
}
