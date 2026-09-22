# Laptop Fix Makassar Web

Project web aplikasi **Laptop Fix Makassar** berbasis **Next.js 14 (App Router, TypeScript, Tailwind CSS)** dengan integrasi autentikasi **Supabase SSR** (`@supabase/ssr` & `@supabase/supabase-js`).

## 📁 Struktur File Utama

- **`lib/supabase/client.ts`**: Supabase client untuk Client Components (menggunakan `createBrowserClient`).
- **`lib/supabase/server.ts`**: Supabase client untuk Server Components & Server Actions (menggunakan `createServerClient` dan `cookies()` dari `next/headers`).
- **`lib/supabase/middleware.ts`**: Helper penyegaran token sesi Supabase dan logika redirect.
- **`middleware.ts`**: Next.js Middleware di root yang melindungi seluruh rute `/admin/*` (kecuali `/admin/login`).
- **`.env.local.example`**: Template environment variable untuk URL dan Anon Key Supabase.
- **`app/admin/login/page.tsx`**: Halaman login admin dengan form autentikasi email & password.
- **`app/admin/page.tsx`**: Halaman dashboard admin terproteksi (Server Component).

## 🚀 Memulai (Getting Started)

1. Salin file environment:
   ```bash
   cp .env.local.example .env.local
   ```
2. Isi nilai `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di file `.env.local` dengan kredensial project Supabase Anda.
3. Install dependencies (jika belum):
   ```bash
   npm install
   ```
4. Jalankan server development:
   ```bash
   npm run dev
   ```
5. Buka [http://localhost:3000](http://localhost:3000) di browser.
