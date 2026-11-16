import { supabaseConfigured } from "@/lib/supabase";

export default function SetupNotice() {
  if (supabaseConfigured) return null;
  return (
    <div className="mb-6 rounded-xl border-2 border-amber-500 bg-amber-100 p-4 text-sm">
      <strong>Supabase haijaunganishwa.</strong> Weka <code>NEXT_PUBLIC_SUPABASE_URL</code> na{" "}
      <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> kwenye environment variables.
    </div>
  );
}
