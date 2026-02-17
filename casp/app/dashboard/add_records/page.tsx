
import {ChoosingRecords} from "@/app/dashboard/add_records/components/choosing record";
import getOrganizationID from "@/lib/database/organization_id";
import getEmployeeSchema from "@/lib/database/employee_schema";
import getProjectSchema from "@/lib/database/project_schema";
import getProjectsByOrgId from "@/lib/database/projects";

export default async function RecordsPage() {
    const {OrgId} = await getOrganizationID()
    const [empSchema, projSchema, projects] = await Promise.all([
        getEmployeeSchema({ orgId: OrgId }),
        getProjectSchema({ orgId: OrgId }),
        getProjectsByOrgId({ orgId: OrgId }),
    ]);



    return (
        <div className=" pl-[25px] pr-[30px] pt-[15px] w-full items-start justify-center flex flex-col">
            <ChoosingRecords orgId={OrgId} empfields={empSchema|| []} projfields={projSchema || []} projectList={projects || []}/>
        </div>
    );
}