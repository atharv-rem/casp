import { NextResponse } from "next/server";
import { fetchSummary } from "@/lib/database fetch/dashboard";
import getOrganizationID from "@/lib/database fetch/organization_id";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const { OrgId } = await getOrganizationID();

    if (!OrgId || OrgId === "cannot find organization id") {
      return NextResponse.json(
          { error: "Unauthorized" }, 
          { status: 401 });
    }

    const cacheKey = `dashboard_summary:${OrgId}`;

    // Attempt cache read
    if (redis) {
      try {
        const cachedSummary = await redis.get(cacheKey);
        if (cachedSummary) {
          return NextResponse.json(cachedSummary);
        }
      } catch (cacheError) {
        console.error("Redis GET Error:", cacheError);
      }
    }

    const summary = await fetchSummary(OrgId);

    // Cache for 10 minutes
    if (redis) {
      try {
        await redis.set(cacheKey, summary, { ex: 600 });
      } catch (cacheError) {
        console.error("Redis SET Error:", cacheError);
      }
    }

    return NextResponse.json(summary ?? {});
  } catch (error: any) {
    console.error("Dashboard Summary Error:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
