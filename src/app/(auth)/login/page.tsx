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
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('login-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          var btn = this.querySelector('button');
          var oldErr = document.getElementById('login-error');
          if (oldErr) oldErr.remove();
          btn.disabled = true;
          btn.textContent = 'Entrando...';

          try {
            var res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams(new FormData(this)).toString()
            });
            if (res.ok) {
              var data = await res.json();
              document.cookie = 'token=' + data.token + '; path=/; max-age=900; SameSite=Lax';
              window.location.href = '/dashboard';
            } else {
              var data = await res.json();
              var p = document.createElement('p');
              p.id = 'login-error';
              p.className = 'text-sm text-red-500';
              p.textContent = data.error || 'Erro ao fazer login';
              btn.parentNode.insertBefore(p, btn);
            }
          } catch(ex) {
            var p = document.createElement('p');
            p.id = 'login-error';
            p.className = 'text-sm text-red-500';
            p.textContent = 'Erro de conexão';
            btn.parentNode.insertBefore(p, btn);
          } finally {
            btn.disabled = false;
            btn.textContent = 'Entrar';
          }
        });
      ` }} />
    </div>
  );
}
