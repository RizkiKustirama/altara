import { getSession } from "@/lib/auth";
import { assertRole } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { getMasterVendors } from "@/services/vendor-service";
import { VendorDirectoryClient } from "@/components/admin/vendor-directory-client";

export default async function VendorsPage() {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT", "CREW"]);
  if (!auth.success) {
    redirect("/login");
  }

  const vendorsRes = await getMasterVendors();
  const vendorsList = vendorsRes.success ? vendorsRes.data : [];
  const canManage = session?.role === "OWNER" || session?.role === "MANAGEMENT";

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Direktori Master Rekanan Vendor
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Katalog resmi rekanan vendor pernikahan untuk slotting acara pengantin dan koordinasi Technical Meeting (TM).
        </p>
      </div>

      {/* Interactive Vendor Table & Management Client Component */}
      <VendorDirectoryClient
        initialVendors={vendorsList}
        canManage={canManage}
      />
    </div>
  );
}
