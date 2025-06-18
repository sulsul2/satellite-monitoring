import React, { useEffect, useState } from "react";
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

const MainPage: React.FC = () => {
  const navigate = useNavigate();
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

  // State untuk modal logout
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Data tiruan untuk daftar antena. Di aplikasi nyata, ini bisa datang dari state atau API.
  const [antennas] = useState([
    { id: "ant1", name: "Antena Jakarta Pusat" },
    { id: "ant2", name: "Antena Surabaya Timur" },
    { id: "ant3", name: "Antena Bandung Selatan" },
  ]);

  useEffect(() => {
    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [107, -6],
        zoom: 1,
      }),
    });

    return () => map.setTarget(undefined);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const satelliteData = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      altitude: parseFloat(altitude),
    };
    console.log("Data Satelit Disimpan:", satelliteData);
    // Di sini Anda bisa menambahkan logika untuk mengirim data ke server
    setIsSatelliteModalOpen(false); // Tutup modal setelah submit`
  };

  const handleCancel = () => {
    setIsSatelliteModalOpen(false);
    setLatitude("");
    setLongitude("");
    setAltitude("");
  };

  // Handler untuk form antena
  const handleAntennaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const antennaData = {
      beamwidth: parseFloat(beamwidth),
      fdRatio: parseFloat(fdRatio),
      frequency: parseFloat(frequency),
      efficiency: parseFloat(efficiency),
    };
    console.log("Data Antena Disimpan:", antennaData);
    setIsAntennaModalOpen(false);
  };

  const handleAntennaCancel = () => {
    setIsAntennaModalOpen(false);
    setBeamwidth("");
    setFdRatio("");
    setFrequency("");
    setEfficiency("");
  };

  // Handler untuk form beam
  const handleBeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const beamData = {
      centerLat: parseFloat(centerLat),
      centerLon: parseFloat(centerLon),
      antennaId: selectedAntenna,
    };
    console.log("Data Beam Disimpan:", beamData);
    setIsBeamModalOpen(false);
  };

  const handleBeamCancel = () => {
    setIsBeamModalOpen(false);
    setCenterLat("");
    setCenterLon("");
    setSelectedAntenna("");
  };

  // Handlers untuk Logout
  const handleConfirmLogout = () => {
    localStorage.removeItem("access_token");
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* Modal Satelite */}
      <Modal visible={isSatelliteModalOpen} onClose={handleCancel}>
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
          <h1 className="text-center text-2xl font-bold text-gray-800">
            Input Data Satelit
          </h1>

          {/* Input Fields */}
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

          {/* Action Buttons */}
          <div className="flex w-full justify-end gap-3 pt-4">
            <Button
              onClick={handleCancel}
              text="Batalkan"
              type="button"
              styleType="secondary"
            />
            <Button text="Simpan Data" type="submit" styleType="primary" />
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
        <div id="map" className="w-screen h-screen">
          <div className="absolute top-3 right-3 w-full flex justify-end z-[1000] gap-2">
            <CustomIconButton
              onClick={() => setIsSatelliteModalOpen(true)}
              isActive={isSatelliteModalOpen}
              Icon={LuSatellite}
            />
            <CustomIconButton
              onClick={() => setIsAntennaModalOpen(true)}
              isActive={isAntennaModalOpen}
              Icon={LuSatelliteDish}
            />
            <CustomIconButton
              onClick={() => setIsBeamModalOpen(true)}
              isActive={isBeamModalOpen}
              Icon={MdRadar}
            />
            <CustomIconButton
              onClick={() => {}}
              isActive={false}
              Icon={FaWifi}
            />
            <CustomIconButton
              onClick={() => setIsLogoutModalOpen(true)}
              isActive={isLogoutModalOpen}
              Icon={MdLogin}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
