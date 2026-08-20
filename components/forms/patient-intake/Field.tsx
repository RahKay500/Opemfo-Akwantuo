// Shared with RegisterPatientForm/EditPatientForm's own local Field —
// pulled out so the new intake-step components can use the identical
// label style without importing a component private to those two files.
export default function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="font-body text-[13px] font-medium text-text-secondary">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
