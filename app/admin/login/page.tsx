'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Laptop as LaptopIcon,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        if (
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid_credentials')
        ) {
          setErrorMsg('Email atau password salah. Silakan periksa kembali.')
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMsg('Email belum dikonfirmasi.')
        } else {
          setErrorMsg(error.message || 'Gagal masuk. Silakan coba lagi.')
        }
        setLoading(false)
        return
      }

      // Berhasil login
      router.push(redirectTo)
      router.refresh()
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat proses login.'
      )
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Back to Home Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-[#1E90FF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Website Utama</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl border border-[#1E2230] bg-[#12121A] p-8 shadow-2xl">
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#1E90FF]/30 bg-[#1E90FF]/10 text-[#1E90FF]">
            <LaptopIcon className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
            Admin Login
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Panel Manajemen <span className="text-[#1E90FF] font-medium">Laptop Fix Makassar</span>
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Email Admin
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@laptopfixmakassar.com"
                className="w-full rounded-xl border border-slate-800 bg-[#0A0A0F] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 transition focus:border-[#1E90FF] focus:outline-none focus:ring-1 focus:ring-[#1E90FF]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-[#0A0A0F] pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 transition focus:border-[#1E90FF] focus:outline-none focus:ring-1 focus:ring-[#1E90FF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E90FF] py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-[#1E90FF]/20 hover:bg-[#187bcd] active:scale-[0.98] transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <p className="mt-6 text-center text-[11px] text-slate-600">
        Khusus staf &amp; teknisi resmi Laptop Fix Makassar.
      </p>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F] px-4 py-12 text-slate-100 font-sans selection:bg-[#1E90FF]/30 selection:text-white">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#1E90FF]" />
            <span>Memuat form login...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
