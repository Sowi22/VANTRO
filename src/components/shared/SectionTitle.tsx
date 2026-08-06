import { cn } from "@/lib/utils";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      {subtitle ? <p className="max-w-2xl text-muted">{subtitle}</p> : null}
    </div>
  );
}
