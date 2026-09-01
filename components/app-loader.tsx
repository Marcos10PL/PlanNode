import { AppLogo } from "./app-logo";

const spinnerArcClass =
  "absolute inset-0 rounded-full border-4 border-l-transparent border-r-transparent border-b-transparent opacity-90 will-change-transform [animation:spin_950ms_cubic-bezier(0.45,0.15,0.1,0.9)_infinite] drop-shadow-[0_0_4px_currentColor]";

export function AppLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="relative mx-auto size-50">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full border-4 border-white/20"
        />
        <div className={`${spinnerArcClass} border-t-primary`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <AppLogo size="2xl" className="animate-pulse" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-b from-transparent via-transparent to-background/45"
        />
      </div>
    </div>
  );
}
