import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Login from "./Components/Login";
import { MeetingProvider } from "./Components/MeetingComponent/MeetingContext";
import Payments from "./Components/SidebarComponents/Payments";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = (email) => {
    console.log("User logged in with email:", email);
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true"); // Save login state
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn"); // Clear login state
  };

  return (
    <Router>
      <MeetingProvider>
        <div className="h-screen">
          {!isLoggedIn ? (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
              <Login onLogin={handleLogin} />
            </div>
          ) : (
            <div className="flex h-full">
              <Sidebar onLogout={handleLogout} />
              <div className="flex-1">
                <Routes>
                  <Route path="/payments" element={<Payments />} />
                </Routes>
              </div>
            </div>
          )}
        </div>
      </MeetingProvider>
    </Router>
  );
}

export default App;
