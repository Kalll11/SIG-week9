from utils.auth import get_current_user
from fastapi import APIRouter, HTTPException, Depends # <-- Menambahkan Depends di sini
from database import get_pool
import json
from models import FasilitasCreate, FasilitasUpdate

router = APIRouter(
    prefix="/api/fasilitas",
    tags=["Fasilitas"]
)

# 1. GET All Fasilitas (Bisa diakses tanpa login)
@router.get("/")
async def get_all_fasilitas():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT id, nama, jenis, ST_AsGeoJSON(geom) as geom
            FROM fasilitas LIMIT 100
        """)
        return [dict(row) for row in rows]

# 2. GET by ID (Bisa diakses tanpa login)
@router.get("/{id}")
async def get_fasilitas_by_id(id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT id, nama, jenis, alamat,
            ST_X(geom) as longitude, ST_Y(geom) as latitude
            FROM fasilitas WHERE id=$1
        """, id)
        if not row:
            raise HTTPException(status_code=404, detail="Fasilitas tidak ditemukan")
        return dict(row)

# 3. GET GeoJSON Format (Bisa diakses tanpa login untuk map)
@router.get("/geojson/data")
async def get_fasilitas_geojson():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, nama, jenis, alamat, ST_AsGeoJSON(geom) as geom FROM fasilitas")
        features = []
        for row in rows:
            features.append({
                "type": "Feature",
                "geometry": json.loads(row["geom"]),
                "properties": {
                    "id": row["id"],
                    "nama": row["nama"],
                    "jenis": row["jenis"],
                    "alamat": row["alamat"] 
                }
            })
        return {"type": "FeatureCollection", "features": features}

# 4. GET Nearby (Query Spasial Radius)
@router.get("/search/nearby")
async def get_nearby(lat: float, lon: float, radius: int = 1000):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT id, nama, jenis,
            ROUND(ST_Distance(geom::geography, ST_Point($1,$2)::geography)::numeric) as jarak_m
            FROM fasilitas
            WHERE ST_DWithin(geom::geography, ST_Point($1,$2)::geography, $3)
            ORDER BY jarak_m
        """, lon, lat, radius)
        return [dict(row) for row in rows]

# 5. POST Tambah Fasilitas Baru (WAJIB LOGIN)
@router.post("/", status_code=201)
async def create_fasilitas(data: FasilitasCreate, user: str = Depends(get_current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            INSERT INTO fasilitas (nama, jenis, alamat, geom)
            VALUES ($1, $2, $3, ST_SetSRID(ST_Point($4,$5), 4326))
            RETURNING id, nama, jenis, alamat,
            ST_X(geom) as longitude, ST_Y(geom) as latitude
        """, data.nama, data.jenis, data.alamat, data.longitude, data.latitude)
        return dict(row)

# 6. PUT Edit Fasilitas (BARU - WAJIB LOGIN)
@router.put("/{id}")
async def update_fasilitas(id: int, data: FasilitasUpdate, user: str = Depends(get_current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            UPDATE fasilitas SET
            nama = COALESCE($2, nama), jenis = COALESCE($3, jenis), alamat = COALESCE($4, alamat)
            WHERE id = $1 RETURNING id, nama, jenis
        """, id, data.nama, data.jenis, data.alamat)
        if not row:
            raise HTTPException(status_code=404, detail="Data tidak ditemukan")
        return dict(row)

# 7. DELETE Hapus Fasilitas (BARU - WAJIB LOGIN)
@router.delete("/{id}", status_code=204)
async def delete_fasilitas(id: int, user: str = Depends(get_current_user)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM fasilitas WHERE id=$1", id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Data tidak ditemukan")