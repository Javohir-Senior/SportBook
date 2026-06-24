import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Search, ImagePlus } from "lucide-react";
import { db } from "../firebase.config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import AdminNavbar from "./Admin-Navbar";

const AdminPanel: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [current, setCurrent] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [isImgModalOpen, setIsImgModalOpen] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async (): Promise<void> => {
    const colRef = collection(db, "Sports");
    const snapshot = await getDocs(colRef);
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setVenues(data);
  };

  const saveProduct = async (): Promise<void> => {
    const colRef = collection(db, "Sports");
    const obj = { name, location, price, description, };

    if (current === null) {
      await addDoc(colRef, obj);
    } else {
      await updateDoc(doc(colRef, current), obj);
    }
    resetForm();
    fetchVenues();
  };

  const editItem = (item: any): void => {
    setCurrent(item.id);
    setName(item.name);
    setLocation(item.location);
    setPrice(item.price);
    setDescription(item.description);
    setIsModalOpen(true);
  };

  const delItem = async (id: string): Promise<void> => {
    await deleteDoc(doc(collection(db, "Sports"), id));
    fetchVenues();
  };

  const resetForm = (): void => {
    setCurrent(null);
    setName("");
    setLocation("");
    setPrice("");
    setDescription("");
    setIsModalOpen(false);
  };

  const addImageToVenue = async () => {
    if (!selectedVenueId || !newImageUrl) return;
    await updateDoc(doc(db, "Sports", selectedVenueId), {
      images: arrayUnion(newImageUrl),
    });
    setNewImageUrl("");
    setIsImgModalOpen(false);
    fetchVenues();
  };

  return (
    <div className="admin-wrapper">
      <AdminNavbar/>
      {/* Header */}
      <div className="admin-header">
        <h2 className="admin-title">Manage Venues</h2>
        <button
          className="add-btn"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} /> Add New Venue
        </button>
      </div>

      {/* Table Section */}
      <div className="admin-card">
        <div className="search-bar">
          <Search size={20} className="text-gray-500" />
          <input placeholder="Search venues..." />
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Venue Name</th>
              <th>Location</th>
              <th>Price</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((venue: any) => (
              <tr key={venue.id}>
                <td className="font-bold">{venue.name}</td>
                <td>{venue.location}</td>
                <td className="text-blue-400">{venue.price}$/h</td>
                <td className="actions">
                  <button
                    onClick={() => {
                      setSelectedVenueId(venue.id);
                      setIsImgModalOpen(true);
                    }}
                  >
                    <ImagePlus size={18} />
                  </button>

                  <button onClick={() => editItem(venue)}>
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => delItem(venue.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            {/* Sarlavha va X tugmasi joylashgan qator */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0 }}>
                {current ? "Edit Venue" : "Add New Venue"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Inputlar */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Venue Name"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
            />
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price ($)"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />

            <button className="save-btn" onClick={saveProduct}>
              {current ? "Update Venue" : "Save Venue"}
            </button>
          </div>
        </div>
      )}
      {isImgModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add Image</h3>
            <input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Image URL"
            />
            <button className="save-btn" onClick={addImageToVenue}>
              Add
            </button>
            <button
              className="cancel-btn"
              onClick={() => setIsImgModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
