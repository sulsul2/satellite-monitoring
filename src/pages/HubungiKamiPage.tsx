import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // Ikon untuk menu mobile

// Tipe Data untuk setiap item kontak
interface Contact {
  id: number;
  name: string;
  imageUrl: string;
  email: string;
  instagram: {
    username: string;
    url: string;
  };
}

// Daftar Kontak
const contactList: Contact[] = [
  {
    id: 1,
    name: "Achmad Kabir Rifai",
    imageUrl: "https://i.imgur.com/LBfYji4.jpeg",
    email: "18121040@mahasiswa.itb.ac.id",
    instagram: {
      username: "@kabirrifai.pro",
      url: "https://instagram.com/kabirrifai.pro",
    },
  },
  {
    id: 2,
    name: "Ali Ridho",
    imageUrl: "https://i.imgur.com/Aapt4Yj.jpeg",
    email: "18121008@mahasiswa.itb.ac.id",
    instagram: {
      username: "@alir_02",
      url: "https://instagram.com/alir_02",
    },
  },
];

const HubungiKamiPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", text: "BERANDA" },
    { href: "/tentangkami", text: "TENTANG KAMI" },
    { href: "/berita", text: "BERITA" },
    { href: "/hubungikami", text: "HUBUNGI KAMI" },
    { href: "/register", text: "REGISTER" },
    { href: "/login", text: "LOGIN" },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 left-0 right-0 z-50 h-20 shadow-sm">
        <nav className="container mx-auto px-6 flex justify-between items-center h-full">
          <a href="/" className="flex-shrink-0">
            <img
              src="https://www.psn.co.id/wp-content/uploads/2022/08/new-psn-logo.png"
              alt="PSN Logo"
              className="h-10"
            />
          </a>
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-bold transition-colors ${
                  window.location.pathname === link.href
                    ? "text-yellow-500"
                    : "text-blue-800 hover:text-yellow-500"
                }`}
              >
                {link.text}
              </Link>
            ))}
          </div>
          <div className="lg:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-blue-800 text-2xl"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>
      </header>
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMenuOpen(false)}
        ></div>

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-5 flex justify-end">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-blue-800 text-3xl"
            >
              <FaTimes />
            </button>
          </div>
          <div className="flex flex-col space-y-4 px-5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-blue-800 font-bold hover:text-yellow-500 transition-colors py-2"
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-6 uppercase tracking-wider">
            Hubungi Kami
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-16">
            Jika ada pertanyaan, saran, atau ingin berkolaborasi, silakan
            hubungi kami melalui kontak di bawah ini.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-12">
          {contactList.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center transform hover:-translate-y-2 transition-transform duration-300 ease-in-out"
            >
              <img
                src={contact.imageUrl}
                alt={contact.name}
                className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-blue-300 shadow-lg"
              />
              <h3 className="text-2xl font-bold text-blue-900 mb-2">
                {contact.name}
              </h3>
              <a
                href={`mailto:${contact.email}`}
                className="block text-blue-600 hover:underline mb-3"
              >
                {contact.email}
              </a>
              <p className="text-gray-600">
                Instagram:
                <a
                  href={contact.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-700 hover:underline ml-1"
                >
                  {contact.instagram.username}
                </a>
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-blue-900 text-white text-center p-6">
        <p>
          © 2025 Website Visualisasi Spotbeam Satelit | Hak Cipta Dilindungi
        </p>
      </footer>
    </div>
  );
};

export default HubungiKamiPage;
