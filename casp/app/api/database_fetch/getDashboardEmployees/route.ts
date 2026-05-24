import { NextResponse } from "next/server";
import { fetchEmployees } from "@/lib/database fetch/dashboard";
import getOrganizationID from "@/lib/database fetch/organization_id";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const { OrgId } = await getOrganizationID();

    if (!OrgId || OrgId === "cannot find organization id") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `dashboard_employees:${OrgId}`;

    if (redis) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          return NextResponse.json(cachedData);
        }
      } catch (cacheError) {
        console.error("Redis GET Error:", cacheError);
      }
    }

    const data = await fetchEmployees(OrgId);
    
    if (redis) {
      try {
        await redis.set(cacheKey, data, { ex: 600 });
      } catch (cacheError) {
        console.error("Redis SET Error:", cacheError);
      }
    }

    return NextResponse.json(data ?? {});
  } catch (error: any) {
    console.error("Dashboard Employees Error:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch dashboard employees" },
      { status: 500 }
    );
  }
}
