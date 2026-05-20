import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { db } from "../firebase.config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { Trash2, Edit3, Plus, Save } from "lucide-react";

const Admin = () => {
  const [stollar, setStollar] = useState<any[]>([]);
  const [stolId, setStolId] = useState("");


  const [menyu, setMenyu] = useState<any[]>([]);
  const [title, setTitle] = useState(""); 
  const [price, setPrice] = useState("");
  const [current, setCurrent] = useState<string | null>(null); 

  useEffect(() => {
    getStollar();
    getMenyu();
  }, []);

  function getStollar() {
    const getCol = collection(db, "stollar");

    getDocs(getCol).then((res) => {
      const a: any = res.docs.map((itm: any) => {
        return { ...itm.data(), id: itm.id };
      });
      setStollar(a);
    });
  }

function addStol() {
  const stolRef = doc(db, "stollar", stolId);

  const obj = {
    id: stolId,
    status: "bo'sh",
    vaqt: 0,
    start: null,
    bar: [],
  };

  setDoc(stolRef, obj).then(() => {
    setStolId("");
    getStollar();
  })
}

  function delStol(id: string) {
    const getCol = collection(db, "stollar");

    const oneDoc = doc(getCol, id);

    deleteDoc(oneDoc).then(() => {
      getStollar();
    });
  }

  function getMenyu() {
    const getCol = collection(db, "menyu");

    getDocs(getCol).then((res) => {
      const a: any = res.docs.map((itm: any) => {
        return { ...itm.data(), id: itm.id };
      });
      setMenyu(a);
    });
  }

  function barSaqlash() {
    const getCol = collection(db, "menyu");
    const obj = {
      nomi: title,
      narxi: Number(price),
    };

    if (current == null) {
      addDoc(getCol, obj).then(() => {
        setTitle("");
        setPrice("");
        getMenyu();
      });
    } else {
      const oneDoc = doc(getCol, current);

      updateDoc(oneDoc, obj).then(() => {
        setCurrent(null);
        setTitle("");
        setPrice("");
        getMenyu();
      });
    }
  }

  function editItem(item: any) {
    setCurrent(item.id);
    setTitle(item.nomi);
    setPrice(item.narxi);
  }

  function delItem(id: string) {
      const getCol = collection(db, "menyu");

    const oneDoc = doc(getCol, id);

    deleteDoc(oneDoc).then(() => {
      getMenyu();
    });
  }

  return (
    <div className="flex h-screen bg-[#0a0f1a] text-gray-400 font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-black text-white mb-10 tracking-widest">
          ADMIN <span className="text-blue-500 text-sm">CONTROL PANEL</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* STOLLAR JADVALI */}
          <section className="bg-[#121826] p-6 rounded-[30px] border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-bold text-sm uppercase">
                Stollar
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Stol #"
                  value={stolId}
                  onChange={(e) => setStolId(e.target.value)}
                  className="bg-black/30 border border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={addStol}
                  className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead className="text-gray-500 border-b border-gray-800">
                <tr>
                  <th className="pb-3 text-left">ID</th>
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {stollar.map((s) => (
                  <tr key={s.id} className="hover:bg-white/2">
                    <td className="py-4 font-mono text-white">Stol #{s.id}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-0.5 rounded ${s.status === "band" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => delStol(s.id)}
                        className="text-gray-600 hover:text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>


          <section className="bg-[#121826] p-6 rounded-[30px] border border-gray-800">
            <div className="flex flex-col gap-4 mb-6">
              <h2 className="text-white font-bold text-sm uppercase">
                Bar Menyusi
              </h2>
              <div className="grid grid-cols-5 gap-2">
                <input
                  type="text"
                  placeholder="Nomi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="col-span-2 bg-black/30 border border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
                <input
                  type="number"
                  placeholder="Narxi"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="col-span-2 bg-black/30 border border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={barSaqlash}
                  className="bg-amber-500 text-black rounded-xl flex items-center justify-center font-bold"
                >
                  {current ? <Save size={18} /> : <Plus size={18} />}
                </button>
              </div>
              {current && (
                <button
                  onClick={() => {
                    setCurrent(null);
                    setTitle("");
                    setPrice("");
                  }}
                  className="text-[10px] text-gray-500 underline text-left"
                >
                  Bekor qilish
                </button>
              )}
            </div>

            <table className="w-full text-xs">
              <thead className="text-gray-500 border-b border-gray-800">
                <tr>
                  <th className="pb-3 text-left">Mahsulot</th>
                  <th className="pb-3 text-left">Narxi</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {menyu.map((m) => (
                  <tr key={m.id} className="hover:bg-white/2">
                    <td className="py-4 text-white font-medium">{m.nomi}</td>
                    <td className="py-4 font-mono text-emerald-500">
                      {m.narxi.toLocaleString()} s.
                    </td>
                    <td className="py-4 text-right space-x-3">
                      <button
                        onClick={() => editItem(m)}
                        className="text-gray-600 hover:text-amber-500"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => delItem(m.id)}
                        className="text-gray-600 hover:text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Admin;
