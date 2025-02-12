// src/app/api/bankid/sign/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { BankIDService } from "@/lib/bankid";

export async function POST() {
  try {
    // Get client IP from headers
    const headersList = headers();
    const clientIp = (await headersList).get("x-forwarded-for") || "127.0.0.1";

    const bankIDService = new BankIDService();
    const signResponse = await bankIDService.initiateSign(clientIp);

    // Check if the sign request was successful
    if (!signResponse.authResponse?.Success || !signResponse.apiCallResponse) {
      return NextResponse.json(
        {
          success: false,
          error:
            signResponse.authResponse?.ErrorMessage ||
            "Failed to initiate BankID sign",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response: signResponse,
    });
  } catch (error) {
    console.error("BankID sign error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
