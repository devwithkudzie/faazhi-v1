import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { error: "Use the Faazhi API service for learn data." },
    { status: 404 },
  );
}
