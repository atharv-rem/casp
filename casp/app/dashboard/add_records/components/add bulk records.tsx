'use client'
import Image from "next/image"
import erroricon from "@/public/assets/error icon.svg"
import { useState } from 'react'
import { add_bulk_records } from '@/app/dashboard/add_records/action'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


export default function AddBulkRecordButton( { empfields, projfields }: { empfields: any[], projfields: any[] }) {

  const [templateType, setTemplateType] = useState('employees')
  const [uploadError, setUploadError] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')
  const [open, setOpen] = useState(false)

  const templateOptions = [
    { value: 'employees', label: 'Employee' },
    { value: 'projects', label: 'Project' },
    { value: 'assignments', label: 'Assignment' },
    { value: 'all', label: 'All' },
  ]

  const handle_excel_sheet = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadStatus('Uploading file...')
      setUploadError('')

      const formData = new FormData()
      formData.append('file', file)

      await add_bulk_records(formData, templateType)

      setUploadStatus('File uploaded successfully')
      setUploadError('')

    } catch (err: any) {
      setUploadError(err.message || 'Upload failed')
      setUploadStatus('')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <>
      <div className="mb-5 mt-2 flex flex-row items-center">
        <label className="mr-2 font-rethink font-bold text-[14px] text-black">
          Select Template Type:
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="text-[14px] w-[220px] justify-between border-gray-300 bg-white text-black rounded-[10px]"
            >
              {templateOptions.find((opt) => opt.value === templateType)?.label ?? "Select template..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-100" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0 bg-white border border-gray-200 shadow-md z-50">
            <Command>
              <CommandInput placeholder="Search template..." />
              <CommandList>
                <CommandEmpty>No template found.</CommandEmpty>
                <CommandGroup>
                  {templateOptions.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      onSelect={(currentValue) => {
                        setTemplateType(currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          templateType === opt.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {templateType === 'employees' && (
        <p className="mb-4 text-[14px] leading-[16px]">
          Upload an Excel file to add multiple employees at once. Ensure the file includes the columns shown in the preview below
          </p>
      )}
      {templateType === 'projects' && (
        <p className="mb-4 text-[14px] leading-[16px]">
          Upload an Excel file to add multiple projects at once. Ensure the file includes the columns shown in the preview below
          </p>
      )}
      {templateType === 'assignments' && (
        <p className="mb-4 text-[14px] leading-[16px]">
          Upload an Excel file to add multiple assignments at once. Ensure the file includes the columns shown in the preview below
          </p>
      )}
      {templateType === 'all' && (
        <p className="mb-4 text-[14px] leading-[16px]">
          Upload an Excel file to add multiple employees, projects, and assign them projects all at once. Ensure the file includes the columns shown in the preview below
          </p>
      )}
      <div className="rounded-[10px] border-[1px] border border-[#d8d8d8] bg-white overflow-x-auto max-w-full">
        <Table className="min-w-max">
        <TableHeader>
          <TableRow>
            {templateType === 'employees' && (
              <>
                <TableHead className="font-rethink font-bold">employee name</TableHead>
                <TableHead className="font-rethink font-bold">employee email</TableHead>
                {empfields.map((field) => (
                  <TableHead key={field.id} className="font-rethink font-bold">{field.label.toLowerCase()}</TableHead>
                ))}
              </>
            )}
            {templateType === 'projects' && (
              <>
                <TableHead className="font-rethink font-bold">project name</TableHead>
                {projfields.map((field) => (
                  <TableHead key={field.id} className="font-rethink font-bold">{field.label.toLowerCase()}</TableHead>
                ))}
              </>
            )}
            {templateType === 'assignments' && (
              <>
                <TableHead className="font-rethink font-bold">employee name</TableHead>
                <TableHead className="font-rethink font-bold">project name</TableHead>
                <TableHead className="font-rethink font-bold">start date</TableHead>
                <TableHead className="font-rethink font-bold">end date</TableHead>
                <TableHead className="font-rethink font-bold">allocation</TableHead>
              </>
            )}
            {templateType === 'all' && (
              <>
                <TableHead className="font-rethink font-bold">employee name</TableHead>
                <TableHead className="font-rethink font-bold">employee email</TableHead>
                {empfields.map((field) => (
                  <TableHead key={field.id} className="font-rethink font-bold">{field.label.toLowerCase()}</TableHead>
                ))}
                <TableHead className="font-rethink font-bold">project name</TableHead>
                {projfields.map((field) => (
                  <TableHead key={field.id} className="font-rethink font-bold">{field.label.toLowerCase()}</TableHead>
                ))}
                <TableHead className="font-rethink font-bold">start date</TableHead>
                <TableHead className="font-rethink font-bold">end date</TableHead>
                <TableHead className="font-rethink font-bold">allocation</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            {templateType === 'employees' && (
              <>
                <TableCell className="font-rethink">John Doe</TableCell>
                <TableCell className="font-rethink">john.doe@example.com</TableCell>
                {empfields.map((field) => (
                  <TableCell key={field.id} className="font-rethink">{field.type}</TableCell>
                ))}
              </>
            )}
            {templateType === 'projects' && (
              <>
                <TableCell className="font-rethink">Project Alpha</TableCell>
                {projfields.map((field) => (
                  <TableCell key={field.id} className="font-rethink">{field.type}</TableCell>
                ))}
              </>
            )}
            {templateType === 'assignments' && (
              <>
                <TableCell className="font-rethink">John Doe</TableCell>
                <TableCell className="font-rethink">Project Alpha</TableCell>
                <TableCell className="font-rethink">2023-01-01</TableCell>
                <TableCell className="font-rethink">2023-12-31</TableCell>
                <TableCell className="font-rethink">50%</TableCell>
              </>
            )}
            {templateType === 'all' && (
              <>
                <TableCell className="font-rethink">John Doe</TableCell>
                <TableCell className="font-rethink">john.doe@example.com</TableCell>
                {empfields.map((field) => (
                  <TableCell key={field.id} className="font-rethink">{field.type}</TableCell>
                ))}
                <TableCell className="font-rethink">Project Alpha</TableCell>
                {projfields.map((field) => (
                  <TableCell key={field.id} className="font-rethink">{field.type}</TableCell>
                ))}
                <TableCell className="font-rethink">2023-01-01</TableCell>
                <TableCell className="font-rethink">2023-12-31</TableCell>
                <TableCell className="font-rethink">50%</TableCell>
              </>
            )}
          </TableRow>
        </TableBody>
      </Table>
      </div>
      <p className="mt-2 ml-2 text-black text-[13px]">
        scroll horizontally right to see more columns &#8594;
      </p>
      <label
        htmlFor="file-upload"
        className="bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle,black_0%,transparent_80%)] text-black font-rethink pl-[15px] pr-[10px] py-[5px] rounded-[15px] flex flex-col items-center justify-center cursor-pointer w-full h-[400px]"
      >
        {uploadStatus ? (
          <p className="text-[18px] font-bold">{uploadStatus}</p>
        ) : (
          <div className="flex flex-col text-center">
            <p className="text-[18px] font-bold">
              Click to upload Excel file
            </p>
            <p className="text-[14px] text-gray-600">
              Supported formats: .xlsx, .xls
            </p>

            {uploadError && (
              <div className="flex flex-row items-center mt-1">
                <Image
                  src={erroricon}
                  alt="error icon"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                <p className="text-red-500 font-bold text-[15px]">
                  {uploadError}
                </p>
              </div>
            )}
          </div>
        )}

      <input
        id="file-upload"
        type="file"
        accept=".xlsx,.xls"
        onChange={handle_excel_sheet}
        className="hidden"
      />
      </label>
    </>
  )
}

