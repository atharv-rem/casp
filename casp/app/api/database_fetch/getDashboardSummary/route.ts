import { NextResponse } from "next/server";
import { fetchSummary } from "@/lib/database fetch/dashboard";
import getOrganizationID from "@/lib/database fetch/organization_id";

export async function GET() {
  const { OrgId } = await getOrganizationID();

  if (!OrgId || OrgId === "cannot find organization id") {
    return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 });
  }

  try {
    const summary = await fetchSummary(OrgId);
    return NextResponse.json(summary ?? {});
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
