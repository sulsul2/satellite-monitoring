import "./App.css";
import LoginPage from "./pages/LoginPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import BerandaPage from "./pages/BerandaPage";
import TentangKamiPage from "./pages/TentangKamiPage";
import BeritaPage from "./pages/BeritaPage";
import HubungiKamiPage from "./pages/HubungiKamiPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<BerandaPage />} />
        <Route path="/tentangkami" element={<TentangKamiPage />} />
        <Route path="/berita" element={<BeritaPage />} />
        <Route path="/hubungikami" element={<HubungiKamiPage />} />

        <Route
          path="/map-view"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <h1>404: Halaman Tidak Ditemukan</h1>
              <a href="/login">Kembali ke Login</a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
