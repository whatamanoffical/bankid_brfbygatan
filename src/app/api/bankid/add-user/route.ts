import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, name, personalNumber } = await request.json();

  if (!email || !name || !personalNumber) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-json/bankid/v1/add-user`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, personal_number: personalNumber }),
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
