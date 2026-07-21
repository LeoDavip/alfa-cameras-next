import LoginHandler from "@/components/features/login-handler"

export default async function LoginPage(props: { searchParams?: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error;

  const errors: Record<string, string> = {
    invalid: "Credenciais inválidas",
    required: "Email e senha obrigatórios",
    rate_limit: "Muitas tentativas. Aguarde 1 minuto.",
    locked: "Conta bloqueada temporariamente. Tente novamente mais tarde.",
    internal: "Erro interno do servidor",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="bg-background p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Alfa Câmeras</h1>
        <form id="login-form" method="POST" className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{errors[error] || error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium"
          >
            Entrar
          </button>
        </form>
      </div>
      <LoginHandler />
    </div>
  );
}
