import { Suspense } from "react";
import { Snowflake } from "lucide-react";
import { FormularioLogin } from "./formulario";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  const siguiente = searchParams.then(({ siguiente }) => (typeof siguiente === "string" ? siguiente : "/"));

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-marca-900 via-marca-800 to-marca-600 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-marca-600 text-white">
            <Snowflake size={24} />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Ártica</h1>
            <p className="text-xs text-slate-500">Ingenieros Especialistas en HVAC</p>
          </div>
        </div>
        <Suspense>
          <FormularioLogin siguiente={siguiente} />
        </Suspense>
      </div>
    </main>
  );
}
