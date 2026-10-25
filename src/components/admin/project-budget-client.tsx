"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BudgetSummaryCard } from "./budget-summary-card";
import { BudgetCategoryTable } from "./budget-category-table";
import { VendorInvoiceTable } from "./vendor-invoice-table";
import { ClientMilestoneCard } from "./client-milestone-card";
import { BudgetItemDialog } from "./budget-item-dialog";
import { VendorInvoiceDialog } from "./vendor-invoice-dialog";
import { ClientMilestoneDialog } from "./client-milestone-dialog";
import type { ProjectBudgetOverviewDTO } from "@/services/budget-service";
import type { ProjectBudget } from "@/db/schema/operational-budgets";
import {
  ArrowLeft,
  Calendar,
  Building,
  Users,
  Building2,
  Clock,
  Wallet,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface ProjectBudgetClientProps {
  project: {
    id: string;
    projectName: string;
    weddingDate: string;
    venueName: string;
    clientGroomName: string;
    clientBrideName: string;
    status: string;
    leadPlannerId?: string | null;
    leadPlannerName?: string | null;
  };
  initialOverview: ProjectBudgetOverviewDTO;
  projectVendors: Array<{
    id: string;
    vendorName: string;
    category: string;
  }>;
  canManage: boolean;
}

export function ProjectBudgetClient({
  project,
  initialOverview,
  projectVendors,
  canManage,
}: ProjectBudgetClientProps) {
  const router = useRouter();
  const [overview, setOverview] = useState<ProjectBudgetOverviewDTO>(initialOverview);

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectBudget | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sync when initialOverview changes
  React.useEffect(() => {
    setOverview(initialOverview);
  }, [initialOverview]);

  const { metrics, categories, vendorInvoices, milestones } = overview;

  let formattedDate = project.weddingDate;
  try {
    const parsed = parseISO(project.weddingDate);
    formattedDate = format(parsed, "EEEE, d MMMM yyyy", { locale: localeId });
  } catch {
    // fallback
  }

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (item: ProjectBudget) => {
    setEditingCategory(item);
    setCategoryDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Link
            href="/projects"
            className="hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Daftar Proyek</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">
            {project.projectName}
          </span>
          <span>/</span>
          <span className="text-foreground font-medium">Bujet Operasional</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-xs h-7 gap-1 text-stone-600 hover:text-stone-900"
        >
          <RefreshCw
            className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>Segarkan Data</span>
        </Button>
      </div>

      {/* Project Header Card */}
      <Card className="p-6 rounded-xl border border-border/70 bg-card shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {project.projectName}
              </h1>
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 bg-stone-100 text-stone-800 border-border"
              >
                {project.status}
              </Badge>
              {project.leadPlannerName && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 border-amber-200"
                >
                  Lead: {project.leadPlannerName}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-muted-foreground mt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-stone-500" />
                <span>{formattedDate}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-stone-500" />
                <span>{project.venueName}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-700">Pengantin:</span>
                <span>
                  {project.clientGroomName} &amp; {project.clientBrideName}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Financial Boundary Assurance Banner */}
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200/80 p-3 rounded-xl max-w-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-[11px] leading-relaxed text-stone-600">
              <strong className="text-stone-800 font-semibold block">
                Tier 1 Financial Boundary Active
              </strong>
              Kalkulasi hanya mencakup bujet operasional acara pengantin & vendor.
              Margin laba internal agensi terisolasi penuh.
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 pt-6 border-t border-border/60 mt-6 overflow-x-auto">
          <Link href={`/projects/${project.id}/squad`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Skuad & Kru</span>
            </Button>
          </Link>

          <Link href={`/projects/${project.id}/vendors`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Rekanan Vendor</span>
            </Button>
          </Link>

          <Link href={`/projects/${project.id}/rundown`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Susunan Acara</span>
            </Button>
          </Link>

          <Button
            variant="default"
            size="sm"
            className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5"
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Bujet Operasional</span>
          </Button>
        </div>
      </Card>

      {/* 1. Summary Card (Progress Plafon, Vendor & Client Financials) */}
      <BudgetSummaryCard metrics={metrics} />

      {/* 2. Budget Category Allocations Table */}
      <BudgetCategoryTable
        projectId={project.id}
        contractAmount={metrics.contractAmount}
        categories={categories}
        canManage={canManage}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onRefresh={handleRefresh}
      />

      {/* 3. Bottom Grid: Vendor Invoices & Client Payment Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Vendor Invoices Table */}
        <VendorInvoiceTable
          projectId={project.id}
          invoices={vendorInvoices}
          canManage={canManage}
          onAddInvoice={() => setInvoiceDialogOpen(true)}
          onRefresh={handleRefresh}
        />

        {/* Client Payment Milestones Card */}
        <ClientMilestoneCard
          projectId={project.id}
          clientName={`${project.clientGroomName} & ${project.clientBrideName}`}
          milestones={milestones}
          canManage={canManage}
          onAddMilestone={() => setMilestoneDialogOpen(true)}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Modals & Dialogs */}
      <BudgetItemDialog
        projectId={project.id}
        categoryItem={editingCategory}
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSuccess={handleRefresh}
      />

      <VendorInvoiceDialog
        projectId={project.id}
        projectVendors={projectVendors}
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        onSuccess={handleRefresh}
      />

      <ClientMilestoneDialog
        projectId={project.id}
        open={milestoneDialogOpen}
        onOpenChange={setMilestoneDialogOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
