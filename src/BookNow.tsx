import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase.config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookingPage = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(new Date());
  const [sports, setSports] = useState<any>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<{ expiry?: string }>({});

  const [userData, setUserData] = useState({
    name: "",
    surname: "",
    phone: "",
  });
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiry: "",
    cardType: "Uzcard",
  });

  const { id } = useParams();
  const currentHour = new Date().getHours();
  const times = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  useEffect(() => {
    if (id) {
      getDoc(doc(collection(db, "Sports"), id)).then((res) => {
        if (res.exists()) setSports({ ...res.data(), id: res.id });
      });
    }
  }, [id]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!id) return;

      const offset = startDate.getTimezoneOffset();
      const localDate = new Date(startDate.getTime() - offset * 60 * 1000);
      const dateStr = localDate.toISOString().split("T")[0];

      const q = query(
        collection(db, "bookings"),
        where("sportId", "==", id),
        where("date", "==", dateStr),
      );
      const querySnapshot = await getDocs(q);

      let taken: number[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        for (let i = data.startTime; i < data.endTime; i++) {
          taken.push(i);
        }
      });
      setBookedSlots(taken);
    };

    fetchBookings();
    setStartTime(null);
    setEndTime(null);
  }, [startDate, id]);

  const handleTimeClick = (time: number) => {
    if (startTime === null || (startTime !== null && endTime !== null)) {
      setStartTime(time);
      setEndTime(null);
    } else {
      if (time > startTime && time <= startTime + 2) {
        let hasConflict = false;
        for (let i = startTime; i < time; i++) {
          if (bookedSlots.includes(i)) {
            hasConflict = true;
            break;
          }
        }

        if (!hasConflict) {
          setEndTime(time);
        } else {
          setStartTime(time);
          toast.info("ℹ️ Tanlangan oraliqda band soat bor!", { theme: "dark" });
        }
      } else {
        setStartTime(time);
      }
    }
  };

  const calculateHours = () =>
    startTime !== null && endTime !== null ? endTime - startTime : 0;
  const hours = calculateHours();
  const serviceFee = 2;
  const subtotal = hours * (sports.price || 0);
  const total = subtotal + serviceFee;

  const SaveBook = async () => {
    if (!startTime || !endTime || !id) return;

    if (!validateData()) return;

    const offset = startDate.getTimezoneOffset();
    const localDate = new Date(startDate.getTime() - offset * 60 * 1000);

    try {
      await addDoc(collection(db, "bookings"), {
        sportId: id,
        date: localDate.toISOString().split("T")[0],
        startTime,
        endTime,
        userInfo: userData,
        paymentInfo: {
          cardType: cardData.cardType,
          amountPaid: total * 0.5,
        },
        createdAt: new Date(),
      });

      toast.success("🎉 Muvaffaqiyatli band qilindi!");

      setIsModalOpen(false);


      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (e) {
      toast.error("❌ Xatolik yuz berdi!");
    }
  };

  const formatPhone = (value: string) => {
    const nums = value.replace(/\+998/g, "").replace(/\D/g, "");
    return (
      "+998 " +
      nums.slice(0, 9).replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4")
    );
  };

  const validateData = () => {
    setErrors({});
    let newErrors: { expiry?: string } = {};

    const [month, year] = cardData.expiry.split("/");
    const m = parseInt(month);
    const y = parseInt(year);

    if (isNaN(m) || isNaN(y) || m < 1 || m > 12 || y < 26) {
      newErrors.expiry = "Karta muddati yaroqsiz!";
    }

    if (newErrors.expiry) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const formatCard = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
    return v.slice(0, 5);
  };
  return (
    <div className="book-page">
      <ToastContainer />

      <div className="book-container">
        <div className="book-layout">
          <div className="venue-panel">
            <Link to={"/"} className="back-link">
              ← Back to venues
            </Link>

            <img
              src={sports.images?.[0] || "https://via.placeholder.com/600x400"}
              className="main-image"
              alt={sports.name}
            />

            <div className="gallery">
              {sports.images?.slice(1, 4).map((img: string, index: number) => (
                <img key={index} src={img} alt={`Gallery ${index}`} />
              ))}

              {sports.images && sports.images.length > 4 && (
                <div className="gallery-more">+{sports.images.length - 4}</div>
              )}
            </div>

            <div className="venue-info">
              <h1 className="venue-name">{sports.name}</h1>
              <div className="venue-rating">{sports.location}</div>
              <p className="venue-description">{sports.description}</p>
            </div>
          </div>

          <div className="booking-panel">
            <h2 className="booking-title">Select Date & Time</h2>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date as Date)}
              minDate={new Date()}
              className="calendar-input"
              dateFormat="yyyy-MM-dd"
            />

            <h3 className="slot-title">Available Time Slots</h3>
            <div className="time-slots">
              {times.map((time) => {
                const isToday =
                  startDate.toDateString() === new Date().toDateString();
                const isPast = isToday && time < currentHour;
                const isBooked = bookedSlots.includes(time);

                const isActive =
                  (startTime !== null && time === startTime) ||
                  (endTime !== null && time === endTime) ||
                  (startTime !== null &&
                    endTime !== null &&
                    time > startTime &&
                    time < endTime);

                const handleSlotClick = () => {
                  if (isPast) {
                    toast.warning("⚠️ Bu vaqt o'tib ketgan!", {
                      position: "top-center",
                      autoClose: 2500,
                      theme: "dark",
                    });
                    return;
                  }
                  if (isBooked) {
                    toast.error("🚫 Bu vaqt allaqachon band qilingan!", {
                      position: "top-center",
                      autoClose: 2500,
                      theme: "dark",
                    });
                    return;
                  }
                  handleTimeClick(time);
                };

                return (
                  <button
                    key={time}
                    className={`time-slot ${isActive ? "active" : ""} ${isPast || isBooked ? "disabled-slot" : ""}`}
                    onClick={handleSlotClick}
                  >
                    {time}:00
                  </button>
                );
              })}
            </div>

            <div className="price-box">
              <div className="price-row">
                <span>
                  ${sports.price} x {hours} hours
                </span>
                <span>${subtotal}</span>
              </div>
              <div className="price-row">
                <span>Service fee</span>
                <span>${serviceFee}</span>
              </div>
              <div className="price-total">
                <span>Total</span>
                <span className="total-amount">${hours > 0 ? total : 0}</span>
              </div>
            </div>

            <button
              className="book-button"
              onClick={() => setIsModalOpen(true)}
              disabled={hours === 0}
            >
              Book Now
            </button>
            {isModalOpen && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <button
                    className="close-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
                    ×
                  </button>

                  {step === 1 ? (
                    <div className="modal-row">
                      <h3 className="modal-title">Shaxsiy ma'lumotlar</h3>
                      <input
                        className="modal-input"
                        placeholder="Ism"
                        value={userData.name}
                        onChange={(e) =>
                          setUserData({ ...userData, name: e.target.value })
                        }
                      />
                      <input
                        className="modal-input"
                        placeholder="Familya"
                        value={userData.surname}
                        onChange={(e) =>
                          setUserData({ ...userData, surname: e.target.value })
                        }
                      />
                      <input
                        className="modal-input"
                        placeholder="+998 00 000 00 00"
                        value={userData.phone || "+998 "}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            phone: formatPhone(e.target.value),
                          })
                        }
                      />
                      <button
                        className="confirm-button"
                        onClick={() => setStep(2)}
                      >
                        Keyingisi
                      </button>
                    </div>
                  ) : (
                    <div className="modal-row">
                      <h3 className="modal-title">To'lov (50%)</h3>
                      <select
                        className="modal-input"
                        value={cardData.cardType}
                        onChange={(e) =>
                          setCardData({ ...cardData, cardType: e.target.value })
                        }
                      >
                        <option>Uzcard</option>
                        <option>Humo</option>
                        <option>Visa</option>
                      </select>
                      <input
                        className="modal-input"
                        placeholder="0000 0000 0000 0000"
                        value={cardData.cardNumber}
                        onChange={(e) =>
                          setCardData({
                            ...cardData,
                            cardNumber: formatCard(e.target.value),
                          })
                        }
                      />
                      <div className="input-group">
                        <input
                          className={`modal-input ${errors.expiry ? "input-error" : ""}`}
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={(e) => {
                            setCardData({
                              ...cardData,
                              expiry: formatExpiry(e.target.value),
                            });
                            if (errors.expiry) setErrors({}); // Yozishni boshlaganda xatoni o'chirish
                          }}
                        />
                        {errors.expiry && (
                          <span className="error-text">{errors.expiry}</span>
                        )}
                      </div>

                      <div className="modal-actions">
                        <button
                          className="back-button"
                          onClick={() => setStep(1)}
                        >
                          Orqaga
                        </button>
                        <button
                          className="confirm-button"
                          onClick={() => {
                            if (validateData()) SaveBook();
                          }}
                        >
                          To'lov qilish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
