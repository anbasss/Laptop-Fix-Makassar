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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#1E40AF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Website Utama</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        {/* Header Logo & Title */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E40AF] text-white shadow-md">
            <LaptopIcon className="h-6 w-6" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="font-heading text-2xl font-black text-slate-900 tracking-tight uppercase">
              Admin Login
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
          </div>
          <p className="text-xs text-slate-500">
            Panel Manajemen <span className="text-[#1E40AF] font-bold">Laptop Fix Makassar</span>
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Email Admin
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
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
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#1E40AF] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1E40AF]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
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
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-[#1E40AF] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1E40AF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E40AF] py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-[#1E3A8A] active:scale-[0.98] transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard</span>
            )}
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <p className="mt-6 text-center text-xs text-slate-500">
        Khusus staf &amp; teknisi resmi Laptop Fix Makassar.
      </p>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 text-slate-900 font-sans selection:bg-[#1E40AF]/15 selection:text-[#1E40AF]">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#1E40AF]" />
            <span>Memuat form login...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
