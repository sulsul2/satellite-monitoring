// src/types.ts

export interface Antenna {
  id: string | number;
  name: string;
}

export interface RawAntennaData {
  bw3db_deg: number;
  directivity: number;
  eff: number;
  f_d: number;
  frekuensi: number;
  id: number;
  id_satelite: number;
  name: string;
  pattern_dB: number[]; // Array angka untuk grafik
  theta_deg: number[]; // Array angka untuk grafik
}

export interface Satellite {
  id: number;
  lat: number;
  lon: number;
  alt: number;
}

export interface Contour {
  level: number;
  points: number[][]; // Array dari [lon, lat]
}

export interface Beam {
  id: number;
  id_antena: number;
  center_lat: number;
  center_lon: number;
  antenna_directivity_dBi: number;
  contours: Contour[];
}

export interface Link {
  bw: number;
  ci: number;
  ci_down: number;
  cinr: number;
  clat: number;
  clon: number;
  lat: number;
  lon: number;
  cn: number;
  dir_ground: number;
  directivity: number;
  distance: number;
  eirp: number;
  evaluasi: string;
  fsl: number;
  gt: number;
  id: number;
  id_beam: number;
  id_default: number;
  loss: number;
  suhu: number;
  tx_sat: number;
}

export interface ChartData {
  theta: number;
  pattern: number;
}
