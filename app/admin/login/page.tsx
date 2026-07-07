import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 font-body">
      <div className="w-full max-w-sm rounded-lg border border-[#E2E8F0] bg-white p-8 shadow-sm">
        <p className="text-center text-sm font-medium text-[#6B7280]">Ɔpemfoɔ Akwantuo</p>
        <h1 className="mt-1 text-center text-xl font-semibold text-[#1A1A2E]">Admin Portal</h1>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
