import { Routes, Route, HashRouter as Router, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import './styles/Vars.module.css'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
  )
}

export default App
