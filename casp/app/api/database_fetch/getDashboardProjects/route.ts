import { NextResponse } from "next/server";
import { fetchProjects } from "@/lib/database fetch/dashboard";
import getOrganizationID from "@/lib/database fetch/organization_id";
import { redis } from "@/lib/redis";

export async function GET() {
  const { OrgId } = await getOrganizationID();

  if (!OrgId || OrgId === "cannot find organization id") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cacheKey = `dashboard_projects:${OrgId}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const data = await fetchProjects(OrgId);
    await redis.set(cacheKey, data, { ex: 600 });

    return NextResponse.json(data ?? {});
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Failed to fetch dashboard projects" },
      { status: 500 }
    );
  }
}
