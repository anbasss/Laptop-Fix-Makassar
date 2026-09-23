'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Laptop as LaptopIcon,
  Cpu,
  Layers,
  HardDrive,
  Monitor,
  MessageCircle,
  Tag,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface LaptopItem {
  id?: string | number
  name: string
  brand?: string | null
  cpu?: string | null
  ram?: string | null
  storage?: string | null
  gpu?: string | null
  price?: number | null
  original_price?: number | null
  bonus?: string | null
  status?: string | null
  image_url?: string | null
  image_urls?: string[] | null
  created_at?: string | null
}

const WA_NUMBER = '6282346662991'
const WA_DIRECT_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  'Halo Laptop Fix Makassar, saya ingin menanyakan stok unit laptop yang tersedia.'
)}`

function formatRupiah(amount?: number | null): string {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return 'Hubungi Admin'
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getDiscountPercentage(original?: number | null, promo?: number | null): number | null {
  if (!original || !promo || original <= promo || original <= 0) return null
  return Math.round(((original - promo) / original) * 100)
}

function getWhatsAppProductUrl(productName: string): string {
  const message = `Halo Laptop Fix Makassar, saya tertarik dengan unit *${productName}*. Apakah unit ini masih ready di toko?`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}

function getStatusBadge(status?: string | null) {
  const norm = (status || 'Tersedia').toLowerCase()
  if (norm.includes('terjual') || norm.includes('sold') || norm.includes('habis')) {
    return {
      label: 'Terjual (Sold Out)',
      className: 'bg-red-50 text-[#DC2626] border-red-200',
    }
  }
  if (norm.includes('booking') || norm.includes('booked') || norm.includes('dp')) {
    return {
      label: 'Booking / DP',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
    }
  }
  if (norm.includes('like new') || norm.includes('mulus')) {
    return {
      label: 'Like New 98%',
      className: 'bg-blue-50 text-[#1E40AF] border-blue-200',
    }
  }
  return {
    label: 'Ready Stock',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
}

interface LaptopCatalogSectionProps {
  laptops: LaptopItem[]
}

export default function LaptopCatalogSection({ laptops }: LaptopCatalogSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('latest') // 'latest' | 'price-asc' | 'price-desc'
  const [selectedLaptop, setSelectedLaptop] = useState<LaptopItem | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const getLaptopImages = (laptop: LaptopItem): string[] => {
    if (laptop.image_urls?.length) return laptop.image_urls
    return laptop.image_url ? [laptop.image_url] : []
  }

  useEffect(() => {
    if (!selectedLaptop) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedLaptop(null)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedLaptop])

  const openLaptopDetails = (laptop: LaptopItem) => {
    setSelectedImageIndex(0)
    setSelectedLaptop(laptop)
  }

  // Extract unique brands for filter tabs
  const brandList = useMemo(() => {
    const brandsSet = new Set<string>()
    laptops.forEach((item) => {
      if (item.brand && item.brand.trim()) {
        brandsSet.add(item.brand.trim())
      }
    })
    return Array.from(brandsSet).sort()
  }, [laptops])

  // Filter and Sort Laptops
  const filteredLaptops = useMemo(() => {
    return laptops
      .filter((laptop) => {
        const query = searchQuery.toLowerCase().trim()
        const matchesQuery =
          !query ||
          (laptop.name || '').toLowerCase().includes(query) ||
          (laptop.brand || '').toLowerCase().includes(query) ||
          (laptop.cpu || '').toLowerCase().includes(query) ||
          (laptop.ram || '').toLowerCase().includes(query) ||
          (laptop.storage || '').toLowerCase().includes(query) ||
          (laptop.gpu || '').toLowerCase().includes(query)

        const matchesBrand =
          selectedBrand === 'ALL' ||
          (laptop.brand || '').toLowerCase() === selectedBrand.toLowerCase()

        const statusNorm = (laptop.status || 'Tersedia').toLowerCase()
        let matchesStatus = true
        if (selectedStatus === 'READY') {
          matchesStatus = !statusNorm.includes('terjual')
        } else if (selectedStatus === 'SOLD') {
          matchesStatus = statusNorm.includes('terjual')
        } else if (selectedStatus === 'LIKE_NEW') {
          matchesStatus = statusNorm.includes('like new')
        }

        return matchesQuery && matchesBrand && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          return (a.price || 0) - (b.price || 0)
        }
        if (sortBy === 'price-desc') {
          return (b.price || 0) - (a.price || 0)
        }
        // Default latest (if created_at is available, or preserve natural order)
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        return 0
      })
  }, [laptops, searchQuery, selectedBrand, selectedStatus, sortBy])

  const hasActiveFilters = searchQuery !== '' || selectedBrand !== 'ALL' || selectedStatus !== 'ALL' || sortBy !== 'latest'

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedBrand('ALL')
    setSelectedStatus('ALL')
    setSortBy('latest')
  }

  return (
    <section id="katalog" className="py-16 sm:py-20 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-5 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Katalog Unit Toko</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
              PILIHAN LAPTOP READY STOCK
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Gunakan kotak pencarian atau filter merk untuk menemukan laptop impian Anda. Bebas cek unit sepuasnya di toko kami.
          </p>
        </div>

        {/* ==================== SEARCH & FILTER CONTROLS ==================== */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 mb-8 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input Bar */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik merk, tipe laptop, Core i5, SSD, dsb..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E40AF] focus:ring-1 focus:ring-[#1E40AF] focus:outline-none transition shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition"
                  title="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <div className="relative">
                <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 focus:border-[#1E40AF] focus:outline-none transition shadow-sm"
                >
                  <option value="ALL">Semua Status Unit</option>
                  <option value="READY">Ready Stock / Siap Pakai</option>
                  <option value="LIKE_NEW">Like New 98%</option>
                  <option value="SOLD">Terjual (Sold Out)</option>
                </select>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="md:col-span-3">
              <div className="relative">
                <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 focus:border-[#1E40AF] focus:outline-none transition shadow-sm"
                >
                  <option value="latest">Urutkan: Unit Terbaru</option>
                  <option value="price-asc">Harga: Termurah ke Tertinggi</option>
                  <option value="price-desc">Harga: Tertinggi ke Termurah</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Brand Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Merk:
            </span>
            <button
              type="button"
              onClick={() => setSelectedBrand('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                selectedBrand === 'ALL'
                  ? 'bg-[#1E40AF] text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Merk ({laptops.length})
            </button>
            {brandList.map((brand) => {
              const count = laptops.filter(
                (l) => (l.brand || '').toLowerCase() === brand.toLowerCase()
              ).length
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                    selectedBrand.toLowerCase() === brand.toLowerCase()
                      ? 'bg-[#1E40AF] text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {brand} ({count})
                </button>
              )
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition sm:ml-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Summary */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500 font-semibold">
          <span>
            Menampilkan <strong className="text-slate-900">{filteredLaptops.length}</strong> unit laptop
            {hasActiveFilters && ` (dari total ${laptops.length} unit)`}
          </span>
          {searchQuery && (
            <span className="text-[#1E40AF]">
              Hasil pencarian untuk &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </span>
          )}
        </div>

        {/* Empty States */}
        {laptops.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 text-[#1E40AF] shadow-sm">
              <LaptopIcon className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
              Katalog Sedang Diperbarui
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Unit baru sedang dalam proses pengecekan kualitas (QC). Silakan langsung hubungi admin untuk menanyakan ketersediaan stok laptop terbaru hari ini.
            </p>
            <a
              href={WA_DIRECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-xs sm:text-sm font-bold transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Tanya Stok via WhatsApp</span>
            </a>
          </div>
        ) : filteredLaptops.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900 mb-1">
              Laptop Tidak Ditemukan
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Tidak ada unit yang sesuai dengan kata kunci &ldquo;{searchQuery}&rdquo; atau filter yang dipilih.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-xs font-bold transition shadow-sm"
              >
                Tampilkan Semua Laptop
              </button>
              <a
                href={WA_DIRECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>Request Unit via WA</span>
              </a>
            </div>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLaptops.map((laptop, idx) => {
              const statusInfo = getStatusBadge(laptop.status)
              const waUrl = getWhatsAppProductUrl(laptop.name)

              return (
                <div
                  key={laptop.id || idx}
                  className="group rounded-2xl bg-white border border-slate-200 hover:border-[#1E40AF]/50 transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-lg"
                >
                  {/* Thumbnail Image Container */}
                  <div className="relative aspect-[16/10] w-full bg-slate-100 border-b border-slate-200 overflow-hidden flex items-center justify-center">
                    {getLaptopImages(laptop)[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getLaptopImages(laptop)[0]}
                        alt={laptop.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4">
                        <LaptopIcon className="w-10 h-10 stroke-[1.25]" />
                        <span className="text-[11px] text-slate-500 font-medium">Foto Belum Tersedia</span>
                      </div>
                    )}

                    {/* Top-Left Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border shadow-sm ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Brand Tag Top-Right */}
                    {laptop.brand && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-sm shadow-sm">
                          {laptop.brand}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-[#1E40AF] transition-colors line-clamp-2 leading-snug">
                        {laptop.name}
                      </h3>

                      {/* Hardware Specs Pills */}
                      <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                        {/* CPU */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                          <Cpu className="w-3.5 h-3.5 text-[#1E40AF] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                              CPU
                            </span>
                            <span className="text-slate-800 truncate block font-medium">
                              {laptop.cpu || 'Standar'}
                            </span>
                          </div>
                        </div>

                        {/* RAM */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                          <Layers className="w-3.5 h-3.5 text-[#1E40AF] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                              RAM
                            </span>
                            <span className="text-slate-800 truncate block font-medium">
                              {laptop.ram || '-'}
                            </span>
                          </div>
                        </div>

                        {/* Storage */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                          <HardDrive className="w-3.5 h-3.5 text-[#1E40AF] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                              Storage
                            </span>
                            <span className="text-slate-800 truncate block font-medium">
                              {laptop.storage || '-'}
                            </span>
                          </div>
                        </div>

                        {/* GPU */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                          <Monitor className="w-3.5 h-3.5 text-[#1E40AF] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                              GPU
                            </span>
                            <span className="text-slate-800 truncate block font-medium">
                              {laptop.gpu || 'Integrated'}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Price & Action Button */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Harga Promo:
                          </span>
                          {getDiscountPercentage(laptop.original_price, laptop.price) && (
                            <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-[#DC2626]">
                              Hemat {getDiscountPercentage(laptop.original_price, laptop.price)}%
                            </span>
                          )}
                        </div>
                        {laptop.original_price && laptop.original_price > (laptop.price || 0) && (
                          <div className="text-xs text-slate-400 line-through">
                            Harga asli: {formatRupiah(laptop.original_price)}
                          </div>
                        )}
                        <div className="font-heading font-black text-xl text-[#DC2626]">
                          {formatRupiah(laptop.price)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openLaptopDetails(laptop)}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#1E40AF] bg-white hover:bg-blue-50 text-[#1E40AF] text-xs font-bold tracking-wide transition shadow-sm active:scale-95"
                        >
                          <LaptopIcon className="w-4 h-4" />
                          <span>Lihat Detail</span>
                        </button>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-xs font-bold tracking-wide transition shadow-sm active:scale-95 group-hover:bg-[#DC2626]"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Tanya via WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedLaptop && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedLaptop(null)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="laptop-detail-title"
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedLaptop(null)}
              aria-label="Tutup detail laptop"
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-[16/10] min-h-56 bg-slate-100 md:aspect-auto">
                {getLaptopImages(selectedLaptop)[selectedImageIndex] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getLaptopImages(selectedLaptop)[selectedImageIndex]}
                    alt={selectedLaptop.name}
                    className="h-full min-h-56 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-56 flex-col items-center justify-center gap-2 text-slate-400">
                    <LaptopIcon className="h-16 w-16 stroke-[1.25]" />
                    <span className="text-xs font-medium">Foto Belum Tersedia</span>
                  </div>
                )}
                {getLaptopImages(selectedLaptop).length > 1 && (
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex((index) => (index - 1 + getLaptopImages(selectedLaptop).length) % getLaptopImages(selectedLaptop).length)}
                      className="h-8 w-8 rounded-full bg-white/90 text-slate-700 shadow transition hover:bg-white"
                      aria-label="Foto sebelumnya"
                    >
                      ‹
                    </button>
                    <span className="rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-bold text-white">
                      {selectedImageIndex + 1} / {getLaptopImages(selectedLaptop).length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex((index) => (index + 1) % getLaptopImages(selectedLaptop).length)}
                      className="h-8 w-8 rounded-full bg-white/90 text-slate-700 shadow transition hover:bg-white"
                      aria-label="Foto berikutnya"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-7">
                <div className="mb-4 flex flex-wrap items-center gap-2 pr-8">
                  <span className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-bold ${getStatusBadge(selectedLaptop.status).className}`}>
                    {getStatusBadge(selectedLaptop.status).label}
                  </span>
                  {selectedLaptop.brand && (
                    <span className="rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-bold uppercase text-white">
                      {selectedLaptop.brand}
                    </span>
                  )}
                </div>

                <h2 id="laptop-detail-title" className="font-heading text-xl font-black leading-tight text-slate-900 sm:text-2xl">
                  {selectedLaptop.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Laptop pilihan Laptop Fix Makassar yang telah melalui pengecekan kualitas sebelum ditawarkan kepada pelanggan.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {([
                    { label: 'CPU', value: selectedLaptop.cpu || 'Standar', icon: Cpu },
                    { label: 'RAM', value: selectedLaptop.ram || '-', icon: Layers },
                    { label: 'Storage', value: selectedLaptop.storage || '-', icon: HardDrive },
                    { label: 'GPU', value: selectedLaptop.gpu || 'Integrated', icon: Monitor },
                  ] as Array<{ label: string; value: string; icon: LucideIcon }>).map(({ label, value, icon: SpecIcon }) => {
                    return (
                      <div key={label} className="flex min-w-0 items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                        <SpecIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#1E40AF]" />
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
                          <span className="block truncate text-xs font-semibold text-slate-800">{value}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <span className="block text-xs font-medium text-slate-500">Harga</span>
                  <span className="font-heading text-2xl font-black text-[#DC2626]">{formatRupiah(selectedLaptop.price)}</span>
                  {selectedLaptop.original_price && selectedLaptop.original_price > (selectedLaptop.price || 0) && (
                    <span className="ml-2 text-xs text-slate-400 line-through">{formatRupiah(selectedLaptop.original_price)}</span>
                  )}
                  {selectedLaptop.bonus && (
                    <p className="mt-2 text-xs font-semibold text-emerald-700">Bonus: {selectedLaptop.bonus}</p>
                  )}
                </div>

                <a
                  href={getWhatsAppProductUrl(selectedLaptop.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E40AF] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1E3A8A]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Tanya Unit via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
