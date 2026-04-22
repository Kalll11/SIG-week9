import { createContext, useState, useContext } from 'react'
import api from '../config/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(localStorage.getItem('token') ? true : false)

    const login = async (email, password) => {
        const form = new URLSearchParams()
        form.append('username', email)
        form.append('password', password)
        const res = await api.post('/auth/login', form, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        localStorage.setItem('token', res.data.access_token)
        setUser(true)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(false)
        window.location.reload()
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => useContext(AuthContext)