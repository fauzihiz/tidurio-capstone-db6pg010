import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/dashboard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
