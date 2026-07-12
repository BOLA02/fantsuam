// components/apply/section-header.tsx
// FULL FILE — back on semantic tokens now that muted-foreground has real contrast

'use client';

interface Props {
  icon: React.ElementType;
  title: string;
  hint?: string;
}

export function SectionHeader({ icon: Icon, title, hint }: Props) {
  return (
    <div className="mb-3 mt-1 flex items-center gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon size={13} />
      </div>
      <h3 className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </h3>
      <div className="h-px flex-1 bg-border" />
      {hint && <span className="whitespace-nowrap text-[11px] text-muted-foreground/80">{hint}</span>}
    </div>
  );
}