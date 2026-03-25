import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  let connection;
  try {
    const { status } = await req.json();
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        "UPDATE Booking SET status = ?, updatedAt = NOW() WHERE id = ?",
        [status, bookingId]
      );

      const [bookings]: any = await connection.execute(
        "SELECT roomId FROM Booking WHERE id = ?",
        [bookingId]
      );
      
      if (bookings.length > 0) {
        const roomId = bookings[0].roomId;
        if (status === "APPROVED" || status === "CHECKED_IN") {
          await connection.execute(
            "UPDATE Room SET status = 'OCCUPIED', isAvailable = false, updatedAt = NOW() WHERE id = ?",
            [roomId]
          );
        }
      }

      await connection.commit();

      const [updatedBookings]: any = await pool.execute(
        "SELECT * FROM Booking WHERE id = ?",
        [bookingId]
      );

      return NextResponse.json(updatedBookings[0]);
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 });
  }
}