'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Laptop as LaptopIcon,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  ExternalLink,
  Search,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  Layers,
  HardDrive,
  Monitor,
  Tag,
  ImageIcon,
  RefreshCw,
} from 'lucide-react'

interface LaptopItem {
  id: string | number
  name: string
  brand?: string | null
  cpu?: string | null
  ram?: string | null
  storage?: string | null
  gpu?: string | null
  price?: number | null
  status?: string | null
  image_url?: string | null
  created_at?: string | null
}

const STATUS_OPTIONS = ['Tersedia', 'Like New', 'Terjual', 'Booking']
const BRAND_SUGGESTIONS = ['Asus', 'Lenovo', 'Acer', 'HP', 'Dell', 'Apple', 'MSI', 'Axioo', 'Toshiba']

function formatRupiah(amount?: number | null): string {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return 'Rp 0'
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function extractStoragePath(imageUrl?: string | null): string | null {
  if (!imageUrl) return null
  const match = imageUrl.match(/laptop-photos\/(.+)$/)
  if (match && match[1]) {
    return decodeURIComponent(match[1].split('?')[0])
  }
  return null
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // User state
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Data state
  const [laptops, setLaptops] = useState<LaptopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Notification state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLaptop, setEditingLaptop] = useState<LaptopItem | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form inputs
  const [formName, setFormName] = useState('')
  const [formBrand, setFormBrand] = useState('')
  const [formCpu, setFormCpu] = useState('')
  const [formRam, setFormRam] = useState('')
  const [formStorage, setFormStorage] = useState('')
  const [formGpu, setFormGpu] = useState('')
  const [formPrice, setFormPrice] = useState<string>('')
  const [formStatus, setFormStatus] = useState('Tersedia')
  const [formImageFile, setFormImageFile] = useState<File | null>(null)
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<LaptopItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch user & laptops
  const fetchLaptops = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('laptops')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }
      setLaptops((data as LaptopItem[]) || [])
    } catch (err: unknown) {
      console.error('Error fetching laptops:', err)
      setFeedback({
        type: 'error',
        message: 'Gagal mengambil data laptop: ' + (err instanceof Error ? err.message : 'Unknown error'),
      })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email ?? 'Admin')
      }
    }
    checkUser()
    fetchLaptops()
  }, [supabase, fetchLaptops])

  // Toast auto-hide
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // Logout handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error('Error during logout:', err)
    }
  }

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingLaptop(null)
    setFormName('')
    setFormBrand('')
    setFormCpu('')
    setFormRam('')
    setFormStorage('')
    setFormGpu('')
    setFormPrice('')
    setFormStatus('Tersedia')
    setFormImageFile(null)
    setFormImagePreview(null)
    setIsModalOpen(true)
  }

  // Open Edit Form
  const handleOpenEdit = (laptop: LaptopItem) => {
    setEditingLaptop(laptop)
    setFormName(laptop.name || '')
    setFormBrand(laptop.brand || '')
    setFormCpu(laptop.cpu || '')
    setFormRam(laptop.ram || '')
    setFormStorage(laptop.storage || '')
    setFormGpu(laptop.gpu || '')
    setFormPrice(laptop.price ? laptop.price.toString() : '')
    setFormStatus(laptop.status || 'Tersedia')
    setFormImageFile(null)
    setFormImagePreview(laptop.image_url || null)
    setIsModalOpen(true)
  }

  // Image change handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormImageFile(file)
      setFormImagePreview(URL.createObjectURL(file))
    }
  }

  // Upload image to Supabase Storage bucket 'laptop-photos'
  const uploadImageToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `${cleanFileName}`

    const { data, error } = await supabase.storage
      .from('laptop-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Gagal upload foto ke storage: ${error.message}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from('laptop-photos')
      .getPublicUrl(data.path)

    return publicUrlData.publicUrl
  }

  // Form Submit (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      setFeedback({ type: 'error', message: 'Nama laptop wajib diisi.' })
      return
    }

    const numericPrice = formPrice ? parseInt(formPrice.replace(/\D/g, ''), 10) : 0
    if (isNaN(numericPrice) || numericPrice < 0) {
      setFeedback({ type: 'error', message: 'Harga laptop tidak valid.' })
      return
    }

    setFormLoading(true)

    try {
      let finalImageUrl = editingLaptop?.image_url || null

      // If user uploaded a new photo file
      if (formImageFile) {
        finalImageUrl = await uploadImageToStorage(formImageFile)

        // If updating and had an old image in storage, remove it to save space
        if (editingLaptop?.image_url) {
          const oldPath = extractStoragePath(editingLaptop.image_url)
          if (oldPath) {
            await supabase.storage.from('laptop-photos').remove([oldPath])
          }
        }
      }

      const payload = {
        name: formName.trim(),
        brand: formBrand.trim() || null,
        cpu: formCpu.trim() || null,
        ram: formRam.trim() || null,
        storage: formStorage.trim() || null,
        gpu: formGpu.trim() || null,
        price: numericPrice,
        status: formStatus,
        image_url: finalImageUrl,
      }

      if (editingLaptop) {
        // UPDATE
        const { error } = await supabase
          .from('laptops')
          .update(payload)
          .eq('id', editingLaptop.id)

        if (error) throw error

        setFeedback({
          type: 'success',
          message: `Berhasil memperbarui "${formName.trim()}".`,
        })
      } else {
        // INSERT
        const { error } = await supabase
          .from('laptops')
          .insert([payload])

        if (error) throw error

        setFeedback({
          type: 'success',
          message: `Berhasil menambahkan "${formName.trim()}".`,
        })
      }

      setIsModalOpen(false)
      // Refresh list without full page reload
      await fetchLaptops()
    } catch (err: unknown) {
      console.error('Submit error:', err)
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data.',
      })
    } finally {
      setFormLoading(false)
    }
  }

  // Delete Laptop Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)

    try {
      // 1. Delete image from storage if exists
      if (deleteTarget.image_url) {
        const storagePath = extractStoragePath(deleteTarget.image_url)
        if (storagePath) {
          try {
            await supabase.storage.from('laptop-photos').remove([storagePath])
          } catch (storageErr) {
            console.warn('Could not delete storage image:', storageErr)
          }
        }
      }

      // 2. Delete row from laptops table
      const { error } = await supabase
        .from('laptops')
        .delete()
        .eq('id', deleteTarget.id)

      if (error) throw error

      setFeedback({
        type: 'success',
        message: `Laptop "${deleteTarget.name}" berhasil dihapus.`,
      })

      setDeleteTarget(null)
      await fetchLaptops()
    } catch (err: unknown) {
      console.error('Delete error:', err)
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal menghapus laptop.',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  // Filtered laptops based on search & status
  const filteredLaptops = laptops.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.cpu || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.gpu || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      filterStatus === 'ALL' ||
      (item.status || '').toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Quick Stats
  const totalCount = laptops.length
  const availableCount = laptops.filter((l) => (l.status || '').toLowerCase().includes('tersedia') || (l.status || '').toLowerCase().includes('like new')).length
  const soldCount = laptops.filter((l) => (l.status || '').toLowerCase().includes('terjual')).length

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-100 flex flex-col font-sans selection:bg-[#1E90FF]/30 selection:text-white">
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-30 w-full border-b border-[#1E2230] bg-[#0A0A0F]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1E90FF]/10 border border-[#1E90FF]/30 flex items-center justify-center text-[#1E90FF]">
              <LaptopIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-base sm:text-lg text-white">
                  Laptop Fix <span className="text-[#1E90FF]">Makassar</span>
                </span>
                <span className="rounded bg-[#1E90FF]/20 px-2 py-0.5 text-[10px] font-semibold text-[#1E90FF] uppercase tracking-wider border border-[#1E90FF]/30">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#12121A] text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              <span>Lihat Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* Toast Alert */}
        {feedback && (
          <div
            className={`flex items-center justify-between p-4 rounded-xl border text-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Row & Top Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#12121A] border border-[#1E2230] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Stok</p>
              <p className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-white">{totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#1E90FF]">
              <LaptopIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#12121A] border border-[#1E2230] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unit Tersedia / Ready</p>
              <p className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-emerald-400">{availableCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#12121A] border border-[#1E2230] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unit Terjual</p>
              <p className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-slate-400">{soldCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <Tag className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Control Bar: Search, Filter, Refresh, Add Button */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#12121A] border border-[#1E2230]">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari laptop berdasarkan nama, merk, prosesor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#0A0A0F] pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#1E90FF] focus:outline-none focus:ring-1 focus:ring-[#1E90FF] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-800 bg-[#0A0A0F] px-3 py-2 text-xs sm:text-sm text-slate-300 focus:border-[#1E90FF] focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Like New">Like New</option>
              <option value="Booking">Booking</option>
              <option value="Terjual">Terjual</option>
            </select>

            <button
              onClick={fetchLaptops}
              title="Refresh Data"
              className="p-2.5 rounded-xl border border-slate-800 bg-[#0A0A0F] text-slate-400 hover:text-white hover:border-slate-700 transition shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1E90FF]' : ''}`} />
            </button>
          </div>

          {/* Add New Laptop Button */}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E90FF] text-white text-xs sm:text-sm font-semibold hover:bg-[#187bcd] transition shadow-lg shadow-[#1E90FF]/20 shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Laptop Baru</span>
          </button>
        </div>

        {/* ==================== LAPTOPS TABLE / LIST ==================== */}
        <div className="rounded-2xl border border-[#1E2230] bg-[#12121A] overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E90FF]" />
              <p className="text-sm">Memuat daftar laptop...</p>
            </div>
          ) : filteredLaptops.length === 0 ? (
            <div className="py-20 text-center px-4">
              <LaptopIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="font-heading text-lg font-bold text-white mb-1">
                {searchQuery || filterStatus !== 'ALL'
                  ? 'Tidak ada laptop yang cocok dengan filter'
                  : 'Belum ada data laptop'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                {searchQuery || filterStatus !== 'ALL'
                  ? 'Coba ganti kata kunci pencarian atau ubah filter status.'
                  : 'Mulai isi katalog dengan menekan tombol "Tambah Laptop Baru" di atas.'}
              </p>
              {!searchQuery && filterStatus === 'ALL' && (
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E90FF] text-white text-xs font-semibold hover:bg-[#187bcd] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Laptop Pertama</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2230] bg-[#0E0E16] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Foto</th>
                    <th className="py-3.5 px-4">Nama Laptop &amp; Merk</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Spesifikasi</th>
                    <th className="py-3.5 px-4">Harga</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2230] text-xs text-slate-200">
                  {filteredLaptops.map((laptop) => {
                    const status = laptop.status || 'Tersedia'
                    const isSold = status.toLowerCase().includes('terjual')
                    const isBooking = status.toLowerCase().includes('booking')

                    return (
                      <tr
                        key={laptop.id}
                        className="hover:bg-[#161622] transition-colors group"
                      >
                        {/* Thumbnail */}
                        <td className="py-3 px-4 w-16">
                          <div className="w-14 h-11 rounded-lg bg-[#0A0A0F] border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                            {laptop.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={laptop.image_url}
                                alt={laptop.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                        </td>

                        {/* Name & Brand */}
                        <td className="py-3 px-4 min-w-[180px]">
                          <div className="font-heading font-bold text-sm text-white group-hover:text-[#1E90FF] transition-colors line-clamp-1">
                            {laptop.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {laptop.brand && (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-medium">
                                {laptop.brand}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Specs summary */}
                        <td className="py-3 px-4 hidden md:table-cell min-w-[220px]">
                          <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
                            {laptop.cpu && (
                              <span className="inline-flex items-center gap-1 bg-[#0A0A0F] px-2 py-0.5 rounded border border-slate-800/80">
                                <Cpu className="w-3 h-3 text-[#1E90FF]" />
                                <span className="truncate max-w-[120px]">{laptop.cpu}</span>
                              </span>
                            )}
                            {laptop.ram && (
                              <span className="inline-flex items-center gap-1 bg-[#0A0A0F] px-2 py-0.5 rounded border border-slate-800/80">
                                <Layers className="w-3 h-3 text-[#1E90FF]" />
                                <span>{laptop.ram}</span>
                              </span>
                            )}
                            {laptop.storage && (
                              <span className="inline-flex items-center gap-1 bg-[#0A0A0F] px-2 py-0.5 rounded border border-slate-800/80">
                                <HardDrive className="w-3 h-3 text-[#1E90FF]" />
                                <span>{laptop.storage}</span>
                              </span>
                            )}
                            {laptop.gpu && (
                              <span className="inline-flex items-center gap-1 bg-[#0A0A0F] px-2 py-0.5 rounded border border-slate-800/80">
                                <Monitor className="w-3 h-3 text-[#1E90FF]" />
                                <span className="truncate max-w-[100px]">{laptop.gpu}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-heading font-bold text-sm text-[#1E90FF]">
                            {formatRupiah(laptop.price)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isSold
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : isBooking
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(laptop)}
                              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-[#1E90FF] hover:bg-[#1E90FF]/20 transition"
                              title="Edit Data"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(laptop)}
                              className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition"
                              title="Hapus Laptop"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ==================== MODAL TAMBAH / EDIT LAPTOP ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-[#1E2230] bg-[#12121A] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E2230]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1E90FF]/10 border border-[#1E90FF]/30 flex items-center justify-center text-[#1E90FF]">
                  {editingLaptop ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h3 className="font-heading font-bold text-lg text-white">
                  {editingLaptop ? 'Edit Data Laptop' : 'Tambah Laptop Baru'}
                </h3>
              </div>
              <button
                onClick={() => !formLoading && setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-5 space-y-4">
              {/* Row 1: Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Nama Laptop / Judul Produk *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Lenovo ThinkPad T480 Core i5 Gen 8"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#0A0A0F] px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-[#1E90FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Merk / Brand
                  </label>
                  <input
                    type="text"
                    list="brand-suggestions"
                    placeholder="Contoh: Lenovo"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#0A0A0F] px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-[#1E90FF] focus:outline-none"
                  />
                  <datalist id="brand-suggestions">
                    {BRAND_SUGGESTIONS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Row 2: Price & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="10000"
                    placeholder="Contoh: 4500000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#0A0A0F] px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-[#1E90FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Status Unit
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#0A0A0F] px-3.5 py-2 text-sm text-white focus:border-[#1E90FF] focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: CPU & RAM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Processor (CPU)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Intel Core i5-8350U @ 1.70GHz"
                    value={formCpu}
                    onChange={(e) => setFormCpu(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#0A0A0F] px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-[#1E90FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    RAM
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 8GB DDR4 (Dual Channel)"
                    value={formRam}
                    onChange={(e) => setFormRam(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#0A0A0F] px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-[#1E90FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Storage & GPU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Storage / Penyimpanan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SSD 256GB NVMe Fast Boot"
                    value={formStorage}
                    onChange={(e) => setFormStorage(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#0A0A0F] px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-[#1E90FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Kartu Grafis (GPU / VGA)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Intel UHD Graphics 620"
                    value={formGpu}
                    onChange={(e) => setFormGpu(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#0A0A0F] px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-[#1E90FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Foto Laptop (Upload to bucket laptop-photos) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Foto Unit (Upload ke Supabase Storage &quot;laptop-photos&quot;)
                </label>
                <div className="mt-1 flex items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="relative w-24 h-20 rounded-xl bg-[#0A0A0F] border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    {formImagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formImagePreview}
                        alt="Preview Foto"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  {/* File Upload Trigger */}
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-[#1E90FF]" />
                      <span>{formImageFile ? 'Ganti Foto Terpilih' : 'Pilih Foto Laptop'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      {formImageFile
                        ? `File: ${formImageFile.name} (${Math.round(formImageFile.size / 1024)} KB)`
                        : editingLaptop?.image_url
                        ? 'Unit saat ini telah memiliki foto. Upload baru jika ingin mengganti.'
                        : 'Format JPG, PNG, atau WebP. Maks 5MB.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-[#1E2230] flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={formLoading}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E90FF] text-white text-xs sm:text-sm font-semibold hover:bg-[#187bcd] transition disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingLaptop ? 'Simpan Perubahan' : 'Tambah Laptop'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL KONFIRMASI HAPUS ==================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#12121A] p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-heading font-bold text-lg text-white mb-2">
              Hapus Data Laptop?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus unit <strong className="text-white font-semibold">{deleteTarget.name}</strong>? Foto unit di storage juga akan dihapus. Aksi ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2230]">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus Unit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
