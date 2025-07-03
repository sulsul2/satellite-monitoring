import React, { useCallback, useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import CustomIconButton from "../components/CustomIconButton";
import { LuFileUp, LuSatellite, LuSatelliteDish } from "react-icons/lu";
import { MdLogin, MdRadar } from "react-icons/md";
import { SlGraph } from "react-icons/sl";
import { FaWifi } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoGridSharp } from "react-icons/io5";
import Modal from "../components/Modal";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Antenna,
  Beam,
  ChartData,
  Link,
  RawAntennaData,
  Satellite,
} from "../types";
import MapView from "../components/Map";
import { fromLonLat } from "ol/proj";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import "intro.js/themes/introjs-modern.css";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
const LinkDetailItem: React.FC<{
  label: string;
  value: string | number | undefined;
}> = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-2 text-sm">
    <span className="font-semibold text-gray-600">{label}</span>
    <span className="text-gray-800">{String(value ?? "N/A")}</span>
  </div>
);

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
  const [fullAntennaData, setFullAntennaData] = useState<RawAntennaData[]>([]);

  // State untuk modal beam
  const [isBeamModalOpen, setIsBeamModalOpen] = useState(false);
  const [centerLat, setCenterLat] = useState("");
  const [centerLon, setCenterLon] = useState("");
  const [selectedAntenna, setSelectedAntenna] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [beamIdToDelete, setBeamIdToDelete] = useState<number | null>(null);
  const [beamInputMethod, setBeamInputMethod] = useState<
    "manual" | "excel" | null
  >(null);
  const [beamExcelFile, setBeamExcelFile] = useState<File | null>(null);

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
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [isLinkInfoModalOpen, setIsLinkInfoModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const defaultLinkValues = {
    directivity: "45",
    power: "17",
    temperature: "100",
    bandwidth: "36000000",
    loss: "3",
    carrierToInterference: "20",
  };

  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [selectedAntennaForGraph, setSelectedAntennaForGraph] =
    useState<string>("");
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const [isGridView, setIsGridView] = useState(false);

  // State untuk modal logout
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [satellite, setSatellite] = useState<Satellite | null>(null);
  const [antennas, setAntennas] = useState<Antenna[]>([]);
  const [beams, setBeams] = useState<Beam[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const token = localStorage.getItem("access_token");

  const isAnyModalOpen =
    isSatelliteModalOpen ||
    isAntennaModalOpen ||
    isBeamModalOpen ||
    isLinkModalOpen ||
    isGraphModalOpen ||
    isLogoutModalOpen ||
    isDeleteConfirmOpen;

  // Dropzone hook
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setBeamExcelFile(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  // Definisi langkah-langkah untuk tutorial
  const tourSteps = [
    {
      element: "#tour-step-1",
      intro:
        "Langkah 1: Klik ikon ini untuk menambahkan data satelit utama Anda.<br><br><i>Step 1: Click this icon to add your main satellite data.</i>",
    },
    {
      element: "#tour-step-2",
      intro:
        "Langkah 2: Setelah satelit ada, tambahkan data antena di sini.<br><br><i>Step 2: Once the satellite exists, add antenna data here.</i>",
    },
    {
      element: "#tour-step-3",
      intro:
        "Langkah 3: Tambahkan data beam yang terhubung dengan antena yang telah dibuat.<br><br><i>Step 3: Add beam data linked to the created antenna.</i>",
    },
    {
      element: "#tour-step-4",
      intro:
        "Langkah 4: Hitung link budget untuk sebuah titik observasi di peta.<br><br><i>Step 4: Calculate the link budget for an observation point on the map.</i>",
    },
    {
      element: "#tour-step-5",
      intro:
        "Langkah 5: Semua hasil perhitungan (beam dan link) akan divisualisasikan di peta ini.<br><br><i>Step 5: All calculation results (beams and links) will be visualized on this map.</i>",
    },
    {
      element: "#tour-step-6",
      intro:
        "Langkah 6: Jika sudah selesai, Anda bisa keluar dari aplikasi melalui tombol ini.<br><br><i>Step 6: When finished, you can log out of the application using this button.</i>",
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
          setFullAntennaData(antResponse.data);
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

  const handleBeamManualSubmit = async (e: React.FormEvent) => {
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
  const handleBeamExcelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beamExcelFile || !selectedAntenna) {
      toast.error("Harap unggah file Excel dan pilih antena.");
      return;
    }
    const loadingToast = toast.loading("Memproses file Excel...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[][] = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          range: 1,
        });

        const pointsAsArray = data.map((row) => [row[0], row[1]]);

        const beamDataFromExcel = {
          id_antena: parseInt(selectedAntenna, 10),
          points: pointsAsArray,
        };

        await axios.post(url + "beam/store-beams", beamDataFromExcel, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Semua beam dari Excel berhasil disimpan!", {
          id: loadingToast,
        });
        window.location.reload();
      } catch (error) {
        toast.error("Gagal memproses file Excel.", { id: loadingToast });
        console.error(error);
      }
    };
    reader.readAsBinaryString(beamExcelFile);
  };

  const handleBeamCancel = () => {
    setIsBeamModalOpen(false);
    setBeamInputMethod(null);
    setBeamExcelFile(null);
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

    const linkParamsPayload: { [key: string]: number } = {};
    if (directivity !== defaultLinkValues.directivity)
      linkParamsPayload.dir_ground = parseFloat(directivity);
    if (power !== defaultLinkValues.power)
      linkParamsPayload.tx_sat = parseFloat(power);
    if (temperature !== defaultLinkValues.temperature)
      linkParamsPayload.suhu = parseFloat(temperature);
    if (bandwidth !== defaultLinkValues.bandwidth)
      linkParamsPayload.bw = parseFloat(bandwidth);
    if (loss !== defaultLinkValues.loss)
      linkParamsPayload.loss = parseFloat(loss);
    if (carrierToInterference !== defaultLinkValues.carrierToInterference)
      linkParamsPayload.ci_down = parseFloat(carrierToInterference);

    const linkData = {
      obs_lat: parseFloat(linkLat),
      obs_lon: parseFloat(linkLon),
      link_params: linkParamsPayload,
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
                  lat: linkData.obs_lat,
                  lon: linkData.obs_lon,
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
      const loadingToast = toast.loading("Menyimpan data link...");
      try {
        await axios.post(url + "link_budget/calculate", linkData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Data link berhasil disimpan!", { id: loadingToast });
        window.location.reload();
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
    setEditingLinkId(null);
  };

  // Handler untuk menampilkan modal detail link
  const handleLinkInfoRequest = (linkData: Link) => {
    setSelectedLink(linkData);
    setIsLinkInfoModalOpen(true);
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

  const handleMapClickRequest = (coords: [number, number]) => {
    const [lon, lat] = coords;

    // Reset form ke nilai default, lalu isi lat/lon dari klik
    handleLinkCancel(); // Ini akan mereset semua field & editingLinkId

    setLinkLat(lat.toFixed(2));
    setLinkLon(lon.toFixed(2));

    // Buka modal untuk membuat link baru
    setIsLinkModalOpen(true);
  };

  // Handler untuk modal grafik
  const handleOpenGraphModal = () => {
    if (fullAntennaData.length === 0) {
      toast.error("Data antena belum tersedia atau gagal dimuat.");
      return;
    }

    const firstAntenna = fullAntennaData[0];
    setSelectedAntennaForGraph(String(firstAntenna.id));
    if (firstAntenna && firstAntenna.theta_deg && firstAntenna.pattern_dB) {
      const formattedData = firstAntenna.theta_deg.map((theta, index) => ({
        theta: theta,
        pattern: firstAntenna.pattern_dB[index],
      }));
      setChartData(formattedData);
    } else {
      setChartData([]);
    }

    setIsGraphModalOpen(true);
  };

  const handleAntennaSelectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const antennaId = e.target.value;
    setSelectedAntennaForGraph(antennaId);

    const selectedData = fullAntennaData.find(
      (antenna) => antenna.id === parseInt(antennaId)
    );

    if (selectedData && selectedData.theta_deg && selectedData.pattern_dB) {
      const formattedData = selectedData.theta_deg.map((theta, index) => ({
        theta: theta,
        pattern: selectedData.pattern_dB[index],
      }));
      setChartData(formattedData);
    } else {
      setChartData([]);
    }
  };

  const handleGraphModalCancel = () => {
    setIsGraphModalOpen(false);
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
        <div className="flex w-full flex-col gap-5">
          <h1 className="text-center text-2xl font-bold text-gray-800">
            Input Data Beam
          </h1>

          {/* Tampilkan pilihan jika belum ada metode yang dipilih */}
          {!beamInputMethod && (
            <div className="flex justify-center gap-4 py-8">
              <Button
                text="Input Manual"
                onClick={() => setBeamInputMethod("manual")}
                styleType="primary"
              />
              <Button
                text="Import Excel"
                onClick={() => setBeamInputMethod("excel")}
                styleType="secondary"
              />
            </div>
          )}

          {/* Form untuk Input Manual */}
          {beamInputMethod === "manual" && (
            <form
              onSubmit={handleBeamManualSubmit}
              className="flex w-full flex-col gap-5"
            >
              <div className="space-y-4">
                {/* Input Lat, Lon, dan Dropdown Antena */}
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
          )}

          {/* Form untuk Import Excel */}
          {beamInputMethod === "excel" && (
            <form
              onSubmit={handleBeamExcelSubmit}
              className="flex w-full flex-col gap-5"
            >
              <div className="space-y-4">
                {/* Dropzone Area */}
                <div
                  {...getRootProps()}
                  className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input {...getInputProps()} />
                  <LuFileUp className="mx-auto h-12 w-12 text-gray-400" />
                  {beamExcelFile ? (
                    <p className="mt-2 text-sm text-gray-600">
                      {beamExcelFile.name}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      Seret & lepas file Excel di sini, atau klik untuk memilih
                      file
                    </p>
                  )}
                </div>
                {beamExcelFile && (
                  <div className="text-center">
                    <Button
                      onClick={() => setBeamExcelFile(null)}
                      text="Hapus File"
                      type="button"
                      styleType="danger"
                    />
                  </div>
                )}

                {/* Dropdown Antena */}
                <div>
                  <label
                    htmlFor="antennaExcel"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    Pilih Antena untuk semua beam ini
                  </label>
                  <select
                    id="antennaExcel"
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
                <Button
                  text="Import & Simpan"
                  type="submit"
                  styleType="primary"
                />
              </div>
            </form>
          )}
        </div>
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

      {/* Modal untuk Detail Link */}
      <Modal
        visible={isLinkInfoModalOpen}
        onClose={() => setIsLinkInfoModalOpen(false)}
      >
        {selectedLink && (
          <div className="space-y-4 p-4">
            <h2 className="text-2xl font-bold text-blue-800 text-center mb-6">
              Detail Link {selectedLink.id}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <LinkDetailItem label="Status" value={selectedLink.evaluasi} />
              <LinkDetailItem
                label="C/N Ratio"
                value={`${selectedLink.cinr?.toFixed(2)} dB`}
              />
              <LinkDetailItem label="Latitude" value={selectedLink.lat} />
              <LinkDetailItem label="Longitude" value={selectedLink.lon} />
              <LinkDetailItem
                label="Longitude Satelit"
                value={`${longitude}`}
              />
              <LinkDetailItem
                label="Directivity"
                value={`${selectedLink.directivity} dBi`}
              />
              <LinkDetailItem
                label="ID Beam"
                value={`${selectedLink.id_beam}`}
              />
              <LinkDetailItem
                label="Bandwidth"
                value={`${selectedLink.bw / 1_000_000} MHz`}
              />
              <LinkDetailItem label="CINR" value={`${selectedLink.cinr} db`} />
              <LinkDetailItem label="Loss" value={`${selectedLink.loss} dB`} />
              <LinkDetailItem label="G/T" value={`${selectedLink.gt} db`} />
              <LinkDetailItem label="EIRP" value={`${selectedLink.eirp} dBi`} />
            </div>
            <div className="flex justify-center pt-6">
              <Button
                text="Tutup"
                onClick={() => setIsLinkInfoModalOpen(false)}
                styleType="secondary"
              />
            </div>
          </div>
        )}
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

      {/* Modal Grafik Antena */}
      <Modal visible={isGraphModalOpen} onClose={handleGraphModalCancel}>
        <div className="flex w-full flex-col gap-5">
          <div className="w-full flex justify-end">
            <button className="" onClick={() => setIsGraphModalOpen(false)}>
              <RxCross2 size={24} />
            </button>
          </div>
          <h1 className="text-center text-2xl font-bold text-gray-800">
            Grafik Radiasi Antena
          </h1>

          {/* Dropdown untuk memilih antena */}
          <div>
            <label
              htmlFor="antenna-graph-select"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Pilih Antena
            </label>
            <select
              id="antenna-graph-select"
              value={selectedAntennaForGraph}
              onChange={handleAntennaSelectionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                -- Pilih salah satu antena --
              </option>
              {antennas.map((antenna) => (
                <option key={antenna.id} value={antenna.id}>
                  {antenna.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kontainer untuk Grafik */}
          <div className="w-full h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="theta"
                  label={{
                    value: "Theta (derajat)",
                    position: "insideBottomRight",
                    offset: -5,
                  }}
                />
                <YAxis
                  label={{
                    value: "Gain (dB)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(2)} dB`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pattern"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  name="Pola Radiasi"
                />
              </LineChart>
            </ResponsiveContainer>
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
                isGridView={isGridView}
                onBeamDeleteRequest={handleDeleteRequest}
                onLinkUpdateRequest={handleLinkUpdateRequest}
                onLinkInfoRequest={handleLinkInfoRequest}
                onMapClickRequest={handleMapClickRequest}
              />
            )}
          </div>
          <div className="absolute top-3 right-3 w-full flex justify-end z-[1000] gap-2">
            <div id="tour-step-1">
              <CustomIconButton
                onClick={handleOpenSatelliteModal}
                isActive={isSatelliteModalOpen}
                Icon={LuSatellite}
                disabled={isAnyModalOpen}
              />
            </div>
            <div id="tour-step-2">
              <CustomIconButton
                onClick={handleOpenAntennaModal}
                isActive={isAntennaModalOpen}
                Icon={LuSatelliteDish}
                disabled={isAnyModalOpen}
              />
            </div>
            <div id="tour-step-3">
              <CustomIconButton
                onClick={handleOpenBeamModal}
                isActive={isBeamModalOpen}
                Icon={MdRadar}
                disabled={isAnyModalOpen}
              />
            </div>
            <div id="tour-step-4">
              <CustomIconButton
                onClick={handleOpenLinkModal}
                isActive={isLinkModalOpen}
                Icon={FaWifi}
                disabled={isAnyModalOpen}
              />
            </div>
            <CustomIconButton
              onClick={handleOpenGraphModal}
              isActive={isGraphModalOpen}
              Icon={SlGraph}
              disabled={isAnyModalOpen}
            />
            <CustomIconButton
              onClick={() => setIsGridView(!isGridView)}
              isActive={isGridView}
              Icon={IoGridSharp}
              disabled={isAnyModalOpen}
            />
            <div id="tour-step-6">
              <CustomIconButton
                onClick={() => setIsLogoutModalOpen(true)}
                isActive={isLogoutModalOpen}
                Icon={MdLogin}
                disabled={isAnyModalOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
