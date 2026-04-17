interface SkeletonBlockProps {
  label?: string;
  height?: string;
}

export function SkeletonBlock({
  label = "Content coming soon",
  height = "h-32",
}: SkeletonBlockProps) {
  return (
    <div
      className={`${height} rounded-lg border border-neutral-800 border-dashed bg-neutral-900/40 flex items-center justify-center`}
    >
      <span className="font-mono text-neutral-700 text-xs uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

interface PageShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageShell({ title, subtitle, icon, children }: PageShellProps) {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Heading */}
      <div className="mb-10">
        {icon && <div className="opacity-80 mb-3 text-accent">{icon}</div>}
        <h1 className="font-display text-neutral-100 text-4xl tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 font-mono text-neutral-500 text-xs leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="bg-gradient-to-r from-accent to-transparent mt-4 w-24 h-px" />
      </div>

      {/* Slot for actual content */}
      {children ?? (
        <div className="space-y-4">
          <SkeletonBlock height="h-24" />
          <SkeletonBlock height="h-16" />
          <SkeletonBlock height="h-32" />
        </div>
      )}
    </div>
  );
}
