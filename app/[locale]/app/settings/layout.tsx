import { NavSettings } from "@/components/settings/nav-settings";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavSettings />

      <div className="max-w-5xl overflow-hidden *:px-4 md:*:px-6 mx-auto">
        {children}
      </div>
    </>
  );
}
