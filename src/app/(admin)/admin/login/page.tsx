import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Admin Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="mb-1 font-display text-2xl font-semibold">Rise Up Together</h1>
        <p className="mb-6 text-sm text-muted-foreground">Admin sign in</p>
        <LoginForm from={from} />
      </div>
    </div>
  );
}
