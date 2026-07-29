
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function signUp() {
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Cuenta creada. Revisa tu correo.')
    }
  }

  async function signIn() {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Bienvenido a Atlas.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-3xl font-bold">
          ATLAS
        </h1>

        <p className="mb-8 text-gray-500">
          Places disappear. Stories remain.
        </p>

        <input
          className="mb-4 w-full rounded-lg border p-3"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          className="mb-6 w-full rounded-lg border p-3"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={signIn}
          disabled={loading}
          className="mb-3 w-full rounded-lg bg-black p-3 text-white"
        >
          Iniciar sesión
        </button>

        <button
          onClick={signUp}
          disabled={loading}
          className="w-full rounded-lg border p-3"
        >
          Crear cuenta
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          {message}
        </p>

      </div>
    </main>
  )
}