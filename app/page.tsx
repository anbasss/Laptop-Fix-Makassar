import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  Laptop as LaptopIcon,
  Cpu,
  Layers,
  HardDrive,
  Monitor,
  MessageCircle,
  MapPin,
  Clock,
  Instagram,
  ShieldCheck,
  CheckCircle2,
  Phone,
  RefreshCw,
  Wrench,
  Tag,
  ArrowRight,
  ExternalLink,
  Store,
  Sparkles,
  Check,
  Percent,
} from 'lucide-react'
import LaptopCatalogSection from '@/components/LaptopCatalogSection'

// Selalu ambil data terbaru dari Supabase agar perubahan di admin langsung terlihat di landing page.
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface LaptopItem {
  id?: string | number
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

const WA_NUMBER = '6282346662991'
const WA_DIRECT_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  'Halo Laptop Fix Makassar, saya ingin konsultasi mengenai stok laptop / servis / tukar tambah.'
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

export default async function HomePage() {
  const supabase = createClient()
  let laptops: LaptopItem[] = []

  try {
    const { data, error } = await supabase
      .from('laptops')
      .select('name, brand, cpu, ram, storage, gpu, price, status, image_url, created_at')
      .order('created_at', { ascending: false })

    if (!error && data) {
      laptops = data as LaptopItem[]
    }
  } catch (err) {
    console.error('Error loading laptops:', err)
  }

  // Cari unit featured untuk ditampilkan di hero jika ada
  const featuredLaptop = laptops.find(
    (l) => !(l.status || '').toLowerCase().includes('terjual')
  ) || laptops[0]

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#1E40AF]/15 selection:text-[#1E40AF]">
      {/* ==================== TOP ANNOUNCEMENT BAR ==================== */}
      <div className="bg-[#1E40AF] text-white text-[10px] sm:text-xs py-2 overflow-hidden">
        <div className="announcement-track flex items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-2 px-8 whitespace-nowrap" aria-hidden={copy === 1}>
              <span className="inline-block w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
              <span>Toko Buka Setiap Hari (09.00 - 21.00 WITA) • Jl. Sultan Alauddin No. 137E, Makassar</span>
              <span className="text-blue-200">|</span>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-100">
                Chat Langsung WA: 0823-4666-2991
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== NAVBAR ==================== */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-20 sm:h-24 py-2 sm:py-0 flex items-center justify-between gap-2">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-28 h-14 sm:w-52 sm:h-20 shrink-0 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Logo Laptop Fix Makassar"
                fill
                sizes="(max-width: 640px) 112px, 208px"
                className="object-contain sm:scale-150"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-heading font-black text-xl tracking-tight text-slate-900">
                  Laptop Fix <span className="text-[#1E40AF]">Makassar</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              </div>
              <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                JUAL BELI &amp; SERVIS LAPTOP
              </span>
            </div>
          </Link>

          {/* Nav Links & Contact CTA */}
          <div className="flex items-center gap-2 sm:gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <a href="#katalog" className="hover:text-[#1E40AF] transition-colors">
                Katalog Laptop
              </a>
              <a href="#layanan" className="hover:text-[#1E40AF] transition-colors">
                Layanan &amp; Servis
              </a>
              <a href="#lokasi" className="hover:text-[#1E40AF] transition-colors">
                Lokasi Toko
              </a>
            </nav>

            <a
              href={WA_DIRECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-2.5 sm:px-5 py-2.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span className="hidden sm:inline">Hubungi WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* ==================== HERO SECTION (CLEAN LIGHT E-COMMERCE THEME) ==================== */}
      <section className="relative pt-10 pb-14 sm:pt-14 sm:pb-20 bg-gradient-to-b from-white via-slate-50 to-[#F1F5F9] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Trust Copy, CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Location / Status Pill */}
              <div className="inline-flex max-w-full items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] sm:text-xs font-semibold text-[#1E40AF] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                <span className="truncate">TOKO FISIK: JL. SULTAN ALAUDDIN NO. 137E, MAKASSAR</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-[50px] text-slate-900 tracking-tight leading-[1.12] uppercase">
                JUAL BELI, TUKAR TAMBAH &amp; SERVIS LAPTOP <span className="text-[#1E40AF]">BERKUALITAS DI MAKASSAR</span>
              </h1>

              {/* Subtext */}
              <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed">
                Pusat laptop second bergaransi resmi toko Makassar. Setiap unit lolos uji QC hardware 100%, 
                fisik mulus, dan bebas dites sepuasnya langsung di toko kami sebelum beli.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#katalog"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-bold text-sm tracking-wide transition shadow-md hover:shadow-lg active:scale-95"
                >
                  <span>LIHAT STOK TERSEDIA</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={WA_DIRECT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition shadow-sm active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-[#DC2626]" />
                  <span>KONSULTASI &amp; TUKAR TAMBAH</span>
                </a>
              </div>

              {/* Real World Trust Factors */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-semibold text-slate-700 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Lolos QC Hardware</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1E40AF] shrink-0" />
                  <span>Garansi Resmi Toko</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>Bisa Cek Langsung di Toko</span>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Product Showcase Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden group hover:border-[#1E40AF]/40 transition-all duration-300">
                
                {/* Showcase Header Bar */}
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-700" />
                      TERVERIFIKASI QC TOKO
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#DC2626] flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    BEST DEAL HARI INI
                  </span>
                </div>

                {/* Laptop Image Frame */}
                <div className="relative aspect-[16/10] bg-gradient-to-b from-slate-100 to-slate-200 border-b border-slate-200 flex items-center justify-center p-6 overflow-hidden">
                  {featuredLaptop?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featuredLaptop.image_url}
                      alt={featuredLaptop.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <LaptopIcon className="w-20 h-20 stroke-[1.25] text-slate-400" />
                      <span className="text-xs font-semibold text-slate-500 mt-2">Display Unit Showroom</span>
                    </div>
                  )}

                  {/* Floating Grade Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-800">
                    Grade A • Mulus 98%
                  </div>

                  {/* Brand Tag */}
                  <div className="absolute top-3 right-3 bg-[#1E40AF] text-white px-2.5 py-0.5 rounded text-[11px] font-bold uppercase shadow-sm">
                    {featuredLaptop?.brand || 'Lenovo'}
                  </div>
                </div>

                {/* Product Info & Specs */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-heading font-black text-lg text-slate-900 leading-snug group-hover:text-[#1E40AF] transition-colors">
                      {featuredLaptop?.name || 'Lenovo ThinkPad T14 Gen 2 - Intel Core i5'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Cocok untuk Office, Coding, Desain Grafis, dan Kuliah
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
                      <span className="font-medium text-slate-800 truncate">
                        {featuredLaptop?.cpu || 'Core i5 11th Gen'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
                      <span className="font-medium text-slate-800 truncate">
                        {featuredLaptop?.ram || '16GB DDR4'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
                      <span className="font-medium text-slate-800 truncate">
                        {featuredLaptop?.storage || '512GB SSD NVMe'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <Monitor className="w-3.5 h-3.5 text-[#1E40AF] shrink-0" />
                      <span className="font-medium text-slate-800 truncate">
                        {featuredLaptop?.gpu || 'Intel Iris Xe'}
                      </span>
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] text-slate-500 block font-medium">Harga Promo:</span>
                      <div className="font-heading font-black text-2xl text-[#DC2626]">
                        {formatRupiah(featuredLaptop?.price || 5750000)}
                      </div>
                    </div>

                    <a
                      href={getWhatsAppProductUrl(featuredLaptop?.name || 'ThinkPad T14 Gen 2')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm transition shadow-sm active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Cek Detail Unit</span>
                    </a>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== 3 CORE SERVICES ==================== */}
      <section id="layanan" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#1E40AF] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#1E40AF]" />
            <span>Solusi Lengkap Kebutuhan Laptop Anda</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-slate-900 tracking-tight">
            LAYANAN UTAMA KAMI
          </h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Didukung teknisi berpengalaman dan stok laptop bergaransi untuk menunjang produktivitas Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Jual Beli */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#1E40AF]/40 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1E40AF] mb-5 font-bold">
                <LaptopIcon className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                Jual Beli Laptop Berkualitas
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stok laptop second mulus siap pakai dari berbagai merk: Lenovo ThinkPad, ASUS ROG/TUF, Dell, HP, hingga MacBook dengan garansi toko terpercaya.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 text-xs font-bold text-[#1E40AF] flex items-center gap-1.5">
              <span>Unit Siap Kerja &amp; Lolos QC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Tukar Tambah */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#1E40AF]/40 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#DC2626] mb-5 font-bold">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                Tukar Tambah Unit Lama
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ingin upgrade spek ke laptop yang lebih kencang? Bawa unit lama Anda ke toko kami untuk ditaksir dengan harga jujur, transparan, dan bersahabat.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 text-xs font-bold text-[#DC2626] flex items-center gap-1.5">
              <span>Taksiran Cepat &amp; Fair</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Servis Spesialis */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#1E40AF]/40 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1E40AF] mb-5 font-bold">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                Servis &amp; Upgrade Spesialis
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Perbaikan motherboard mati total, ganti LCD, keyboard, engsel patah, instalasi software, pembersihan kipas, dan upgrade RAM serta SSD super cepat.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 text-xs font-bold text-[#1E40AF] flex items-center gap-1.5">
              <span>Pengerjaan Rapi &amp; Bergaransi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRODUCT CATALOG SECTION ==================== */}
      <LaptopCatalogSection laptops={laptops} />

      {/* ==================== LOCATION & FOOTER ==================== */}
      <footer id="lokasi" className="bg-slate-900 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Column 1: Store Bio */}
            <div className="space-y-4">
              <div className="flex flex-col items-start gap-2">
                <Image
                  src="/logo.png"
                  alt="Logo Laptop Fix Makassar"
                  width={280}
                  height={96}
                  className="h-24 w-[280px] object-contain object-left"
                />
                <span className="font-heading font-black text-lg text-white">
                  Laptop Fix Makassar
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Spesialis jual beli laptop second berkualitas, tukar tambah cepat, dan layanan servis motherboard profesional di Kota Makassar.
              </p>
            </div>

            {/* Column 2: Alamat & Jam Kerja */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
                Lokasi Toko &amp; Jam Buka
              </h4>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>Jl. Sultan Alauddin No. 137E, Makassar, Sulawesi Selatan</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Buka Setiap Hari: 09.00 - 21.00 WITA</span>
              </div>
            </div>

            {/* Column 3: Kontak & Instagram */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
                Hubungi &amp; Media Sosial
              </h4>
              <div className="flex flex-col gap-2.5 text-xs">
                <a
                  href={`https://wa.me/${WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp: +62 823-4666-2991</span>
                </a>
                <a
                  href="https://instagram.com/laptopfixmakassar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span>Instagram: @laptopfixmakassar</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Laptop Fix Makassar. Hak Cipta Dilindungi.</p>
            <Link href="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
              Panel Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
