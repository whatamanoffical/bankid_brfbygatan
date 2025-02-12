// src/app/api/wordpress/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { WordPressLoginResponse } from "@/types/bankid";

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

    const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!wpApiUrl) {
      throw new Error("WordPress API URL not configured");
    }

    const response = await fetch(`${wpApiUrl}/wp-json/bankid/v1/login-user`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ personal_number }),
      credentials: "include",
    });

    const responseText = await response.text();
    console.log("Raw WordPress login response:", responseText);

    let jsonStr = responseText;
    const jsonStart = responseText.indexOf("{");
    const jsonEnd = responseText.lastIndexOf("}");

    if (jsonStart >= 0 && jsonEnd >= 0) {
      jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
    }

    let data: WordPressLoginResponse;
    try {
      data = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse WordPress response:", parseError);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from WordPress",
          debug: responseText,
        },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || `WordPress API returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    const cookies = response.headers.get("set-cookie");
    const headers = new Headers();
    if (cookies) {
      headers.set("Set-Cookie", cookies);
    }

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("WordPress login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
