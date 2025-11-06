const Hello = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-100 flex items-center justify-center px-6 py-16">
      <div className="relative max-w-xl w-full rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="absolute -top-20 -right-12 h-40 w-40 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-44 w-44 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="relative px-10 py-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-sky-600">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4m0 12v4m8-8h-4m-12 0H2m15.78 5.78L15 15m-6 0-2.78 2.78M9 9 6.22 6.22M18 6.22 15.78 9" />
            </svg>
            Hello there
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Your invoice companion says hi! 👋
          </h1>
          <p className="mt-4 text-base text-gray-600">
            Jump in to craft sleek invoices, monitor outstanding payments, and keep your business looking sharp with a
            polished interface.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <button className="w-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-sky-600 hover:to-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 sm:w-auto">
              Start building
            </button>
            <button className="w-full rounded-full border border-indigo-200 px-6 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-400 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 sm:w-auto">
              Take a tour
            </button>
          </div>
        </div>
        <div className="relative flex flex-col items-start gap-4 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-10 py-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <path d="M3 17h7v4H3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Quick tip</p>
              <p className="mt-1 text-base font-semibold">Preview your invoice layout in real time.</p>
            </div>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-600 shadow-md transition hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
          >
            Open preview
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hello;
