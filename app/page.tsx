import Link from "next/link";
import LandingNavAuth from "@/components/landing/LandingNavAuth";

const stats = [
  { value: "4.9/5", label: "Average client rating" },
  { value: "18k+", label: "Invoices generated" },
  { value: "2 min", label: "Average setup time" },
];

const features = [
  {
    title: "Invoice templates that feel custom",
    description:
      "Pick from modern, minimalist templates and tweak colors, terms, and line items instantly.",
  },
  {
    title: "Client-ready in every currency",
    description:
      "Auto-calculate totals, discounts, and taxes with clean formatting for global clients.",
  },
  {
    title: "Send, track, get paid faster",
    description:
      "See when invoices are viewed, add payment links, and follow up with a click.",
  },
  {
    title: "Built for teams and freelancers",
    description:
      "Keep business profiles, contacts, and invoice history organized in one workspace.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your account",
    detail: "Start free and set up your business profile in minutes.",
  },
  {
    step: "02",
    title: "Design your invoice",
    detail: "Choose a template, add line items, and brand it your way.",
  },
  {
    step: "03",
    title: "Send and track",
    detail: "Deliver instantly and stay on top of every payment.",
  },
];

const templates = [
  {
    name: "Studio Edition",
    tone: "Clean, bold headers with spacious layouts.",
    accent: "from-emerald-200/70 to-emerald-50",
  },
  {
    name: "Agency Grid",
    tone: "Structured columns made for multi-service projects.",
    accent: "from-amber-200/70 to-amber-50",
  },
  {
    name: "Consultant Luxe",
    tone: "Soft contrast and premium invoice summaries.",
    accent: "from-slate-200/70 to-slate-50",
  },
];

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 font-sans"
      style={{
        backgroundImage:
          "radial-gradient(1200px 600px at 10% 5%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(900px 500px at 95% 15%, rgba(251,191,36,0.18), transparent 55%), linear-gradient(180deg, #f8fafc 0%, #ffffff 35%, #f1f5f9 100%)",
      }}
    >
      <header className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl animate-[float_14s_ease-in-out_infinite]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-amber-200/50 blur-3xl animate-[float_16s_ease-in-out_infinite]"
        />

        <nav
          className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6"
          aria-label="Primary"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20">
              SX
            </div>
            <div className="leading-tight">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
                Sellyx
              </p>
              <p className="text-lg font-semibold text-slate-900">
                Invoice Studio
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <Link className="hover:text-slate-900" href="#features">
              Features
            </Link>
            <Link className="hover:text-slate-900" href="#features">
              Use cases
            </Link>
            <Link className="hover:text-slate-900" href="#templates">
              Examples
            </Link>
            <Link className="hover:text-slate-900" href="#workflow">
              How it works
            </Link>
          </div>

          <LandingNavAuth />
        </nav>

        <section className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-6 md:grid-cols-[1.08fr_0.92fr] md:pb-24 md:pt-12">
          <div className="space-y-6 animate-[hero-fade_900ms_ease-out]">
            <p className="text-xs uppercase tracking-[0.45em] text-slate-400">
              Modern invoice generator
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Get paid faster with invoices that look
              <span className="block bg-linear-to-r from-emerald-500 via-emerald-600 to-amber-500 bg-clip-text text-transparent">
                premium from day one
              </span>
            </h1>
            <p className="max-w-xl text-base text-slate-600 md:text-lg">
              Sellyx helps freelancers and teams create polished invoices and get
              paid without the busywork.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Create your first invoice
              </Link>
              <Link
                href="#templates"
                className="rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300"
              >
                See invoice examples
              </Link>
            </div>
            <p className="text-xs text-slate-500">No credit card required</p>
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-slate-600">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`flex items-center gap-3 ${
                    index > 0 ? "pl-4 md:border-l md:border-slate-200/70" : ""
                  }`}
                >
                  <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-900 font-semibold">
                    {stat.value}
                  </div>
                  <p className="max-w-[140px] leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <div className="h-44 w-44 rounded-full bg-emerald-200/40 blur-3xl animate-[float_10s_ease-in-out_infinite]" />
            </div>
            <div className="relative rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.15)] backdrop-blur animate-[rise_900ms_ease-out]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Template preview
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Invoice No. SLX-204
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Draft
                  </span>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
                    Edit
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Prepared for</span>
                  <span>Due in 7 days</span>
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  Brightlane Studio
                </div>
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  {[
                    "Brand identity system",
                    "Landing page redesign",
                    "Invoice automation setup",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-lg border-b border-dashed border-slate-200 pb-2 transition hover:bg-slate-50/80"
                    >
                      <span>{item}</span>
                      <span className="font-medium text-slate-900">$680</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white transition">
                  <span className="text-sm">Total due</span>
                  <span className="text-lg font-semibold">$2,040</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span>Sent via Sellyx</span>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <span className="rounded-full border border-slate-200 px-2 py-1">
                    Visa
                  </span>
                  <span className="rounded-full border border-slate-200 px-2 py-1">
                    Stripe
                  </span>
                  <span className="rounded-full border border-slate-200 px-2 py-1">
                    PayPal
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Real-time preview updates as you edit
              </div>
            </div>
          </div>
        </section>
      </header>

      <main className="space-y-20 pb-20">
        <section
          id="features"
          className="mx-auto w-full max-w-6xl px-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Features
              </p>
              <h2 className="text-3xl font-semibold text-slate-900">
                Everything you need to invoice with confidence
              </h2>
            </div>
            <Link
              href="/register"
              className="w-fit rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Start free
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 animate-[rise_700ms_ease-out]"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white text-sm font-semibold">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="templates"
          className="mx-auto w-full max-w-6xl px-6"
        >
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Templates
              </p>
              <h2 className="text-3xl font-semibold text-slate-900">
                Preview invoices before you send them
              </h2>
              <p className="text-base text-slate-600">
                Mix layouts, adjust color accents, and keep your brand
                consistent across every invoice.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Build my first invoice
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.name}
                  className={`rounded-3xl border border-white/70 bg-linear-to-br ${template.accent} p-4 shadow-[0_16px_30px_rgba(15,23,42,0.1)]`}
                >
                  <div className="rounded-2xl bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {template.name}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {template.tone}
                    </p>
                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      <div className="h-2 w-full rounded-full bg-slate-200" />
                      <div className="h-2 w-3/4 rounded-full bg-slate-200" />
                      <div className="h-2 w-1/2 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="mx-auto w-full max-w-6xl px-6"
        >
          <div className="rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.12)] md:p-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  How it works
                </p>
                <h2 className="text-3xl font-semibold text-slate-900">
                  From signup to paid in three steps
                </h2>
              </div>
              <Link
                href="/login"
                className="w-fit rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <div className="text-sm font-semibold text-emerald-600">
                    {step.step}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-[36px] bg-slate-900 px-8 py-12 text-white shadow-[0_25px_60px_rgba(15,23,42,0.25)] md:px-12">
            <div className="absolute -top-16 right-10 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold">
                  Ready to send your first invoice?
                </h2>
                <p className="mt-3 max-w-xl text-sm text-slate-300">
                  Build a free account, preview your template, and start billing
                  clients today.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 pb-10 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>2026 Sellyx. Crafted for modern invoicing.</p>
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/login" className="hover:text-slate-900">
            Login
          </Link>
          <Link href="/register" className="hover:text-slate-900">
            Register
          </Link>
          <Link href="/dashboard" className="hover:text-slate-900">
            Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
