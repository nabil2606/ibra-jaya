"use client";

import Link from "next/link";
import { useActionState } from "react";
import { type AuthState } from "@/lib/auth-actions";

type Field = { name: string; label: string; type: string; autoComplete: string; placeholder?: string };

export function AuthForm({
  action,
  fields,
  submitLabel,
  next,
  footer,
}: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  fields: Field[];
  submitLabel: string;
  next?: string;
  footer: { text: string; href: string; label: string };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={`f-${f.name}`} className="label">{f.label}</label>
          <input id={`f-${f.name}`} name={f.name} type={f.type} autoComplete={f.autoComplete} placeholder={f.placeholder} required className="field" />
        </div>
      ))}
      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.error}</p>
      )}
      <button id="btn-submit" type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? "Memproses…" : submitLabel}
      </button>
      <p className="text-center text-sm text-muted">
        {footer.text} <Link href={footer.href} className="font-bold text-brand-dark-700 underline">{footer.label}</Link>
      </p>
    </form>
  );
}
