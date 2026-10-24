import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, ShieldCheck, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
          Altara Wedding Studio - Single-Tenant System
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
          Sistem Manajemen Operasional Wedding Organizer
        </h1>
        
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          Platform terintegrasi untuk penanganan multi-acara pernikahan akhir pekan: validasi anti-bentrok kru,
          manajemen vendor rekanan, master rundown, dan portal pengantin.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <Card>
            <CardHeader className="pb-2">
              <Calendar className="w-5 h-5 text-primary mb-1" />
              <CardTitle className="text-base">Anti-Bentrok Skuad</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Validasi ketersediaan kru real-time pada tanggal acara yang sama.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Users className="w-5 h-5 text-primary mb-1" />
              <CardTitle className="text-base">Vendor & Rundown</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Slotting rekanan dengan pintas WhatsApp serta master rundown cue sheet.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <ShieldCheck className="w-5 h-5 text-primary mb-1" />
              <CardTitle className="text-base">Privasi Dapur Bisnis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Isolasi Dual-Tier: Margin laba dan honor harian terproteksi eksklusif Owner.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/login">Masuk ke Sistem Kantor</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Lihat Dashboard Operasional</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
