// src/app/api/wordpress/check/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const personalNumber = searchParams.get("personal_number");

    if (!personalNumber) {
      return NextResponse.json(
        { success: false, message: "Personal number is required" },
        { status: 400 }
      );
    }

    const wpApiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!wpApiUrl) {
      throw new Error("WordPress API URL not configured");
    }

    const response = await fetch(
      `${wpApiUrl}/wp-json/bankid/v1/check-user?personal_number=${personalNumber}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    // Get raw response text
    const responseText = await response.text();
    console.log("Raw WordPress response:", responseText);

    // Try to extract JSON from the response
    let jsonStr = responseText;
    const jsonStart = responseText.indexOf("{");
    const jsonEnd = responseText.lastIndexOf("}");

    if (jsonStart >= 0 && jsonEnd >= 0) {
      jsonStr = responseText.substring(jsonStart, jsonEnd + 1);
    }

    // Parse the JSON
    let data;
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

    // Handle WordPress error responses
    if (!response.ok) {
      console.error("WordPress API error:", data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || `WordPress API returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    // Validate response format
    if (typeof data.success !== "boolean") {
      console.error("Unexpected WordPress response format:", data);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid response format from WordPress",
          debug: data,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("WordPress check error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
