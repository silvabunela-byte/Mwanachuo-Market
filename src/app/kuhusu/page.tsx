import Navbar from "@/components/Navbar";

export default function KuhusuPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-2xl p-4">
        <h1 className="text-2xl font-extrabold">Kuhusu Sisi</h1>
        <p className="mt-2 text-slate-600">Maelezo yako hapa...</p>
      </main>
    </div>
  );
}
