import { NextResponse } from 'next/server';
import { pool } from "@/lib/db";

export async function GET() {
  try {
    console.log("[Migration] Starting room pricing and capacity migration...");
    
    // 1. Ensure capacity column exists
    await pool.execute("ALTER TABLE Room ADD COLUMN IF NOT EXISTS capacity INT DEFAULT 2 AFTER price");

    // 2. Standardize all rooms to the new ETB prices and capacities
    // SINGLE SUITE -> 2000 ETB / 2 Guests
    await pool.execute("UPDATE Room SET price = 2000, capacity = 2 WHERE type = 'SINGLE'");
    // DOUBLE LUXE -> 4000 ETB / 4 Guests
    await pool.execute("UPDATE Room SET price = 4000, capacity = 4 WHERE type = 'DOUBLE'");
    // FAMILY PALACE -> 4500 ETB / 5 Guests
    await pool.execute("UPDATE Room SET price = 4500, capacity = 5 WHERE type = 'FAMILY'");
    // PRESIDENTIAL -> 6000 ETB / 6 Guests
    await pool.execute("UPDATE Room SET price = 6000, capacity = 6 WHERE type = 'PRESIDENTIAL'");

    console.log("[Migration] Room migration complete!");
    return NextResponse.json({ success: true, message: "Migration complete" });
  } catch (error: any) {
    console.error("[Migration] Failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
