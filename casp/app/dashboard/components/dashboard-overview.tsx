"use client";

import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { useState, useMemo } from "react";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Award, 
  Target, 
  Search, 
  ArrowUpRight, 
  Percent, 
  ShieldAlert,
  Activity,
  Frown
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "burnout" | "underutilized" | "on_leave">("all");

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
    if (!name) return <span className="text-slate-400 font-rethink italic">{fallback}</span>;

    const employeeId = employeeIdByName.get(name);
    if (!employeeId) return <span className="font-semibold text-slate-800 font-rethink">{name}</span>;

    return (
      <Link 
        href={employeeHref(employeeId)} 
        className="font-bold text-slate-850 hover:text-black transition-colors font-rethink inline-flex items-center gap-0.5 group"
      >
        {name}
        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-black" />
      </Link>
    );
  };

  const renderProjectName = (name: string | null | undefined, fallback = "Unnamed project") => {
    if (!name) return <span className="text-slate-400 font-rethink italic">{fallback}</span>;

    const projectId = projectIdByName.get(name);
    if (!projectId) return <span className="font-semibold text-slate-800 font-rethink">{name}</span>;

    return (
      <Link 
        href={projectHref(projectId)} 
        className="font-bold text-slate-850 hover:text-black transition-colors font-rethink inline-flex items-center gap-0.5 group"
      >
        {name}
        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-black" />
      </Link>
    );
  };

  const renderEmployeeList = (names: string[]) =>
    names.map((name, index) => {
      const employeeId = employeeIdByName.get(name);
      return (
        <span 
          key={`${name}-${index}`} 
          className="inline-flex items-center bg-slate-100 border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm hover:bg-slate-200 transition-colors mr-1.5 mb-1.5"
        >
          {employeeId ? (
            <Link href={employeeHref(employeeId)} className="hover:underline flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
              {name}
            </Link>
          ) : (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-450" />
              {name}
            </span>
          )}
        </span>
      );
    });

  const renderProjectList = (items: Array<{ id?: string; name: string; suffix?: string }>) =>
    items.map((item, index) => {
      const id = item.id || projectIdByName.get(item.name);
      return (
        <span 
          key={`${item.name}-${index}`}
          className="inline-flex items-center bg-slate-100 border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm hover:bg-slate-200 transition-colors mr-1.5 mb-1.5"
        >
          {id ? (
            <Link href={projectHref(id)} className="hover:underline flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
              {item.name} {item.suffix ?? ""}
            </Link>
          ) : (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-450" />
              {item.name} {item.suffix ?? ""}
            </span>
          )}
        </span>
      );
    });

  // Filter employees reactively on user search and status controls
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((employee) => {
      const matchesSearch = employee.name
        ? employee.name.toLowerCase().includes(searchQuery.toLowerCase())
        : false;
      
      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "burnout") return n(employee.utilization_pct) > 110;
      if (statusFilter === "underutilized") return n(employee.utilization_pct) < 50;
      if (statusFilter === "on_leave") return employee.is_on_leave;
      return true;
    });
  }, [allEmployees, searchQuery, statusFilter]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };

  const getAvatarBg = (name: string | null) => {
    if (!name) return "bg-slate-100 text-slate-800 border border-slate-200";
    const index = name.length % 4;
    const colors = [
      "bg-slate-50 border border-slate-200 text-slate-800",
      "bg-slate-100 border border-slate-250 text-slate-900",
      "bg-slate-800 border border-slate-700 text-white",
      "bg-slate-200 border border-slate-300 text-slate-900",
    ];
    return colors[index];
  };

  return (
    <section className="mt-5 w-full flex flex-col space-y-6 pb-10">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {/* Total Employees */}
        <article className="group flex flex-col rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-center w-full mb-3">
            <p className="font-rethink text-xs font-semibold text-slate-450 uppercase tracking-wider">Total Employees</p>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-850">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="font-rethink text-[38px] font-bold text-slate-800 leading-none">{n(summary?.total_employees)}</p>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-rethink">
            <span className="font-semibold text-slate-800 flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
              Active
            </span>
            <span>workforce profiles</span>
          </div>
        </article>

        {/* Inactive Projects */}
        <article className="group flex flex-col rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-center w-full mb-3">
            <p className="font-rethink text-xs font-semibold text-slate-450 uppercase tracking-wider">Inactive Projects</p>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-855">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-rethink text-[38px] font-bold text-slate-800 leading-none">{n(summary?.inactive_projects)}</p>
            {n(summary?.inactive_projects) > 0 && (
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-rethink">
            <span className="font-semibold text-slate-700">Status hold</span>
            <span>requiring activation</span>
          </div>
        </article>

        {/* Unassigned Employees */}
        <article className="group flex flex-col rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-center w-full mb-3">
            <p className="font-rethink text-xs font-semibold text-slate-455 uppercase tracking-wider">Unassigned Bench</p>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-850">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-rethink text-[38px] font-bold text-slate-800 leading-none">{n(summary?.unassigned_employees)}</p>
            {n(summary?.unassigned_employees) > 0 && (
              <span className="h-2 w-2 rounded-full bg-slate-600 animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-rethink">
            <span className="font-semibold text-slate-800">Under-allocated</span>
            <span>staff available</span>
          </div>
        </article>

        {/* Average Utilization */}
        <article className="group flex flex-col rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-center w-full mb-3">
            <p className="font-rethink text-xs font-semibold text-slate-450 uppercase tracking-wider">Avg Utilization</p>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-850">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="font-rethink text-[38px] font-bold text-slate-800 leading-none">{pct(summary?.avg_utilization)}</p>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-rethink">
            <span className="font-semibold text-slate-800">Operational rate</span>
            <span>target 75-85%</span>
          </div>
        </article>
      </div>

      {/* Capacity Overview & Allocation Matrix (Sleek White theme panel) */}
      <span className="font-rethink text-xs font-semibold tracking-wider text-slate-400 uppercase mt-4">Capacity & Allocation Matrix</span>
      <div className="flex flex-col gap-5 rounded-[24px] bg-white border border-slate-200 w-full p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="font-rethink text-xs font-medium text-slate-450 uppercase tracking-wider mb-1">Total Weekly Capacity</p>
            <p className="font-rethink text-4xl font-extrabold text-slate-900">{hrs(summary?.total_capacity_hrs)}</p>
          </div>
          <div className="text-left sm:text-right font-rethink text-xs">
            <div className="text-slate-600">
              <span className="font-bold text-slate-900 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">{n(summary?.total_allocated_hrs)}h allocated</span>
              <span className="mx-2 text-slate-300">/</span>
              <span className="font-medium text-slate-500">{n(summary?.remaining_capacity_hrs)}h remaining</span>
            </div>
          </div>
        </div>

        {/* Dot Matrix Tracker */}
        <div className="rounded-xl w-full">
          <div className="flex flex-wrap gap-[6px]">
            {(() => {
              const total = n(summary?.total_capacity_hrs) || 1;
              const allocated = n(summary?.total_allocated_hrs);
              const allocatedDots = Math.min(100, Math.round((allocated / total) * 100));

              return Array.from({ length: 100 }).map((_, i) => {
                const isAllocated = i < allocatedDots;
                const dotColor = isAllocated 
                  ? "bg-black shadow-[0_0_4px_rgba(0,0,0,0.15)]" 
                  : "bg-slate-100 hover:bg-slate-200 transition-colors";

                return (
                  <div
                    key={`dot-${i}`}
                    className={`h-3 w-3 rounded-full ${dotColor} transition-all duration-300 cursor-help`}
                    title={isAllocated ? "Allocated Capacity (1%)" : "Available Capacity (1%)"}
                  />
                );
              });
            })()}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-1 text-xs">
          <div className="flex items-center gap-2 text-slate-655 font-rethink">
            <div className="h-3 w-3 rounded-full bg-black shadow-[0_0_4px_rgba(0,0,0,0.15)]" />
            <span>Allocated Capacity</span>
          </div>
          <div className="flex items-center gap-2 text-slate-655 font-rethink">
            <div className="h-3 w-3 rounded-full bg-slate-100 border border-slate-200" />
            <span>Remaining Capacity</span>
          </div>
        </div>
      </div>
      
      {/* Top 5 Least Utilized */}
      <span className="font-rethink text-xs font-semibold tracking-wider text-slate-400 uppercase mt-4">Underutilized Workforce</span>
      <div className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 w-full shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
          <div className="p-1.5 bg-slate-100 rounded-md text-slate-800">
            <TrendingUp className="h-4 w-4" />
          </div>
          <h3 className="font-rethink text-base font-bold text-slate-800">Top 5 Underutilized Staff</h3>
        </div>

        <div className="flex flex-col gap-6 mt-1 flex-1">
          {leastUtilized.length > 0 ? (
            leastUtilized.map((employee, index) => {
              const totalHours = 40;
              const freeHours = Math.round(n(employee.free_hrs));
              const allocatedHours = Math.max(0, totalHours - freeHours);
              const utilizationPct = Math.round((allocatedHours / totalHours) * 100);

              return (
                <div key={`lu-${employee.name}-${index}`} className="flex flex-col gap-2 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${getAvatarBg(employee.name)} shadow-sm`}>
                        {getInitials(employee.name)}
                      </div>
                      <div>
                        <p className="font-rethink text-sm font-semibold text-slate-850 hover:text-black transition-colors">
                          {renderEmployeeName(employee.name, "Unnamed")}
                        </p>
                        <p className="text-xs text-slate-450 font-rethink">
                          Utilization: <span className="font-bold text-slate-700">{utilizationPct}%</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-rethink text-xs">
                      <p className="text-slate-655">
                        <span className="font-bold text-slate-800">{allocatedHours}h allocated</span>
                        <span className="mx-1 text-slate-300">•</span>
                        <span className="text-slate-450 font-medium">{freeHours}h available</span>
                      </p>
                    </div>
                  </div>

                  {/* Visual Progress bar */}
                  <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-slate-700 rounded-full transition-all duration-500 group-hover:brightness-105"
                      style={{ width: `${utilizationPct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <Frown className="h-8 w-8 text-slate-355 mb-2" />
              <p className="text-sm text-slate-500 font-rethink">No underutilized employees found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Allocation Insights & Work Tracking (Side-by-side grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-4">
        {/* Employee Allocation Insights */}
        <div className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
            <div className="p-1.5 bg-slate-100 rounded-md text-slate-800">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="font-rethink text-base font-bold text-slate-800">Allocation Insights</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-rethink flex-1">
            <div className="flex justify-between items-center p-3.5 rounded-[15px] bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-150">
              <span className="text-slate-500 font-medium">Optimal Utilization</span>
              <span className="px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg">{n(summary?.optimal_count)}</span>
            </div>

            <div className="flex justify-between items-center p-3.5 rounded-[15px] bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-150">
              <span className="text-slate-500 font-medium">Underutilized</span>
              <span className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg">{n(summary?.underutilized_count)}</span>
            </div>

            <div className="flex justify-between items-center p-3.5 rounded-[15px] bg-slate-100 hover:bg-slate-150 transition-colors border border-slate-250">
              <span className="text-slate-800 font-bold flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Burnout Risk
              </span>
              <span className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 rounded-lg">{n(summary?.burnout_risk_count)}</span>
            </div>

            <div className="flex justify-between items-center p-3.5 rounded-[15px] bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-150">
              <span className="text-slate-500 font-medium">Fully Booked</span>
              <span className="px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg">{n(summary?.fully_booked)}</span>
            </div>

            <div className="flex justify-between items-center p-3.5 rounded-[15px] bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-150">
              <span className="text-slate-500 font-medium">Multi-project Roles</span>
              <span className="px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg">{n(summary?.multi_project_count)}</span>
            </div>

            <div className="flex justify-between items-center p-3.5 rounded-[15px] bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-150">
              <span className="text-slate-500 font-medium">Partial Allocation</span>
              <span className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg">{n(summary?.partial_alloc_count)}</span>
            </div>

            <div className="flex justify-between items-center p-3.5 rounded-[15px] bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-150 sm:col-span-2">
              <span className="text-slate-500 font-medium">Unassigned profiles</span>
              <span className="px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-200 border border-slate-250 rounded-lg">{n(summary?.unassigned_employees)}</span>
            </div>
          </div>
        </div>

        {/* Work Tracking */}
        <div className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
            <div className="p-1.5 bg-slate-100 rounded-md text-slate-800">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="font-rethink text-base font-bold text-slate-800">Work Tracking Insights</h3>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col p-3 rounded-[15px] bg-slate-50 border border-slate-150">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-rethink">Today</span>
                <span className="text-lg font-bold text-slate-800 font-rethink mt-1">{n(summary?.hours_logged_today)}h</span>
              </div>
              <div className="flex flex-col p-3 rounded-[15px] bg-slate-50 border border-slate-150">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-rethink">This Week</span>
                <span className="text-lg font-bold text-slate-800 font-rethink mt-1">{n(summary?.hours_logged_week)}h</span>
              </div>
              <div className="flex flex-col p-3 rounded-[15px] bg-slate-50 border border-slate-150">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-rethink">No Hours Logged</span>
                <span className="text-lg font-bold text-slate-800 font-rethink mt-1">{n(summary?.no_hours_count)}</span>
              </div>
            </div>

            {/* Delinquency Alert Banner */}
            {n(summary?.timesheet_delinquency_rate) > 0 && (
              <div className="flex items-center gap-3.5 p-4 rounded-[18px] bg-slate-100 border border-slate-250 text-slate-800">
                <div className="p-2 bg-slate-200 rounded-xl text-slate-700">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <p className="font-rethink text-xs font-semibold uppercase tracking-wider text-slate-500">Timesheet Delinquency</p>
                  <p className="font-rethink text-sm font-bold text-slate-900 mt-0.5">Rate: {pct(summary?.timesheet_delinquency_rate)} of workforce lagging</p>
                </div>
              </div>
            )}

            <div className="space-y-3 mt-1.5 text-xs text-slate-600 font-rethink">
              {mostActive.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Top Active This Week:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {mostActive.map((employee, index) => (
                      <span 
                        key={`${employee.name ?? "unnamed"}-${index}`}
                        className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-800 px-2.5 py-1 rounded-full font-medium"
                      >
                        <Activity className="h-3 w-3 text-slate-900" />
                        {renderEmployeeName(employee.name, "Unnamed")} ({employee.hours}h)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {noHoursLogged.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Missing Timesheets:</span>
                  <div className="flex flex-wrap">
                    {renderEmployeeList(noHoursLogged)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <span className="font-rethink text-xs font-semibold tracking-wider text-slate-400 uppercase mt-4">Project Workspace</span>
      <div className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
          <div className="p-1.5 bg-slate-100 rounded-md text-slate-800">
            <Briefcase className="h-4 w-4" />
          </div>
          <h3 className="font-rethink text-base font-bold text-slate-800">Active Project Portfolios</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeProjects.map((project) => {
            const allocationVal = n(project.total_allocation_pct);
            let progressColor = "bg-slate-700";

            return (
              <div 
                key={project.id} 
                className="group flex flex-col rounded-[20px] border border-slate-200 bg-slate-50/30 p-5 shadow-sm hover:shadow-md hover:bg-slate-50/70 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-rethink text-base font-bold text-slate-800 hover:text-black transition-colors">
                    <Link href={projectHref(project.id)} className="flex items-center gap-1 group/link">
                      {project.name}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </Link>
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border border-slate-900 bg-white text-slate-900 rounded-md">
                    {project.status}
                  </span>
                </div>

                <div className="flex flex-col gap-3 mt-auto font-rethink text-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-slate-400 font-medium">
                      <span>Staff Allocation</span>
                      <span className="font-bold text-slate-700">{allocationVal}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${progressColor} rounded-full`}
                        style={{ width: `${Math.min(100, allocationVal)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-white border border-slate-150 p-2 rounded-xl text-center">
                      <p className="text-[10px] text-slate-405 font-semibold">Assigned Staff</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{project.assigned_count}</p>
                    </div>
                    <div className="bg-white border border-slate-150 p-2 rounded-xl text-center">
                      <p className="text-[10px] text-slate-405 font-semibold">Weekly Hours</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{project.hours_this_week}h</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Risk Flags & Availability/Leave (Side-by-side grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-4">
        {/* Project Risk Flags */}
        <div className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
            <div className="p-1.5 bg-slate-100 rounded-md text-slate-800">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="font-rethink text-base font-bold text-slate-800">Project Risk Monitor</h3>
          </div>

          <div className="flex flex-col gap-4 font-rethink text-sm text-slate-750 flex-1 justify-between">
            {/* Deadline Threats */}
            <div className="p-4 rounded-[18px] bg-slate-50 border border-slate-200 hover:border-slate-350 transition-colors">
              <p className="font-bold text-slate-850 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-2">
                <Clock className="h-4 w-4 text-slate-850" />
                Critical Deadline Threats (Ending ≤ 14 days)
              </p>
              <div className="mt-1 flex flex-wrap">
                {deadlineThreats.length ? (
                  renderProjectList(
                    deadlineThreats.map((project) => ({
                      id: project.id,
                      name: project.name,
                      suffix: ` (${new Date(project.end_date).toLocaleDateString()})`,
                    }))
                  )
                ) : (
                  <span className="text-slate-450 text-xs italic font-medium">No immediate deadline threats found.</span>
                )}
              </div>
            </div>

            {/* No employees assigned */}
            <div className="p-4 rounded-[18px] bg-slate-50 border border-slate-150">
              <p className="font-bold text-slate-750 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-2">
                <AlertTriangle className="h-4 w-4 text-slate-700" />
                Zero Staff Allocation
              </p>
              <div className="mt-1 flex flex-wrap">
                {noEmployeesAssigned.length ? (
                  renderProjectList(
                    noEmployeesAssigned.map((project) => ({
                      id: project.id,
                      name: project.name,
                    }))
                  )
                ) : (
                  <span className="text-slate-455 text-xs italic font-medium">All active projects have staff.</span>
                )}
              </div>
            </div>

            {/* Low allocation */}
            <div className="p-4 rounded-[18px] bg-slate-50 border border-slate-150">
              <p className="font-bold text-slate-755 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-2">
                <TrendingUp className="h-4 w-4 text-slate-800" />
                Under-allocated Projects (&lt; 50%)
              </p>
              <div className="mt-1 flex flex-wrap">
                {lowAllocationProjects.length ? (
                  renderProjectList(
                    lowAllocationProjects.map((project) => ({
                      id: project.id,
                      name: project.name,
                    }))
                  )
                ) : (
                  <span className="text-slate-450 text-xs italic font-medium">All allocated projects meet threshold.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Availability / Leave */}
        <div className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
            <div className="p-1.5 bg-slate-100 rounded-md text-slate-800">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="font-rethink text-base font-bold text-slate-800">Time-off & Availability</h3>
          </div>

          <div className="flex flex-col gap-4 font-rethink text-sm text-slate-700 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[15px] text-center">
                <p className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider">Active Leave</p>
                <p className="text-xl font-bold text-slate-850 mt-1">{n(summary?.on_leave_count)} employees</p>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[15px] text-center">
                <p className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider">Leaving Soon</p>
                <p className="text-xl font-bold text-slate-850 mt-1">{n(summary?.leaving_soon_count)} employees</p>
              </div>
            </div>

            {employeesOnLeave.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-slate-450 uppercase tracking-wider text-[10px]">On Leave Now:</span>
                <div className="flex flex-wrap">{renderEmployeeList(employeesOnLeave)}</div>
              </div>
            )}

            {employeesLeavingSoon.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="font-semibold text-slate-455 uppercase tracking-wider text-[10px]">Scheduled Leave:</span>
                <div className="flex flex-wrap">{renderEmployeeList(employeesLeavingSoon)}</div>
              </div>
            )}

            {/* Leave impact tracker */}
            <div className="pt-3 border-t border-slate-50 mt-auto">
              <p className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2.5">Leave Impact Analysis</p>
              <div className="space-y-2">
                {leaveImpact.length > 0 ? (
                  leaveImpact.map((impact, index) => {
                    const capLost = impact.capacity_lost_pct;
                    let lossColor = "bg-slate-400";
                    if (capLost >= 30) lossColor = "bg-slate-900";
                    else if (capLost >= 10) lossColor = "bg-slate-650";

                    return (
                      <div 
                        key={`${impact.project_name}-${impact.capacity_lost_pct}-${index}`}
                        className="flex flex-col gap-1.5 p-3 rounded-[15px] bg-slate-50 border border-slate-150"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold">{renderProjectName(impact.project_name, impact.project_name)}</span>
                          <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">-{capLost}% Capacity</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${lossColor} rounded-full`}
                            style={{ width: `${capLost}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-450 text-xs italic font-medium">No critical impact from scheduled leaves.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Insights & Skill Gaps (Side-by-side grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-4">
        {/* Skills Insights */}
        <div className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
            <div className="p-1.5 bg-slate-100 rounded-md text-slate-800">
              <Award className="h-4 w-4" />
            </div>
            <h3 className="font-rethink text-base font-bold text-slate-800">Top Available Skills</h3>
          </div>

          <div className="flex flex-col gap-4 font-rethink text-sm flex-1">
            {skillsTop.length > 0 ? (
              skillsTop.map((skill, index) => (
                <div 
                  key={`${skill.name ?? "unknown-skill"}-${skill.employee_count}-${index}`}
                  className="flex flex-col gap-1.5 group"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{skill.name ?? "Unnamed skill"}</span>
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-900 rounded font-semibold">{skill.employee_count} profiles</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-800 rounded-full group-hover:bg-black transition-colors"
                      style={{ width: `${Math.min(100, (skill.avg_proficiency ?? 4) * 20)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <span className="text-slate-450 text-xs italic font-medium">No skills data available.</span>
            )}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
            <div className="p-1.5 bg-slate-100 rounded-md text-slate-800">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="font-rethink text-base font-bold text-slate-800">Identified Skill Gaps</h3>
          </div>

          <div className="flex flex-col gap-4 font-rethink text-sm flex-1">
            {skillsGap.length > 0 ? (
              skillsGap.map((skill, index) => (
                <div 
                  key={`${skill.name ?? "unknown-skill"}-${skill.employee_count}-${index}`}
                  className="flex flex-col gap-1.5 group"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{skill.name ?? "Unnamed skill"}</span>
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-900 rounded font-semibold">{skill.employee_count} needed</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-500 rounded-full group-hover:bg-slate-700 transition-colors"
                      style={{ width: `${Math.min(100, skill.employee_count * 20)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <span className="text-slate-450 text-xs italic font-medium">No talent deficits identified.</span>
            )}
          </div>
        </div>
      </div>

      {/* All Employees (Interactive Data Table with client-side live Search and Status Filtering tabs) */}
      <span className="font-rethink text-xs font-semibold tracking-wider text-slate-400 uppercase mt-4">Talent Roster</span>
      <div className="flex flex-col rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-md text-slate-800">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="font-rethink text-base font-bold text-slate-800">All Employees ({filteredEmployees.length})</h3>
          </div>

          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Live Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 pr-4 py-2 border border-slate-200 rounded-[14px] text-xs font-rethink bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-slate-700 placeholder-slate-400"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-[16px] overflow-x-auto self-start sm:self-auto">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-[12px] text-[10px] font-bold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-black text-white shadow-[0_2px_6px_-2px_rgba(0,0,0,0.15)] border border-slate-900/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("burnout")}
                className={`px-3 py-1.5 rounded-[12px] text-[10px] font-bold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "burnout"
                    ? "bg-black text-white shadow-[0_2px_6px_-2px_rgba(0,0,0,0.15)] border border-slate-900/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Burnout Risk
              </button>
              <button
                onClick={() => setStatusFilter("underutilized")}
                className={`px-3 py-1.5 rounded-[12px] text-[10px] font-bold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "underutilized"
                    ? "bg-black text-white shadow-[0_2px_6px_-2px_rgba(0,0,0,0.15)] border border-slate-900/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Underutilized
              </button>
              <button
                onClick={() => setStatusFilter("on_leave")}
                className={`px-3 py-1.5 rounded-[12px] text-[10px] font-bold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "on_leave"
                    ? "bg-black text-white shadow-[0_2px_6px_-2px_rgba(0,0,0,0.15)] border border-slate-900/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                On Leave
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-4 overflow-x-auto">
          {filteredEmployees.length > 0 ? (
            <table className="min-w-full text-sm font-rethink">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-4 pl-2 font-semibold">Employee</th>
                  <th className="pb-3 pr-4 font-semibold">Allocation</th>
                  <th className="pb-3 pr-4 font-semibold">Utilization</th>
                  <th className="pb-3 pr-4 font-semibold">Projects</th>
                  <th className="pb-3 pr-4 font-semibold">Hours/Wk</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEmployees.map((employee) => {
                  const allocVal = n(employee.allocation_pct);
                  const utilVal = n(employee.utilization_pct);

                  let allocMeterColor = "bg-slate-700";
                  if (allocVal > 100) allocMeterColor = "bg-black";
                  else if (allocVal < 40) allocMeterColor = "bg-slate-400";

                  let utilMeterColor = "bg-slate-800";
                  if (utilVal > 110) utilMeterColor = "bg-black";
                  else if (utilVal < 50) utilMeterColor = "bg-slate-400";

                  return (
                    <tr key={employee.employee_id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Name Card & initials */}
                      <td className="py-3.5 pr-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${getAvatarBg(employee.name)} shadow-sm`}>
                            {getInitials(employee.name)}
                          </div>
                          <div>
                            <Link 
                              href={employeeHref(employee.employee_id)} 
                              className="font-bold text-slate-800 hover:text-black transition-colors flex items-center gap-0.5 group/name"
                            >
                              {employee.name ?? "Unnamed employee"}
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/name:opacity-100 transition-all transform group-hover/name:translate-x-0.5 group-hover/name:-translate-y-0.5 text-black" />
                            </Link>
                            <span className="text-[10px] text-slate-400 font-medium">ID: {employee.employee_id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Allocation Meter */}
                      <td className="py-3.5 pr-4">
                        <div className="flex flex-col gap-1 w-28">
                          <span className="font-bold text-slate-850 text-xs">{allocVal}%</span>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${allocMeterColor} rounded-full`} style={{ width: `${Math.min(100, allocVal)}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Utilization Meter */}
                      <td className="py-3.5 pr-4">
                        <div className="flex flex-col gap-1 w-28">
                          <span className="font-bold text-slate-850 text-xs">{utilVal}%</span>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${utilMeterColor} rounded-full`} style={{ width: `${Math.min(100, utilVal)}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Projects Tags */}
                      <td className="py-3.5 pr-4">
                        {employee.project_names?.length ? (
                          <div className="flex flex-wrap max-w-sm">
                            {renderProjectList(
                              employee.project_names.map((name) => ({
                                id: projectIdByName.get(name),
                                name,
                              }))
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-350 font-semibold text-xs">-</span>
                        )}
                      </td>

                      {/* Weekly Hours */}
                      <td className="py-3.5 pr-4">
                        <span className="font-bold text-slate-700 text-xs">{employee.hours_week} hrs</span>
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 pr-4">
                        {employee.is_on_leave ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-750 rounded-full uppercase tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-pulse" />
                            On Leave
                          </span>
                        ) : utilVal > 110 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-black border border-black text-white rounded-full uppercase tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            Overloaded
                          </span>
                        ) : allocVal === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-slate-50 border border-slate-150 text-slate-450 rounded-full uppercase tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                            Bench
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-800 rounded-full uppercase tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Frown className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No matching employees found</h4>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
              <button
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                className="mt-4 px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </div>

    </section>
  );
}
