# Aniplay

Aplikasi streaming anime (React + Vite + Tailwind v4), siap deploy ke Vercel.

## Struktur

- `src/` — frontend React (Vite)
- `api/proxy.ts` — Vercel Serverless Function yang menggantikan `server.ts` (proxy ke Supabase & API anime: Animasu/Samehadaku via sankavollerei)
- `vercel.json` — konfigurasi build & SPA rewrite

## Deploy ke Vercel

1. Push folder ini ke repo GitHub.
2. Import project di [vercel.com/new](https://vercel.com/new), pilih repo tersebut.
3. Di tab **Environment Variables**, tambahkan:
   - `SUPABASE_URL` — URL project Supabase kamu
   - `SUPABASE_ANON_KEY` — anon/public key Supabase
   - `ANIME_API_KEY` — (opsional, default `planaai`)
4. Klik **Deploy**. Vercel otomatis menjalankan `vite build` untuk frontend dan mendeploy `api/proxy.ts` sebagai serverless function.

Setelah deploy, semua request dari frontend ke `/api/proxy?route=...` akan otomatis diarahkan ke serverless function tersebut — tidak perlu konfigurasi tambahan.

## Run Locally

**Prerequisites:** Node.js, [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)

1. Install dependencies:
   `npm install`
2. Copy `.env.example` ke `.env` lalu isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.
3. Jalankan dengan Vercel CLI agar serverless function di `api/` juga aktif:
   `vercel dev`

   (Menjalankan `npm run dev` murni hanya akan start Vite tanpa endpoint `/api/proxy` — untuk testing API lokal wajib pakai `vercel dev`.)
