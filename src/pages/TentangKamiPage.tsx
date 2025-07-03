import React, { useState } from "react";
import { Link } from "react-router-dom"; // Gunakan Link untuk navigasi internal
import { FaBars, FaTimes } from "react-icons/fa"; // Ikon untuk menu mobile

const TentangKamiPage: React.FC = () => {
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
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 h-20 shadow-sm">
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

      <main className="pt-20">
        {" "}
        {/* Padding top untuk menghindari konten tertutup header */}
        {/* Hero Section */}
        <section className="relative w-full h-[50vh]">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <img
            src="https://www.telkomsat.co.id/uploads/n_news_content/20231018073227-2023-10-18n_news_content073142.jpg"
            alt="Satelit di angkasa"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center z-20 p-4">
            <h1 className="text-4xl md:text-6xl font-bold text-shadow-lg">
              Tentang Website Kami
            </h1>
          </div>
        </section>
        {/* Content Section */}
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-gray-700">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-8">
              Latar Belakang Proyek
            </h2>
            <div className="prose lg:prose-xl max-w-none text-justify space-y-6">
              <p>
                Indonesia, sebagai negara kepulauan terbesar di dunia,
                menghadapi tantangan besar dalam pemerataan akses komunikasi,
                terutama akses internet, ke seluruh wilayahnya. Kondisi
                geografis yang terdiri dari ribuan pulau menyebabkan banyak
                daerah, terutama di wilayah 3T (terdepan, terluar, dan
                tertinggal), sulit dijangkau oleh infrastruktur jaringan
                terestrial seperti fiber optik.
              </p>
              <p>
                Teknologi satelit, khususnya High Throughput Satellite (HTS)
                yang beroperasi di spektrum Ka-Band, menjadi solusi yang vital
                untuk menjembatani kesenjangan ini. Peluncuran SATRIA, satelit
                Ka-Band pertama Indonesia, merupakan langkah strategis untuk
                meningkatkan kapasitas dan cakupan layanan internet nasional.
              </p>
              <p>
                Namun, perangkat lunak komersial untuk analisis spotbeam yang
                ada memiliki keterbatasan, seperti kurangnya visualisasi 3D yang
                interaktif dan biaya langganan yang tinggi. Hal ini membatasi
                aksesibilitas dan efisiensi operasional.
              </p>
              <p>
                Menyikapi keterbatasan tersebut, dikembangkanlah sebuah sistem
                monitoring dan simulasi performa spotbeam satelit berbasis web.
                Sistem ini dirancang untuk memberikan pengalaman visualisasi
                yang lebih modern, menarik, serta interaktif, dengan
                memanfaatkan teknologi open-source untuk kemudahan akses.
              </p>
              <p>
                Proyek tugas akhir ini dilaksanakan dalam kerja sama dengan PT.
                Pasifik Satelit Nusantara (PSN) untuk mendukung operasional
                satelit SATRIA. Kolaborasi ini memastikan bahwa sistem yang
                dikembangkan tidak hanya berorientasi pada aspek akademik,
                tetapi juga praktis dan sesuai dengan kebutuhan industri, dengan
                harapan dapat mendorong kemandirian teknologi bangsa dalam
                bidang komunikasi satelit.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-blue-900 text-white text-center p-6 mt-16">
        <p>
          © 2025 Website Visualisasi Spotbeam Satelit | Hak Cipta Dilindungi
        </p>
      </footer>

      {/* CSS untuk efek text-shadow
      <style jsx global>{`
        .text-shadow-lg { text-shadow: 2px 2px 12px rgba(0,0,0,0.6); }
      `}</style> */}
    </div>
  );
};

export default TentangKamiPage;
