export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex-1 border-0 shadow-none max-w-5xl overflow-hidden *:px-4 md:*:px-6">
        {children}
      </div>
    </>
  );
}
