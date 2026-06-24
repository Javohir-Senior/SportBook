import { useEffect, useState } from "react";
import "./index.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.config";
import { Link } from "react-router-dom";

export default function Home() {
  const [sports, setSports] = useState<any>([]);

  useEffect(() => {
    getProduct();
  }, []);

  function getProduct() {
    const getCol = collection(db, "Sports");

    getDocs(getCol).then((res) => {
      const a: any = res.docs.map((itm: any) => {
        return { ...itm.data(), id: itm.id };
      });
      setSports(a);
    });
  }
  return (
    <div className="home">
      <div className="container">
        <nav className="navbar">
          <div className="logo">
            Sport<span>Book</span>
          </div>

          <div className="nav-links">
            <a href="/">Venues</a>
            <a href="/">How it works</a>
            <a href="/">About</a>
            <a href="/">Blog</a>
            <a href="/">Contact</a>
            {/* Admin tugmasi shu yerga qo'shildi */}
            <Link to="/admin" className="admin-btn">
              Admin
            </Link>
          </div>
        </nav>

        <section className="hero">
          <div className="glow left"></div>
          <div className="glow right"></div>

          <div className="hero-content">
            <h1>
              Find & Book <br />
              Premium <span>Sports</span> Venues
            </h1>

            <p>
              Football, Tennis, Padel, Fitness and more.
              <br />
              Book anytime, anywhere.
            </p>
          </div>
        </section>

        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div>
              <h3>12,000+</h3>
              <p>Bookings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏟️</div>
            <div>
              <h3>500+</h3>
              <p>Venues</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div>
              <h3>4.8</h3>
              <p>Average Rating</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div>
              <h3>Safe</h3>
              <p>Secure Payments</p>
            </div>
          </div>
        </div>

        {/* VENUES */}
        <div className="section-header">
          <h2>Popular Venues</h2>
          <Link to="/">View all venues →</Link>
        </div>

        <div className="venues-grid">
          {sports.map((venue: any) => (
            <div key={venue.id} className="venue-card">
              <img
                src={venue.images?.[0]}
                className="venue-image"
                alt={venue.name}
              />

              <div className="venue-content">
                <div className="venue-title">{venue.name}</div>

                <div className="venue-location">{venue.location}</div>

                <div className="venue-bottom">
                  <div className="price">
                    ${venue.price}
                    <span> / hour</span>
                  </div>

                  <Link to={`/buyurtma/${venue.id}`} className="book-btn">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
