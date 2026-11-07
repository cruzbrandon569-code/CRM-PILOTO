export default function ConfigurarPage() {
  return (
    <main className="mx-auto max-w-xl p-10">
      <h1 className="text-xl font-semibold">Falta conectar Supabase</h1>
      <p className="mt-3 text-sm text-slate-600">
        Copia <code>.env.example</code> como <code>.env.local</code>, llena la URL y la publishable key de tu proyecto de
        Supabase y reinicia <code>npm run dev</code>. Los pasos completos están en el README.
      </p>
    </main>
  );
}
