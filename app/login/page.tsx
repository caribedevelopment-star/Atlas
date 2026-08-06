
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
    <main className="flex min-h-dvh items-center justify-center overflow-x-hidden bg-stone-50 px-4 py-8 sm:px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-lg sm:p-8">

        <h1 className="mb-2 text-[clamp(2rem,10vw,3rem)] font-bold tracking-tight">
          ATLAS
        </h1>

        <p className="mb-6 text-sm leading-relaxed text-gray-500 sm:mb-8 sm:text-base">
          Places disappear. Stories remain.
        </p>

        <input
          className="mb-3 min-h-12 w-full rounded-2xl border p-3 text-base outline-none focus:border-stone-700 sm:mb-4"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          className="mb-5 min-h-12 w-full rounded-2xl border p-3 text-base outline-none focus:border-stone-700 sm:mb-6"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={signIn}
          disabled={loading}
          className="mb-3 min-h-12 w-full rounded-2xl bg-black p-3 text-sm font-semibold text-white transition active:scale-[0.99] disabled:opacity-60"
        >
          Iniciar sesión
        </button>

        <button
          onClick={signUp}
          disabled={loading}
          className="min-h-12 w-full rounded-2xl border p-3 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-60"
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