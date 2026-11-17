import Navbar from "@/components/Navbar";

export default function MawasilianoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC] py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-4">Mawasiliano</h1>
          <p className="text-gray-600">Andika maelezo yako hapa.</p>
        </div>
      </main>
    </>
  );
}
