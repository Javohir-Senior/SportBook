import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { ReceiptText, X, Plus, Minus } from "lucide-react";
import { getDocs, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.config";

// ... (Interface'lar o'zgarmadi)
interface BarItem { id: number; nomi: string; narxi: number; soni: number; }
interface Stol { id: string; status: "bo'sh" | "band"; vaqt: number; start: string | null; bar: BarItem[]; }

const Dashboard = () => {
  const SOAT_NARXI = 45000;
  const [stollar, setStollar] = useState<Stol[]>([]);
  const [cheklar, setCheklar] = useState<any[]>([]);
  const [menyu, setMenyu] = useState<any[]>([]);
  const [kassa, setKassa] = useState<number|string>(() => {
    const saqlanganKassa = localStorage.getItem("kassa_puli");
    return saqlanganKassa ? Number(saqlanganKassa) : 0;
  });
  const [modal, setModal] = useState<{ ochiq: boolean; stolId: string | null }>({ ochiq: false, stolId: null });

  // LOGIKALAR (O'zgartirishsiz)
  function getMenyu() {
    const getCol = collection(db, "menyu");
    getDocs(getCol).then((res) => {
      const a: any = res.docs.map((itm: any) => ({ ...itm.data(), id: itm.id }));
      setMenyu(a);
    });
  }

  const getStollar = () => {
    const getCol = collection(db, "stollar");
    getDocs(getCol).then((res) => {
      const a: any = res.docs.map((itm) => ({ ...itm.data(), id: itm.id }));
      setStollar(a);
    });
  };

  useEffect(() => { getStollar(); getMenyu(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStollar((prev) => prev.map((s) => s.status === "band" ? { ...s, vaqt: (s.vaqt || 0) + 1 } : s));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const boshlash = (id: string) => {
    const vaqtHozir = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setStollar((prev) => prev.map((s) => s.id === id ? { ...s, status: "band", start: vaqtHozir, vaqt: 0 } : s));
    updateDoc(doc(db, "stollar", id), { status: "band", start: vaqtHozir, vaqt: 0, bar: [] });
  };

  const tugatish = (id: string) => {
    const stol = stollar.find((s) => s.id === id);
    if (!stol) return;
    const minut = Math.floor(stol.vaqt / 60);
    const stolPuli = (SOAT_NARXI / 60) * minut;
    const barPuli = stol.bar.reduce((sum, item) => sum + item.narxi * item.soni, 0);
    const yangiChek = { id: Date.now(), stolId: stol.id, start: stol.start, minut, soatNarxi: SOAT_NARXI, stolSummasi: Math.round(stolPuli), bar: [...stol.bar], jami: Math.round(stolPuli + barPuli) };
    
    setCheklar([...cheklar, yangiChek]);
    setStollar((prev) => prev.map((s) => s.id === id ? { ...s, status: "bo'sh", vaqt: 0, start: null, bar: [] } : s));
    updateDoc(doc(db, "stollar", id), { status: "bo'sh", vaqt: 0, start: null, bar: [] });
  };

  const barHarakat = (stolId: string, mahsulot: any, tur: "plus" | "minus") => {
    let yangiBar: BarItem[] = [];
    setStollar((prev) => {
      const yangilangan = prev.map((stol) => {
        if (stol.id !== stolId) return stol;
        let tempBar = [...stol.bar];
        const borMahsulot = tempBar.find((b) => b.id === mahsulot.id);
        if (tur === "plus") {
          if (borMahsulot) tempBar = tempBar.map((b) => b.id === mahsulot.id ? { ...b, soni: b.soni + 1 } : b);
          else tempBar.push({ ...mahsulot, soni: 1 });
        } else {
          if (borMahsulot && borMahsulot.soni > 1) tempBar = tempBar.map((b) => b.id === mahsulot.id ? { ...b, soni: b.soni - 1 } : b);
          else tempBar = tempBar.filter((b) => b.id !== mahsulot.id);
        }
        yangiBar = tempBar;
        return { ...stol, bar: tempBar };
      });
      updateDoc(doc(db, "stollar", stolId), { bar: yangiBar });
      return yangilangan;
    });
  };

  const vaqtFormat = (sekund: number) => {
    const h = Math.floor(sekund / 3600);
    const m = Math.floor((sekund % 3600) / 60);
    const s = sekund % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => { localStorage.setItem("kassa_puli", String(kassa)); }, [kassa]);
  const tolash = (c: any) => { setKassa((k: any) => Number(k) + c.jami); setCheklar((prev) => prev.filter((x) => x.id !== c.id)); };

  // UI (Mobilga moslashtirilgan)
  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0a0f1a] text-gray-400 font-sans">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Statistika - Responsive grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#121826] p-4 rounded-2xl border border-gray-800">
            <p className="text-[10px] uppercase">Jami Stollar</p>
            <p className="text-lg font-black text-white">{stollar.length}</p>
          </div>
          <div className="bg-[#121826] p-4 rounded-2xl border border-gray-800">
            <p className="text-[10px] uppercase">Bo'sh</p>
            <p className="text-lg font-black text-white">{stollar.filter((s) => s.status === "bo'sh").length}</p>
          </div>
          <div className="bg-[#121826] p-4 rounded-2xl border border-gray-800">
            <p className="text-[10px] uppercase">Band</p>
            <p className="text-lg font-black text-white">{stollar.filter((s) => s.status === "band").length}</p>
          </div>
          <div className="bg-[#121826] p-4 rounded-2xl border border-gray-800">
            <p className="text-[10px] uppercase">Kassa</p>
            <p className="text-lg font-black text-white">{Number(kassa).toLocaleString()} s.</p>
          </div>
        </div>

        {/* Asosiy qism - Mobil uchun vertikal */}
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stollar.map((s) => (
              <div key={s.id} className="bg-[#121826] rounded-2xl p-5 border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-bold text-xs">Stol #{s.id.slice(-3)}</span>
                  <div className={`h-2 w-2 rounded-full ${s.status === "band" ? "bg-rose-500" : "bg-emerald-500"}`} />
                </div>
                <div className="h-20 bg-black/20 rounded-xl flex flex-col items-center justify-center mb-4">
                  {s.status === "band" ? <span className="text-2xl font-mono text-white">{vaqtFormat(s.vaqt || 0)}</span> : <span className="text-[10px] font-bold">BO'SH</span>}
                </div>
                <div className="flex gap-2">
                  {s.status === "band" ? (
                    <>
                      <button onClick={() => setModal({ ochiq: true, stolId: s.id })} className="flex-1 bg-amber-500/10 text-amber-500 py-3 rounded-xl text-[10px] font-bold">BAR</button>
                      <button onClick={() => tugatish(s.id)} className="flex-1 bg-rose-600 text-white py-3 rounded-xl text-[10px] font-bold">STOP</button>
                    </>
                  ) : (
                    <button onClick={() => boshlash(s.id)} className="w-full bg-blue-600 text-white py-3 rounded-xl text-[10px] font-bold">BOSHLASH</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Yon panel - Mobil uchun full width */}
          <aside className="w-full xl:w-80">
            <div className="bg-[#121826] rounded-2xl border border-gray-800 p-5">
              <h3 className="text-white text-[11px] font-bold uppercase mb-4 flex items-center gap-2"><ReceiptText size={16} /> To'lov Kutayotganlar</h3>
              {cheklar.map((c) => (
                <div key={c.id} className="bg-[#111] p-4 rounded-xl border border-gray-800 mb-3">
                  <div className="flex justify-between text-xs mb-2 text-gray-400"><span>Stol #{c.stolId.slice(-3)}</span><span className="text-white font-bold">{c.jami.toLocaleString()} s.</span></div>
                  <button onClick={() => tolash(c)} className="w-full bg-emerald-600 py-2 rounded-lg text-[10px] font-bold text-white">TO'LASH</button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      {/* Modal - Mobil uchun markazlashtirilgan */}
      {modal.ochiq && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#121826] w-full max-w-xs rounded-3xl p-6 border border-gray-800">
             <div className="flex justify-between mb-4"><span className="text-white">Bar xizmati</span><X onClick={() => setModal({ ochiq: false, stolId: null })} /></div>
             {menyu.map((m) => (
               <div key={m.id} className="flex justify-between items-center mb-3 p-2 bg-black/20 rounded-lg">
                 <span className="text-xs text-white">{m.nomi}</span>
                 <div className="flex items-center gap-3">
                    <button onClick={() => barHarakat(modal.stolId!, m, "minus")}><Minus size={14}/></button>
                    <button onClick={() => barHarakat(modal.stolId!, m, "plus")}><Plus size={14} className="bg-amber-500 rounded"/></button>
                 </div>
               </div>
             ))}
             <button onClick={() => setModal({ ochiq: false, stolId: null })} className="w-full mt-4 bg-blue-600 py-3 rounded-xl">Saqlash</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;