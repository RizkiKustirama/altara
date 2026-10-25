import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getSession } from "@/lib/auth";
import { assertProjectAccess } from "@/lib/auth-guard";
import { aggregateGuidebookData } from "@/services/pdf-aggregator-service";
import { GuidebookDocument } from "@/components/pdf/guidebook-template";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    projectId: string;
  };
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Sesi tidak valid atau telah kedaluwarsa" },
        { status: 401 }
      );
    }

    const { projectId } = params;
    const access = await assertProjectAccess(session, projectId);
    if (!access.success) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke berkas proyek ini" },
        { status: 403 }
      );
    }

    const guidebookData = await aggregateGuidebookData(projectId);
    if (!guidebookData) {
      return NextResponse.json(
        { error: "Data proyek tidak ditemukan" },
        { status: 404 }
      );
    }

    // Render PDF Document to Buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(GuidebookDocument, { data: guidebookData }) as any
    );

    const safeFilename = guidebookData.project.projectName
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Guidebook-TM-${safeFilename}.pdf"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error generating Guidebook PDF:", error);
    return NextResponse.json(
      { error: "Gagal memproses dan menghasilkan dokumen PDF" },
      { status: 500 }
    );
  }
}
