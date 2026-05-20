import Admin from "./Admin"
import Dashboard from "./dashboard"
import { Route, Routes } from "react-router-dom"
import Stollar from "./Stollar"
import Statistika from "./Statistika"

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/admin" element={<Admin/>} />
        <Route path="/stollar" element={<Stollar/>} />
        <Route path="/statistika" element={<Statistika/>} />
        <Route path="/hisobot" element={<Statistika/>} />
      </Routes>
    </div>
  )
}

export default App
