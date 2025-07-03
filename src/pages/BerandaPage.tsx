import React, { useState, useEffect, useRef, FC, ReactNode } from "react";
import { FaBars, FaTimes } from "react-icons/fa"; // Ikon untuk menu mobile

// --- Data & Tipe ---
interface Berita {
  id: number;
  title: string;
  imageUrl: string;
  url: string;
}

interface Feature {
  id: number;
  title: string;
  imageUrl: string;
  url: string;
}

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
];

const featureList: Feature[] = [
  {
    id: 1,
    title: "Visualisasi Spotbeam",
    imageUrl: "https://i.imgur.com/JQBiaWv.jpeg",
    url: "#",
  },
  {
    id: 2,
    title: "Input Data Satelit",
    imageUrl: "https://i.imgur.com/Jo7mrhe.jpeg",
    url: "#",
  },
  {
    id: 3,
    title: "Input Data Antena",
    imageUrl: "https://i.imgur.com/PHb1JBf.jpeg",
    url: "#",
  },
  {
    id: 4,
    title: "Input Data Beam Manual",
    imageUrl: "https://i.imgur.com/wSUpTDY.jpeg",
    url: "#",
  },
  {
    id: 5,
    title: "Input Data Beam Excel",
    imageUrl: "https://i.imgur.com/dGv3FUD.jpeg",
    url: "#",
  },
  {
    id: 6,
    title: "Input Data Link Budget",
    imageUrl: "https://i.imgur.com/nW2BCJu.jpeg",
    url: "#",
  },
  {
    id: 7,
    title: "Grafik Pola Radiasi",
    imageUrl: "https://i.imgur.com/wY7Srl3.jpeg",
    url: "#",
  },
  {
    id: 8,
    title: "Gridview Peta (Opsional)",
    imageUrl: "https://i.imgur.com/j7XHQba.jpeg",
    url: "#",
  },
];

const slides = [
  {
    title: "Selamat Datang di Website Kami",
    description:
      "Website Visualisasi Spotbeam Monitoring Satelit dengan Tampilan Interaktif dan Variatif",
    imageUrl:
      "https://www.psn.co.id/wp-content/uploads/2024/08/background-33-1929x1085.jpg",
  },
  {
    title: "Berita Seputar Teknologi",
    description:
      "Memberikan Update Berita dari Belahan Dunia Terkait Teknologi Terbaru.",
    imageUrl:
      "https://www.psn.co.id/wp-content/uploads/2023/05/Landing-Page-01-1920x1080.png",
  },
  {
    title: "Kolaborasi dan Inovasi",
    description:
      "Dibuat untuk keperluan Tugas Akhir bekerja sama dengan PT. Pasifik Satelit Nusantara (PSN).",
    imageUrl:
      "https://cdn.pixabay.com/photo/2015/10/28/16/36/raisting-satellite-1010862_1280.jpg",
  },
];

// --- Komponen-Komponen Kecil ---

// Custom Hook untuk deteksi elemen di layar (untuk animasi fade-in)
const useOnScreen = (ref: React.RefObject<HTMLElement>, rootMargin = "0px") => {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin }
    );
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [ref, rootMargin]);
  return isIntersecting;
};

// Wrapper Animasi
const AnimatedSection: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref as any, "-100px");
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        onScreen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
};

// --- Komponen Utama ---
const BerandaPage: React.FC = () => {
  const [sliderIndex, setSliderIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSliderIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
              <a
                key={link.href}
                href={link.href}
                className="text-blue-800 font-bold hover:text-yellow-500 transition-colors"
              >
                {link.text}
              </a>
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

      <main>
        {/* Carousel Section */}
        <section className="relative w-full h-screen">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img
            src={slides[sliderIndex].imageUrl}
            alt="Carousel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center z-20 p-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-shadow-lg">
              {slides[sliderIndex].title}
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl text-shadow">
              {slides[sliderIndex].description}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-6 py-16 md:py-24 space-y-24">
          {/* Intro Section */}
          <AnimatedSection>
            <div className="bg-blue-50/50 rounded-xl shadow-lg p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6 uppercase tracking-wider">
                Visualisasi Spotbeam Satelit
              </h2>
              <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                Kami menyediakan layanan visualisasi spotbeam monitoring satelit
                dengan berbagai tampilan yang mudah dipahami dan interaktif.
                Kami memiliki fitur Visualisasi Spotbeam, Tampilan 2D, Tampilan
                Gridview, Input Data Satelit, Input Data Antena, ⁠Input Data
                Beam, ⁠Input Data Link Budget, dan Grafik Pola Radiasi
              </p>
            </div>
          </AnimatedSection>

          {/* Latar Belakang Section */}
          <AnimatedSection>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2913/2913466.png"
                alt="Satelit Illustration"
                className="w-full max-w-md mx-auto rounded-lg"
              />
              <div className="text-gray-700 leading-relaxed">
                <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6 uppercase tracking-wider">
                  Latar Belakang
                </h2>
                <p className="mb-4">
                  Indonesia adalah negara kepulauan dengan tantangan geografis
                  yang kompleks, menyulitkan pemerataan akses internet.
                  Teknologi satelit High Throughput Satellite (HTS) seperti
                  SATRIA hadir sebagai solusi.
                </p>
                <p>
                  Kolaborasi Teknik Telekomunikasi ITB dengan PT. Pasifik
                  Satelit Nusantara menghadirkan sistem visualisasi berbasis web
                  ini untuk memudahkan analisis dan monitoring jaringan satelit
                  secara real-time.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Features Section */}
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-12 text-center uppercase tracking-wider">
              Fitur Utama
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureList.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
                >
                  <img
                    src={feature.imageUrl}
                    alt={feature.title}
                    className="w-full h-48 object-cover"
                  />
                  <h3 className="p-4 font-bold text-center text-blue-800">
                    {feature.title}
                  </h3>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Berita Section */}
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-12 text-center uppercase tracking-wider">
              Berita Terbaru
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {beritaList.map((berita) => (
                <a
                  key={berita.id}
                  href={berita.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-lg shadow-md overflow-hidden group"
                >
                  <div className="overflow-hidden">
                    <img
                      src={berita.imageUrl}
                      alt={berita.title}
                      className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="p-5 font-bold text-blue-900 group-hover:text-yellow-600 transition-colors">
                    {berita.title}
                  </h3>
                </a>
              ))}
            </div>
          </AnimatedSection>

          {/* Kontak Section */}
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6 text-center uppercase tracking-wider">
              Kontak Kami
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto text-center mb-12">
              Untuk pertanyaan, saran, atau kolaborasi, jangan ragu hubungi
              kami.
            </p>
            <div className="flex flex-wrap justify-center gap-12">
              <div className="text-center">
                <img
                  src="https://i.imgur.com/iORE2LW.jpeg"
                  alt="Achmad Kabir Rifa'i"
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-300 shadow-lg"
                />
                <h3 className="text-xl font-bold text-blue-900">
                  Achmad Kabir Rifa'i
                </h3>
                <a
                  href="mailto:18121040@mahasiswa.itb.ac.id"
                  className="text-blue-600 hover:underline"
                >
                  18121040@mahasiswa.itb.ac.id
                </a>
              </div>
              <div className="text-center">
                <img
                  src="https://i.imgur.com/Aapt4Yj.jpeg"
                  alt="Ali Ridho"
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-300 shadow-lg"
                />
                <h3 className="text-xl font-bold text-blue-900">Ali Ridho</h3>
                <a
                  href="mailto:18121008@mahasiswa.itb.ac.id"
                  className="text-blue-600 hover:underline"
                >
                  18121008@mahasiswa.itb.ac.id
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-blue-900 text-white text-center p-6 mt-16">
        <p>
          © 2025 Website Visualisasi Spotbeam Satelit | Hak Cipta Dilindungi
        </p>
      </footer>

      {/* CSS untuk efek text-shadow */}
      {/* <style jsx global>{`
        .text-shadow { text-shadow: 1px 1px 8px rgba(0,0,0,0.5); }
        .text-shadow-lg { text-shadow: 2px 2px 12px rgba(0,0,0,0.6); }
      `}</style> */}
    </div>
  );
};

export default BerandaPage;
