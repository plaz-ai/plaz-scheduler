import AgendaLoader from '@/features/agenda/AgendaLoader';

// Static export (output: 'export') + GitHub Pages + rutas dinámicas:
// - generateStaticParams con un placeholder registra el route en el JS bundle del cliente
// - dynamicParams = false es requerido por output: 'export'
// - GitHub Pages sirve 404.html para paths desconocidos; el client router de Next.js
//   detecta el path real y renderiza el componente correcto via useParams()
export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function Page() {
  return <AgendaLoader />;
}
