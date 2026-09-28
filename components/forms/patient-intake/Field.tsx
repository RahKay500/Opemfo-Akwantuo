// Shared with RegisterPatientForm/EditPatientForm's own local Field —
// pulled out so the new intake-step components can use the identical
// label style without importing a component private to those two files.
export default function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="font-body text-[13px] font-medium text-text-secondary">{label}</label>
      {hint && <p className="mt-0.5 font-body text-xs text-text-secondary/70">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
