'use client';
import { useState,useEffect } from 'react';
import arrowRight from '@/public/assets/arrow icon.svg';
import erroricon from '@/public/assets/error icon.svg';
import Image from 'next/image';
import SchemaBuilder from '@/app/dashboard/onboarding/components/schema builder';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Onboarding_Form() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [empSchema, setEmpSchema] = useState([]);
  const [projSchema, setProjSchema] = useState([]);
  const [onboardingStatus, setOnboardingStatus] = useState<string | null>(null);
  const [onboardingButtonState, setOnboardingButtonState] = useState<string | null>("LAUNCH");

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const add_schemas = async () => {
    const schemas= {
      employee_schema: { fields: empSchema },
      project_schema: { fields: projSchema }
    };

    const onboarding_api = await fetch("/api/onboarding_form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schemas),
    });

    if (onboarding_api.ok) {
      setOnboardingButtonState("ONBOARDING...");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.auth.refreshSession();
      router.push("/dashboard/records");
      return;
    }
    else {
      const onboarding_error = await onboarding_api.json();
      setOnboardingStatus(onboarding_error.error || "Onboarding failed");
    }
  };


  return (
    <div className="w-full items-start justify-center flex flex-col">

      {/* Progress Bar */}
      <div className={`mt-[20px] ${step === 0 ? 'hidden' : 'flex'} flex-row justify-between w-full px-[30px]`}>
        <div className={`h-[5px] flex-1 rounded ${step >= 1 ? 'bg-black' : 'bg-gray-200'}`} />
        <div className={`h-[5px] flex-1 mx-2 rounded ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`} />
        <div className={`h-[5px] flex-1 rounded ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`} />
      </div>

    
      {step === 0 && (
        <section className="ml-[30px] mr-[30px] mt-[15px] flex flex-col items-start">
          <h2 className="text-[25px] font-rethink font-bold">Onboarding form</h2>
          <p className="text-[#686868] font-rethink font-medium leading-[14px] pr-[30px] text-[14px] mt-[5px]">this onboarding form is meant to set columns that you require in your database. It only contains two steps</p>
          <button onClick={nextStep} className="mt-[20px] text-[14px] bg-black text-white font-rethink font-extrabold pl-[15px] pr-[10px] py-[4px] rounded-[10px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
            <span>CONTINUE</span>
            <Image src={arrowRight} alt="Arrow Right" width={18} height={18} className="ml-[5px]" />
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="ml-[30px] mr-[30px] mt-[10px] flex flex-col items-start">
          <p className="text-black font-rethink font-semibold text-[25px] mt-[5px]">Set Employee Columns</p>
          <p className="text-[#686868] mb-[10px] text-[14px] font-rethink"><b>Employee Name</b> and <b>Employee email</b> already exist in the database. These are some extra columns that you can add.</p>
          <SchemaBuilder fields={empSchema} setFields={setEmpSchema} />
          <button onClick={nextStep} className="text-[14px] mt-[20px] bg-black text-white font-rethink font-extrabold pl-[15px] pr-[10px] py-[4px] rounded-[10px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
            <span>NEXT</span>
            <Image src={arrowRight} alt="Arrow Right" width={18} height={18} className="ml-[5px]" />
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="ml-[30px] mr-[30px] mt-[15px] flex flex-col items-start">
          <h2 className="text-[25px] font-rethink font-semibold mt-[5px]">Set Project Columns</h2>
          <p className="text-[#686868] mb-[10px] text-[14px] font-rethink"><b>Project Name</b> already exists in the database. These are some extra columns that you can add.</p>
          <SchemaBuilder fields={projSchema} setFields={setProjSchema} />
          <div className="flex flex-row gap-2 mt-[20px]">
            <button onClick={prevStep} className="bg-black text-white font-rethink font-extrabold pr-[15px] pl-[10px] py-[4px] rounded-[10px] text-[14px] flex flex-row items-center justify-center shadow-md hover:-translate-x-1 hover:duration-300 hover:bg-gray-800">
              <Image src={arrowRight} alt="Arrow Right" width={18} height={18} className="rotate-[180deg] mr-[5px]" />
              <span>BACK</span>
            </button>
            <button onClick={nextStep} className="bg-black text-white font-rethink font-extrabold pl-[15px] pr-[10px] py-[4px] rounded-[10px] text-[14px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
              <span>NEXT</span>
              <Image src={arrowRight} alt="Arrow Right" width={18} height={18} className="ml-[5px]" />
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="ml-[30px] mr-[30px] mt-[15px] flex flex-col items-start w-full pr-[60px]">
          <h2 className="text-[25px] font-rethink font-semibold mt-[5px]">Review your Setup</h2>
          <p className="text-[#686868] mb-[10px] text-[14px] font-rethink">You've defined <b>{empSchema.length} employee fields </b> and <b>{projSchema.length} project fields</b>.</p>
          
          {/* Employee Schema Table */}
          {empSchema.length > 0 && (
            <div className="w-auto mb-4">
              <h3 className="text-[12px] font-rethink font-semibold mb-2 text-[#686868]"> Draft of Employee Table</h3>
              <div className="border rounded-[10px] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-rethink font-semibold text-[12px]">employee name</TableHead>
                      <TableHead className="font-rethink font-semibold text-[12px]">employee email</TableHead>
                      {empSchema.map((field: { id: string; label: string; type: string }) => (
                        <TableHead key={field.id} className="font-rethink font-semibold text-[12px]">{field.label.toLowerCase()}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-rethink text-[#686868] text-[12px]">John Doe</TableCell>
                      <TableCell className="font-rethink text-[#686868] text-[12px]">john.doe@example.com</TableCell>
                      {empSchema.map((field: { id: string; label: string; type: string }) => (
                        <TableCell key={field.id} className="font-rethink text-[#686868] text-[12px]">{field.type}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Project Schema Table */}
          {projSchema.length > 0 && (
            <div className="w-auto mb-4">
              <h3 className="text-[12px] font-rethink font-semibold mb-2 text-[#686868]">Draft of Project Table</h3>
              <div className="border rounded-[10px] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-rethink font-semibold text-[12px]">project name</TableHead>
                      {projSchema.map((field: { id: string; label: string; type: string }) => (
                        <TableHead key={field.id} className="font-rethink font-semibold text-[12px]">{field.label.toLowerCase()}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-rethink text-[#686868] text-[12px]">Website Redesign</TableCell>
                      {projSchema.map((field: { id: string; label: string; type: string }) => (
                        <TableCell key={field.id} className="font-rethink text-[#686868] text-[12px]">{field.type}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {onboardingStatus && 
            <div className="flex flex-row items-center">
              <Image src={erroricon} alt="error icon" width={18} height={18} className="mr-2"/>
              <p className="text-red-500">{onboardingStatus}</p>
            </div>
          }   
          <div className="flex flex-row gap-2 mt-[10px]">
            <button onClick={prevStep} className="bg-black text-[14px] text-white font-rethink font-extrabold pr-[15px] pl-[10px] py-[4px] rounded-[10px] flex flex-row items-center justify-center shadow-md hover:-translate-x-1 hover:duration-300 hover:bg-gray-800">
                <Image src={arrowRight} alt="Arrow Right" width={18} height={18} className="rotate-[180deg] mr-[5px]" />
                <span>BACK</span>
              </button>
            <button onClick={add_schemas} className="bg-black text-[14px] text-white font-rethink font-extrabold pl-[15px] pr-[10px] py-[4px] rounded-[10px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
                <span>{onboardingButtonState}</span>
                <Image src={arrowRight} alt="Arrow Right" className="ml-[5px] size-[18px] border-none" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};