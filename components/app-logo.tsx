import Link from "next/link";

type Sizes = "sm" | "md" | "xl" | "lg" | "2xl" | "3xl" | "4xl" | "5xl";

type Props = {
  size?: Sizes;
};

const mainSizeMap: Record<Sizes, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
} as const;

export default function AppLogo({ size = "xl" }: Props) {
  return (
    <Link
      href="/"
      className="flex flex-col items-start leading-none select-none max-w-fit"
    >
      <div className={`font-bold tracking-tighter ${mainSizeMap[size]}`}>
        <span className="text-neutral-400 font-bold">Plan</span>
        <span className="text-primary">Node</span>
      </div>

      <div className="h-1 w-full bg-linear-to-r from-primary to-transparent rounded-full mt-0.5" />
    </Link>
  );
}
