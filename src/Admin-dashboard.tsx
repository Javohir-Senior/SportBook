import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase.config";
import AdminNavbar from "./Admin-Navbar";
import "./index.css";
import { deleteDoc, doc } from "firebase/firestore";

interface BookingType {
  id: string;
  sportId: string;
  date: string;
  startTime: number;
  endTime: number;
  createdAt: any;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const todayString = new Date().toISOString().split("T")[0];

        const fetchedBookings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BookingType[];

        for (const booking of fetchedBookings) {
          if (booking.date < todayString) {
            await deleteDoc(doc(db, "bookings", booking.id));
          }
        }

        setBookings(fetchedBookings.filter((b) => b.date >= todayString));
        setLoading(false);
      },
      (error) => {
        console.error("Firebase xatolik:", error);
        setLoading(false);
      },
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
          <div className="no-data">
            Hozircha hech qanday buyurtma mavjud emas.
          </div>
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
                {bookings.map((book: any) => (
                  <tr key={book.id} className="table-row">
                    {/* Booking ID & User */}
                    <td className="doc-id">
                      <div className="flex-col">
                        <span
                          className="id-text"
                          style={{ fontWeight: "bold" }}
                        >
                          #{book.id.slice(0, 8)}...
                        </span>
                        <span className="user-name" style={{ color: "#888" }}>
                          {book.userInfo?.name || "Noma'lum"}{" "}
                          {book.userInfo?.surname || ""}
                        </span>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="date-time-cell">
                      <div
                        className="cell-content"
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <span>📅 {book.date}</span>
                        <span>
                          🕒 {book.startTime}:00 - {book.endTime}:00
                        </span>
                      </div>
                    </td>

                    {/* Payment Info */}
                    <td className="payment-cell">
                      <div className="flex-col">
                        <span
                          className="price"
                          style={{ color: "#4caf50", fontWeight: "bold" }}
                        >
                          {book.paymentInfo?.amountPaid || 0} sum
                        </span>
                        <span
                          className="card-type"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {book.paymentInfo?.cardType || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className="status-tag confirmed"
                        style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          background: "#1b3a20",
                          color: "#4caf50",
                        }}
                      >
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
