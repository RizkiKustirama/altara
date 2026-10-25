"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/actions/auth-actions";
import { LoginSchema } from "@/schemas/auth-schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi klien cepat
    const validation = LoginSchema.safeParse({ email, password });
    if (!validation.success) {
      const err = validation.error.errors[0]?.message ?? "Input belum valid";
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAction({ email, password });

      if (!result.success) {
        setErrorMessage(result.error.message);
        toast.error(result.error.message);
        setIsLoading(false);
        return;
      }

      toast.success(`Selamat datang kembali, ${result.data.user.fullName}!`);
      
      const targetDestination = callbackUrl || result.data.redirectTo;
      router.push(targetDestination);
      router.refresh();
    } catch {
      const fallbackErr = "Terjadi gangguan jaringan saat memproses login.";
      setErrorMessage(fallbackErr);
      toast.error(fallbackErr);
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setErrorMessage(null);
    toast.info(`Akun demo ${demoRole} siap digunakan.`);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 text-sm rounded-md bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Alamat Email Kerja
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="email"
              type="email"
              placeholder="nama@altara.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="pl-9 bg-card border-border/80 focus-visible:ring-primary"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Kata Sandi
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="pl-9 pr-10 bg-card border-border/80 focus-visible:ring-primary"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full font-medium mt-2"
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Memverifikasi Akun...
            </>
          ) : (
            <>
              Masuk ke Sistem
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Demo Credentials Picker - Developer / Evaluator Helper */}
      <div className="pt-4 border-t border-border/60">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Isi Cepat Akun Demo (Testing):</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill("dimas@altara.id", "Dimas (Owner)")}
            className="text-xs py-1.5 px-2 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-border/50 text-center font-medium transition-colors"
          >
            Dimas (Owner)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("sarah@altara.id", "Sarah (Planner)")}
            className="text-xs py-1.5 px-2 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-border/50 text-center font-medium transition-colors"
          >
            Sarah (Planner)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("rian@altara.id", "Rian (Crew)")}
            className="text-xs py-1.5 px-2 rounded-md bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-border/50 text-center font-medium transition-colors"
          >
            Rian (Kru)
          </button>
        </div>
      </div>
    </div>
  );
}
