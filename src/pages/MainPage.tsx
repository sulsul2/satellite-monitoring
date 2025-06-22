import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import CustomIconButton from "../components/CustomIconButton";
import { LuSatellite, LuSatelliteDish } from "react-icons/lu";
import { MdLogin, MdRadar } from "react-icons/md";
import { FaWifi } from "react-icons/fa";
import Modal from "../components/Modal";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Antenna, Beam, Link, Satellite } from "../types";
import MapView from "../components/Map";
import { fromLonLat } from "ol/proj";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import "intro.js/themes/introjs-modern.css";

const MainPage: React.FC = () => {
  const url = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const mapRef = useRef<Map | null>(null);

  // State untuk User Guidance
  const [isTourOpen, setIsTourOpen] = useState(false);

  // 2. Gunakan useState hanya untuk memberi tahu kapan map siap.
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSatelliteModalOpen, setIsSatelliteModalOpen] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [altitude, setAltitude] = useState("");

  // State untuk modal antena
  const [isAntennaModalOpen, setIsAntennaModalOpen] = useState(false);
  const [beamwidth, setBeamwidth] = useState("");
  const [fdRatio, setFdRatio] = useState("");
  const [frequency, setFrequency] = useState("");
  const [efficiency, setEfficiency] = useState("");

  // State untuk modal beam
  const [isBeamModalOpen, setIsBeamModalOpen] = useState(false);
  const [centerLat, setCenterLat] = useState("");
  const [centerLon, setCenterLon] = useState("");
  const [selectedAntenna, setSelectedAntenna] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [beamIdToDelete, setBeamIdToDelete] = useState<number | null>(null);

  // State untuk data Link Budget
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkLat, setLinkLat] = useState("");
  const [linkLon, setLinkLon] = useState("");
  const [directivity, setDirectivity] = useState("45");
  const [power, setPower] = useState("17");
  const [temperature, setTemperature] = useState("100");
  const [bandwidth, setBandwidth] = useState("36000000");
  const [loss, setLoss] = useState("3");
  const [carrierToInterference, setCarrierToInterference] = useState("20");
  const [isLinkDeleteConfirmOpen, setIsLinkDeleteConfirmOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);

  // State untuk modal logout
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [satellite, setSatellite] = useState<Satellite | null>(null);
  const [antennas, setAntennas] = useState<Antenna[]>([]);
  const [beams, setBeams] = useState<Beam[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const token = localStorage.getItem("access_token");

  // Definisi langkah-langkah untuk tutorial
  const tourSteps = [
    {
      element: "#tour-step-1",
      intro:
        "Langkah 1: Klik ikon ini untuk menambahkan data satelit utama Anda.",
    },
    {
      element: "#tour-step-2",
      intro: "Langkah 2: Setelah satelit ada, tambahkan data antena di sini.",
    },
    {
      element: "#tour-step-3",
      intro:
        "Langkah 3: Tambahkan data beam yang terhubung dengan antena yang telah dibuat.",
    },
    {
      element: "#tour-step-4",
      intro:
        "Langkah 4: Hitung link budget untuk sebuah titik observasi di peta.",
    },
    {
      element: "#tour-step-5",
      intro:
        "Langkah 5: Semua hasil perhitungan (beam dan link) akan divisualisasikan di peta ini.",
    },
    {
      element: "#tour-step-6",
      intro:
        "Langkah 6: Jika sudah selesai, Anda bisa keluar dari aplikasi melalui tombol ini.",
    },
  ];

  useEffect(() => {
    // Buat instance map dan simpan di ref.
    mapRef.current = new Map({
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({ center: fromLonLat([107.6191, -6.9175]), zoom: 5 }),
      controls: [],
    });
    // Picu re-render agar map bisa diteruskan ke komponen anak.
    setIsMapReady(true);

    // Cleanup saat komponen MainPage dilepas
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        toast.error("Sesi tidak valid, silakan login kembali.");
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      let hasSatellite = false;

      try {
        const [satResponse, antResponse, beamResponse, linkResponse] =
          await Promise.all([
            axios.get(url + "satellite/get-satellites", { headers }),
            axios.get(url + "antenna/get-antennas", { headers }),
            axios.get(url + "beam/get-beams-with-contours", { headers }),
            axios.get(url + "link_budget/links", { headers }),
          ]);

        if (satResponse.data.satellites.length > 0) {
          hasSatellite = true;
          const firstSat = satResponse.data.satellites[0];
          setSatellite({
            id: firstSat.id,
            lat: firstSat.lat,
            lon: firstSat.lon,
            alt: firstSat.alt,
          });
        }
        if (antResponse.data && Array.isArray(antResponse.data)) {
          const formattedAntennas: Antenna[] = antResponse.data.map(
            (item: any) => ({ id: item.id, name: item.name })
          );
          setAntennas(formattedAntennas);
        }
        if (beamResponse.data && Array.isArray(beamResponse.data)) {
          setBeams(beamResponse.data);
        }
        if (linkResponse.data && Array.isArray(linkResponse.data)) {
          setLinks(linkResponse.data);
        }

        if (!hasSatellite) {
          setIsTourOpen(true);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        toast.error("Gagal memuat data dari server.");
      }
    };

    fetchData();
  }, [token, navigate, url]);

  const handleOpenSatelliteModal = () => {
    if (satellite) {
      setLatitude(String(satellite.lat));
      setLongitude(String(satellite.lon));
      setAltitude(String(satellite.alt));
    } else {
      setLatitude("");
      setLongitude("");
      setAltitude("");
    }
    setIsSatelliteModalOpen(true);
  };

  const handleSatelliteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const satelliteData = {
      lat: parseFloat(latitude),
      lon: parseFloat(longitude),
      alt: parseFloat(altitude),
    };

    if (satellite) {
      // Logic untuk UPDATE satelit yang ada
      const loadingToast = toast.loading("Memperbarui data satelit...");
      try {
        const response = await axios.put(
          `${url}satellite/update-satellite`,
          satelliteData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSatellite(response.data);
        toast.success("Data satelit berhasil diperbarui!", {
          id: loadingToast,
        });
        window.location.reload();
      } catch (error) {
        toast.error("Gagal memperbarui data satelit.", { id: loadingToast });
      }
    } else {
      // Logic untuk CREATE satelit baru
      const loadingToast = toast.loading("Menyimpan data satelit...");
      try {
        const response = await axios.post(
          url + "satellite/store-satellite",
          satelliteData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSatellite(response.data);
        window.location.reload();
        toast.success("Data satelit berhasil disimpan!", { id: loadingToast });
      } catch (error) {
        toast.error("Gagal menyimpan data satelit.", { id: loadingToast });
      }
    }
    setIsSatelliteModalOpen(false);
  };

  const handleSatelliteCancel = () => {
    setIsSatelliteModalOpen(false);
  };

  // Handler untuk form antena
  // Handler untuk membuka modal beam dengan pengecekan
  const handleOpenAntennaModal = () => {
    if (!satellite) {
      toast.error("Harap isi data satelite terlebih dahulu.");
    } else {
      setIsAntennaModalOpen(true);
    }
  };
  const handleAntennaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const antennaData = {
      bw3dB: parseFloat(beamwidth),
      F_D: parseFloat(fdRatio),
      frequency: parseFloat(frequency),
      Efficiency: parseFloat(efficiency),
      id_satelite: 5,
    };
    try {
      const response = await axios.post(
        url + "antenna/calculate",
        antennaData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status == 201) {
        toast.success("Data antena berhasil disimpan!");
        console.log(response);
        setIsAntennaModalOpen(false);
        setBeamwidth("");
        setFdRatio("");
        setFrequency("");
        setEfficiency("");
        window.location.reload();
      } else {
        toast.error("Data antena gagal disimpan!");
      }
    } catch (error) {
      toast.error("Data antena gagal disimpan!");
      console.error(error);
    }
  };

  const handleAntennaCancel = () => {
    setIsAntennaModalOpen(false);
    setBeamwidth("");
    setFdRatio("");
    setFrequency("");
    setEfficiency("");
  };

  // Handler untuk form beam

  // Handler untuk membuka modal beam dengan pengecekan
  const handleOpenBeamModal = () => {
    if (antennas.length === 0) {
      toast.error("Harap isi data antena terlebih dahulu.");
    } else {
      setIsBeamModalOpen(true);
    }
  };

  const handleBeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const beamData = {
      center_lat: parseFloat(centerLat),
      center_lon: parseFloat(centerLon),
      id_antena: selectedAntenna,
    };
    try {
      const response = await axios.post(url + "beam/store-beam", beamData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status == 201) {
        toast.success("Data beam berhasil disimpan!");
        console.log(response);
        setIsBeamModalOpen(false);
        setCenterLat("");
        setCenterLon("");
        setSelectedAntenna("");
        window.location.reload();
      } else {
        toast.error("Data antena gagal disimpan!");
      }
    } catch (error) {
      toast.error("Data antena gagal disimpan!");
      console.error(error);
    }
  };

  const handleBeamCancel = () => {
    setIsBeamModalOpen(false);
    setCenterLat("");
    setCenterLon("");
    setSelectedAntenna("");
  };

  // Handler untuk form Link Budget
  // Handler untuk membuka modal link dengan pengecekan
  const handleOpenLinkModal = () => {
    if (beams.length === 0) {
      toast.error("Harap isi data antena terlebih dahulu.");
    } else {
      setIsLinkModalOpen(true);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Anda tidak terautentikasi.");
      return;
    }

    const linkData = {
      obs_lat: parseFloat(linkLat),
      obs_lon: parseFloat(linkLon),
      link_params: {
        dir_ground: parseFloat(directivity),
        tx_sat: parseFloat(power),
        suhu: parseFloat(temperature),
        bw: parseFloat(bandwidth),
        loss: parseFloat(loss),
        ci_down: parseFloat(carrierToInterference),
      },
    };

    if (editingLinkId) {
      const loadingToast = toast.loading("Memperbarui data link...");
      try {
        await axios.put(`${url}link_budget/link/${editingLinkId}`, linkData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLinks((prevLinks) =>
          prevLinks.map((link) =>
            link.id === editingLinkId
              ? {
                  ...link,
                  ...linkData,
                  clat: linkData.obs_lat,
                  clon: linkData.obs_lon,
                }
              : link
          )
        );
        toast.success("Data link berhasil diperbarui!", { id: loadingToast });
        window.location.reload();
      } catch (error) {
        toast.error("Gagal memperbarui data.", { id: loadingToast });
      }
    } else {
      // Logika untuk membuat link baru
      const loadingToast = toast.loading("Menyimpan data link...");
      try {
        await axios.post(url + "link_budget/calculate", linkData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Data link berhasil disimpan!", { id: loadingToast });
        window.location.reload();
        // Optional: Anda bisa melakukan fetch ulang data links atau menambahkan respons ke state
      } catch (error) {
        toast.error("Gagal menyimpan data.", { id: loadingToast });
      }
    }
    handleLinkCancel();
  };

  const handleLinkCancel = () => {
    setIsLinkModalOpen(false);
    setLinkLat("");
    setLinkLon("");
    setDirectivity("45");
    setPower("17");
    setTemperature("100");
    setBandwidth("36000000");
    setLoss("3");
    setCarrierToInterference("20");
  };

  // Handler untuk menerima permintaan hapus dari MapView
  const handleDeleteRequest = (beamId: number) => {
    setBeamIdToDelete(beamId);
    setIsDeleteConfirmOpen(true);
  };

  // Handler untuk mengkonfirmasi dan mengeksekusi penghapusan
  const handleConfirmDelete = async () => {
    if (beamIdToDelete === null) return;
    const loadingToast = toast.loading("Menghapus beam...");
    try {
      await axios.delete(`${url}beam/delete-beam/${beamIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBeams((prevBeams) =>
        prevBeams.filter((beam) => beam.id !== beamIdToDelete)
      );
      toast.success("Beam berhasil dihapus.", { id: loadingToast });
    } catch (error) {
      toast.error("Gagal menghapus beam.", { id: loadingToast });
      console.error("Error deleting beam:", error);
    } finally {
      setIsDeleteConfirmOpen(false);
      setBeamIdToDelete(null);
    }
  };

  const handleLinkUpdateRequest = (linkId: number) => {
    const linkToEdit = links.find((link) => link.id === linkId);
    if (linkToEdit) {
      setLinkLat(String(linkToEdit.lat));
      setLinkLon(String(linkToEdit.lon));
      setDirectivity(String(linkToEdit.dir_ground));
      setPower(String(linkToEdit.tx_sat));
      setTemperature(String(linkToEdit.suhu));
      setBandwidth(String(linkToEdit.bw));
      setLoss(String(linkToEdit.loss));
      setCarrierToInterference(String(linkToEdit.ci_down));
      setEditingLinkId(linkId);
      setIsLinkModalOpen(true);
    } else {
      toast.error("Data link tidak ditemukan.");
    }
  };

  // Handlers untuk Logout
  const handleConfirmLogout = () => {
    localStorage.removeItem("access_token");
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      <Steps
        enabled={isTourOpen}
        steps={tourSteps}
        initialStep={0}
        onExit={() => setIsTourOpen(false)}
        options={{
          tooltipClass: "customTooltip",
          doneLabel: "Selesai",
          nextLabel: "Lanjut",
          prevLabel: "Kembali",
        }}
      />
      <Toaster position="top-center" reverseOrder={false} />
      {/* Modal Satelite */}
      <Modal visible={isSatelliteModalOpen} onClose={handleSatelliteCancel}>
        <form
          onSubmit={handleSatelliteSubmit}
          className="flex w-full flex-col gap-5"
        >
          <h1 className="text-center text-2xl font-bold text-gray-800">
            {satellite ? "Update Data Satelit" : "Input Data Satelit"}
          </h1>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="latitude"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Latitude
              </label>
              <input
                type="number"
                id="latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="-6.9175"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="longitude"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Longitude
              </label>
              <input
                type="number"
                id="longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="107.6191"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="altitude"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Altitude (km)
              </label>
              <input
                type="number"
                id="altitude"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                placeholder="700"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex w-full justify-end gap-3 pt-4">
            <Button
              onClick={handleSatelliteCancel}
              text="Batalkan"
              type="button"
              styleType="secondary"
            />
            <Button
              text={satellite ? "Update Data" : "Simpan Data"}
              type="submit"
              styleType="primary"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Antena */}
      <Modal visible={isAntennaModalOpen} onClose={handleAntennaCancel}>
        <form
          onSubmit={handleAntennaSubmit}
          className="flex w-full flex-col gap-5"
        >
          <h1 className="text-center text-2xl font-bold text-gray-800">
            Input Data Antena
          </h1>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="beamwidth"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                3dB Beamwidth (derajat)
              </label>
              <input
                type="number"
                id="beamwidth"
                value={beamwidth}
                onChange={(e) => setBeamwidth(e.target.value)}
                placeholder="1.5"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="fdRatio"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                f/d Ratio
              </label>
              <input
                type="number"
                id="fdRatio"
                value={fdRatio}
                onChange={(e) => setFdRatio(e.target.value)}
                placeholder="0.4"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="frequency"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Frekuensi (GHz)
              </label>
              <input
                type="number"
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="12.5"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="efficiency"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Efisiensi (%)
              </label>
              <input
                type="number"
                id="efficiency"
                value={efficiency}
                onChange={(e) => setEfficiency(e.target.value)}
                placeholder="65"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex w-full justify-end gap-3 pt-4">
            <Button
              onClick={handleAntennaCancel}
              text="Batalkan"
              type="button"
              styleType="secondary"
            />
            <Button text="Simpan Data" type="submit" styleType="primary" />
          </div>
        </form>
      </Modal>

      {/* Modal Beam */}
      <Modal visible={isBeamModalOpen} onClose={handleBeamCancel}>
        <form
          onSubmit={handleBeamSubmit}
          className="flex w-full flex-col gap-5"
        >
          <h1 className="text-center text-2xl font-bold text-gray-800">
            Input Data Beam
          </h1>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="centerLat"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Center of Latitude
              </label>
              <input
                type="number"
                id="centerLat"
                value={centerLat}
                onChange={(e) => setCenterLat(e.target.value)}
                placeholder="-6.2000"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="centerLon"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Center of Longitude
              </label>
              <input
                type="number"
                id="centerLon"
                value={centerLon}
                onChange={(e) => setCenterLon(e.target.value)}
                placeholder="106.8167"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="antenna"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Pilih Antena
              </label>
              <select
                id="antenna"
                value={selectedAntenna}
                onChange={(e) => setSelectedAntenna(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  -- Pilih salah satu --
                </option>
                {antennas.map((antenna) => (
                  <option key={antenna.id} value={antenna.id}>
                    {antenna.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex w-full justify-end gap-3 pt-4">
            <Button
              onClick={handleBeamCancel}
              text="Batalkan"
              type="button"
              styleType="secondary"
            />
            <Button text="Simpan Data" type="submit" styleType="primary" />
          </div>
        </form>
      </Modal>

      {/* Modal Link Budget (untuk Create & Update) */}
      <Modal visible={isLinkModalOpen} onClose={handleLinkCancel}>
        <form
          onSubmit={handleLinkSubmit}
          className="flex w-full flex-col gap-5"
        >
          <h1 className="text-center text-2xl font-bold text-gray-800">
            {editingLinkId
              ? "Update Data Link Budget"
              : "Input Data Link Budget"}
          </h1>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="linkLat"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Latitude
              </label>
              <input
                type="number"
                id="linkLat"
                value={linkLat}
                onChange={(e) => setLinkLat(e.target.value)}
                placeholder="Contoh: -6.9175"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="linkLon"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Longitude
              </label>
              <input
                type="number"
                id="linkLon"
                value={linkLon}
                onChange={(e) => setLinkLon(e.target.value)}
                placeholder="Contoh: 107.6191"
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="directivity"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Directivity Antena Ground (dBi)
              </label>
              <input
                type="number"
                id="directivity"
                value={directivity}
                onChange={(e) => setDirectivity(e.target.value)}
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="power"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Daya Pancar Antena Satelit (Watt)
              </label>
              <input
                type="number"
                id="power"
                value={power}
                onChange={(e) => setPower(e.target.value)}
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="temperature"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Suhu (Kelvin)
              </label>
              <input
                type="number"
                id="temperature"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="bandwidth"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Bandwidth (Hz)
              </label>
              <input
                type="number"
                id="bandwidth"
                value={bandwidth}
                onChange={(e) => setBandwidth(e.target.value)}
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="loss"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Gabungan Loss (dB)
              </label>
              <input
                type="number"
                id="loss"
                value={loss}
                onChange={(e) => setLoss(e.target.value)}
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="carrierToInterference"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Carrier to Interference (C/I)
              </label>
              <input
                type="number"
                id="carrierToInterference"
                value={carrierToInterference}
                onChange={(e) => setCarrierToInterference(e.target.value)}
                step="any"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex w-full justify-end gap-3 pt-4">
            <Button
              onClick={handleLinkCancel}
              text="Batalkan"
              type="button"
              styleType="secondary"
            />
            <Button
              text={editingLinkId ? "Update Data" : "Simpan Data"}
              type="submit"
              styleType="primary"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus Beam */}
      <Modal
        visible={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Konfirmasi Penghapusan
          </h2>
          <p className="text-gray-600 mb-8">
            Apakah Anda yakin ingin menghapus beam ini?
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setIsDeleteConfirmOpen(false)}
              text="Tidak"
              styleType="secondary"
            />
            <Button
              onClick={handleConfirmDelete}
              text="Iya, Hapus"
              styleType="danger"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Logout */}
      <Modal
        visible={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      >
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Konfirmasi Logout
          </h2>
          <p className="text-gray-600 mb-8">Apakah Anda yakin ingin keluar?</p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setIsLogoutModalOpen(false)}
              text="Tidak"
              styleType="secondary"
            />
            <Button
              onClick={handleConfirmLogout}
              text="Iya, Keluar"
              styleType="danger"
            />
          </div>
        </div>
      </Modal>

      <div>
        <div className="relative w-screen h-screen">
          <div id="tour-step-5" className="w-full h-full">
            {isMapReady && (
              <MapView
                map={mapRef.current}
                satellite={satellite}
                beams={beams}
                links={links}
                onBeamDeleteRequest={handleDeleteRequest}
                onLinkUpdateRequest={handleLinkUpdateRequest}
              />
            )}
          </div>
          <div className="absolute top-3 right-3 w-full flex justify-end z-[1000] gap-2">
            <div id="tour-step-1">
              <CustomIconButton
                onClick={handleOpenSatelliteModal}
                isActive={isSatelliteModalOpen}
                Icon={LuSatellite}
              />
            </div>
            <div id="tour-step-2">
              <CustomIconButton
                onClick={handleOpenAntennaModal}
                isActive={isAntennaModalOpen}
                Icon={LuSatelliteDish}
              />
            </div>
            <div id="tour-step-3">
              <CustomIconButton
                onClick={handleOpenBeamModal}
                isActive={isBeamModalOpen}
                Icon={MdRadar}
              />
            </div>
            <div id="tour-step-4">
              <CustomIconButton
                onClick={handleOpenLinkModal}
                isActive={isLinkModalOpen}
                Icon={FaWifi}
              />
            </div>
            <div id="tour-step-6">
              <CustomIconButton
                onClick={() => setIsLogoutModalOpen(true)}
                isActive={isLogoutModalOpen}
                Icon={MdLogin}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
