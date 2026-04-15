"use client";

import { useQueries } from "@tanstack/react-query";

type SummaryResponse = {
  total_employees: number;
  active_projects: number;
  inactive_projects: number;
  unassigned_employees: number;
  fully_booked: number;
  underutilized_count: number;
  optimal_count: number;
  no_hours_count: number;
  avg_utilization: number | null;
  total_capacity_hrs: number | null;
  total_allocated_hrs: number | null;
  remaining_capacity_hrs: number | null;
  hours_logged_today: number | null;
  hours_logged_week: number | null;
  on_leave_count: number;
  leaving_soon_count: number;
  multi_project_count: number;
  partial_alloc_count: number;
};

type EmployeeRow = {
  employee_id: string;
  name: string;
  allocation_pct: number;
  utilization_pct: number;
  hours_week: number;
  project_count: number;
  is_on_leave: boolean;
  status: string;
  project_names: string[] | null;
};

type LeastUtilizedRow = {
  name: string | null;
  allocation_pct?: number;
  utilization_pct: number;
  free_hrs: number;
};

type MostActiveRow = {
  name: string | null;
  hours: number;
};

type SkillRow = {
  name: string | null;
  employee_count: number;
  avg_proficiency: number | null;
};

type EmployeesResponse = {
  all_employees: EmployeeRow[] | null;
  least_utilized: LeastUtilizedRow[] | null;
  most_active: MostActiveRow[] | null;
  no_hours_logged: string[] | null;
  employees_on_leave: string[] | null;
  employees_leaving_soon: string[] | null;
  skills_top: SkillRow[] | null;
  skills_gap: SkillRow[] | null;
};

type ProjectRow = {
  id: string;
  name: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  assigned_count: number;
  total_allocation_pct: number;
  hours_this_week: number;
};

type LeaveImpactRow = {
  project_name: string;
  employees_on_leave: number;
  leave_from: string | null;
  leave_to: string | null;
  capacity_lost_pct: number;
};

type ProjectsResponse = {
  projects: ProjectRow[] | null;
  active_projects:
    | Pick<ProjectRow, "id" | "name" | "status" | "assigned_count" | "total_allocation_pct" | "hours_this_week">[]
    | null;
  no_employees_assigned: { id: string; name: string }[] | null;
  low_allocation_projects: { id: string; name: string; total_allocation_pct: number }[] | null;
  leave_impact: LeaveImpactRow[] | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error && typeof body.error === "string") {
        message = body.error;
      }
    } catch {}
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function n(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function pct(value: unknown): string {
  return `${n(value)}%`;
}

function hrs(value: unknown): string {
  return `${n(value)} hrs`;
}

export default function DashboardOverview() {
const [summaryQuery, employeesQuery, projectsQuery] = useQueries({
  queries: [
    {
      queryKey: ["dashboard", "summary"],
      queryFn: () =>
        fetchJson<SummaryResponse>("/api/database_fetch/getDashboardSummary"),
      staleTime: 1000 * 60 * 5,
      placeholderData: (prev: SummaryResponse | undefined) => prev,
      refetchInterval: 1000 * 60 * 5,
    },
    {
      queryKey: ["dashboard", "employees"],
      queryFn: () =>
        fetchJson<EmployeesResponse>("/api/database_fetch/getDashboardEmployees"),
      staleTime: 1000 * 60 * 5,
      placeholderData: (prev: EmployeesResponse | undefined) => prev,
      refetchInterval: 1000 * 60 * 5,
    },
    {
      queryKey: ["dashboard", "projects"],
      queryFn: () =>
        fetchJson<ProjectsResponse>("/api/database_fetch/getDashboardProjects"),
      staleTime: 1000 * 60 * 5,
      placeholderData: (prev: ProjectsResponse | undefined) => prev,
      refetchInterval: 1000 * 60 * 5,
    },
  ],
});

const summary = summaryQuery.data;
const employees = employeesQuery.data;
const projects = projectsQuery.data;

const allEmployees = employees?.all_employees ?? [];
const leastUtilized = employees?.least_utilized ?? [];
const mostActive = employees?.most_active ?? [];
const noHoursLogged = employees?.no_hours_logged ?? [];
const employeesOnLeave = employees?.employees_on_leave ?? [];
const employeesLeavingSoon = employees?.employees_leaving_soon ?? [];
const skillsTop = employees?.skills_top ?? [];
const skillsGap = employees?.skills_gap ?? [];

const allProjects = projects?.projects ?? [];
const activeProjects = projects?.active_projects ?? allProjects.filter((project) => project.status === "active");
const noEmployeesAssigned = projects?.no_employees_assigned ?? [];
const lowAllocationProjects = projects?.low_allocation_projects ?? [];
const leaveImpact = projects?.leave_impact ?? [];

const fullyBookedEmployees = allEmployees.filter(
  (employee) => n(employee.allocation_pct) >= 100
);

const partialAllocationEmployees = allEmployees.filter(
  (employee) => n(employee.allocation_pct) > 0 && n(employee.allocation_pct) < 100
);

const smartInsights = [
  `${n(summary?.underutilized_count)} employees are underutilized`,
  `${noEmployeesAssigned.length + lowAllocationProjects.length} projects are understaffed`,
  fullyBookedEmployees.length === 0
    ? "No one is overloaded (healthy workload)"
    : `${fullyBookedEmployees.length} employees are fully booked`,
  `${partialAllocationEmployees.length} employees have available capacity`,
];

return (
  <section className="mt-6 w-full max-w-7xl space-y-6 px-6 pb-10">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <article className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Total employees</p>
        <p className="mt-2 text-3xl font-semibold text-black">{n(summary?.total_employees)}</p>
      </article>

      <article className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Active projects</p>
        <p className="mt-2 text-3xl font-semibold text-black">{n(summary?.active_projects)}</p>
      </article>

      <article className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Inactive projects</p>
        <p className="mt-2 text-3xl font-semibold text-black">{n(summary?.inactive_projects)}</p>
      </article>

      <article className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Unassigned employees</p>
        <p className="mt-2 text-3xl font-semibold text-black">{n(summary?.unassigned_employees)}</p>
      </article>

      <article className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Average utilization</p>
        <p className="mt-2 text-3xl font-semibold text-black">{pct(summary?.avg_utilization)}</p>
      </article>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Total capacity</p>
        <p className="mt-2 text-3xl font-semibold text-black">{hrs(summary?.total_capacity_hrs)}</p>
      </article>

      <article className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Allocated capacity</p>
        <p className="mt-2 text-3xl font-semibold text-black">{hrs(summary?.total_allocated_hrs)}</p>
      </article>

      <article className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Remaining capacity</p>
        <p className="mt-2 text-3xl font-semibold text-black">{hrs(summary?.remaining_capacity_hrs)}</p>
      </article>
    </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Employee Allocation Insights</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
          <div>Underutilized: {n(summary?.underutilized_count)}</div>
          <div>Optimal: {n(summary?.optimal_count)}</div>
          <div>Multi-project: {n(summary?.multi_project_count)}</div>
          <div>Fully booked: {n(summary?.fully_booked)}</div>
          <div>Partial allocation: {n(summary?.partial_alloc_count)}</div>
          <div>Unassigned: {n(summary?.unassigned_employees)}</div>
        </div>
      </div>

      <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Work Tracking</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
          <div>Hours today: {n(summary?.hours_logged_today)}</div>
          <div>Hours this week: {n(summary?.hours_logged_week)}</div>
          <div>No hours logged: {n(summary?.no_hours_count)}</div>
          <div>Most active employees: {mostActive.length}</div>
        </div>
        <div className="mt-4 space-y-2 text-sm text-gray-700">
          {mostActive.length > 0 ? (
            <p>
              Top active:{" "}
              {mostActive
                .map((employee) => `${employee.name ?? "Unnamed employee"} (${employee.hours}h)`)
                .join(", ")}
            </p>
          ) : null}
          {noHoursLogged.length > 0 ? (
            <p>No hours logged: {noHoursLogged.join(", ")}</p>
          ) : null}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Top 5 Least Utilized</h3>
        <div className="mt-4 space-y-3">
          {leastUtilized.map((employee, index) => (
            <div
              key={`${employee.name ?? "unknown"}-${employee.utilization_pct}-${employee.free_hrs}-${index}`}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-800">{employee.name ?? "Unnamed employee"}</span>
              <span className="text-gray-500">
                {n(employee.allocation_pct)}% allocated • {employee.free_hrs} hrs free
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Smart Insights</h3>
        <div className="mt-4 space-y-2 text-sm text-gray-700">
          {smartInsights.map((insight) => (
            <p key={insight}>{insight}</p>
          ))}
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-black">Project Overview</h3>
      <div className="mt-4 space-y-3">
        {activeProjects.map((project) => (
          <div key={project.id} className="rounded-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-black">{project.name}</p>
              <span className="text-xs text-gray-500">{project.status}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {project.assigned_count} employees • {project.total_allocation_pct}% allocation • {project.hours_this_week} hrs this week
            </p>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Project Risk Flags</h3>
        <div className="mt-4 space-y-3 text-sm text-gray-700">
          <div>
            <p className="font-medium text-black">No employees assigned</p>
            <p>{noEmployeesAssigned.length ? noEmployeesAssigned.map((project) => project.name).join(", ") : "None"}</p>
          </div>
          <div>
            <p className="font-medium text-black">Low allocation below 50%</p>
            <p>{lowAllocationProjects.length ? lowAllocationProjects.map((project) => project.name).join(", ") : "None"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Availability / Leave</h3>
        <div className="mt-4 space-y-3 text-sm text-gray-700">
          <p>Employees currently on leave: {n(summary?.on_leave_count)}</p>
          <p>Employees going on leave soon: {n(summary?.leaving_soon_count)}</p>
          {employeesOnLeave.length > 0 ? (
            <p>On leave now: {employeesOnLeave.join(", ")}</p>
          ) : null}
          {employeesLeavingSoon.length > 0 ? (
            <p>Leaving soon: {employeesLeavingSoon.join(", ")}</p>
          ) : null}
          <div className="pt-2">
            <p className="font-medium text-black">Leave impact</p>
            <div className="mt-2 space-y-2">
              {leaveImpact.length > 0 ? (
                leaveImpact.map((impact, index) => (
                  <p key={`${impact.project_name}-${impact.capacity_lost_pct}-${index}`}>
                    {impact.project_name} will lose {impact.capacity_lost_pct}% capacity
                  </p>
                ))
              ) : (
                <p>No project leave impact right now.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Skills Insights</h3>
        <div className="mt-4 space-y-2 text-sm">
          <p className="font-medium text-black">Top skills available</p>
          {skillsTop.map((skill, index) => (
            <div
              key={`${skill.name ?? "unknown-skill"}-${skill.employee_count}-${index}`}
              className="flex justify-between text-gray-700"
            >
              <span>{skill.name ?? "Unnamed skill"}</span>
              <span>{skill.employee_count} employees</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-black">Skill Gaps</h3>
        <div className="mt-4 space-y-2 text-sm">
          {skillsGap.map((skill, index) => (
            <div
              key={`${skill.name ?? "unknown-skill"}-${skill.employee_count}-${index}`}
              className="flex justify-between text-gray-700"
            >
              <span>{skill.name ?? "Unnamed skill"}</span>
              <span>{skill.employee_count} employees</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-black">All Employees</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-500">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Allocation</th>
              <th className="pb-3 pr-4">Utilization</th>
              <th className="pb-3 pr-4">Projects</th>
              <th className="pb-3 pr-4">Hours</th>
              <th className="pb-3 pr-4">Leave</th>
            </tr>
          </thead>
          <tbody>
            {allEmployees.map((employee) => (
              <tr key={employee.employee_id} className="border-b border-gray-50">
                <td className="py-3 pr-4">{employee.name ?? "Unnamed employee"}</td>
                <td className="py-3 pr-4">{employee.allocation_pct}%</td>
                <td className="py-3 pr-4">{employee.utilization_pct}%</td>
                <td className="py-3 pr-4">{employee.project_names?.join(", ") ?? "-"}</td>
                <td className="py-3 pr-4">{employee.hours_week}</td>
                <td className="py-3 pr-4">{employee.is_on_leave ? "On leave" : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);
}
