import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertProjectAccess } from "@/lib/auth-guard";
import { getProjectOverviewAction } from "@/actions/project-actions";
import { getProjectVendors, getMasterVendors } from "@/services/vendor-service";
import { ProjectVendorsClient } from "@/components/admin/project-vendors-client";

export const dynamic = "force-dynamic";

interface ProjectVendorsPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectVendorsPage({
  params,
}: ProjectVendorsPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const access = await assertProjectAccess(session, params.projectId);
  if (!access.success) {
    notFound();
  }

  const [projectRes, slotsRes, masterVendorsRes] = await Promise.all([
    getProjectOverviewAction(params.projectId),
    getProjectVendors(params.projectId),
    getMasterVendors({ isActive: true }),
  ]);

  if (!projectRes.success) {
    notFound();
  }

  const project = projectRes.data;
  const initialSlots = slotsRes.success ? slotsRes.data : [];
  const masterVendors = masterVendorsRes.success ? masterVendorsRes.data : [];

  const canManage =
    session.role === "OWNER" ||
    session.role === "MANAGEMENT" ||
    project.leadPlannerId === session.userId;

  return (
    <ProjectVendorsClient
      project={project}
      initialSlots={initialSlots}
      masterVendors={masterVendors}
      canManage={canManage}
    />
  );
}
