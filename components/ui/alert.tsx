type Props = {
  title?: string;
  description: string;
};

export function Alert({ title, description }: Props) {
  return (
    <div className="rounded-lg border border-yellow-500/50 px-4 py-3 text-sm flex flex-col gap-1.5">
      {title && <p className="font-semibold text-yellow-600">{title}</p>}
      <p className="text-yellow-600">{description}</p>
    </div>
  );
}
