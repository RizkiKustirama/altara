import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertProjectAccess } from "@/lib/auth-guard";
import { getProjectOverviewAction } from "@/actions/project-actions";
import { getProjectRundowns } from "@/services/rundown-service";
import { getWeddingPartyMembers } from "@/services/wedding-party-service";
import { getEventTemplates } from "@/services/template-service";
import { ProjectRundownClient } from "@/components/admin/project-rundown-client";

export const dynamic = "force-dynamic";

interface ProjectRundownPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectRundownPage({
  params,
}: ProjectRundownPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const access = await assertProjectAccess(session, params.projectId);
  if (!access.success) {
    notFound();
  }

  const [projectRes, rundownItems, familyMembers, templates] = await Promise.all([
    getProjectOverviewAction(params.projectId),
    getProjectRundowns(params.projectId),
    getWeddingPartyMembers(params.projectId),
    getEventTemplates(),
  ]);

  if (!projectRes.success) {
    notFound();
  }

  const project = projectRes.data;

  const canManage =
    session.role === "OWNER" ||
    session.role === "MANAGEMENT" ||
    project.leadPlannerId === session.userId;

  return (
    <ProjectRundownClient
      project={project}
      initialItems={rundownItems}
      familyMembers={familyMembers}
      templates={templates}
      canManage={canManage}
    />
  );
}
