import { NextResponse } from "next/server";
import { fetchEmployees } from "@/lib/database fetch/dashboard";
import getOrganizationID from "@/lib/database fetch/organization_id";

export async function GET() {
  const { OrgId } = await getOrganizationID();

  if (!OrgId || OrgId === "cannot find organization id") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await fetchEmployees(OrgId);
    return NextResponse.json(data ?? {});
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch dashboard employees" },
      { status: 500 }
    );
  }
}
