import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCreateForm } from "@/components/admin/project-create-form";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function NewProjectPage() {
  const planners = await db.query.users.findMany({
    where: eq(users.isActive, true),
    columns: { id: true, fullName: true, role: true },
    orderBy: [users.fullName],
  });

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
            Masukkan data pengantin, tanggal acara, dan tunjuk Lead Planner (PM). Token publik akan terbuat otomatis.
          </p>
        </div>
      </div>

      <ProjectCreateForm availablePlanners={planners} />
    </div>
  );
}
