import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  Laptop as LaptopIcon,
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
  Star,
} from 'lucide-react'
import LaptopCatalogSection from '@/components/LaptopCatalogSection'
import ScrollToTopButton from '@/components/ScrollToTopButton'

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
  original_price?: number | null
  bonus?: string | null
  status?: string | null
  image_url?: string | null
  image_urls?: string[] | null
  created_at?: string | null
}

const WA_NUMBER = '6282346662991'
const WA_DIRECT_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  'Halo Laptop Fix Makassar, saya ingin konsultasi mengenai stok laptop / servis / tukar tambah.'
)}`

function getServiceWhatsAppUrl(service: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Halo Laptop Fix Makassar, saya ingin berkonsultasi mengenai layanan ${service}.`
  )}`
}

const googleReviews = [
  {
    name: 'Okta Ngongo',
    meta: '1 ulasan',
    time: '2 bulan lalu',
    text: 'Aman, nyaman pengejaan nya juga cepat pokoknya the best, sukses selalu, recomend 😊 Pelayanannya sangat ramah dan membantu. Saya dibantu menginstal aplikasi dengan sabar sampai selesai, serta diberikan penjelasan yang mudah dipahami. Prosesnya cepat, hasilnya memuaskan, dan semuanya berjalan dengan baik.',
  },
  {
    name: 'Novitasari',
    meta: 'Pemandu Lokal · 7 ulasan',
    time: '1 bulan lalu',
    text: 'Terima kasih pelayanannya, sangat cepat dan staffnya sangat baik dan ramah. Disini juga tersedia jual beli laptop second. Laptopku sudah diservice dengan baik dan kembali bagus.',
  },
  {
    name: 'Salsabila Nada',
    meta: '2 ulasan',
    time: '4 bulan lalu',
    text: 'MasyaAllah, pelayanannya ramah sekali, tempatnya juga bersih dan nyaman. Saya cuma minta dicek kamera laptop karena tidak terdeteksi, ternyata langsung dibantu tanpa disuruh bayar. Terima kasih banyak atas pelayanan yang sangat baik 🙏',
  },
  {
    name: 'sulkarnain bustan',
    meta: '7 ulasan',
    time: '1 bulan lalu',
    text: 'Klk ada bintang 100, bintang 100 sih, layar laptop mati total, di periksa dan di cek, habis itu layar laptop nyala, dan ternyata biayanya free, trimakasih laptop fix makassar.',
  },
  {
    name: 'Lilis Karlina',
    meta: '1 ulasan',
    time: '3 bulan lalu',
    text: 'Pelayanan instalasi SPSS profesional 😍 Alhamdulillah software terpasang dengan baik, dan langsung dapat digunakan untuk analisis data. Teknisi komunikatif dan sangat membantu. Terimakasih banyak Lapto Fix Makassar 😍',
  },
]

const GOOGLE_MAPS_REVIEWS_URL =
  'https://www.google.com/maps/search/?api=1&query=Laptop+Fix+Makassar'

export default async function HomePage() {
  const supabase = createClient()
  let laptops: LaptopItem[] = []

  try {
    let { data, error } = await supabase
      .from('laptops')
      .select('name, brand, cpu, ram, storage, gpu, price, original_price, bonus, status, image_url, image_urls, created_at')
      .order('created_at', { ascending: false })

    if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message.includes('image_urls'))) {
      const fallback = await supabase
        .from('laptops')
        .select('name, brand, cpu, ram, storage, gpu, price, original_price, bonus, status, image_url, created_at')
        .order('created_at', { ascending: false })
      data = fallback.data as typeof data
      error = fallback.error
    }

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
        <div className="hidden sm:flex items-center justify-center gap-2 whitespace-nowrap">
          <span>Toko Buka Setiap Hari (09.00 - 21.00 WITA) • Jl. Sultan Alauddin No. 137E, Makassar</span>
          <span className="text-blue-200">|</span>
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-100">
            WhatsApp: 0823-4666-2991
          </a>
        </div>
        <div className="announcement-track flex sm:hidden items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-2 px-8 whitespace-nowrap" aria-hidden={copy === 1}>
              <span>Toko Buka 09.00 - 21.00 WITA • Jl. Sultan Alauddin No. 137E, Makassar</span>
              <span className="text-blue-200">|</span>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-100">
                WA: 0823-4666-2991
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== NAVBAR ==================== */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-20 sm:h-24 py-2 sm:py-0 flex items-center justify-between gap-2">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-36 h-16 sm:w-64 sm:h-24 shrink-0 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Logo Laptop Fix Makassar"
                fill
                sizes="(max-width: 640px) 144px, 256px"
                className="object-contain scale-[2.1] sm:scale-150"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-heading font-black text-xl tracking-tight text-slate-900">
                  Laptop Fix <span className="text-[#1E40AF]">Makassar</span>
                </span>
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
              className="inline-flex items-center gap-2 px-2.5 sm:px-5 py-2.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span className="hidden sm:inline">Hubungi WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* ==================== HERO SECTION (CLEAN LIGHT E-COMMERCE THEME) ==================== */}
      <section className="relative pt-5 pb-10 sm:pt-8 sm:pb-16 bg-gradient-to-b from-white via-slate-50 to-[#F1F5F9] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Trust Copy, CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Location / Status Pill */}
              <div className="inline-flex max-w-full items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] sm:text-xs font-semibold text-[#1E40AF] shadow-sm">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="truncate">Laptop Second Bergaransi, Bisa Tukar Tambah</span>
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
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm transition shadow-md active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-[#16A34A]" />
                  <span>KONSULTASI &amp; TUKAR TAMBAH</span>
                </a>
              </div>

              {/* Real World Trust Factors */}
              <div className="pt-4 flex flex-wrap items-center gap-y-3 gap-x-6 text-sm font-semibold text-slate-700 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1E40AF] shrink-0" />
                  <span>100% Lolos QC Hardware</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1E40AF] shrink-0" />
                  <span>Garansi 1 Bulan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#1E40AF] shrink-0" />
                  <span>Bisa Cek Langsung di Toko</span>
                </div>
              </div>

              <a
                href="#katalog"
                className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:border-[#1E40AF]/40 hover:shadow-md transition-all"
              >
                <div className="relative w-28 h-24 shrink-0 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                  {(featuredLaptop?.image_url || featuredLaptop?.image_urls?.[0]) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featuredLaptop.image_url || featuredLaptop.image_urls?.[0] || ''}
                      alt={featuredLaptop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <LaptopIcon className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#1E40AF]">
                    Unit Ready Stock
                  </p>
                  <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-2 mt-1">
                    {featuredLaptop?.name || 'Laptop second berkualitas'}
                  </h3>
                  <p className="font-heading font-black text-lg text-[#DC2626] mt-1">
                    {featuredLaptop?.price
                      ? new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        }).format(featuredLaptop.price)
                      : 'Harga mulai terjangkau'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#1E40AF] shrink-0 ml-auto" />
              </a>
            </div>

            {/* Right Column: Google Maps Reviews */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#1E40AF]">
                      Google Maps
                    </p>
                    <h3 className="font-heading font-black text-lg text-slate-900">
                      Kata Mereka
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-0.5 text-[#F59E0B]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">4.9 dari 788 ulasan</span>
                  </div>
                </div>

                <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                  {googleReviews.map((review) => (
                    <article key={review.name} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1E40AF] text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{review.name}</h4>
                            <span className="text-[10px] text-slate-400 shrink-0">{review.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{review.meta}</p>
                          <div className="flex items-center gap-0.5 text-[#F59E0B] mt-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <p className="text-xs leading-relaxed text-slate-600 mt-1.5">{review.text}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-200">
                  <a
                    href={GOOGLE_MAPS_REVIEWS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-lg bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-bold text-xs transition shadow-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Lihat Semua Review di Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
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
          <a
            href={getServiceWhatsAppUrl('jual beli laptop')}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#1E40AF]/40 transition-all duration-300"
          >
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
          </a>

          {/* Card 2: Tukar Tambah */}
          <a
            href={getServiceWhatsAppUrl('tukar tambah laptop')}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#1E40AF]/40 transition-all duration-300"
          >
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
          </a>

          {/* Card 3: Servis Spesialis */}
          <a
            href={getServiceWhatsAppUrl('servis dan upgrade laptop')}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#1E40AF]/40 transition-all duration-300"
          >
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
          </a>
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
                  width={340}
                  height={116}
                  className="h-28 w-[340px] object-contain object-left"
                />
                <span className="font-heading font-black text-lg text-white">
                  Laptop Fix Makassar
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Spesialis jual beli laptop second berkualitas, tukar tambah cepat, dan layanan servis motherboard profesional di Kota Makassar.
              </p>
            </div>

            {/* Column 2: Jam Kerja */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
                Jam Buka
              </h4>
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
      <ScrollToTopButton />
    </div>
  )
}
