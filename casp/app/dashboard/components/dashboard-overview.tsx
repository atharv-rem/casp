"use client";

import { useQueries } from "@tanstack/react-query";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";

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
      <span className={`${GeistMono.className} text-lg font-medium text-[#7a7a7a] uppercase mb-2`}>KEY METRICS</span>
      <div className="flex flex-row items-center justify-start gap-5 w-full overflow-x-auto">
        <article className="flex flex-col rounded-[15px] border bg-[#fafafa] pl-[15px] pr-[50px] py-[15px] items-start justify-center h-fit w-fit gap-1">
          <p className={`${GeistPixelSquare.className} text-sm text-black uppercase`}>Total employees</p>
          <p className={`${GeistMono.className} mt-2 text-[40px] font-regular leading-10 text-black `}>{n(summary?.total_employees)}</p>
        </article>

        <article className="relative flex flex-col rounded-[15px] border bg-[#fafafa] pl-[15px] pr-[50px] py-[15px] items-start justify-center h-fit w-fit gap-1">
          {n(summary?.inactive_projects) > 0 && (
            <div className="absolute top-[15px] right-[15px] h-3 w-3 rounded-full bg-orange-500 animate-[pulse_1s_ease-in-out_infinite]" />
          )}
          <p className={`${GeistPixelSquare.className} text-sm text-black uppercase`}>Inactive projects</p>
          <p className={`${GeistMono.className} mt-2 text-[40px] font-regular leading-10 text-black `}>{n(summary?.inactive_projects)}</p>
        </article>

        <article className="relative flex flex-col rounded-[15px] border bg-[#fafafa] pl-[15px] pr-[50px] py-[15px] items-start justify-center h-fit w-fit gap-1">
          {n(summary?.unassigned_employees) > 0 && (
            <div className="absolute top-[15px] right-[15px] h-3 w-3 rounded-full bg-orange-500 animate-[pulse_1s_ease-in-out_infinite]" />
          )}
          <p className={`${GeistPixelSquare.className} text-sm text-black uppercase`}>Unassigned employees</p>
          <p className={`${GeistMono.className} mt-2 text-[40px] font-regular leading-10 text-black `}>{n(summary?.unassigned_employees)}</p>
        </article>

        <article className="flex flex-col rounded-[15px] border bg-[#fafafa] pl-[15px] pr-[50px] py-[15px] items-start justify-center h-fit w-fit gap-1">
          <p className={`${GeistPixelSquare.className} text-sm text-black uppercase`}>Unassigned employees</p>
          <p className={`${GeistMono.className} mt-2 text-[40px] font-regular leading-10 text-black `}>{n(summary?.unassigned_employees)}</p>
        </article>

        <article className="flex flex-col rounded-[15px] border bg-[#fafafa] pl-[15px] pr-[50px] py-[15px] items-start justify-center h-fit w-fit gap-1">
          <p className={`${GeistPixelSquare.className} text-sm text-black uppercase`}>Average utilization</p>
          <p className={`${GeistMono.className} mt-2 text-[40px] font-regular leading-10 text-black `}>{pct(summary?.avg_utilization)}</p>
        </article>
      </div>

      <span className={`${GeistMono.className} text-lg font-medium text-[#7a7a7a] uppercase mb-2`}>CAPACITY OVERVIEW</span>
      <div className="flex flex-col gap-4 rounded-xl border bg-[#fafafa] w-full p-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className={`${GeistPixelSquare.className} text-sm text-gray-500 uppercase`}>Total Weekly Capacity</p>
            <p className={`${GeistMono.className} text-3xl text-black`}>{hrs(summary?.total_capacity_hrs)}</p>
          </div>
          <div className="text-right">
            <p className={`${GeistMono.className} text-lg text-gray-600`}>
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
            <span className={GeistMono.className}>Allocated</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="h-3 w-3 rounded-full bg-[#d1d1d1]" />
            <span className={GeistMono.className}>Remaining</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-black">Employee Allocation Insights</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div>Underutilized: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.underutilized_count)}</span></div>
            <div>Optimal: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.optimal_count)}</span></div>
            <div className="text-red-600 font-medium">Burnout risk: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.burnout_risk_count)}</span></div>
            <div>Fully booked: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.fully_booked)}</span></div>
            <div>Multi-project: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.multi_project_count)}</span></div>
            <div>Fully booked: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.fully_booked)}</span></div>
            <div>Partial allocation: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.partial_alloc_count)}</span></div>
            <div>Unassigned: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.unassigned_employees)}</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-black">Work Tracking</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div>Hours today: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.hours_logged_today)}</span></div>
            <div>Hours this week: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.hours_logged_week)}</span></div>
            <div>No hours logged: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.no_hours_count)}</span></div>
            <div className="text-orange-600 font-medium">Delinquency Rate: <span className={`${GeistPixelSquare.className} tabular-nums`}>{pct(summary?.timesheet_delinquency_rate)}</span></div>
            <div>Most active employees: <span className={`${GeistPixelSquare.className} tabular-nums`}>{mostActive.length}</span></div>
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
                <span className={`${GeistPixelSquare.className} text-gray-500 tabular-nums`}>
                  {n(employee.allocation_pct)}% allocated • {employee.free_hrs} hrs free
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#efefef] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-black">Flight Risk (Top Performers on Bench)</h3>
          <div className="mt-4 space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((employee, index) => (
                <div key={`tp-${employee.employee_id}-${index}`} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 font-medium">{employee.name ?? "Unnamed employee"}</span>
                  <span className={`${GeistPixelSquare.className} text-orange-500 tabular-nums`}>
                    ★ {employee.rating} Rating • {n(employee.allocation_pct)}% alloc
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No top performers are currently under-allocated.</p>
            )}
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
              <p className={`${GeistPixelSquare.className} mt-2 text-sm text-gray-600 tabular-nums`}>
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
              <p>{deadlineThreats.length ? deadlineThreats.map((project) => `${project.name} (${new Date(project.end_date).toLocaleDateString()})`).join(", ") : "No immediate threats"}</p>
            </div>
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
            <p>Employees currently on leave: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.on_leave_count)}</span></p>
            <p>Employees going on leave soon: <span className={`${GeistPixelSquare.className} tabular-nums`}>{n(summary?.leaving_soon_count)}</span></p>
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
                <span className={`${GeistPixelSquare.className} tabular-nums`}>{skill.employee_count} employees</span>
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
                <span className={`${GeistPixelSquare.className} tabular-nums`}>{skill.employee_count} employees</span>
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
                  <td className={`${GeistPixelSquare.className} py-3 pr-4 tabular-nums`}>{employee.allocation_pct}%</td>
                  <td className={`${GeistPixelSquare.className} py-3 pr-4 tabular-nums`}>{employee.utilization_pct}%</td>
                  <td className="py-3 pr-4">{employee.project_names?.join(", ") ?? "-"}</td>
                  <td className={`${GeistPixelSquare.className} py-3 pr-4 tabular-nums`}>{employee.hours_week}</td>
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
