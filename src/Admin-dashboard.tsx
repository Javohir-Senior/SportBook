import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase.config";
import AdminNavbar from "./Admin-Navbar";
import "./index.css"

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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BookingType[];
      
      setBookings(fetchedBookings);
      setLoading(false);
    }, (error) => {
      console.error("Firebase xatolik:", error);
      setLoading(false);
    });

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
          <div className="no-data">Hozircha hech qanday buyurtma mavjud emas.</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Venue ID (Sport)</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((book) => (
                  <tr key={book.id}>
                    <td className="doc-id">#{book.id.slice(0, 8)}...</td>
                    <td className="sport-id">{book.sportId}</td>
                    <td className="date-cell">📅 {book.date}</td>
                    <td className="time-cell">
                      🕒 {book.startTime}:00 - {book.endTime}:00
                    </td>
                    <td>{book.endTime - book.startTime} hours</td>
                    <td>
                      <span className="status-tag confirmed">Confirmed</span>
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