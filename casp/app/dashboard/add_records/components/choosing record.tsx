'use client';
import { useState } from "react";
import AddSingleRecord from "@/app/dashboard/add_records/components/add single record";
import AddBulkRecords from "@/app/dashboard/add_records/components/add bulk records";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


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


export function ChoosingRecords( {orgId, empfields, projfields, projectList }: {orgId: string, empfields: Schema[], projfields: Schema[], projectList: ProjectSchema[]}) {
    const [numberOfRecords, setNumberOfRecords] = useState('single');
    const [recordType, setRecordType] = useState('employee');
    return (
        <>
        <div className="w-full flex flex-row items-center justify-start gap-6">
            <Tabs defaultValue="single record">
                <TabsList className="">
                    <TabsTrigger value="single record" onClick={() => setNumberOfRecords('single')} className="font-rethink font-bold h-[25px] !text-[14px]">Single Record</TabsTrigger>
                    <TabsTrigger value="bulk records" onClick={() => setNumberOfRecords('bulk')} className="font-rethink font-bold h-[25px] !text-[14px]">Bulk Records</TabsTrigger>
                </TabsList>
                <TabsContent value="single record"></TabsContent>
                <TabsContent value="bulk records"></TabsContent>
            </Tabs>
            {numberOfRecords === 'single' && (
                <RadioGroup defaultValue="employee" className="flex flex-row items-center gap-4">
                    <div className="flex items-center gap-3" onClick={() => setRecordType('employee')}>
                        <RadioGroupItem value="employee" id="r1" />
                        <Label htmlFor="r1">add Employee</Label>
                    </div>
                    <div className="flex items-center gap-3" onClick={() => setRecordType('project')}>
                        <RadioGroupItem value="project" id="r2" />
                        <Label htmlFor="r2">add Project</Label>
                    </div>
                </RadioGroup>
            )}
        </div>
        {numberOfRecords === 'single' ? <AddSingleRecord orgId={orgId} empfields={empfields} projfields={projfields} projectList={projectList} recordType={recordType} /> : <AddBulkRecords empfields={empfields} projfields={projfields} />}
        </>
    );
}