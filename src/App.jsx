import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import EksikUrunler from './pages/EksikUrunler'
import FazlaUrunler from './pages/FazlaUrunler'
import './App.css'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">📦 Stok Kontrol</h1>
        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'nav-link active' : 'nav-link'}>
            Ana Sayfa
          </Link>
          <Link to="/eksik-urunler" className={isActive('/eksik-urunler') ? 'nav-link active' : 'nav-link'}>
            Eksik Ürünler
          </Link>
          <Link to="/fazla-urunler" className={isActive('/fazla-urunler') ? 'nav-link active' : 'nav-link'}>
            Fazla Ürünler
          </Link>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/eksik-urunler" element={<EksikUrunler />} />
            <Route path="/fazla-urunler" element={<FazlaUrunler />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

