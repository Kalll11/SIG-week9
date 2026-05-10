import cv2
import json
import rasterio
from ultralytics import YOLO

# 1. Load Model YOLOv8 (Otomatis akan mendownload model pretrained jika belum ada)
model = YOLO('yolov8n.pt') # Menggunakan versi nano agar cepat [cite: 2758]

def detect_and_georef(image_path, tile_size=640):
    # Baca citra menggunakan Rasterio untuk mengambil georeferensi [cite: 2915-2917]
    with rasterio.open(image_path) as src:
        transform = src.transform
        
        # Baca citra dengan OpenCV untuk diproses AI [cite: 2853-2854]
        img = cv2.imread(image_path)
        h, w = img.shape[:2]
        
        geo_detections = []
        
        print(f"Mulai memproses citra ukuran {w}x{h}...")
        
        # 2. Implementasi Tiling (Memotong citra besar) [cite: 2856-2859]
        for y in range(0, h, tile_size):
            for x in range(0, w, tile_size):
                tile = img[y:y+tile_size, x:x+tile_size]
                
                if tile.shape[0] < 100 or tile.shape[1] < 100:
                    continue
                
                # 3. Inference / Deteksi Objek dengan YOLO [cite: 2864]
                results = model(tile, verbose=False)
                
                # 4. Hitung Koordinat Pixel ke Geografis [cite: 2866-2871, 2919-2925]
                for box in results[0].boxes:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    
                    # Titik tengah objek (center)
                    cx = ((x1 + x2) / 2) + x
                    cy = ((y1 + y2) / 2) + y
                    
                    # Konversi ke Lintang Bujur
                    lon, lat = transform * (cx, cy)
                    
                    geo_detections.append({
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [lon, lat]
                        },
                        'properties': {
                            'class_id': cls,
                            'class_name': model.names[cls],
                            'confidence': round(conf, 3)
                        }
                    })
        return geo_detections

def export_to_geojson(geo_detections, output_path):
    # 5. Export hasil ke format GeoJSON [cite: 2966-2983]
    geojson = {
        'type': 'FeatureCollection',
        'features': []
    }
    
    for det in geo_detections:
        feature = {
            'type': 'Feature',
            'geometry': det['geometry'],
            'properties': det['properties']
        }
        geojson['features'].append(feature)
        
    with open(output_path, 'w') as f:
        json.dump(geojson, f, indent=2)
    print(f"Selesai! {len(geo_detections)} objek berhasil diekspor ke {output_path}")

# Eksekusi Pipeline
if __name__ == "__main__":
    file_citra = "citra_satelit.tiff" 
    hasil_deteksi = detect_and_georef(file_citra)
    export_to_geojson(hasil_deteksi, "detections.geojson")