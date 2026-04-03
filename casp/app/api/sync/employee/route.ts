import getOrganizationID from "@/lib/database fetch/organization_id";

export async function GET() {
  const { OrgId } = await getOrganizationID();
  const url = `https://api.electric-sql.cloud/v1/shape?source_id=${process.env.ELECTRIC_SOURCE_ID}&table=employees&where=organization_id='${OrgId}'&offset=-1`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.ELECTRIC_SECRET}`,
    },
  });

  return new Response(res.body, { headers: res.headers });
}
