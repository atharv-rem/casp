import { NextResponse } from "next/server";
import { fetchSummary } from "@/lib/database fetch/dashboard";
import getOrganizationID from "@/lib/database fetch/organization_id";
import { redis } from "@/lib/redis";

export async function GET() {
  const { OrgId } = await getOrganizationID();

  if (!OrgId || OrgId === "cannot find organization id") {
    return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 });
  }

  const cacheKey = `dashboard_summary:${OrgId}`;

  try {
    // Attempt cache read
    const cachedSummary = await redis.get(cacheKey);
    if (cachedSummary) {
      return NextResponse.json(cachedSummary);
    }

    const summary = await fetchSummary(OrgId);

    // Cache for 10 minutes
    await redis.set(cacheKey, summary, { ex: 600 });

    return NextResponse.json(summary ?? {});
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
