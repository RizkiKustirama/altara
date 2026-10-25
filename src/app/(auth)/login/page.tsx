import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Beranda
      </Link>

      <Card className="border-border/80 shadow-sm bg-card">
        <CardHeader className="space-y-1.5 pb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Altara Wedding Studio
          </div>
          <CardTitle className="text-2xl font-serif font-bold tracking-tight text-foreground">
            Masuk ke Sistem Kantor
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Akses operasional internal wedding organizer, timeline, vendor, dan rundown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <React.Suspense
            fallback={
              <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                Memuat formulir masuk...
              </div>
            }
          >
            <LoginForm />
          </React.Suspense>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Hak Cipta © 2026 Altara Wedding Studio. Sistem Eksklusif Single-Tenant.
      </p>
    </div>
  );
}
