'use client';
import { useState,useEffect } from 'react';
import arrowRight from '@/public/assets/arrow icon.svg';
import erroricon from '@/public/assets/error icon.svg';
import Image from 'next/image';
import SchemaBuilder from '@/app/dashboard/onboarding/components/schema builder';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

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
        <div className={`h-2 flex-1 rounded ${step >= 1 ? 'bg-black' : 'bg-gray-200'}`} />
        <div className={`h-2 flex-1 mx-2 rounded ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`} />
        <div className={`h-2 flex-1 rounded ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`} />
      </div>

    
      {step === 0 && (
        <section className="ml-[30px] mr-[30px] mt-[15px] flex flex-col items-start">
          <h2 className="text-[40px] font-rethink font-semibold">Onboarding form</h2>
          <p className="text-black font-rethink font-medium leading-[20px] pr-[30px]">this onboarding form is meant to set columns that you require in your database. It only contains two steps</p>
          <button onClick={nextStep} className="mt-[20px] bg-black text-white font-geist font-extrabold pl-[15px] pr-[10px] py-[5px] rounded-[15px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
            <span>CONTINUE</span>
            <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="ml-[5px]" />
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="ml-[30px] mr-[30px] mt-[15px] flex flex-col items-start">
          <p className="text-black font-rethink font-bold text-[25px] mt-[5px]">Define Employee Columns</p>
          <p className="text-gray-500 mb-4 font-rethink">e.g. Employee ID, Name, Email.</p>
          <SchemaBuilder fields={empSchema} setFields={setEmpSchema} />
          <button onClick={nextStep} className="mt-[20px] bg-black text-white font-geist font-extrabold pl-[15px] pr-[10px] py-[5px] rounded-[15px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
            <span>NEXT</span>
            <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="ml-[5px]" />
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="ml-[30px] mr-[30px] mt-[15px] flex flex-col items-start">
          <h2 className="text-[25px] font-rethink font-bold mt-[5px]">Define Project Columns.</h2>
          <p className="text-gray-500 mb-4 font-rethink">e.g. Budget, Client Name, Deadline.</p>
          <SchemaBuilder fields={projSchema} setFields={setProjSchema} />
          <div className="flex flex-row gap-2 mt-[20px]">
            <button onClick={prevStep} className="bg-black text-white font-geist font-extrabold pr-[15px] pl-[10px] py-[5px] rounded-[15px] flex flex-row items-center justify-center shadow-md hover:-translate-x-1 hover:duration-300 hover:bg-gray-800">
              <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="rotate-[180deg] mr-[5px]" />
              <span>BACK</span>
            </button>
            <button onClick={nextStep} className="bg-black text-white font-geist font-extrabold pl-[15px] pr-[10px] py-[5px] rounded-[15px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
              <span>NEXT</span>
              <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="ml-[5px]" />
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="ml-[30px] mr-[30px] mt-[15px] flex flex-col items-start">
          <h2 className="text-[25px] font-rethink font-bold mt-[5px]">Review your Setup</h2>
          <p className="text-gray-500 mb-4 font-rethink">You've defined {empSchema.length} employee fields and {projSchema.length} project fields.</p>
          {onboardingStatus && 
            <div className="flex flex-row items-center">
              <Image src={erroricon} alt="error icon" width={20} height={20} className="mr-2"/>
              <p className="text-red-500">{onboardingStatus}</p>
            </div>
          }   
          <div className="flex flex-row gap-2 mt-[10px]">
            <button onClick={prevStep} className="bg-black text-white font-geist font-extrabold pr-[15px] pl-[10px] py-[5px] rounded-[15px] flex flex-row items-center justify-center shadow-md hover:-translate-x-1 hover:duration-300 hover:bg-gray-800">
                <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="rotate-[180deg] mr-[5px]" />
                <span>BACK</span>
              </button>
            <button onClick={add_schemas} className="bg-black text-white font-geist font-extrabold pl-[15px] pr-[10px] py-[5px] rounded-[15px] flex flex-row items-center justify-center shadow-md hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
                <span>{onboardingButtonState}</span>
                <Image src={arrowRight} alt="Arrow Right" className="ml-[5px] size-[22px] border-none" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};