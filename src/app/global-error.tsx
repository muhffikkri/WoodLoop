"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="bg-canvas text-ink-900 flex min-h-svh items-center justify-center p-5">
          <section className="border-danger/20 bg-danger-bg w-full max-w-lg rounded-lg border p-6">
            <h1 className="font-heading text-xl font-semibold">
              WoodLoop needs to reload
            </h1>
            <p className="text-ink-600 mt-2 text-sm leading-6">
              A page-level recovery was not available. Your browser-local demo
              data has not been intentionally cleared.
            </p>
            <button
              type="button"
              onClick={reset}
              className="bg-brand-900 mt-5 min-h-12 rounded-md px-5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
