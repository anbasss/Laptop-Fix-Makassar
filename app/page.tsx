import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
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
  Zap,
  Tag,
  ArrowRight,
} from 'lucide-react'

// Pastikan data selalu real-time / tidak di-cache statis
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
const WA_DIRECT_HERO = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  'Halo Laptop Fix Makassar, saya ingin konsultasi mengenai jual beli / tukar tambah laptop.'
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
  const message = `Halo Laptop Fix Makassar, saya tertarik dengan laptop *${productName}*. Apakah unit ini masih tersedia?`
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}

function getStatusBadgeClass(status?: string | null) {
  const normalized = (status || 'Tersedia').toLowerCase()
  // Aksen Merah #EE2D2D untuk Terjual / Sold Out (Selective urgency/status)
  if (normalized.includes('terjual') || normalized.includes('sold') || normalized.includes('habis')) {
    return 'bg-[#EE2D2D]/15 text-[#FF4D4D] border-[#EE2D2D]/40'
  }
  if (normalized.includes('booking') || normalized.includes('booked') || normalized.includes('dp')) {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/35'
  }
  // Biru Utama #2E5FE8 untuk unit Tersedia / Ready
  return 'bg-[#2E5FE8]/15 text-[#4B77FA] border-[#2E5FE8]/35'
}

export default async function HomePage() {
  const supabase = createClient()
  
  let laptops: LaptopItem[] = []
  let fetchError = false

  try {
    const { data, error } = await supabase
      .from('laptops')
      .select('name, brand, cpu, ram, storage, gpu, price, status, image_url')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching laptops from Supabase:', error.message)
      fetchError = true
    } else if (data) {
      laptops = data as LaptopItem[]
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    fetchError = true
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col font-sans selection:bg-[#2E5FE8]/30 selection:text-white">
      {/* ==================== NAVBAR ==================== */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#0A0A0F]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          {/* Brand Logo (Ready for landscape / wide logo file or styled brandmark) */}
          <Link href="/" className="flex items-center gap-3.5 group py-2">
            {/* Logo image support with automatic fallback */}
            <div className="relative flex items-center">
              {/* If user uploads /logo.png or /logo.svg, it will display gracefully here */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#2E5FE8] text-white flex items-center justify-center font-black shadow-[0_0_15px_rgba(46,95,232,0.35)] shrink-0">
                  <LaptopIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-white uppercase">
                      LAPTOP <span className="text-[#2E5FE8]">FIX</span>
                    </span>
                    {/* Small selective Red Accent Dot */}
                    <span className="w-2 h-2 rounded-full bg-[#EE2D2D] shadow-[0_0_6px_#EE2D2D]" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-[#A0A8B8] font-bold tracking-widest uppercase">
                    MAKASSAR • JUAL BELI &amp; SERVIS
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#A0A8B8]">
              <a href="#katalog" className="hover:text-[#2E5FE8] transition-colors">
                Katalog Laptop
              </a>
              <a href="#keunggulan" className="hover:text-[#2E5FE8] transition-colors">
                Layanan &amp; Garansi
              </a>
              <a href="#kontak" className="hover:text-[#2E5FE8] transition-colors">
                Lokasi Toko
              </a>
            </nav>

            <a
              href={WA_DIRECT_HERO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-md bg-[#2E5FE8] text-white text-xs sm:text-sm font-bold tracking-wide hover:bg-[#224EC4] transition shadow-[0_0_18px_rgba(46,95,232,0.30)] hover:shadow-[0_0_24px_rgba(46,95,232,0.45)] active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Hubungi WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-10 pb-0 overflow-hidden border-b border-white/[0.07] bg-[#0A0A0F]">
        {/* Physical store workshop textures: subtle diagonal linear grid */}
        <div 
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #2E5FE8 0, #2E5FE8 1px, transparent 0, transparent 32px)`
          }}
        />
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-[#2E5FE8]/12 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Text & CTAs (Industrial Headline, Dominant Blue & Selective Red Accent) */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Technical Store Identifier with Selective Red Pulse Dot */}
              <div className="flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider text-[#A0A8B8] uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-[#EE2D2D] shadow-[0_0_8px_#EE2D2D]" />
                <span>TOKO FISIK: JL. SULTAN ALAUDDIN NO. 137E, MAKASSAR</span>
              </div>

              {/* Main Headline: Solid pure white, bold industrial weight, uppercase */}
              <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-[52px] text-white tracking-tight leading-[1.08] uppercase">
                JUAL BELI &amp; TUKAR TAMBAH LAPTOP BEKAS BERKUALITAS DI MAKASSAR
              </h1>

              {/* Subtext with readable #A0A8B8 contrast */}
              <p className="text-[#A0A8B8] text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed">
                Unit second terpilih dengan pengujian hardware menyeluruh: motherboard, layar, keyboard, baterai, hingga thermal paste baru. Siap pakai untuk kerja, kuliah, programming, dan gaming.
              </p>

              {/* Action Buttons: Solid Blue Primary CTA & Sharp Dark Outline Secondary */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <a
                  href="#katalog"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-[#2E5FE8] text-white font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-[#224EC4] transition shadow-[0_0_20px_rgba(46,95,232,0.30)] hover:shadow-[0_0_28px_rgba(46,95,232,0.50)] active:scale-95"
                >
                  <span>LIHAT STOK TERSEDIA</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={WA_DIRECT_HERO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md border border-slate-700/80 bg-[#12141C] text-slate-200 font-semibold text-xs sm:text-sm hover:border-[#2E5FE8]/60 hover:text-white hover:bg-[#181B26] transition active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-[#2E5FE8]" />
                  <span>KONSULTASI / TUKAR TAMBAH</span>
                </a>
              </div>
            </div>

            {/* Right Column: 3/4 Angled Laptop Showcase (Instagram Catalog Studio Style) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual Showcase Card with Deep Blue Studio Depth */}
                <div className="relative rounded-xl border border-white/[0.08] bg-[#12141C] p-4 shadow-[0_0_35px_rgba(0,0,0,0.6)] overflow-hidden group">
                  {/* Photo Frame Header: Instagram / Showroom Tag */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] text-[11px] font-mono text-[#A0A8B8]">
                    <span className="flex items-center gap-1.5 text-white font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#2E5FE8] shadow-[0_0_8px_#2E5FE8]" />
                      LIVE STORE UNIT
                    </span>
                    <span className="text-[#4B77FA] font-semibold">@laptopfixmakassar</span>
                  </div>

                  {/* 3/4 Isometric Perspective Display with Studio Lighting Backdrop */}
                  <div className="relative aspect-[4/3] w-full rounded-lg bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#172554] via-[#0E1626] to-[#070A10] border border-[#2E5FE8]/30 overflow-hidden flex items-center justify-center p-4">
                    {/* Atmospheric diagonal grid watermark */}
                    <div 
                      className="absolute inset-0 opacity-[0.06]"
                      style={{
                        backgroundImage: `repeating-linear-gradient(-45deg, #FFF 0, #FFF 1px, transparent 0, transparent 16px)`
                      }}
                    />

                    {/* Blue Glow Center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#2E5FE8]/15 blur-[60px] rounded-full pointer-events-none" />

                    {/* Realistic 3/4 Angled Laptop Visual Representation */}
                    <div className="relative w-full h-full flex flex-col items-center justify-center [perspective:1000px] z-10">
                      {/* Laptop Screen (Angled back) */}
                      <div className="relative w-[78%] h-[58%] rounded-t-lg bg-gradient-to-b from-slate-900 to-black border-2 border-slate-700/80 shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex flex-col justify-between p-2.5 transform -rotate-1 group-hover:rotate-0 transition-transform duration-500">
                        {/* Camera dot */}
                        <div className="w-1 h-1 rounded-full bg-slate-500 mx-auto" />
                        {/* Screen Content: Diagnostic / Performance Test */}
                        <div className="rounded bg-[#070B14] border border-[#2E5FE8]/30 p-2 text-left space-y-1 my-auto">
                          <div className="flex items-center justify-between text-[9px] font-mono">
                            <span className="text-[#4B77FA] font-bold">LFX BENCHMARK // QC PASS</span>
                            <span className="text-[#EE2D2D] font-bold">100% OK</span>
                          </div>
                          <div className="w-full bg-[#121826] h-1 rounded-full overflow-hidden">
                            <div className="bg-[#2E5FE8] h-full w-[94%]" />
                          </div>
                          <div className="flex justify-between text-[8px] font-mono text-[#A0A8B8] pt-0.5">
                            <span>CPU: TEMP 42°C</span>
                            <span>BATTERY: EXCELLENT</span>
                          </div>
                        </div>
                        {/* Bottom bezel logo */}
                        <div className="text-[8px] font-mono text-slate-400 text-center tracking-widest uppercase">
                          LAPTOP FIX MAKASSAR
                        </div>
                      </div>

                      {/* Laptop Base / Keyboard Deck */}
                      <div className="relative w-[92%] h-[26%] -mt-1 rounded-b-lg bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 border-x-2 border-b-2 border-slate-700/80 shadow-2xl transform rotate-x-[35deg] flex flex-col items-center justify-center p-1">
                        {/* Keyboard keys pattern */}
                        <div className="w-[85%] h-2.5 bg-slate-950/90 rounded border border-slate-700/50 mb-1" />
                        {/* Trackpad */}
                        <div className="w-8 h-2 bg-slate-950 rounded-sm border border-slate-700/60" />
                      </div>

                      {/* Realistic Shadow beneath laptop */}
                      <div className="w-[85%] h-3 bg-black/90 blur-md rounded-full mt-1" />
                    </div>

                    {/* Showroom Physical Sticker Overlay */}
                    <div className="absolute bottom-3 left-3 bg-[#0A0A0F]/90 border border-white/[0.1] rounded px-2 py-1 text-[10px] font-mono text-[#A0A8B8] backdrop-blur-sm shadow-md z-20">
                      <span className="text-[#4B77FA] font-bold">QC PASSED:</span> MOTHERBOARD • LCD • BATTERY
                    </div>
                  </div>

                  {/* Photo Frame Footer: Supported Brands */}
                  <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#A0A8B8]">
                    <span className="font-semibold text-white">UNIT TERSEDIA:</span>
                    <span className="font-mono text-[10px] text-[#A0A8B8] truncate">
                      ThinkPad • ASUS ROG • TUF • Dell • MacBook
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== FEATURE STRIP (HORIZONTAL COMPACT STRIP) ==================== */}
        <div className="border-t border-white/[0.07] bg-[#0D0F16]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.07] text-left">
              {/* Feature 1 */}
              <div className="p-4 sm:p-5 flex flex-col justify-center">
                <div className="text-[11px] font-mono font-bold text-[#2E5FE8] tracking-wider mb-0.5">
                  01 / QC HARDWARE 100%
                </div>
                <p className="text-xs text-[#A0A8B8] font-medium leading-snug">
                  Tes ketat motherboard, suhu thermal, layar &amp; baterai.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 sm:p-5 flex flex-col justify-center">
                <div className="text-[11px] font-mono font-bold text-[#2E5FE8] tracking-wider mb-0.5">
                  02 / GARANSI TOKO JELAS
                </div>
                <p className="text-xs text-[#A0A8B8] font-medium leading-snug">
                  Jaminan replace &amp; servis purna jual transparan.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 sm:p-5 flex flex-col justify-center">
                <div className="text-[11px] font-mono font-bold text-[#2E5FE8] tracking-wider mb-0.5">
                  03 / TUKAR TAMBAH MUDAH
                </div>
                <p className="text-xs text-[#A0A8B8] font-medium leading-snug">
                  Terima tukar laptop lama dengan taksiran wajar di toko.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 sm:p-5 flex flex-col justify-center">
                <div className="text-[11px] font-mono font-bold text-[#2E5FE8] tracking-wider mb-0.5">
                  04 / UNIT SIAP PAKAI
                </div>
                <p className="text-xs text-[#A0A8B8] font-medium leading-snug">
                  OS &amp; software kerja harian sudah terinstalasi rapi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRODUCT GRID SECTION ==================== */}
      <section id="katalog" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-white/[0.07] gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2E5FE8] tracking-wider uppercase mb-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Katalog Unit Terbaru</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                Pilihan Laptop Siap Kerja &amp; Gaming
              </h2>
              {/* Subtle selective Red Accent line */}
              <span className="hidden sm:inline-block w-8 h-1 bg-[#EE2D2D] rounded-full mt-2" />
            </div>
          </div>
          <p className="text-sm text-[#A0A8B8] max-w-sm">
            Semua unit telah melewati pengecekan hardware, siap uji coba langsung di toko kami di Alauddin.
          </p>
        </div>

        {/* Handling Empty State or No Data */}
        {(!laptops || laptops.length === 0) ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#12141C] p-12 text-center max-w-xl mx-auto my-8 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#0D0F16] border border-[#2E5FE8]/30 flex items-center justify-center mx-auto mb-4 text-[#2E5FE8]">
              <LaptopIcon className="w-8 h-8 opacity-80" />
            </div>
            <h3 className="font-heading font-bold text-xl text-white mb-2">
              Belum ada produk
            </h3>
            <p className="text-[#A0A8B8] text-sm mb-6 leading-relaxed">
              Saat ini katalog laptop sedang diperbarui atau stok baru sedang dalam tahap pengecekan (QC). 
              Silakan hubungi kami via WhatsApp untuk menanyakan stok unit yang tersedia di toko.
            </p>
            <a
              href={WA_DIRECT_HERO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#2E5FE8] text-white text-sm font-bold hover:bg-[#224EC4] transition shadow-[0_0_15px_rgba(46,95,232,0.30)]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Tanya Stok via WhatsApp</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {laptops.map((laptop, index) => {
              const statusText = laptop.status || 'Tersedia'
              const waUrl = getWhatsAppProductUrl(laptop.name)
              const badgeClass = getStatusBadgeClass(laptop.status)

              return (
                <div
                  key={laptop.id || `${laptop.name}-${index}`}
                  className="group rounded-xl bg-[#12141C] border border-white/[0.07] hover:border-[#2E5FE8]/60 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(46,95,232,0.15)]"
                >
                  {/* Image Container with Top-Left Badge */}
                  <div className="relative aspect-[16/10] w-full bg-[#0A0A0F] border-b border-white/[0.07] overflow-hidden flex items-center justify-center">
                    {laptop.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={laptop.image_url}
                        alt={laptop.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-600 gap-2 p-4 text-center">
                        <LaptopIcon className="w-12 h-12 stroke-[1.25] text-slate-700" />
                        <span className="text-[11px] text-[#A0A8B8] font-medium">Foto Belum Tersedia</span>
                      </div>
                    )}

                    {/* Badge Status in Top-Left Corner (uses Blue for Tersedia, Red for Terjual) */}
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border backdrop-blur-md shadow-sm ${badgeClass}`}
                      >
                        {statusText}
                      </span>
                    </div>

                    {/* Brand Tag in Top-Right Corner */}
                    {laptop.brand && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#0A0A0F]/90 text-[#A0A8B8] border border-white/[0.08] backdrop-blur-sm">
                          {laptop.brand}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-white group-hover:text-[#4B77FA] transition-colors line-clamp-2 leading-snug">
                        {laptop.name}
                      </h3>

                      {/* Brief Specs List with Dominant Blue #2E5FE8 Icons */}
                      <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                        {/* CPU */}
                        <div className="p-2 rounded-lg bg-[#0D0F16] border border-white/[0.05] flex items-start gap-2">
                          <Cpu className="w-3.5 h-3.5 text-[#2E5FE8] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              CPU
                            </span>
                            <span className="text-[#A0A8B8] truncate block font-medium">
                              {laptop.cpu || 'Standar'}
                            </span>
                          </div>
                        </div>

                        {/* RAM */}
                        <div className="p-2 rounded-lg bg-[#0D0F16] border border-white/[0.05] flex items-start gap-2">
                          <Layers className="w-3.5 h-3.5 text-[#2E5FE8] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              RAM
                            </span>
                            <span className="text-[#A0A8B8] truncate block font-medium">
                              {laptop.ram || '-'}
                            </span>
                          </div>
                        </div>

                        {/* Storage */}
                        <div className="p-2 rounded-lg bg-[#0D0F16] border border-white/[0.05] flex items-start gap-2">
                          <HardDrive className="w-3.5 h-3.5 text-[#2E5FE8] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              Storage
                            </span>
                            <span className="text-[#A0A8B8] truncate block font-medium">
                              {laptop.storage || '-'}
                            </span>
                          </div>
                        </div>

                        {/* GPU */}
                        <div className="p-2 rounded-lg bg-[#0D0F16] border border-white/[0.05] flex items-start gap-2">
                          <Monitor className="w-3.5 h-3.5 text-[#2E5FE8] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              GPU
                            </span>
                            <span className="text-[#A0A8B8] truncate block font-medium">
                              {laptop.gpu || 'Integrated'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA Button */}
                    <div className="pt-3 border-t border-white/[0.07] space-y-3">
                      <div>
                        <span className="text-[11px] text-[#A0A8B8] font-medium block">
                          Harga Nett:
                        </span>
                        <div className="font-heading font-extrabold text-2xl text-white tracking-tight">
                          {formatRupiah(laptop.price)}
                        </div>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[#2E5FE8] text-white font-bold text-xs sm:text-sm hover:bg-[#224EC4] active:scale-[0.98] transition-all shadow-[0_0_16px_rgba(46,95,232,0.25)] hover:shadow-[0_0_22px_rgba(46,95,232,0.40)]"
                      >
                        <MessageCircle className="w-4 h-4 fill-white/20" />
                        <span>Chat Sekarang</span>
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ==================== SERVICES & GUARANTEE SECTION ==================== */}
      <section id="keunggulan" className="py-16 bg-[#0D0F16] border-y border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Mengapa Memilih <span className="text-[#2E5FE8]">Laptop Fix Makassar</span>?
            </h2>
            <p className="mt-3 text-[#A0A8B8] text-sm">
              Kami memprioritaskan transparansi, kualitas unit, dan kenyamanan purna jual bagi seluruh pelanggan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#12141C] border border-white/[0.07] hover:border-[#2E5FE8]/40 transition">
              <div className="w-12 h-12 rounded-lg bg-[#2E5FE8]/15 border border-[#2E5FE8]/30 flex items-center justify-center text-[#2E5FE8] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                Garansi Unit &amp; Pengecekan Terbuka
              </h3>
              <p className="text-[#A0A8B8] text-sm leading-relaxed">
                Bebas tes benchmark, cek keyboard, layar, baterai, dan performa mesin sepuasnya langsung di toko sebelum transaksi.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#12141C] border border-white/[0.07] hover:border-[#2E5FE8]/40 transition">
              <div className="w-12 h-12 rounded-lg bg-[#2E5FE8]/15 border border-[#2E5FE8]/30 flex items-center justify-center text-[#2E5FE8] mb-4">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                Tukar Tambah &amp; Upgrade Fleksibel
              </h3>
              <p className="text-[#A0A8B8] text-sm leading-relaxed">
                Punya laptop lama ingin upgrade ke spek lebih kencang? Bawa unit Anda untuk kami taksir dengan harga wajar dan jujur.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#12141C] border border-white/[0.07] hover:border-[#2E5FE8]/40 transition">
              <div className="w-12 h-12 rounded-lg bg-[#2E5FE8]/15 border border-[#2E5FE8]/30 flex items-center justify-center text-[#2E5FE8] mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                Servis &amp; Sparepart Berpengalaman
              </h3>
              <p className="text-[#A0A8B8] text-sm leading-relaxed">
                Selain jual beli, kami juga melayani servis motherboard, ganti LCD, keyboard, instalasi ulang, serta pembersihan thermal paste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer id="kontak" className="bg-[#07080D] border-t border-white/[0.07] text-[#A0A8B8] text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Column 1: Info Toko */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#2E5FE8] text-white flex items-center justify-center font-bold">
                  <LaptopIcon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-lg text-white">
                    LAPTOP <span className="text-[#2E5FE8]">FIX</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#EE2D2D]" />
                </div>
              </div>
              <p className="text-xs text-[#A0A8B8] leading-relaxed max-w-sm">
                Pusat jual beli laptop bekas berkualitas, tukar tambah, dan servis spesialis laptop di kota Makassar.
              </p>
            </div>

            {/* Column 2: Alamat & Jam Operasional */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider">
                Lokasi &amp; Jam Buka
              </h4>
              <div className="flex items-start gap-2.5 text-xs text-[#A0A8B8]">
                <MapPin className="w-4 h-4 text-[#2E5FE8] shrink-0 mt-0.5" />
                <span className="text-slate-200 font-medium">Jl. Sultan Alauddin No. 137E, Makassar</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#A0A8B8]">
                <Clock className="w-4 h-4 text-[#2E5FE8] shrink-0 mt-0.5" />
                <span>Jam Operasional: 09.00 - 21.00 WITA</span>
              </div>
            </div>

            {/* Column 3: Kontak & Media Sosial */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider">
                Hubungi Kami
              </h4>
              <div className="flex flex-col gap-2.5 text-xs">
                <a
                  href={`https://wa.me/${WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#A0A8B8] hover:text-[#2E5FE8] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#2E5FE8]" />
                  <span>WhatsApp: +62 823-4666-2991</span>
                </a>
                <a
                  href="https://instagram.com/laptopfixmakassar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#A0A8B8] hover:text-[#2E5FE8] transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#2E5FE8]" />
                  <span>Instagram: @laptopfixmakassar</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Laptop Fix Makassar. Hak Cipta Dilindungi.</p>
            <Link href="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
              Akses Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
