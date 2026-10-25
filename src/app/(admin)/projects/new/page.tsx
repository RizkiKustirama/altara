import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCreateForm } from "@/components/admin/project-create-form";

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Registrasi Proyek Pernikahan Baru
          </h1>
          <p className="text-xs text-muted-foreground">
            Masukkan data pengantin dan tanggal acara. Token publik akan terbuat otomatis.
          </p>
        </div>
      </div>

      <ProjectCreateForm />
    </div>
  );
}
