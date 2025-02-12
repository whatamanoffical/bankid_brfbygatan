import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const personalNumber = searchParams.get("personal_number");

  if (!personalNumber) {
    return NextResponse.json(
      { success: false, message: "Missing personal number" },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-json/bankid/v1/check-user?personal_number=${personalNumber}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
