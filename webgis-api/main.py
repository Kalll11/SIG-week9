from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import get_pool, close_pool
from routers import fasilitas, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_pool()
    print("Database connected")
    yield
    await close_pool()
    print("Database disconnected")

app = FastAPI(title="WebGIS API", version="1.0.0", lifespan=lifespan)

# Tambahkan blok CORS ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Mengizinkan semua origin (untuk development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(fasilitas.router)