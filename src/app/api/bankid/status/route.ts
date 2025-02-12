// src/app/api/bankid/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bankIDService } from "@/lib/bankid"; // Import the bankIDService

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderRef } = body;

    if (!orderRef) {
      return NextResponse.json(
        { success: false, error: "OrderRef is required" },
        { status: 400 }
      );
    }

    const result = await bankIDService.collectStatus(orderRef);

    console.log("API Response:", result); // Enhanced logging

    switch (result.status) {
      case "pending":
        return NextResponse.json(
          {
            success: true,
            status: result.status,
            hintCode: result.hintCode,
            message: bankIDService.getStatusMessage(result.hintCode), // Using the service method
          },
          { status: 202 }
        );

      case "complete":
        return NextResponse.json(
          {
            success: true,
            status: result.status,
            userData: result.userData,
          },
          { status: 200 }
        );

      case "failed":
        return NextResponse.json(
          {
            success: false,
            status: result.status,
            hintCode: result.hintCode,
            error: "BankID authentication failed",
          },
          { status: 400 }
        );

      default:
        return NextResponse.json(
          {
            success: false,
            status: "error",
            error: "Invalid status response",
          },
          { status: 500 }
        );
    }
  } catch (error) {
    console.error("BankID status check error:", error);
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
