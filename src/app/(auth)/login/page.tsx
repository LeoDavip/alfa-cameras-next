import { LoginForm } from "@/components/features/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="bg-background p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Alfa Câmeras</h1>
        <LoginForm />
      </div>
    </div>
  );
}
