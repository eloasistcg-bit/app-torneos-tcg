import Link from 'next/link';

export const metadata = {
  title: 'Omni Route – El Oasis TCG',
  description: 'Ruta omni para el proyecto El Oasis TCG',
};

export default function OmniRoutePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto rounded-3xl border border-slate-700 bg-slate-950/90 shadow-2xl p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-300">Omni Route</h1>
          <p className="mt-3 text-slate-400">Esta es la nueva ruta `/omniroute` para tu app de torneos.</p>
        </header>

        <section className="space-y-6 text-slate-200">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-700 p-6">
            <h2 className="text-2xl font-semibold text-white">Bienvenida Omni</h2>
            <p className="mt-3 text-slate-300">
              Usa esta ruta como punto de entrada adicional. Puedes ampliarla para mostrar información especial, enlaces a eventos, integraciones o cualquier contenido compartido desde un punto central.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/" className="block rounded-2xl border border-blue-600 bg-blue-600/10 p-5 text-center text-white transition hover:border-blue-500 hover:bg-blue-600/20">
              Volver al calendario
            </Link>
            <Link href="/registro" className="block rounded-2xl border border-teal-500 bg-teal-500/10 p-5 text-center text-white transition hover:border-teal-400 hover:bg-teal-500/20">
              Ir al registro
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 text-sm text-slate-400">
            <p className="font-semibold text-slate-200">Detalles técnicos</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-slate-400">
              <li>Ruta creada en <code className="rounded bg-slate-900 px-1 py-0.5">app/omniroute/page.tsx</code>.</li>
              <li>Se puede extender como página de aterrizaje especial o centro unificado.</li>
              <li>Funciona con el App Router de Next.js 16.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

