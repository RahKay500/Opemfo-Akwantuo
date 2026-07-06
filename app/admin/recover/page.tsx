import RecoverForm from "./RecoverForm";

export default function AdminRecoverPage() {
  return (
    <main className="flex min-h-screen min-w-[1024px] items-center justify-center bg-[#F8FAFC] font-body">
      <div className="w-full max-w-sm rounded-lg border border-[#E2E8F0] bg-white p-8 shadow-sm">
        <p className="text-center text-sm font-medium text-[#6B7280]">Ɔpemfoɔ Akwantuo</p>
        <h1 className="mt-1 text-center text-xl font-semibold text-[#1A1A2E]">Recover Admin Access</h1>
        <p className="mt-2 text-center text-sm text-[#6B7280]">
          Only works with the server&apos;s own SUPER_ADMIN_PHONE/SUPER_ADMIN_PASSWORD config — for whoever controls
          deployment, not day-to-day sign-in.
        </p>
        <div className="mt-6">
          <RecoverForm />
        </div>
      </div>
    </main>
  );
}
