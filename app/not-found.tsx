
import Link from "next/link";

/**
 * Vista 404 con link de retorno.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6 text-center">
      <div className="max-w-[420px]">
        <h1 className="text-[120px] font-bold text-bone leading-none mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-3">Página no encontrada</h2>
        <p className="text-ink-3 mb-8">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
        <Link 
          href="/payments/methods" 
          className="inline-flex items-center justify-center px-8 h-12 bg-forest text-paper rounded-full font-medium transition-transform active:scale-95"
        >
          Volver a pagos
        </Link>
      </div>
    </div>
  );
}
