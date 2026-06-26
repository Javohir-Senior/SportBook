import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase.config";
import AdminNavbar from "./Admin-Navbar";
import "./index.css";

interface BookingType {
  id: string;
  sportId: string;
  date: string;
  startTime: number;
  endTime: number;
  createdAt: any;
  userInfo?: { name: string; surname: string };
  paymentInfo?: { amountPaid: number; cardType: string };
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Bugungi sanani olish (YYYY-MM-DD formatida)
    const todayString = new Date().toISOString().split("T")[0];

    // FAQAT bugun va kelajakdagi buyurtmalarni olish uchun so'rov
    const q = query(
      collection(db, "bookings"),
      where("date", ">=", todayString),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedBookings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BookingType[];

        setBookings(fetchedBookings);
        setLoading(false);
      },
      (error) => {
        console.error("Firebase xatolik:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="admin-dashboard-page">
      <AdminNavbar />

      <div className="admin-container">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Monitor all "Book Now" reservations in real-time</p>
          </div>
          <div className="stats-badge">
            Total Bookings: <span>{bookings.length}</span>
          </div>
        </header>

        {loading ? (
          <div className="admin-loading">Loading dashboard data...</div>
        ) : bookings.length === 0 ? (
          <div className="no-data">Hozircha faol buyurtmalar mavjud emas.</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking & User</th>
                  <th>Date & Time</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((book) => (
                  <tr key={book.id} className="table-row">
                    <td className="doc-id">
                      <div className="flex-col">
                        <span style={{ fontWeight: "bold" }}>#{book.id.slice(0, 8)}...</span>
                        <span style={{ color: "#888" }}>
                          {book.userInfo?.name || "Noma'lum"} {book.userInfo?.surname || ""}
                        </span>
                      </div>
                    </td>
                    <td className="date-time-cell">
                      <div className="cell-content" style={{ display: "flex", flexDirection: "column" }}>
                        <span>📅 {book.date}</span>
                        <span>🕒 {book.startTime}:00 - {book.endTime}:00</span>
                      </div>
                    </td>
                    <td className="payment-cell">
                      <div className="flex-col">
                        <span style={{ color: "#4caf50", fontWeight: "bold" }}>
                          {book.paymentInfo?.amountPaid || 0} sum
                        </span>
                        <span style={{ fontSize: "0.75rem" }}>
                          {book.paymentInfo?.cardType || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="status-tag confirmed" style={{ padding: "4px 10px", borderRadius: "12px", background: "#1b3a20", color: "#4caf50" }}>
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}