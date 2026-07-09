import ActivateAdminForm from "./ActivateAdminForm";

export default function AdminActivatePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F8FAFC] px-4 font-body">
      <div className="w-full max-w-sm rounded-lg border border-[#E2E8F0] bg-white p-8 shadow-sm">
        <p className="text-center text-sm font-medium text-[#6B7280]">Ɔpemfoɔ Akwantuo</p>
        <h1 className="mt-1 text-center text-xl font-semibold text-[#1A1A2E]">Activate Facility Admin Account</h1>
        <p className="mt-2 text-center text-sm text-[#6B7280]">
          If the Super Admin has added you as a Facility Admin, enter your phone number to get started.
        </p>
        <div className="mt-6">
          <ActivateAdminForm />
        </div>
      </div>
    </main>
  );
}
