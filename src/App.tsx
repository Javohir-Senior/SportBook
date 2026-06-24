import { Route, Routes } from "react-router-dom"
import Home from "./Home"
import Admin from "./Admin"
import BookNow from "./BookNow"
import AdminDashboard from "./Admin-dashboard"

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/admin/add-booking" element={<Admin/>} />
        <Route path="/buyurtma/:id" element={<BookNow/>} />
        <Route path="/admin" element={<AdminDashboard/>} />
      </Routes>
    </div>
  )
}

export default App
