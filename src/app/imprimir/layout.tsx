import { Suspense } from "react";

export default function ImprimirLayout({ children }: LayoutProps<"/imprimir">) {
  return <Suspense>{children}</Suspense>;
}
