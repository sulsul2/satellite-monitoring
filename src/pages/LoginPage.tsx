import React, { useState } from "react";
import axios from "axios"; // 1. Impor axios
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";

const BACKGROUND_IMAGE_PATH = "/background.avif";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const url = process.env.REACT_APP_API_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(url + "user/login", {
        username,
        password,
      });
      console.log(response);

      if (response.status == 200) {
        localStorage.setItem("access_token", response.data.access_token);
        navigate("/map-view");
      } else {
        setError(response.data.message || "Username atau password salah!");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const serverError = err.response?.data;
        setError(
          serverError?.message ||
            "Login gagal. Periksa kembali username dan password Anda."
        );
      } else {
        setError("Tidak dapat terhubung ke server. Silakan coba lagi nanti.");
      }
    }
  };

  return (
    // Container utama dengan background image dan layout flexbox
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE_PATH})` }}
    >
      {/* Box login dengan efek blur dan latar semi-transparan */}
      <div className="w-full max-w-md space-y-8 rounded-xl bg-gray-900 bg-opacity-80 p-8 shadow-lg backdrop-blur-md">
        <Link to="/" className="flex justify-start items-center gap-2 text-gray-400">
          <IoIosArrowRoundBack size={24}/>
          <p>Kembali ke beranda</p>
        </Link>

        <h1 className="text-center text-4xl font-bold text-white">Login</h1>

        {error && (
          <p className="rounded-lg bg-red-500/30 p-3 text-center text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              className="w-full rounded-lg border border-gray-600 bg-transparent px-4 py-3 text-white placeholder-gray-400 ring-blue-500/50 transition focus:border-blue-500 focus:outline-none focus:ring-2"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className="w-full rounded-lg border border-gray-600 bg-transparent px-4 py-3 text-white placeholder-gray-400 ring-blue-500/50 transition focus:border-blue-500 focus:outline-none focus:ring-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-400">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-400 hover:underline"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
