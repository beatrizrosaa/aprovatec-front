import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SemesterEntryPage from "./pages/SemesterEntryPage";
import { AuthContext } from "./context/AuthContext";

const App: React.FC = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/semestres" replace /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/semestres" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/semestres" replace /> : <RegisterPage />}
      />
      <Route
        path="/semestres"
        element={user ? <SemesterEntryPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dashboard"
        element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
