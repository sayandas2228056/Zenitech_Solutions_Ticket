import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './Components/ProtectedRoute'
import Navbar from './Components/Navbar'
import LandingPage from './Pages/LandingPage'
import Login from './Pages/Login'
import SignUp from './Pages/SignUp'
import Dashboard from './Pages/Dashboard'
import Profile from './Pages/Profile'
import ForgotPassword from './Pages/ForgotPassword'
import Footer from './Components/Footer'
import RaiseTicket from './Pages/RaiseTicket'
function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/token"
              element={
                <ProtectedRoute>
                  <RaiseTicket />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
      <Footer />
    </AuthProvider>
  )
}

export default App
