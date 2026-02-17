import { add_single_employee_record } from "@/app/dashboard/add_records/action";
import { add_single_project_record } from "@/app/dashboard/add_records/action";
import Image from "next/image";
import arrowRight from '@/public/assets/arrow icon.svg'
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils/utils";

type Schema = {  
  id: string;
  key: string;
  type: string;
  label: string;
  required: boolean;
}

type meta = Record<string, string>;
type ProjectSchema = {
  "id": string;
  "name": string;
  "meta": meta;
}

export default function AddSingleRecord({ orgId, empfields, projfields, projectList, recordType }: { orgId: string; empfields: Schema[]; projfields: Schema[]; projectList: ProjectSchema[]; recordType: string }) {
  const router = useRouter();
  const [empState, empFormAction, isEmpPending] = useActionState(add_single_employee_record, null);
  const [projState, projFormAction, isProjPending] = useActionState(add_single_project_record, null);
  
  const [showEmpMessage, setShowEmpMessage] = useState(false);
  const [showProjMessage, setShowProjMessage] = useState(false);

  // State for dynamic project field dates
  const [projFieldDates, setProjFieldDates] = useState<Record<string, Date | undefined>>({});
  // State for dynamic employee field dates
  const [empFieldDates, setEmpFieldDates] = useState<Record<string, Date | undefined>>({});
  // State for combobox open states (one per assignment)
  const [comboboxOpen, setComboboxOpen] = useState<Record<number, boolean>>({});

  type Assignment = {project_id: string; allocation_percentage: number; start_date?: Date; end_date?: Date;};

  const [assignments, setAssignments] = useState<Assignment[]>([{ project_id: "", allocation_percentage: 0, start_date: undefined, end_date: undefined }, ]);
  const usedPercentage = assignments.reduce((sum, a) => sum + (a.allocation_percentage || 0), 0);
  const remainingPercentage = 100 - usedPercentage;

  const getAvailableProjects = (currentIndex: number) => {
  const selectedIds = assignments
    .map((a, i) => (i === currentIndex ? null : a.project_id))
    .filter(Boolean);

  return projectList.filter(
    (p) => !selectedIds.includes(p.id)
  );
  };


  useEffect(() => {
    if (empState?.success) {
      setShowEmpMessage(true);
      setAssignments([{ project_id: "", allocation_percentage: 0, start_date: undefined, end_date: undefined }]);
      setEmpFieldDates({}); // Reset employee field dates on success
      const timer = setTimeout(() => {
        setShowEmpMessage(false);
        router.refresh();
      }, 800);
      return () => clearTimeout(timer);
    }
    if (empState?.error) {
      setShowEmpMessage(true);
      const timer = setTimeout(() => setShowEmpMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [empState, router]);

  useEffect(() => {
    if (projState?.success) {
      setShowProjMessage(true);
      setProjFieldDates({}); // Reset project field dates on success

      const timer = setTimeout(() => {
        setShowProjMessage(false);
        router.refresh();
      }, 800);

      return () => clearTimeout(timer);
    }

    if (projState?.error) {
      setShowProjMessage(true);
      const timer = setTimeout(() => setShowProjMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [projState, router]);


  return (
    <>
    {recordType === 'employee' && (
    <div className="flex flex-col items-start mb-[20px] mt-[10px]">
      <h1 className="text-[25px] font-rethink font-semibold text-black w-full">Add Employee</h1>
      <p className="text-[14px] font-rethink text-[#686868] mb-[10px] w-full">fill out the form below to add a new employee.</p>
      <form action={empFormAction} className="grid grid-cols-2 gap-[12px]">
        <input type="hidden" name="organization_id" value={orgId} />
        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-rethink font-medium mb-[5px] text-[12px]">name</label>
          <Input name="system_name" type="text" placeholder="Enter full name" className="w-full rounded-[10px] py-2 px-2 text-[12px] font-rethink focus:placeholder-transparent" required/>
        </div>

        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-rethink font-medium mb-[5px] text-[12px]">email</label>
          <Input name="system_email" type="email" placeholder="Enter email address" className="w-full rounded-[10px] py-2 px-2 text-[12px] font-rethink focus:placeholder-transparent" required/>
        </div>
        {empfields.map((field) => (
          <div key={field.id} className="w-full flex flex-col">
            <label htmlFor={field.id} className="text-[#686868] font-rethink font-medium mb-[5px] text-[12px]">{field.label.toLowerCase()}</label>
            {field.type === "date" ? (
              <>
                <input type="hidden" name={field.id} value={empFieldDates[field.id] ? format(empFieldDates[field.id]!, "yyyy-MM-dd") : ""} />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-[10px] text-[14px] font-rethink",
                        !empFieldDates[field.id] && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {empFieldDates[field.id] ? format(empFieldDates[field.id]!, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={empFieldDates[field.id]}
                      onSelect={(date) => {
                        setEmpFieldDates(prev => ({ ...prev, [field.id]: date }));
                      }}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <Input id={field.id} name={field.id} type={field.type ?? "text"} placeholder={`Enter ${field.label.toLowerCase()}`} className="w-full rounded-[10px] py-2 px-2 text-[14px] font-rethink focus:placeholder-transparent" autoFocus/>
            )}
          </div>
        ))}

        <div className="col-span-2">
          {projectList.length === 0 ? (
            <p className="text-red-500 font-medium mb-[5px] text-[13px]">
              No projects available. Please add a project first to assign to the employee.
            </p>
          ) : (
          <>
          {assignments.map((assignment, index) => (
            <div key={index} className="grid grid-cols-2 gap-[12px] items-center mb-[10px] mt-[10px] pb-[10px]">
              {/* assign project*/}
              <div className="flex flex-col space-y-1">
                <label htmlFor={`assignments[${index}][project_id]`} className ="text-[#686868] font-medium font-rethink text-[12px]">assign a project</label>
                <input type="hidden" name={`assignments[${index}][project_id]`} value={assignment.project_id === "none" ? "" : assignment.project_id} />
                <Popover open={comboboxOpen[index]} onOpenChange={(open) => setComboboxOpen(prev => ({ ...prev, [index]: open }))}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen[index]}
                      className="w-full justify-between rounded-[10px] text-[12px] font-rethink"
                    >
                      {assignment.project_id
                        ? projectList.find((p) => p.id === assignment.project_id)?.name.toUpperCase()
                        : "Select a project..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search projects..." className="font-rethink text-[12px]" />
                      <CommandList>
                        <CommandEmpty>No project found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              const next = [...assignments];
                              next[index].project_id = "";
                              setAssignments(next);
                              setComboboxOpen(prev => ({ ...prev, [index]: false }));
                            }}
                            className="font-geist font-medium text-[12px]"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-2 w-2",
                                !assignment.project_id || assignment.project_id === "none" ? "opacity-100" : "opacity-0"
                              )}
                            />
                            NONE
                          </CommandItem>
                          {getAvailableProjects(index).map((p) => (
                            <CommandItem
                              key={p.id}
                              value={p.name}
                              onSelect={() => {
                                const next = [...assignments];
                                next[index].project_id = p.id;
                                setAssignments(next);
                                setComboboxOpen(prev => ({ ...prev, [index]: false }));
                              }}
                              className="font-geist font-medium text-[12px]"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-2 w-2",
                                  assignment.project_id === p.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {p.name.toUpperCase()}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Allocation Percentage*/}
              <div className="flex flex-col space-y-1">
                <label htmlFor={`assignments[${index}][allocation_percentage]`} className="text-[#686868] font-medium font-rethink text-[12px]">allocation percentage (%)</label>
                <Input
                  type="number"
                  min={1}
                  id={`assignments[${index}][allocation_percentage]`}
                  max={remainingPercentage + assignment.allocation_percentage}
                  value={assignment.allocation_percentage || ""}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (usedPercentage - assignment.allocation_percentage + value > 100)
                      return;

                    const next = [...assignments];
                    next[index].allocation_percentage = value;
                    setAssignments(next);
                  }}
                  name={`assignments[${index}][allocation_percentage]`}
                  placeholder="Allocation %"
                  className="w-full rounded-[10px] py-2 px-2 text-[12px] font-rethink focus:placeholder-transparent"
                />
              </div>
              {/* Start Date */}
              <div className="flex flex-col space-y-1">
                <label htmlFor={`assignments[${index}][start_date]`} className="text-[#686868] font-medium font-rethink text-[12px]">start date</label>
                <input type="hidden" name={`assignments[${index}][start_date]`} value={assignment.start_date ? format(assignment.start_date, "yyyy-MM-dd") : ""} />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-[10px] text-[12px] font-rethink",
                        !assignment.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-1 w-1" />
                      {assignment.start_date ? format(assignment.start_date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={assignment.start_date}
                      onSelect={(date) => {
                        const next = [...assignments];
                        next[index].start_date = date;
                        setAssignments(next);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* End Date */}
              <div className="flex flex-col space-y-1">
                <label htmlFor={`assignments[${index}][end_date]`} className="text-[#686868] font-medium font-rethink text-[12px]">end date</label>
                <input type="hidden" name={`assignments[${index}][end_date]`} value={assignment.end_date ? format(assignment.end_date, "yyyy-MM-dd") : ""} />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-[10px] text-[12px] font-rethink",
                        !assignment.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-1 w-1 text-[12px]" />
                      {assignment.end_date ? format(assignment.end_date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 text-[12px]" align="start">
                    <Calendar
                      mode="single"
                      selected={assignment.end_date}
                      onSelect={(date) => {
                        const next = [...assignments];
                        next[index].end_date = date;
                        setAssignments(next);
                      }}
                      initialFocus
                      className="text-[12px]"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))}

          {/* Show remaining allocation only if there are assignments */}
          <p className="text-[#686868] font-medium font-rethink text-[14px] mb-[10px]">
            Remaining allocation: <b className="text-red-500">{remainingPercentage}%</b>
          </p>

          </>
        )}
        </div>

        {/* Add Another Project Button */}
        <button type="button"
            disabled={remainingPercentage <= 0 || assignments.length >= projectList.length}
            onClick={() => setAssignments([...assignments, { project_id: "", allocation_percentage: 0, start_date: undefined, end_date: undefined },])}
            className="text-[14px] shadow-sm bg-white text-black font-rethink font-bold pl-[15px] pr-[10px] py-[5px] rounded-[10px] border-[1px] border-[#e8e8e8] flex flex-row items-center justify-center hover:translate-x-1 hover:duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ASSIGN ANOTHER PROJECT
        </button>

        
        <button disabled={isEmpPending} type="submit" className="w-auto bg-[#000000] text-[14px] text-white font-rethink font-bold pl-[15px] pr-[10px] py-[5px] rounded-[10px] flex flex-row items-center justify-center shadow-sm hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
            <span>{isEmpPending ? "PROCESSING..." : "ADD EMPLOYEE"}</span>
            <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="ml-[5px]" />
        </button>

        <div className="col-span-2">
          {showEmpMessage && empState?.success && (
          <p className="text-green-500 text-[13px] font-bold font-rethink mb-2">Employee added</p>
          )}
          {showEmpMessage && empState?.error && (
            <p className="text-red-500 text-[13px] font-bold font-rethink mb-2">{empState.error}</p>
          )}
        </div>
      </form>
    </div>
    )}
    
    {recordType === 'project' && (
    <div className="flex flex-col items-start mb-[20px] mt-[10px]">
      <h1 className="text-[25px] font-rethink font-semibold text-black w-full">Add Project</h1>
      <p className="text-[14px] font-rethink text-[#686868] mb-[10px] w-full">fill out the form below to add a new project.</p>
      <form action={projFormAction} className="grid grid-cols-2 gap-[20px]">
        <input type="hidden" name="organization_id" value={orgId} />
        <div className="w-full flex flex-col">
          <label className="text-[#686868] font-medium mb-[5px] text-[12px] font-rethink">project name</label>
          <Input name="project_name" type="text" placeholder="Enter project name" className="w-full rounded-[10px] py-2 px-2 text-[12px] font-rethink focus:placeholder-transparent" required/>
        </div>
        {projfields.map((field) => (
          <div key={field.id} className="w-full flex flex-col">
            <label htmlFor={field.id} className="text-[#686868] font-medium mb-[5px] text-[12px] font-rethink">{field.label.toLowerCase()}</label>
            {field.type === "date" ? (
              <>
                <input type="hidden" name={field.id} value={projFieldDates[field.id] ? format(projFieldDates[field.id]!, "yyyy-MM-dd") : ""} />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-[10px] text-[12px] font-rethink",
                        !projFieldDates[field.id] && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {projFieldDates[field.id] ? format(projFieldDates[field.id]!, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={projFieldDates[field.id]}
                      onSelect={(date) => {
                        setProjFieldDates(prev => ({ ...prev, [field.id]: date }));
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <Input id={field.id} name={field.id} type={field.type ?? "text"} placeholder={`Enter ${field.label.toLowerCase()}`} className="w-full rounded-[10px] py-2 px-3 text-[15px] font-rethink focus:placeholder-transparent"/>
            )}
          </div>
        ))}
        <div className="flex flex-col">
          {showProjMessage && projState?.success && (
          <p className="text-green-500 text-[13px] font-bold font-rethink mb-2">Project added</p>
          )}
          {showProjMessage && projState?.error && (
            <p className="text-red-500 text-[13px] font-bold font-rethink mb-2">{projState.error}</p>
          )}
          <button type="submit" className="text-[14px] w-auto bg-black text-white font-rethink font-bold pl-[15px] pr-[10px] py-[5px] rounded-[10px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
              <span>{isProjPending ? "PROCESSING..." : "ADD PROJECT"}</span>
              <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="ml-[5px]" />
          </button>
        </div>
      </form>
    </div>
    )}
    </>
  );
}
