import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import api from '../config/api';

function MapView() {
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await api.get('/fasilitas/geojson/data'); 
        setGeojsonData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchGeoJSON();
  }, []);

  // Fungsi pewarnaan berdasarkan jenis
  const getStyle = (feature) => {
    const jenis = feature.properties.jenis;
    const colors = {
      "Rumah Sakit": "#FF0000", // Merah
      "Puskesmas": "#FF6600",   // Oranye
      "Sekolah": "#0000FF",     // Biru
      "Pasar": "#00FF00"        // Hijau
    };
    return {
      color: colors[jenis] || "#666666",
      weight: 2,
      fillOpacity: 0.5
    };
  };

  // Mengubah data Point menjadi Lingkaran Marker
  const pointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: getStyle(feature).color,
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
  };

  // Fungsi Popup dan Event Listener (Hover, Click, & Delete)
  const onEachFeature = (feature, layer) => {
    // Kita panggil id fasilitas juga dari database
    const { id, nama, jenis, alamat } = feature.properties; 
    
    // 1. Popup (Sekarang ditambah tombol Hapus dengan ID unik)
    const popupContent = `
      <div style="font-family: sans-serif;">
        <h3 style="margin: 0 0 5px 0; color: #656D3F;">${nama}</h3>
        <p style="margin: 0;"><b>Jenis:</b> ${jenis}</p>
        <p style="margin: 0 0 10px 0;"><b>Alamat:</b> ${alamat || '-'}</p>
        <button id="btn-hapus-${id}" style="color: white; background-color: #dc3545; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
          🗑️ Hapus Fasilitas
        </button>
      </div>
    `;
    layer.bindPopup(popupContent);

    // 2. Events gabungan (Hover, Zoom, dan Listener Tombol Hapus)
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ weight: 4, fillOpacity: 1 });
      },
      mouseout: (e) => {
        e.target.setStyle({ weight: 1, fillOpacity: 0.8 });
      },
      click: (e) => {
        const map = e.target._map;
        map.flyTo(e.latlng, 17, { duration: 1.5 });
      },
      // Event ini mendeteksi saat popup selesai terbuka di layar
      popupopen: () => {
        const btn = document.getElementById(`btn-hapus-${id}`);
        if (btn) {
          btn.onclick = async () => {
            // Konfirmasi sebelum menghapus (Mencegah salah klik)
            if (window.confirm(`Apakah Anda yakin ingin menghapus "${nama}" secara permanen?`)) {
              try {
                // Melakukan request DELETE ke backend API
                await api.delete(`/fasilitas/${id}`);
                alert('Data berhasil dihapus!');
                window.location.reload(); // Refresh halaman otomatis agar marker hilang
              } catch (error) {
                console.error(error);
                alert('Gagal menghapus data! Pastikan Anda sudah Login sebagai Admin.');
              }
            }
          };
        }
      }
    });
  };

  return (
    <MapContainer center={[-5.42, 105.26]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {geojsonData && (
        <GeoJSON 
          data={geojsonData} 
          style={getStyle}
          pointToLayer={pointToLayer}
          onEachFeature={onEachFeature} 
        />
      )}
    </MapContainer>
  );
}

export default MapView;