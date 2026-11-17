# Mwanachuo Market

Soko la wanachuo Tanzania (Next.js 14 + Tailwind + Supabase).

## Kuanza
1. `npm install`
2. Nakili `.env.example` kuwa `.env.local` kisha weka `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` na `NEXT_PUBLIC_ADMIN_WHATSAPP`.
3. Kwenye Supabase > SQL Editor, endesha yote yaliyo kwenye `supabase-setup.sql` (tables, policies, storage bucket `product-images`).
4. `npm run dev` kisha fungua http://localhost:3000

## Kurasa
- `/` Soko, `/blog` Blogu, `/kuhusu` Kuhusu Sisi, `/tangaza` Bei za matangazo, `/admin` Admin (PIN `2026`, badilisha kwenye `src/lib/config.ts`).
