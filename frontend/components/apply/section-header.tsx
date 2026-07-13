// components/apply/section-header.tsx
// NEW FILE — interface inferred from usage in Step1/2/3
// (`<SectionHeader icon={X} title="..." />`, optionally with `hint`).

interface Props {
  icon: React.ElementType;
  title: string;
  hint?: string;
}

export function SectionHeader({ icon: Icon, title, hint }: Props) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon size={14} />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {hint && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {hint}
        </span>
      )}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}