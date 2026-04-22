import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../config/api';

// Komponen Pendeteksi Klik Peta untuk "Tambah Data"
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
}

function MapView() {
  const [geojsonData, setGeojsonData] = useState(null);
  
  // State untuk mengontrol Form Modal
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState(''); // 'add' atau 'edit'
  const [formData, setFormData] = useState({ id: null, nama: '', jenis: 'Kesehatan', alamat: '', lat: '', lng: '' });

  // Fungsi untuk memuat data dari database
  const loadData = async () => {
    try {
      const res = await api.get('/fasilitas/geojson/data');
      setGeojsonData(res.data);
    } catch (error) {
      console.error("Gagal memuat data", error);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Trigger saat area kosong di peta diklik
  const handleMapClick = (latlng) => {
    setFormData({ id: null, nama: '', jenis: 'Kesehatan', alamat: '', lat: latlng.lat, lng: latlng.lng });
    setFormMode('add');
    setShowForm(true);
  };

  // Styling Marker (Silakan sesuaikan jenis warnanya jika berbeda)
  const getStyle = (feature) => {
    const colors = { 
      "Rumah Sakit": "#FF0000", // Merah
      "Puskesmas": "#FF6600",   // Oranye
      "Sekolah": "#0000FF",     // Biru
      "Masjid": "#00FF00",      // Hijau
      "Pasar": "#8E44AD"        // Ungu
    };
    return { color: colors[feature.properties.jenis] || "#666666", weight: 2, fillOpacity: 0.8 };
  };

  const pointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, { radius: 8, fillColor: getStyle(feature).color, weight: 1, fillOpacity: 0.8 });
  };

  // Interaksi Tiap Marker (Popup, Edit, Hapus)
  const onEachFeature = (feature, layer) => {
    const { id, nama, jenis, alamat } = feature.properties;
    
    // HTML untuk Popup
    const popupContent = `
      <div style="font-family: sans-serif;">
        <h3 style="margin: 0 0 5px 0;">${nama}</h3>
        <p style="margin: 0 0 5px 0;"><b>Jenis:</b> ${jenis}</p>
        <p style="margin: 0 0 10px 0;"><b>Alamat:</b> ${alamat || '-'}</p>
        <button id="btn-edit-${id}" style="color:white; background:#f39c12; padding:5px 10px; border:none; cursor:pointer; margin-right:5px; border-radius:3px;">Edit</button>
        <button id="btn-hapus-${id}" style="color:white; background:#e74c3c; padding:5px 10px; border:none; cursor:pointer; border-radius:3px;">Hapus</button>
      </div>
    `;
    layer.bindPopup(popupContent);

    // Mendaftarkan event listener pada tombol di dalam popup
    layer.on('popupopen', () => {
      const btnEdit = document.getElementById(`btn-edit-${id}`);
      const btnHapus = document.getElementById(`btn-hapus-${id}`);

      if (btnEdit) {
        btnEdit.onclick = () => {
          setFormData({ id, nama, jenis, alamat: alamat || '', lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] });
          setFormMode('edit');
          setShowForm(true);
          layer.closePopup(); // Tutup popup saat form edit terbuka
        };
      }

      if (btnHapus) {
        btnHapus.onclick = async () => {
          if (window.confirm(`Yakin ingin menghapus ${nama}?`)) {
            try {
              await api.delete(`/fasilitas/${id}`);
              alert('Fasilitas berhasil dihapus!');
              loadData(); // Refresh peta otomatis
            } catch (err) {
              alert('Gagal menghapus data.');
            }
          }
        };
      }
    });
  };

  // Fungsi saat tombol Simpan di Form ditekan
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'add') {
        await api.post('/fasilitas', {
          nama: formData.nama,
          jenis: formData.jenis,
          alamat: formData.alamat,
          latitude: parseFloat(formData.lat),
          longitude: parseFloat(formData.lng)
        });
      } else if (formMode === 'edit') {
        await api.put(`/fasilitas/${formData.id}`, {
          nama: formData.nama,
          jenis: formData.jenis,
          alamat: formData.alamat
        });
      }
      setShowForm(false);
      loadData(); // Refresh peta otomatis
      alert('Data berhasil disimpan!');
    } catch (error) {
      alert('Gagal menyimpan data! Pastikan Anda sudah login.');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* MAP LAYER */}
      <MapContainer center={[-5.362, 105.31]} zoom={13} style={{ height: '100vh', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {geojsonData && (
          <GeoJSON 
            key={JSON.stringify(geojsonData)} // Kunci untuk merender ulang layer saat data berubah
            data={geojsonData} 
            style={getStyle} 
            pointToLayer={pointToLayer} 
            onEachFeature={onEachFeature} 
          />
        )}
      </MapContainer>

      {/* FORM OVERLAY (MODAL) */}
      {showForm && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          zIndex: 1000, width: '300px'
        }}>
          <h3>{formMode === 'add' ? 'Tambah Fasilitas Baru' : 'Edit Fasilitas'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Nama Fasilitas" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
            
            <select value={formData.jenis} onChange={e => setFormData({...formData, jenis: e.target.value})}>
              <option value="Rumah Sakit">Rumah Sakit</option>
              <option value="Puskesmas">Puskesmas</option>
              <option value="Sekolah">Sekolah</option>
              <option value="Masjid">Masjid</option>
              <option value="Pasar">Pasar</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            
            <input type="text" placeholder="Alamat (Opsional)" value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px', cursor: 'pointer' }}>Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '8px', cursor: 'pointer' }}>Batal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default MapView;