export function AuthShell({ title, subtitle, notice, children }: { title: string; subtitle: string; notice?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-[24px] bg-white p-6 shadow-float sm:p-8">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        {notice && <p role="status" className="mt-4 rounded-xl bg-navy-50 px-4 py-3 text-sm font-medium text-navy-800">{notice}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
