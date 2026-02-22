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
};

export default function Logo({ size = "xl" }: Props) {
  return (
    <div className="flex flex-col items-start leading-none select-none">
      <div className={`font-bold tracking-tighter ${mainSizeMap[size]}`}>
        <span className="text-neutral-400">Plan</span>
        <span className="text-primary">Node</span>
      </div>

      <div className="h-1 w-full bg-linear-to-r from-primary to-transparent rounded-full mt-0.5" />
    </div>
  );
}
