import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { personalNumber } = await request.json();

  if (!personalNumber) {
    return NextResponse.json(
      { success: false, message: "Missing personal number" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-json/bankid/v1/login-user`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personal_number: personalNumber }),
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
