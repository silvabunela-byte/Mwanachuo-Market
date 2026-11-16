import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      <p className="font-display text-6xl font-bold text-emerald-900">404</p>
      <p className="mt-2">Ukurasa huu haupo.</p>
      <Link href="/" className="btn-primary mt-4">Rudi Sokoni</Link>
    </div>
  );
}
