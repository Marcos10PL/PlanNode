import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";

export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-6 p-6">
      <NoWorkspaceBanner />
    </div>
  );
}
