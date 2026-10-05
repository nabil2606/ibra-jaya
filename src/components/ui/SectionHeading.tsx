export function SectionHeading({ id, eyebrow, title, invert = false }: { id: string; eyebrow: string; title: string; invert?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-brand-orange-dark">{eyebrow}</p>
      <h2 id={id} className={`mt-1 text-2xl font-extrabold sm:text-3xl ${invert ? "!text-white" : ""}`}>{title}</h2>
      <span className="mt-3 block h-1 w-12 rounded-full bg-brand-orange" aria-hidden />
    </div>
  );
}
