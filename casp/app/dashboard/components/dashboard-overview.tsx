"use client";

import { useQueries } from "@tanstack/react-query";
import Link from "next/link";

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
  burnout_risk_count: number;
  timesheet_delinquency_rate: number | null;
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
  burnout_risk_employees: BurnoutRow[] | null;
  top_performers_on_bench: TopPerformerRow[] | null
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
  deadline_threats: DeadlineThreatRow[] | null
};

type BurnoutRow = {
  employee_id: string;
  name: string | null;
  utilization_pct: number;
};

type TopPerformerRow = {
  employee_id: string;
  name: string | null;
  rating: number;
  allocation_pct: number;
};

type DeadlineThreatRow = {
  id: string;
  name: string;
  end_date: string;
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

function projectHref(id: string) {
  return `/dashboard/projects/id?projectId=${id}`;
}

function employeeHref(id: string) {
  return `/dashboard/employees/${id}`;
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
  const burnoutRiskEmployees = employees?.burnout_risk_employees ?? [];
  const topPerformers = employees?.top_performers_on_bench ?? [];
  const deadlineThreats = projects?.deadline_threats ?? [];

  const employeeIdByName = new Map(
    allEmployees
      .filter((employee) => employee.name && employee.employee_id)
      .map((employee) => [employee.name, employee.employee_id] as const)
  );

  const projectIdByName = new Map(
    allProjects
      .filter((project) => project.name && project.id)
      .map((project) => [project.name, project.id] as const)
  );

  const renderEmployeeName = (name: string | null | undefined, fallback = "Unnamed employee") => {
    if (!name) return <span>{fallback}</span>;

    const employeeId = employeeIdByName.get(name);
    if (!employeeId) return <span>{name}</span>;

    return (
      <Link href={employeeHref(employeeId)} className="hover:underline">
        {name}
      </Link>
    );
  };

  const renderProjectName = (name: string | null | undefined, fallback = "Unnamed project") => {
    if (!name) return <span>{fallback}</span>;

    const projectId = projectIdByName.get(name);
    if (!projectId) return <span>{name}</span>;

    return (
      <Link href={projectHref(projectId)} className="hover:underline">
        {name}
      </Link>
    );
  };

  const renderEmployeeList = (names: string[]) =>
    names.map((name, index) => (
      <span key={`${name}-${index}`}>
        {index > 0 ? ", " : ""}
        {renderEmployeeName(name, name)}
      </span>
    ));

  const renderProjectList = (items: Array<{ id?: string; name: string; suffix?: string }>) =>
    items.map((item, index) => (
      <span key={`${item.name}-${index}`}>
        {index > 0 ? ", " : ""}
        {item.id ? (
          <Link href={projectHref(item.id)} className="hover:underline">
            {item.name}
          </Link>
        ) : (
          renderProjectName(item.name, item.name)
        )}
        {item.suffix ?? ""}
      </span>
    ));

  const fullyBookedEmployees = allEmployees.filter(
    (employee) => n(employee.allocation_pct) >= 100
  );

  const partialAllocationEmployees = allEmployees.filter(
    (employee) => n(employee.allocation_pct) > 0 && n(employee.allocation_pct) < 100
  );

  const smartInsights = [
    `${n(summary?.underutilized_count)} employees are underutilized`,
    `${burnoutRiskEmployees.length} employees are at risk of burnout (>110% utilization)`,
    topPerformers.length > 0 ? `${topPerformers.length} top performers are under-allocated (flight risk)` : "All top performers are well allocated",
    `${noEmployeesAssigned.length + lowAllocationProjects.length} projects are understaffed`,
    `${deadlineThreats.length} projects ending soon require attention`,
  ];

  return (
    <section className="mt-5 w-full flex flex-col space-y-6 pb-10">
      <span className={`font-rethink text-lg font-medium text-[#7a7a7a] uppercase mb-2`}>KEY METRICS</span>
      <div className="flex flex-row items-center justify-start gap-5 w-full overflow-x-auto">
        <article className="flex flex-col rounded-[15px] border bg-[#fafafa] pl-[15px] pr-[50px] py-[15px] items-start justify-center h-fit w-fit gap-1">
          <p className={`font-rethink text-sm text-black uppercase`}>Total employees</p>
          <p className={`font-rethink mt-2 text-[40px] font-regular leading-10 text-black `}>{n(summary?.total_employees)}</p>
        </article>

        <article className="relative flex flex-col rounded-[15px] border bg-[#fafafa] pl-[15px] pr-[50px] py-[15px] items-start justify-center h-fit w-fit gap-1">
          {n(summary?.inactive_projects) > 0 && (
            <div className="absolute top-[15px] right-[15px] h-3 w-3 rounded-full bg-orange-500 animate-[pulse_1s_ease-in-out_infinite]" />
          )}
          <p className={`font-rethink text-sm text-black uppercase`}>Inactive projects</p>
          <p className={`font-rethink mt-2 text-[40px] font-regular leading-10 text-black `}>{n(summary?.inactive_projects)}</p>
        </article>

        <article className="relative flex flex-col rounded-[15px] border bg-[#fafafa] pl-[15px] pr-[50px] py-[15px] items-start justify-center h-fit w-fit gap-1">
          {n(summary?.unassigned_employees) > 0 && (
            <div className="absolute top-[15px] right-[15px] h-3 w-3 rounded-full bg-orange-500 animate-[pulse_1s_ease-in-out_infinite]" />
          )}
          <p className={`font-rethink text-sm text-black uppercase`}>Unassigned employees</p>
          <p className={`font-rethink mt-2 text-[40px] font-regular leading-10 text-black `}>{n(summary?.unassigned_employees)}</p>
        </article>

        <article className="flex flex-col rounded-[15px] border bg-[#fafafa] pl-[15px] pr-[50px] py-[15px] items-start justify-center h-fit w-fit gap-1">
          <p className={`font-rethink text-sm text-black uppercase`}>Average utilization</p>
          <p className={`font-rethink mt-2 text-[40px] font-regular leading-10 text-black `}>{pct(summary?.avg_utilization)}</p>
        </article>
      </div>

      <span className={`font-rethink text-lg font-medium text-[#7a7a7a] uppercase mb-2`}>CAPACITY OVERVIEW</span>
      <div className="flex flex-col gap-4 rounded-xl border bg-[#fafafa] w-full p-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className={`font-rethink text-sm text-gray-500 uppercase`}>Total Weekly Capacity</p>
            <p className={`font-rethink text-3xl text-black`}>{hrs(summary?.total_capacity_hrs)}</p>
          </div>
          <div className="text-right">
            <p className={`font-rethink text-lg text-gray-600`}>
              <span className="font-semibold text-black">{n(summary?.total_allocated_hrs)}h allocated</span> / <span className="text-gray-500">{n(summary?.remaining_capacity_hrs)}h remaining</span>
            </p>
          </div>
        </div>

        {/* Dot Matrix Tracker */}
        <div className="rounded-xl w-full">
          <div className="flex flex-wrap gap-[6px]">
            {(() => {
              const total = n(summary?.total_capacity_hrs) || 1; // Prevent division by zero
              const allocated = n(summary?.total_allocated_hrs);

              // Calculate percentages (1 dot = 1%)
              const allocatedDots = Math.min(100, Math.round((allocated / total) * 100));

              // Generate array of 100 dots based on states
              return Array.from({ length: 100 }).map((_, i) => {
                // If the current dot index is less than the allocated amount, color it blue, otherwise grey
                const dotColor = i < allocatedDots ? "bg-gray-500" : "bg-[#d1d1d1]";

                return (
                  <div
                    key={`dot-${i}`}
                    className={`h-[14px] w-[14px] rounded-full ${dotColor} transition-colors duration-300`}
                  />
                );
              });
            })()}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="h-3 w-3 rounded-full bg-gray-500" />
            <span className="font-rethink">Allocated</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="h-3 w-3 rounded-full bg-[#d1d1d1]" />
            <span className="font-rethink">Remaining</span>
          </div>
        </div>
      </div>
      
      <h3 className={`font-rethink text-lg font-medium text-[#7a7a7a] uppercase mb-2`}>Top 5 Least Utilized</h3>
      <div className="flex flex-col gap-6 rounded-[15px] border bg-[#fafafa] p-6 w-full">
          <div className="flex flex-col gap-7 mt-2 flex-1">
            {leastUtilized.length > 0 ? (
              leastUtilized.map((employee, index) => {
                // Assuming a standard 40-hour work week
                const totalHours = 40;
                const freeHours = Math.round(n(employee.free_hrs));
                const allocatedHours = Math.max(0, totalHours - freeHours);

                return (
                  <div key={`lu-${employee.name}-${index}`} className="flex flex-col gap-2">
                    {/* Header: Name and Hours */}
                    <div className="flex justify-between items-end mb-1">
                      <p className={`font-rethink text-xl text-black truncate pr-4`}>
                        {renderEmployeeName(employee.name, "Unnamed")}
                      </p>
                      <p className={`font-rethink text-sm text-gray-600 whitespace-nowrap`}>
                        <span className="font-semibold text-black">{allocatedHours}h allocated</span> <span className="text-gray-400">/ {freeHours}h free</span>
                      </p>
                    </div>

                    {/* 40-Dot Matrix (1 dot = 1 hour) */}
                    <div className="flex flex-wrap gap-[5px]">
                      {Array.from({ length: totalHours }).map((_, i) => {
                        // Dark slate for allocated, light gray for free
                        const dotColor = i < allocatedHours ? "bg-slate-500" : "bg-gray-300";
                        return (
                          <div
                            key={i}
                            className={`h-[10px] w-[10px] rounded-full ${dotColor}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-sm text-gray-500">No underutilized employees found.</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 pt-5 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-500" />
              <span className="font-rethink">Allocated</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="font-rethink">Free</span>
            </div>
          </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-6 w-full overflow-x-auto">
        <div className="flex flex-col">
          <h3 className={`text-lg text-black font-medium uppercase font-rethink mb-2`}>Employee Allocation Insights</h3>
          <div className="rounded-xl border bg-white p-5">
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>Underutilized: <span className=" tabular-nums font-rethink">{n(summary?.underutilized_count)}</span></div>
              <div>Optimal: <span className={`font-rethink tabular-nums`}>{n(summary?.optimal_count)}</span></div>
              <div className="text-red-600 font-medium">Burnout risk: <span className={`font-rethink tabular-nums`}>{n(summary?.burnout_risk_count)}</span></div>
              <div>Fully booked: <span className={`font-rethink tabular-nums`}>{n(summary?.fully_booked)}</span></div>
              <div>Multi-project: <span className={`font-rethink tabular-nums`}>{n(summary?.multi_project_count)}</span></div>
              <div>Partial allocation: <span className={`font-rethink tabular-nums`}>{n(summary?.partial_alloc_count)}</span></div>
              <div>Unassigned: <span className={`font-rethink tabular-nums`}>{n(summary?.unassigned_employees)}</span></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className={`text-lg text-black font-medium uppercase font-rethink mb-2`}>Work Tracking</h3>
          <div className="rounded-xl border bg-white p-5">
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>Hours today: <span className={`font-rethink tabular-nums`}>{n(summary?.hours_logged_today)}</span></div>
              <div>Hours this week: <span className={`font-rethink tabular-nums`}>{n(summary?.hours_logged_week)}</span></div>
              <div>No hours logged: <span className={`font-rethink tabular-nums`}>{n(summary?.no_hours_count)}</span></div>
              <div className="text-orange-600 font-medium">Delinquency Rate: <span className={`font-rethink tabular-nums`}>{pct(summary?.timesheet_delinquency_rate)}</span></div>
              <div>Most active employees: <span className={`font-rethink tabular-nums`}>{mostActive.length}</span></div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              {mostActive.length > 0 ? (
                <p>
                  Top active:{" "}
                  {mostActive.map((employee, index) => (
                    <span key={`${employee.name ?? "unnamed"}-${index}`}>
                      {index > 0 ? ", " : ""}
                      {renderEmployeeName(employee.name, "Unnamed employee")} ({employee.hours}h)
                    </span>
                  ))}
                </p>
              ) : null}
              {noHoursLogged.length > 0 ? (
                <p>No hours logged: {renderEmployeeList(noHoursLogged)}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
        <h3 className={`text-lg font-medium uppercase text-black font-rethink`}>Project Overview</h3>
        <div className="mt-4 space-y-3">
          {activeProjects.map((project) => (
            <div key={project.id} className="rounded-lg border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-black">
                  <Link href={projectHref(project.id)} className="hover:underline">
                    {project.name}
                  </Link>
                </p>
                <span className="text-xs text-gray-500">{project.status}</span>
              </div>
              <p className={`font-rethink mt-2 text-sm text-gray-600 tabular-nums`}>
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
              <p className="font-medium text-red-600">Deadline Threat (Ending ≤ 14 days)</p>
              <p>
                {deadlineThreats.length
                  ? renderProjectList(
                      deadlineThreats.map((project) => ({
                        id: project.id,
                        name: project.name,
                        suffix: ` (${new Date(project.end_date).toLocaleDateString()})`,
                      }))
                    )
                  : "No immediate threats"}
              </p>
            </div>
            <div>
              <p className="font-medium text-black">No employees assigned</p>
              <p>
                {noEmployeesAssigned.length
                  ? renderProjectList(
                      noEmployeesAssigned.map((project) => ({
                        id: project.id,
                        name: project.name,
                      }))
                    )
                  : "None"}
              </p>
            </div>
            <div>
              <p className="font-medium text-black">Low allocation below 50%</p>
              <p>
                {lowAllocationProjects.length
                  ? renderProjectList(
                      lowAllocationProjects.map((project) => ({
                        id: project.id,
                        name: project.name,
                      }))
                    )
                  : "None"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-black">Availability / Leave</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <p>Employees currently on leave: <span className={`font-rethink tabular-nums`}>{n(summary?.on_leave_count)}</span></p>
            <p>Employees going on leave soon: <span className={`font-rethink tabular-nums`}>{n(summary?.leaving_soon_count)}</span></p>
            {employeesOnLeave.length > 0 ? (
              <p>On leave now: {renderEmployeeList(employeesOnLeave)}</p>
            ) : null}
            {employeesLeavingSoon.length > 0 ? (
              <p>Leaving soon: {renderEmployeeList(employeesLeavingSoon)}</p>
            ) : null}
            <div className="pt-2">
              <p className="font-medium text-black">Leave impact</p>
              <div className="mt-2 space-y-2">
                {leaveImpact.length > 0 ? (
                  leaveImpact.map((impact, index) => (
                    <p key={`${impact.project_name}-${impact.capacity_lost_pct}-${index}`}>
                      {renderProjectName(impact.project_name, impact.project_name)} will lose {impact.capacity_lost_pct}% capacity
                    </p>
                  ))
                ) : (
                  <p>No impact from current leave.</p>
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
                <span className={`font-rethink tabular-nums`}>{skill.employee_count} employees</span>
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
                <span className={`font-rethink tabular-nums`}>{skill.employee_count} employees</span>
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
                  <td className="py-3 pr-4">
                    <Link href={employeeHref(employee.employee_id)} className="hover:underline">
                      {employee.name ?? "Unnamed employee"}
                    </Link>
                  </td>
                  <td className={`font-rethink py-3 pr-4 tabular-nums`}>{employee.allocation_pct}%</td>
                  <td className={`font-rethink py-3 pr-4 tabular-nums`}>{employee.utilization_pct}%</td>
                  <td className="py-3 pr-4">
                    {employee.project_names?.length
                      ? renderProjectList(
                          employee.project_names.map((name) => ({
                            id: projectIdByName.get(name),
                            name,
                          }))
                        )
                      : "-"}
                  </td>
                  <td className={`font-rethink py-3 pr-4 tabular-nums`}>{employee.hours_week}</td>
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
