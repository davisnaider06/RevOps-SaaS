import { redirect } from "next/navigation";

export default function RootPage() {
  // Redireciona sempre para o dashboard
  // O dashboard vai checar se tem login. Se não tiver, manda pro login.
  redirect("/dashboard");
}