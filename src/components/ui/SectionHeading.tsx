export function SectionHeading({ id, eyebrow, title, invert = false }: { id: string; eyebrow: string; title: string; invert?: boolean }) {
  return (
    <div>
      <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${invert ? "text-white/80" : "text-brand-strong"}`}>
        <span className="diamond" aria-hidden /> {eyebrow}
      </p>
      <h2 id={id} className={`mt-1 text-2xl font-extrabold sm:text-3xl ${invert ? "!text-white" : ""}`}>{title}</h2>
      <span className="mt-3 flex items-center gap-1.5" aria-hidden>
        <span className="block h-0.5 w-10 rounded-full bg-brand" />
        <span className="diamond !h-1.5 !w-1.5" />
      </span>
    </div>
  );
}
