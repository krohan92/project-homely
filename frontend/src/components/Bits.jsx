export const PageHead = ({ title, subtitle, action, testId }) => (
  <div className="mb-10 flex flex-wrap items-end justify-between gap-4 rise" data-testid={testId}>
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Homely</p>
      <h1 className="mt-2 font-display text-4xl font-black tracking-tighter sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-xl text-base leading-relaxed text-foreground/70">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Card = ({ children, className = "", ...rest }) => (
  <section
    className={`rounded-3xl border border-border bg-card p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8 ${className}`}
    {...rest}
  >
    {children}
  </section>
);

export const CardTitle = ({ icon: Icon, children, right }) => (
  <div className="mb-6 flex items-center justify-between gap-3">
    <h3 className="flex items-center gap-2 font-display text-xl font-bold">
      {Icon && <Icon className="h-5 w-5 text-primary" strokeWidth={2.4} />}
      {children}
    </h3>
    {right}
  </div>
);

export const Pill = ({ children, tone = "muted" }) => {
  const tones = {
    muted: "bg-muted text-foreground/70",
    primary: "bg-primary/15 text-primary",
    sage: "bg-secondary text-secondary-foreground",
    sun: "bg-accent text-accent-foreground",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>
  );
};

export const Empty = ({ children }) => (
  <p className="py-10 text-center text-sm text-muted-foreground">{children}</p>
);
