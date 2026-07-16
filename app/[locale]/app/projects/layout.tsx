export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 border-0 shadow-none *:px-4 md:*:px-6">
      {children}
    </div>
  );
}
