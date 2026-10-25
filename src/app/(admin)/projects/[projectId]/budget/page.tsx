import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertProjectAccess } from "@/lib/auth-guard";
import { getProjectOverviewAction } from "@/actions/project-actions";
import { getProjectBudgetOverview } from "@/services/budget-service";
import { getProjectVendors } from "@/services/vendor-service";
import { ProjectBudgetClient } from "@/components/admin/project-budget-client";

export const dynamic = "force-dynamic";

interface ProjectBudgetPageProps {
  params: {
    projectId: string;
  };
}

export default async function ProjectBudgetPage({
  params,
}: ProjectBudgetPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const access = await assertProjectAccess(session, params.projectId);
  if (!access.success) {
    notFound();
  }

  const [projectRes, budgetOverview, vendorsRes] = await Promise.all([
    getProjectOverviewAction(params.projectId),
    getProjectBudgetOverview(params.projectId),
    getProjectVendors(params.projectId),
  ]);

  if (!projectRes.success || !projectRes.data || !budgetOverview) {
    notFound();
  }

  const project = projectRes.data;

  const projectVendors = (vendorsRes.success && vendorsRes.data ? vendorsRes.data : []).map(
    (v) => ({
      id: v.slotId,
      vendorName: v.vendorName,
      category: v.category,
    })
  );

  const canManage =
    session.role === "OWNER" ||
    session.role === "MANAGEMENT" ||
    project.leadPlannerId === session.userId;

  return (
    <ProjectBudgetClient
      project={project}
      initialOverview={budgetOverview}
      projectVendors={projectVendors}
      canManage={canManage}
    />
  );
}
