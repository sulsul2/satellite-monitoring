import React, { useState } from "react";
import { Link } from "react-router-dom"; // Gunakan Link untuk navigasi internal
import { FaBars, FaTimes } from "react-icons/fa"; // Ikon untuk menu mobile

// Tipe Data untuk setiap item berita
interface Berita {
  id: number;
  title: string;
  imageUrl: string;
  url: string;
}

// Daftar Berita
const beritaList: Berita[] = [
  {
    id: 1,
    title: "Letusan Matahari Bikin Satelit Starlink Berguguran",
    imageUrl:
      "https://akcdn.detik.net.id/community/media/visual/2021/03/15/satelit-internet-starlink-13_169.png?w=700&q=90",
    url: "https://inet.detik.com/science/d-7939697/letusan-matahari-bikin-satelit-starlink-berguguran",
  },
  {
    id: 2,
    title:
      "China Bangun Superkomputer AI di Luar Angkasa, Armada Satelit Pertama Meluncur",
    imageUrl:
      "https://akcdn.detik.net.id/community/media/visual/2015/06/13/2c39058f-60f1-4d27-bc16-3d5e7fc64c97_169.jpg?w=700&q=90",
    url: "https://www.detik.com/edu/detikpedia/d-7934127/china-bangun-superkomputer-ai-di-luar-angkasa-armada-satelit-pertama-meluncur",
  },
  {
    id: 3,
    title: "Uji Coba Roket Australia Mau Bawa Selai Terbang Pekan Ini",
    imageUrl:
      "https://akcdn.detik.net.id/community/media/visual/2025/05/15/roket-eris-dari-gilmour-space-technologies-gspace-australia-1747287474533.png?w=700&q=90",
    url: "https://www.detik.com/edu/detikpedia/d-7915209/uji-coba-roket-australia-mau-bawa-selai-terbang-pekan-ini",
  },
  {
    id: 4,
    title: "Apple Resmi Merilis iOS 18.5, Mendukung Fitur Satelit",
    imageUrl:
      "https://akcdn.detik.net.id/community/media/visual/2025/04/17/iphone-16e-1744892290407_169.jpeg?w=700&q=90",
    url: "https://inet.detik.com/consumer/d-7911903/apple-resmi-merilis-ios-18-5-mendukung-fitur-satelit",
  },
  {
    id: 5,
    title:
      "Satelit Soviet dari Tahun 1972 Bakal Jatuh Tak Terkendali Pekan Depan",
    imageUrl:
      "https://akcdn.detik.net.id/community/media/visual/2019/04/09/2f5fb3fb-263b-4088-99f0-dff149129f66.jpeg?w=700&q=90",
    url: "https://inet.detik.com/science/d-7895504/satelit-soviet-dari-tahun-1972-bakal-jatuh-tak-terkendali-pekan-depan",
  },
  {
    id: 6,
    title: "Video: Alpha Firefly Gagal Meroket",
    imageUrl:
      "https://akcdn.detik.net.id/community/media/visual/2025/04/30/usa-spacefirefly-1745991211475_43.jpeg?w=300&q=80",
    url: "https://20.detik.com/detikupdate/20250430-250430083/video-alpha-firefly-gagal-meroket-satelit-lockheed-martin-jatuh-ke-samudra-pasifik",
  },
  {
    id: 7,
    title: "Satelit Internet Kuiper Milik Amazon Meluncur",
    imageUrl:
      "https://akcdn.detik.net.id/community/media/visual/2025/04/29/space-explorationamazon-1745905984313_43.jpeg?w=300&q=80",
    url: "https://20.detik.com/detikupdate/20250429-250429074/video-satelit-internet-kuiper-milik-amazon-meluncur-jadi-pesaing-starlink",
  },
  {
    id: 8,
    title: "Video: Alasan Ditundanya Peluncuran Satelit Kuiper",
    imageUrl:
      "https://akcdn.detik.net.id/community/media/visual/2025/03/19/amazon-kuiper-1742370155408_43.webp?w=300&q=80",
    url: "https://20.detik.com/detikupdate/20250410-250410084/video-alasan-ditundanya-peluncuran-satelit-internet-kuiper-milik-amazon",
  },
  {
    id: 9,
    title: "Cerita Astronaut NASA Selamatkan Satelit Indonesia",
    imageUrl:
      "https://akcdn.detik.net.id/community/media/visual/2025/03/26/astronaut-nasa-menangkap-satelit-palapa-2-1742964759619_43.webp?w=300&q=80",
    url: "https://www.detik.com/edu/detikpedia/d-7862212/cerita-astronaut-nasa-selamatkan-satelit-indonesia-terbang-tanpa-kabel-ke-ruang-hampa",
  },
];

const BeritaPage: React.FC = () => {
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
      <main className="flex-grow container mx-auto px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-12 text-center uppercase tracking-wider">
          Berita Terbaru
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {beritaList.map((berita) => (
            <a
              key={berita.id}
              href={berita.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="overflow-hidden">
                <img
                  src={berita.imageUrl}
                  alt={berita.title}
                  className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 group-hover:text-yellow-600 transition-colors">
                  {berita.title}
                </h3>
              </div>
            </a>
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

export default BeritaPage;
