from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from utils.auth import create_token
from database import get_pool
from pydantic import BaseModel # <-- 1. Tambahkan ini di atas

router = APIRouter(prefix="/api/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- KODE LOGIN ANDA (Biarkan seperti ini) ---
@router.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow("SELECT * FROM users WHERE email = $1", form.username)
        if not user or not pwd_context.verify(form.password, user["password_hash"]):
            raise HTTPException(401, "Email atau password salah")
        
        token = create_token({"sub": user["email"]})
        return {"access_token": token, "token_type": "bearer"}

# --- 2. TAMBAHKAN KODE REGISTER DI BAWAH INI ---
class UserCreate(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(user_data: UserCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Cek apakah email sudah dipakai
        existing = await conn.fetchrow("SELECT * FROM users WHERE email = $1", user_data.email)
        if existing:
            raise HTTPException(400, "Email sudah terdaftar")
            
        # Biarkan Python yang membuatkan Hash secara otomatis dan akurat
        hashed_password = pwd_context.hash(user_data.password)
        
        # Simpan ke PostGIS
        await conn.execute(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
            user_data.email, hashed_password
        )
        return {"message": "Registrasi akun berhasil!"}