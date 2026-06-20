import { NextResponse } from "next/server";
import { marketTrends } from "@/data/market-trends";

export async function GET() {
  return NextResponse.json({ trends: marketTrends, updatedAt: new Date().toISOString() });
}
