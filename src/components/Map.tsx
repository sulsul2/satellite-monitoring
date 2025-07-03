import React, { useRef, useEffect, useState } from "react";
import Map from "ol/Map";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Fill, Stroke, Text, RegularShape } from "ol/style";
import type { Satellite, Beam, Link } from "../types";
import CircleStyle from "ol/style/Circle";
import Polygon from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";
import Overlay from "ol/Overlay";
import { CiSatellite1 } from "react-icons/ci";
import Graticule from "ol/layer/Graticule";

interface MapViewProps {
  map: Map | null;
  satellite: Satellite | null;
  beams: Beam[];
  links: Link[];
  isGridView: boolean;
  onBeamDeleteRequest: (beamId: number) => void;
  onLinkUpdateRequest: (linkId: number) => void;
  onLinkInfoRequest: (linkData: Link) => void;
  onMapClickRequest: (coords: [number, number]) => void; 
}

const VISUAL_SCALE_FACTOR = 13;

// Fungsi untuk mendapatkan warna berdasarkan level kontur
const getContourColor = (level: number): string => {
  switch (level) {
    case -3:
      return "rgba(255, 0, 0, 0.5)"; // Merah
    case -2:
      return "rgba(255, 255, 0, 0.5)"; // Kuning
    case -1:
      return "rgba(0, 255, 0, 0.5)"; // Hijau
    default:
      return "rgba(128, 128, 128, 0.5)"; // Abu-abu sebagai default
  }
};

const scaleContourPoints = (
  center_lat: number,
  center_lon: number,
  points: number[][],
  scaleFactor: number
): number[][] => {
  return points.map((point) => {
    const [pLat, pLon] = point;

    // Hitung vektor dari pusat ke titik
    const vecLat = pLat - center_lat;
    const vecLon = pLon - center_lon;

    // Kalikan vektor dengan faktor pengali
    const scaledVecLat = vecLat * scaleFactor;
    const scaledVecLon = vecLon * scaleFactor;

    // Titik baru adalah pusat + vektor yang sudah diperbesar
    const newLat = center_lat + scaledVecLat;
    const newLon = center_lon + scaledVecLon;

    return [newLat, newLon];
  });
};

const MapView: React.FC<MapViewProps> = ({
  map,
  satellite,
  beams,
  links,
  isGridView,
  onBeamDeleteRequest,
  onLinkUpdateRequest,
  onLinkInfoRequest,
  onMapClickRequest, 
}) => {
  const mapElement = useRef<HTMLDivElement>(null);

  // Refs untuk elemen HTML overlay
  const infoPopupElement = useRef<HTMLDivElement>(null);
  const beamDeletePopupElement = useRef<HTMLDivElement>(null);
  const linkActionsPopupElement = useRef<HTMLDivElement>(null);
  const satelliteIconElement = useRef<HTMLDivElement>(null);

  // Refs untuk instance Overlay OpenLayers
  const infoOverlay = useRef<Overlay | null>(null);
  const beamDeleteOverlay = useRef<Overlay | null>(null);
  const linkActionsOverlay = useRef<Overlay | null>(null);
  const satelliteOverlay = useRef<Overlay | null>(null);

  // State untuk item yang sedang diinteraksi
  const [beamToDelete, setBeamToDelete] = useState<number | null>(null);
  const [linkToInteract, setLinkToInteract] = useState<number | null>(null);

  const featuresLayer = useRef<VectorLayer<VectorSource> | null>(null);
  const graticuleLayer = useRef<Graticule | null>(null);

  useEffect(() => {
    if (!map || !mapElement.current) return;
    map.setTarget(mapElement.current);

    // Hapus layer lama kecuali basemap untuk menghindari duplikasi
    const layersToRemove = map.getLayers().getArray().slice(1);
    layersToRemove.forEach((layer) => map.removeLayer(layer));

    // Inisialisasi layer utama untuk fitur (beams, links)
    const featureSource = new VectorSource();
    featuresLayer.current = new VectorLayer({
      source: featureSource,
      zIndex: 10,
    });
    map.addLayer(featuresLayer.current);

    // Inisialisasi layer Graticule (Grid View)
    graticuleLayer.current = new Graticule({
      strokeStyle: new Stroke({
        color: "rgba(0,0,0,0.3)",
        width: 1,
        lineDash: [2, 4],
      }),
      showLabels: true,
      wrapX: false,
      visible: false, // Mulai dengan kondisi tidak terlihat
      zIndex: 1, // Di bawah fitur utama
    });
    map.addLayer(graticuleLayer.current);

    // Inisialisasi overlays
    if (infoPopupElement.current && !infoOverlay.current) {
      infoOverlay.current = new Overlay({
        element: infoPopupElement.current,
        autoPan: { animation: { duration: 250 } },
      });
      map.addOverlay(infoOverlay.current);
    }
    if (beamDeletePopupElement.current && !beamDeleteOverlay.current) {
      beamDeleteOverlay.current = new Overlay({
        element: beamDeletePopupElement.current,
        positioning: "bottom-center",
        offset: [0, -10],
      });
      map.addOverlay(beamDeleteOverlay.current);
    }
    if (linkActionsPopupElement.current && !linkActionsOverlay.current) {
      linkActionsOverlay.current = new Overlay({
        element: linkActionsPopupElement.current,
        positioning: "bottom-center",
        offset: [0, -10],
      });
      map.addOverlay(linkActionsOverlay.current);
    }
    if (satelliteIconElement.current && !satelliteOverlay.current) {
      satelliteOverlay.current = new Overlay({
        element: satelliteIconElement.current,
        positioning: "center-center",
        stopEvent: false,
      });
      map.addOverlay(satelliteOverlay.current);
    }

    const hideAllPopups = () => {
      infoOverlay.current?.setPosition(undefined);
      beamDeleteOverlay.current?.setPosition(undefined);
      linkActionsOverlay.current?.setPosition(undefined);
    };

    const handleLeftClick = (event: any) => {
      hideAllPopups();
      const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f);
      const infoContentElement = infoOverlay.current
        ?.getElement()
        ?.querySelector("#info-content");

      if (feature && (feature.get("type") === "beam-center" || feature.get("type") === "link-point")) {
        const infoContentElement = infoOverlay.current?.getElement()?.querySelector("#info-content");
        if (infoContentElement) {
          if (feature.get("type") === "beam-center") {
            const coordinates = (feature.getGeometry() as Point).getCoordinates();
            const lonLat = toLonLat(coordinates);
            const beamId = feature.get("beamId");
            const beamData = beams.find(b => b.id === beamId);
            infoContentElement.innerHTML = `
              <div class="p-1">
                <div class="font-bold text-base mb-1">Beam #${beamId}</div>
                <div class="text-xs">Lat: ${lonLat[1].toFixed(4)}</div>
                <div class="text-xs">Lon: ${lonLat[0].toFixed(4)}</div>
                <div class="text-xs mt-1">Directivity: ${beamData?.antenna_directivity_dBi?.toFixed(2) ?? 'N/A'} dBi</div>
              </div>
            `;
            infoOverlay.current?.setPosition(coordinates);
          } else if (feature.get("type") === "link-point") {
            const linkId = feature.get("linkId");
            const linkData = links.find((l) => l.id === linkId);
            if (linkData) {
              onLinkInfoRequest(linkData);
            }
          }
        }
      } else {
        // Jika tidak ada fitur yang diklik, panggil callback onMapClickRequest
        const coordinates = map.getCoordinateFromPixel(event.pixel);
        const lonLat = toLonLat(coordinates); // lonLat adalah [longitude, latitude]
        onMapClickRequest(lonLat as [number, number]);
      }
    };

    const handleRightClick = (event: any) => {
      event.preventDefault();
      hideAllPopups();
      const feature = map.forEachFeatureAtPixel(event.pixel, (f) => f);

      if (feature && feature.get("type") === "beam-center") {
        const coordinates = (feature.getGeometry() as Point).getCoordinates();
        setBeamToDelete(feature.get("beamId"));
        beamDeleteOverlay.current?.setPosition(coordinates);
      } else if (feature && feature.get("type") === "link-point") {
        const coordinates = (feature.getGeometry() as Point).getCoordinates();
        setLinkToInteract(feature.get("linkId"));
        linkActionsOverlay.current?.setPosition(coordinates);
      }
    };

    map.on("click", handleLeftClick);
    map.on("contextmenu" as any, handleRightClick);

    return () => {
      if (map) {
        map.setTarget(undefined);
        map.un("click", handleLeftClick);
        map.un("contextmenu" as any, handleRightClick);
      }
      if (map && featuresLayer.current) {
        map.removeLayer(featuresLayer.current);
      }
      if (map && graticuleLayer.current) {
        map.removeLayer(graticuleLayer.current);
      }
    };
  }, [map, links]);

  // useEffect baru khusus untuk mengontrol visibilitas grid
  useEffect(() => {
    if (graticuleLayer.current) {
      graticuleLayer.current.setVisible(isGridView);
    }
  }, [isGridView]);

  // useEffect untuk menggambar/memperbarui fitur di peta
  useEffect(() => {
    if (!map) return;

    // Buat layer baru untuk fitur-fitur ini
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      // zIndex lebih tinggi agar selalu di atas tile layer
      zIndex: 10,
    });

    map.addLayer(vectorLayer);

    // Set posisi untuk Ikon Satelit menggunakan Overlay
    if (satellite && satelliteOverlay.current) {
      const satelliteCoords = fromLonLat([satellite.lon, satellite.lat]);
      satelliteOverlay.current.setPosition(satelliteCoords);
    } else if (satelliteOverlay.current) {
      satelliteOverlay.current.setPosition(undefined); // Sembunyikan jika tidak ada satelit
    }

    // 2. Gambar Beams
    if (beams && beams.length > 0) {
      beams.forEach((beam) => {
        const centerCoordinate = fromLonLat([beam.center_lon, beam.center_lat]);

        // --- SOLUSI: Gunakan 2 Fitur ---

        // 1. Fitur untuk INTERAKSI (Point)
        const interactivePointFeature = new Feature({
          geometry: new Point(centerCoordinate),
          type: "beam-center",
          beamId: beam.id,
        });
        // Beri gaya agar terlihat seperti titik, tapi interaksi akan menangkap ini.
        interactivePointFeature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 7, // Radius dalam piksel agar mudah di klik
              fill: new Fill({ color: "black" }),
              // stroke: new Stroke({ color: 'white', width: 2 }),
            }),
          })
        );
        vectorSource.addFeature(interactivePointFeature);

        // 2. Fitur untuk VISUAL (Circle) - tidak perlu interaktif
        // Ini hanya untuk menampilkan lingkaran dengan radius meter.
        const radiusInMeters = 25000; // Contoh: 25km
        const visualCircleFeature = new Feature({
          geometry: new Circle(centerCoordinate, radiusInMeters),
        });
        visualCircleFeature.setStyle(
          new Style({
            fill: new Fill({ color: "rgba(0, 0, 0, 0.1)" }),
            stroke: new Stroke({ color: "black", width: 1 }),
          })
        );
        // Gambar setiap kontur sebagai poligon
        const sortedContours = [...beam.contours].sort(
          (a, b) => a.level - b.level
        );

        // Gambar setiap kontur sebagai poligon dari array yang sudah diurutkan
        sortedContours.forEach((contour) => {
          const scaledPoints = scaleContourPoints(
            beam.center_lat,
            beam.center_lon,
            contour.points,
            VISUAL_SCALE_FACTOR
          );
          const coordinates = scaledPoints.map((point) =>
            fromLonLat([point[1], point[0]])
          );

          const polygonFeature = new Feature({
            geometry: new Polygon([coordinates]),
          });

          // Style poligon berdasarkan level
          const polygonStyle = new Style({
            stroke: new Stroke({
              color: getContourColor(contour.level).replace("0.5", "1"),
              width: 3,
            }),
          });

          polygonFeature.setStyle(polygonStyle);
          vectorSource.addFeature(polygonFeature);
        });
      });
    }

    // Gambar Links
    if (links && links.length > 0) {
      links.forEach((link) => {
        const linkFeature = new Feature({
          // Menggunakan clon dan clat sesuai data API
          geometry: new Point(fromLonLat([link.lon, link.lat])),
          type: "link-point",
          linkId: link.id,
        });
        linkFeature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: "rgba(138, 43, 226, 1)" }),
              stroke: new Stroke({ color: "white", width: 2 }),
            }),
          })
        );
        vectorSource.addFeature(linkFeature);
      });
    }

    // Cleanup: Hapus layer saat useEffect berjalan kembali atau komponen dilepas
    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [map, satellite, beams]); // Jalankan kembali efek ini jika map atau data berubah

  const handleBeamDeleteClick = () => {
    if (beamToDelete !== null) onBeamDeleteRequest(beamToDelete);
    beamDeleteOverlay.current?.setPosition(undefined);
  };

  const handleLinkUpdateClick = () => {
    if (linkToInteract !== null) onLinkUpdateRequest(linkToInteract);
    linkActionsOverlay.current?.setPosition(undefined);
  };

  return (
    <>
      <div ref={mapElement} className="w-full h-full" />
      <div
        ref={infoPopupElement}
        className="bg-white rounded-lg shadow-lg p-2 ol-popup"
      >
        <button
          onClick={() => infoOverlay.current?.setPosition(undefined)}
          className="ol-popup-closer"
        ></button>
        <div id="info-content" className="text-sm"></div>
      </div>

      {/* Elemen HTML untuk Delete Popup (Klik Kanan) */}
      <div ref={beamDeletePopupElement}>
        <button
          onClick={handleBeamDeleteClick}
          className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-md shadow-md hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>

      {/* PERUBAHAN: Hanya ada tombol Update untuk link */}
      <div ref={linkActionsPopupElement}>
        <button
          onClick={handleLinkUpdateClick}
          className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-md hover:bg-blue-700"
        >
          Update
        </button>
      </div>

      <div ref={satelliteIconElement}>
        <CiSatellite1 size={28} color="#0064FFE6" />
      </div>
    </>
  );
};

export default MapView;
