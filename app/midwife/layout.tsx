export default function MidwifeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* BottomNav (and EmergencyBell for mother) mounted here in Phase 4 */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
