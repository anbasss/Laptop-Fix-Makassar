'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createWorker } from 'tesseract.js'
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
  original_price?: number | null
  bonus?: string | null
  status?: string | null
  image_url?: string | null
  image_urls?: string[] | null
  created_at?: string | null
}

const STATUS_OPTIONS = ['Tersedia', 'Like New', 'Terjual', 'Booking']
const BRAND_SUGGESTIONS = ['Lenovo', 'Asus', 'Acer', 'HP', 'Dell', 'Apple', 'MSI', 'Axioo', 'Toshiba']

const CPU_PRESETS = [
  'Intel Core i3',
  'Intel Core i5',
  'Intel Core i7',
  'AMD Ryzen 3',
  'AMD Ryzen 5',
  'AMD Ryzen 7',
  'Apple M1',
  'Apple M2',
]

const RAM_PRESETS = [
  '4GB DDR4',
  '8GB DDR4',
  '16GB DDR4',
  '32GB DDR4',
  '8GB Unified',
  '16GB Unified',
]

const STORAGE_PRESETS = [
  '128GB SSD',
  '256GB SSD NVMe',
  '512GB SSD NVMe',
  '1TB SSD NVMe',
  '256GB SSD + 1TB HDD',
]

const GPU_PRESETS = [
  'Intel UHD / Iris Xe',
  'Intel HD Graphics',
  'AMD Radeon Graphics',
  'NVIDIA GeForce GTX 1650',
  'NVIDIA GeForce RTX 3050',
  'Apple M1 GPU',
]

const QUICK_TEMPLATES = [
  {
    label: '💼 ThinkPad / Bisnis',
    brand: 'Lenovo',
    name: 'Lenovo ThinkPad Core i5',
    cpu: 'Intel Core i5 8th / 10th Gen',
    ram: '8GB DDR4',
    storage: '256GB SSD NVMe',
    gpu: 'Intel UHD Graphics',
    price: '3500000',
    status: 'Tersedia',
  },
  {
    label: '🎮 Laptop Gaming',
    brand: 'Asus',
    name: 'ASUS TUF Gaming Core i5 GTX',
    cpu: 'Intel Core i5 / AMD Ryzen 5',
    ram: '16GB DDR4 (Dual Channel)',
    storage: '512GB SSD NVMe High Speed',
    gpu: 'NVIDIA GeForce GTX 1650 4GB',
    price: '7500000',
    status: 'Tersedia',
  },
  {
    label: '🍎 MacBook M1 / Air',
    brand: 'Apple',
    name: 'Apple MacBook Air M1 2020',
    cpu: 'Apple M1 Chip (8-Core CPU)',
    ram: '8GB Unified Memory',
    storage: '256GB Apple SSD',
    gpu: 'Apple M1 GPU 7-Core',
    price: '9500000',
    status: 'Like New',
  },
  {
    label: '🎓 Slim Mahasiswa',
    brand: 'Asus',
    name: 'ASUS Vivobook Slim',
    cpu: 'AMD Ryzen 3 / Intel Core i3',
    ram: '8GB DDR4',
    storage: '256GB SSD NVMe',
    gpu: 'AMD Radeon / Intel UHD',
    price: '3200000',
    status: 'Tersedia',
  },
]

interface ParsedPosterData {
  name?: string
  cpu?: string
  ram?: string
  storage?: string
  gpu?: string
  price?: string
  originalPrice?: string
  bonus?: string
}

const FIXED_BONUS = 'TAS SOFCASE, MOUSE, MOUSPAD'

function normalizeOcrText(text: string): string {
  return text
    .replace(/[—–]/g, '-')
    .replace(/\bRss\b/gi, 'Rp')
    .replace(/\bFrel\b/gi, 'Free')
    .replace(/\bCore\s+i7-\s*(\d{3,5})/gi, 'Core i7-$1')
    .replace(/\r/g, '')
    .replace(/[|]/g, 'I')
    .replace(/[“”]/g, '"')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

function parsePrice(value: string): string {
  const digits = value.replace(/[^\d]/g, '')
  return digits ? digits : ''
}

function extractPrices(text: string): string[] {
  const labelled = [...text.matchAll(/(?:rp|idr)\s*[:.]?\s*([\d][\d.,\s-]{3,})/gi)]
    .map((match) => parsePrice(match[1]))
  const standalone = [...text.matchAll(/\b\d{1,3}(?:[.,]\d{3}){2}\b/g)]
    .map((match) => parsePrice(match[0]))
  return [...new Set([...labelled, ...standalone])].filter((value) => value.length >= 5)
}

function cleanProcessor(value: string): string {
  const match = value.match(/(?:intel\s+)?(?:core\s+)?i[357](?:\s*-\s*[a-z0-9]{3,8})?/i)
  const cleaned = (match?.[0] || value)
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.replace(/i([357])-(\d{4,6})$/i, (_, tier: string, model: string) => {
    if (model.endsWith('00')) {
      return `i${tier}-${model.slice(0, -1)}U`
    }
    return `i${tier}-${model}`
  })
}

function extractProcessor(text: string, lines: string[]): string | undefined {
  const coreMatch = text.match(/(?:intel\s+)?(?:core\s+)?i[357]\b/i)
  if (!coreMatch || coreMatch.index === undefined) return undefined

  const core = coreMatch[0].replace(/\s+/g, ' ').trim()
  const startLine = lines.findIndex((line) => new RegExp(core.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(line))
  const nearbyLines = startLine >= 0
    ? lines.slice(startLine, startLine + 4).join(' ')
    : text.slice(coreMatch.index, coreMatch.index + 180)
  const generation = nearbyLines.match(/\b(\d{4,6})(?:\s*(u|h|g\d))?\b/i)

  if (!generation) return core
  return cleanProcessor(`${core}-${generation[1]}${generation[2] || ''}`)
}

function cleanStorage(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  const capacity = normalized.match(/\b(128|256|512|1000|1024)\s*(gb|tb)\b/i)?.[0] || ''
  const type = normalized.match(/\b(ssd|hdd)\b/i)?.[0]?.toUpperCase() || 'SSD'
  const nvme = /nvme/i.test(normalized) ? ' NVMe' : ''
  const m2 = /m\.?\s*2/i.test(normalized) ? ' M.2' : ''
  return `${type}${m2}${nvme} ${capacity}`.replace(/\s+/g, ' ').trim()
}

async function preprocessPoster(file: File): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = imageUrl
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Gambar poster tidak dapat dibaca.'))
    })

    const scale = Math.min(2, Math.max(1, 1800 / Math.max(image.width, image.height)))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.width * scale)
    canvas.height = Math.round(image.height * scale)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Browser tidak mendukung pemrosesan gambar OCR.')

    context.filter = 'grayscale(1) contrast(1.35) brightness(1.05)'
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Gagal menyiapkan gambar OCR.'))), 'image/png')
    })
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

function parsePosterText(rawText: string): ParsedPosterData {
  const text = normalizeOcrText(rawText)
  const lines = text.split('\n')
  const flatText = lines.join(' ')
  const findLine = (pattern: RegExp) => lines.find((line) => pattern.test(line))
  const afterLabel = (pattern: RegExp) => {
    const line = findLine(pattern)
    return line?.replace(pattern, '').replace(/^[:\-\s]+/, '').trim()
  }

  const processorLine =
    afterLabel(/^(cpu|processor|prosesor)\b/i) ||
    lines.find((line) => /(intel\s+(core|celeron|pentium)|amd\s+ryzen|apple\s+m[123]|snapdragon)/i.test(line))
  const processorMatch = flatText.match(/(?:intel\s+)?(?:core\s+)?i[357]\s*-?\s*\d{4,6}\s*(?:u|h|g\d)?/i)
  const processor = extractProcessor(flatText, lines) || processorMatch?.[0] || processorLine
  const ramLine =
    afterLabel(/^ram\b/i) ||
    lines.find((line) => /\b(?:4|8|16|32|64)\s*gb(?:\s*(?:ddr[345]|unified|ram))?/i.test(line))
  const ramMatch = flatText.match(/\b(?:4|8|16|24|32|64)\s*gb\s*(?:ddr[345]|unified|ram)?/i)
  const ram = ramMatch?.[0] || ramLine
  const storageLine =
    afterLabel(/^(storage|penyimpanan|hard\s*disk|hdd|ssd)\b/i) ||
    lines.find((line) => /\b(?:128|256|512|1000|1024)\s*(?:gb|tb)\s*(?:ssd|hdd|nvme)?\b/i.test(line))
  const storageMatch = flatText.match(
    /\b(?:(?:ssd|hdd)\s*(?:m\.\s*2\s*)?(?:nvme\s*)?.{0,40}?(?:128|256|512|1000|1024)\s*(?:gb|tb)|(?:128|256|512|1000|1024)\s*(?:gb|tb)\s*(?:ssd|hdd)?\s*(?:m\.\s*2\s*)?(?:nvme)?)\b/i
  )
  const storage = storageMatch?.[0] || storageLine
  const gpuLine =
    afterLabel(/^(gpu|vga|graphics|kartu grafis)\b/i) ||
    lines.find((line) => /(nvidia|geforce|rtx|gtx|radeon|iris xe|intel uhd|apple m[123].*gpu)/i.test(line))
  const gpuMatch = flatText.match(/(?:intel\s+)?(?:iris\s+xe|uhd\s+graphics|radeon\s+graphics|geforce\s+(?:gtx|rtx)\s*\w*)/i)
  const gpu = gpuMatch?.[0] || gpuLine

  const priceMatches = extractPrices(flatText)
  const onlyIndex = lines.findIndex((line) => /\bonly\b|promo|diskon|harga jual/i.test(line))
  const priceIndex = lines.findIndex((line) => /\bprice\b|harga asli|harga normal|sebelum diskon|normal/i.test(line))
  const promoLine = [onlyIndex >= 0 ? lines.slice(onlyIndex, onlyIndex + 3).join(' ') : '', findLine(/only|promo|diskon|special|spesial|harga jual/i)].find(Boolean)
  const originalLine = [priceIndex >= 0 ? lines.slice(priceIndex, priceIndex + 3).join(' ') : '', findLine(/harga asli|harga normal|sebelum diskon|normal|price/i)].find(Boolean)
  const nameLine =
    afterLabel(/^(nama|model|tipe|laptop)\b/i) ||
    lines.find((line) => /(laptop|notebook|macbook|thinkpad|vivobook|ideapad|aspire|pavilion|latitude|rog|tuf)/i.test(line))

  return {
    name: nameLine?.replace(/^(nama|model|tipe|laptop)\s*[:\-]?\s*/i, '').trim(),
    cpu: processor
      ? cleanProcessor(processor.replace(/^(cpu|processor|prosesor)\s*[:\-]?\s*/i, ''))
      : undefined,
    ram: ram?.replace(/^ram\s*[:\-]?\s*/i, '').trim(),
    storage: storage ? cleanStorage(storage) : undefined,
    gpu: gpu?.replace(/^(gpu|vga|graphics|kartu grafis)\s*[:\-]?\s*/i, '').trim(),
    price: extractPrices(promoLine || '')[0] || (priceMatches.length > 1 ? priceMatches[1] : priceMatches[0]) || '',
    originalPrice: extractPrices(originalLine || '')[0] || (priceMatches.length > 1 ? priceMatches[0] : ''),
    bonus: FIXED_BONUS,
  }
}

function detectBrandFromName(name: string): string | null {
  const lower = name.toLowerCase()
  if (lower.includes('thinkpad') || lower.includes('ideapad') || lower.includes('legion') || lower.includes('yoga') || lower.includes('lenovo')) {
    return 'Lenovo'
  }
  if (lower.includes('vivobook') || lower.includes('zenbook') || lower.includes('rog') || lower.includes('tuf') || lower.includes('zephyrus') || lower.includes('asus')) {
    return 'Asus'
  }
  if (lower.includes('macbook') || lower.includes('mac') || lower.includes('apple') || lower.includes('retina')) {
    return 'Apple'
  }
  if (lower.includes('aspire') || lower.includes('nitro') || lower.includes('swift') || lower.includes('predator') || lower.includes('acer')) {
    return 'Acer'
  }
  if (lower.includes('pavilion') || lower.includes('victus') || lower.includes('omen') || lower.includes('elitebook') || lower.includes('probook') || lower.includes('envy') || lower.includes('hp')) {
    return 'HP'
  }
  if (lower.includes('latitude') || lower.includes('inspiron') || lower.includes('vostro') || lower.includes('xps') || lower.includes('alienware') || lower.includes('dell')) {
    return 'Dell'
  }
  if (lower.includes('katana') || lower.includes('cyborg') || lower.includes('stealth') || lower.includes('gf63') || lower.includes('msi') || lower.includes('bravo')) {
    return 'MSI'
  }
  if (lower.includes('hype') || lower.includes('mybook') || lower.includes('axioo') || lower.includes('pongo')) {
    return 'Axioo'
  }
  return null
}

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

function isMissingImageUrlsColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const message = 'message' in error && typeof error.message === 'string' ? error.message : ''
  const code = 'code' in error && typeof error.code === 'string' ? error.code : ''
  return code === 'PGRST204' || code === '42703' || message.includes('image_urls')
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
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>('')
  const [formBonus, setFormBonus] = useState('')
  const [formStatus, setFormStatus] = useState('Tersedia')
  const [formImageFiles, setFormImageFiles] = useState<File[]>([])
  const [formImagePreviews, setFormImagePreviews] = useState<string[]>([])
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrText, setOcrText] = useState('')

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

  // Open Create Form - Auto-fills standard default values
  const handleOpenCreate = () => {
    setEditingLaptop(null)
    setFormName('')
    setFormBrand('Lenovo')
    setFormCpu('Intel Core i5')
    setFormRam('8GB DDR4')
    setFormStorage('256GB SSD NVMe')
    setFormGpu('Intel UHD / Iris Xe')
    setFormPrice('')
    setFormOriginalPrice('')
    setFormBonus(FIXED_BONUS)
    setOcrText('')
    setFormStatus('Tersedia')
    setFormImageFiles([])
    setFormImagePreviews([])
    setIsModalOpen(true)
  }

  // Apply Quick Template
  const handleApplyTemplate = (tpl: (typeof QUICK_TEMPLATES)[0]) => {
    setFormName(tpl.name)
    setFormBrand(tpl.brand)
    setFormCpu(tpl.cpu)
    setFormRam(tpl.ram)
    setFormStorage(tpl.storage)
    setFormGpu(tpl.gpu)
    setFormPrice(tpl.price)
    setFormStatus(tpl.status)
  }

  // Handle Name change with smart brand auto-detection
  const handleNameChange = (val: string) => {
    setFormName(val)
    const detected = detectBrandFromName(val)
    if (detected) {
      setFormBrand(detected)
    }
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
    setFormOriginalPrice(laptop.original_price ? laptop.original_price.toString() : '')
    setFormBonus(FIXED_BONUS)
    setOcrText('')
    setFormStatus(laptop.status || 'Tersedia')
    setFormImageFiles([])
    setFormImagePreviews(laptop.image_urls?.length ? laptop.image_urls : laptop.image_url ? [laptop.image_url] : [])
    setIsModalOpen(true)
  }

  // Image change handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) {
      setFormImageFiles(files)
      setFormImagePreviews(files.map((file) => URL.createObjectURL(file)))
    }
  }

  const handlePosterOcr = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const poster = event.target.files?.[0]
    event.target.value = ''
    if (!poster) return

    setOcrLoading(true)
    setFeedback(null)
    try {
      const worker = await createWorker('eng')
      const processedPoster = await preprocessPoster(poster)
      const result = await worker.recognize(processedPoster)
      await worker.terminate()

      const rawText = result.data.text
      const parsed = parsePosterText(rawText)
      setOcrText(rawText)

      if (parsed.name) setFormName(parsed.name)
      if (parsed.cpu) setFormCpu(parsed.cpu)
      if (parsed.ram) setFormRam(parsed.ram)
      if (parsed.storage) setFormStorage(parsed.storage)
      if (parsed.gpu) setFormGpu(parsed.gpu)
      if (parsed.price) setFormPrice(parsed.price)
      if (parsed.originalPrice) setFormOriginalPrice(parsed.originalPrice)
      setFormBonus(FIXED_BONUS)

      setFeedback({
        type: 'success',
        message: 'OCR selesai. Data yang terdeteksi sudah diisikan ke form dan masih bisa diedit.',
      })
    } catch (error: unknown) {
      console.error('OCR error:', error)
      setFeedback({
        type: 'error',
        message: error instanceof Error ? `OCR gagal: ${error.message}` : 'OCR gagal memproses poster.',
      })
    } finally {
      setOcrLoading(false)
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
    const numericOriginalPrice = formOriginalPrice
      ? parseInt(formOriginalPrice.replace(/\D/g, ''), 10)
      : null
    if (numericOriginalPrice !== null && (isNaN(numericOriginalPrice) || numericOriginalPrice < 0)) {
      setFeedback({ type: 'error', message: 'Harga asli laptop tidak valid.' })
      return
    }

    setFormLoading(true)

    try {
      let finalImageUrls = editingLaptop?.image_urls?.length
        ? editingLaptop.image_urls
        : editingLaptop?.image_url
          ? [editingLaptop.image_url]
          : []

      // If user uploaded a new photo file
      if (formImageFiles.length) {
        finalImageUrls = await Promise.all(formImageFiles.map(uploadImageToStorage))

        // If updating and had an old image in storage, remove it to save space
        const oldImages = editingLaptop?.image_urls?.length
          ? editingLaptop.image_urls
          : editingLaptop?.image_url
            ? [editingLaptop.image_url]
            : []
        const oldPaths = oldImages.map(extractStoragePath).filter((path): path is string => Boolean(path))
        if (oldPaths.length) {
          await supabase.storage.from('laptop-photos').remove(oldPaths)
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
        original_price: numericOriginalPrice,
        bonus: FIXED_BONUS,
        status: formStatus,
        image_url: finalImageUrls[0] || null,
        image_urls: finalImageUrls,
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
      router.refresh()
    } catch (err: unknown) {
      console.error('Submit error:', err)
      setFeedback({
        type: 'error',
        message: isMissingImageUrlsColumnError(err)
          ? 'Database belum diperbarui untuk multi-foto. Jalankan migration image_urls di Supabase SQL Editor, lalu coba simpan lagi.'
          : err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data.',
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
      const deleteImages = deleteTarget.image_urls?.length
        ? deleteTarget.image_urls
        : deleteTarget.image_url
          ? [deleteTarget.image_url]
          : []
      const storagePaths = deleteImages.map(extractStoragePath).filter((path): path is string => Boolean(path))
      if (storagePaths.length) {
          try {
            await supabase.storage.from('laptop-photos').remove(storagePaths)
          } catch (storageErr) {
            console.warn('Could not delete storage image:', storageErr)
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
      router.refresh()
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#1E40AF]/15 selection:text-[#1E40AF]">
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-20 py-2 sm:py-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#1E40AF] text-white flex items-center justify-center font-bold shadow-md">
              <LaptopIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-sm sm:text-lg text-slate-900 uppercase truncate">
                  Laptop Fix <span className="text-[#1E40AF]">Makassar</span>
                </span>
                <span className="rounded-md bg-blue-100 text-[#1E40AF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                  Admin Panel
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate max-w-[10rem] sm:max-w-xs">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <span>Lihat Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-xs font-bold text-[#DC2626] hover:bg-red-100 transition active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* Toast Alert */}
        {feedback && (
          <div
            className={`flex items-center justify-between p-4 rounded-xl border text-sm shadow-sm animate-in fade-in duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-[#DC2626]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626]" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Stok</p>
              <p className="mt-1 font-heading text-3xl font-black text-slate-900">{totalCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1E40AF]">
              <LaptopIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit Tersedia / Ready</p>
              <p className="mt-1 font-heading text-3xl font-black text-emerald-600">{availableCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit Terjual</p>
              <p className="mt-1 font-heading text-3xl font-black text-slate-400">{soldCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <Tag className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Control Bar: Search, Filter, Refresh, Add Button */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari laptop berdasarkan nama, merk, prosesor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E40AF] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1E40AF] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-700 font-medium focus:border-[#1E40AF] focus:outline-none"
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
              className="p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shrink-0 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1E40AF]' : ''}`} />
            </button>
          </div>

          {/* Add New Laptop Button */}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-xs sm:text-sm font-bold transition shadow-sm shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Laptop Baru</span>
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Anda dapat menambahkan laptop sebanyak yang diperlukan. Tidak ada batas maksimal jumlah unit.
        </p>

        {/* ==================== LAPTOPS TABLE / LIST ==================== */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E40AF]" />
              <p className="text-sm font-medium">Memuat daftar laptop...</p>
            </div>
          ) : filteredLaptops.length === 0 ? (
            <div className="py-20 text-center px-4">
              <LaptopIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-heading text-lg font-bold text-slate-900 mb-1">
                {searchQuery || filterStatus !== 'ALL'
                  ? 'Tidak ada laptop yang cocok dengan filter'
                  : 'Belum ada data laptop'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                {searchQuery || filterStatus !== 'ALL'
                  ? 'Coba ganti kata kunci pencarian atau ubah filter status.'
                  : 'Mulai isi katalog dengan menekan tombol "Tambah Laptop Baru" di atas.'}
              </p>
              {!searchQuery && filterStatus === 'ALL' && (
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-xs font-bold transition shadow-sm"
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
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3.5 px-4">Foto</th>
                    <th className="py-3.5 px-4">Nama Laptop &amp; Merk</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Spesifikasi</th>
                    <th className="py-3.5 px-4">Harga</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredLaptops.map((laptop) => {
                    const status = laptop.status || 'Tersedia'
                    const isSold = status.toLowerCase().includes('terjual')
                    const isBooking = status.toLowerCase().includes('booking')

                    return (
                      <tr
                        key={laptop.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Thumbnail */}
                        <td className="py-3 px-4 w-16">
                          <div className="w-14 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {(laptop.image_urls?.[0] || laptop.image_url) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={laptop.image_urls?.[0] || laptop.image_url || ''}
                                alt={laptop.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </td>

                        {/* Name & Brand */}
                        <td className="py-3 px-4 min-w-[180px]">
                          <div className="font-heading font-bold text-sm text-slate-900 group-hover:text-[#1E40AF] transition-colors line-clamp-1">
                            {laptop.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {laptop.brand && (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-bold border border-slate-200">
                                {laptop.brand}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Specs summary */}
                        <td className="py-3 px-4 hidden md:table-cell min-w-[220px]">
                          <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                            {laptop.cpu && (
                              <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <Cpu className="w-3 h-3 text-[#1E40AF]" />
                                <span className="truncate max-w-[120px] font-medium">{laptop.cpu}</span>
                              </span>
                            )}
                            {laptop.ram && (
                              <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <Layers className="w-3 h-3 text-[#1E40AF]" />
                                <span className="font-medium">{laptop.ram}</span>
                              </span>
                            )}
                            {laptop.storage && (
                              <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <HardDrive className="w-3 h-3 text-[#1E40AF]" />
                                <span className="font-medium">{laptop.storage}</span>
                              </span>
                            )}
                            {laptop.gpu && (
                              <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                <Monitor className="w-3 h-3 text-[#1E40AF]" />
                                <span className="truncate max-w-[100px] font-medium">{laptop.gpu}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-heading font-black text-sm text-slate-900">
                            {formatRupiah(laptop.price)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                              isSold
                                ? 'bg-red-50 text-[#DC2626] border-red-200'
                                : isBooking
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-[#1E40AF] hover:border-blue-300 hover:bg-blue-50 transition shadow-sm"
                              title="Edit Data"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(laptop)}
                              className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-[#DC2626] hover:bg-red-100 transition shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1E40AF]">
                  {editingLaptop ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h3 className="font-heading font-black text-lg text-slate-900 uppercase">
                  {editingLaptop ? 'Edit Data Laptop' : 'Tambah Laptop Baru'}
                </h3>
              </div>
              <button
                onClick={() => !formLoading && setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-5 space-y-4">
              {/* Row 1: Name & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nama Laptop / Judul Produk *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Lenovo ThinkPad T14 Gen 2 Core i5 11th"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E40AF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Merk / Brand
                  </label>
                  <input
                    type="text"
                    list="brand-suggestions"
                    placeholder="Contoh: Lenovo"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E40AF] focus:bg-white focus:outline-none"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Harga Promo (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="10000"
                    placeholder="Contoh: 5750000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E40AF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Status Unit
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 font-medium focus:border-[#1E40AF] focus:outline-none"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Processor (CPU)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Intel Core i5-1135G7 @ 2.40GHz"
                    value={formCpu}
                    onChange={(e) => setFormCpu(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E40AF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    RAM
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 16GB DDR4 (Dual Channel)"
                    value={formRam}
                    onChange={(e) => setFormRam(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E40AF] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Storage & GPU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Storage / Penyimpanan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 512GB SSD NVMe High Speed"
                    value={formStorage}
                    onChange={(e) => setFormStorage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E40AF] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Kartu Grafis (GPU / VGA)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Intel Iris Xe Graphics"
                    value={formGpu}
                    onChange={(e) => setFormGpu(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E40AF] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* OCR Poster */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
                      Isi Otomatis dari Poster
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                      OCR berjalan lokal di browser menggunakan Tesseract.js. Tidak ada API eksternal atau API key.
                    </p>
                  </div>
                  <label className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-3.5 py-2 text-xs font-bold text-[#1E40AF] shadow-sm transition hover:bg-blue-50 ${ocrLoading ? 'pointer-events-none opacity-60' : ''}`}>
                    {ocrLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                    <span>{ocrLoading ? 'Membaca Poster...' : 'Scan Poster OCR'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterOcr}
                      disabled={ocrLoading}
                      className="hidden"
                    />
                  </label>
                </div>
                {ocrText && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-[11px] font-semibold text-slate-600">
                      Lihat teks mentah hasil OCR
                    </summary>
                    <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-2 text-[10px] leading-relaxed text-slate-600">
                      {ocrText}
                    </pre>
                  </details>
                )}
              </div>

              {/* Row 5: Foto Laptop */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Foto Unit (Upload ke Supabase Storage &quot;laptop-photos&quot;)
                </label>
                <div className="mt-1 flex items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="relative w-24 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {formImagePreviews.length ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formImagePreviews[0]}
                        alt="Preview Foto"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {/* File Upload Trigger */}
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-[#1E40AF]" />
                      <span>{formImageFiles.length ? 'Ganti Foto Terpilih' : 'Pilih Foto Laptop'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      {formImageFiles.length
                        ? `${formImageFiles.length} foto dipilih`
                        : editingLaptop?.image_url
                          ? 'Unit saat ini telah memiliki foto. Pilih beberapa foto untuk mengganti semuanya.'
                          : 'Format JPG, PNG, atau WebP. Pilih beberapa foto sekaligus, maks 5MB per foto.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Harga Asli & Bonus */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Harga Asli
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Contoh: 7.500.000"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1E40AF] focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Bonus
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Tas, mouse, dan garansi toko"
                    value={FIXED_BONUS}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={formLoading}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-xs sm:text-sm font-bold transition shadow-md disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#DC2626] mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-heading font-black text-lg text-slate-900 mb-2">
              Hapus Data Laptop?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus unit <strong className="text-slate-900 font-bold">{deleteTarget.name}</strong>? Foto unit di storage juga akan dihapus. Aksi ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
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
