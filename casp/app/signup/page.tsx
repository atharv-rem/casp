"use client";
import Image from "next/image";
import Link from "next/link";
import building from "@/public/assets/building.svg"
import signupImage from "@/public/assets/signup image.png"
import erroricon from "@/public/assets/error icon.svg"
import { useState } from "react";
import { useRouter } from "next/navigation";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").regex(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/, "Only letters, numbers, and single spaces are allowed").regex(/[a-zA-Z]/, "Name must contain at least one letter"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(10, "Password must be at least 10 characters").regex(/[A-Z]/, "Must contain at least one uppercase letter").regex(/[a-z]/, "Must contain at least one lowercase letter").regex(/[0-9]/, "Must contain at least one number").regex(/[@$!%*?&]/, "Must contain at least one special character (@$!%*?&]"),
  organizationName: z.string().min(1, "Organization Name is required").regex(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/, "Only letters, numbers, and single spaces are allowed").regex(/[a-zA-Z]/, "Name must contain at least one letter"),
});

type SignupSchema = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const {register,handleSubmit,formState:{errors,isSubmitting}} = useForm<SignupSchema>({resolver: zodResolver(signupSchema)});
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupButtonState, setSignupButtonState] = useState<string | null>("Create");

  const onSubmit = async (data: SignupSchema) => {
    const signup_api = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (signup_api.ok) {
      setSignupButtonState(
      <div className="flex flex-row items-center justify-center">
        <div className="loader ease-linear rounded-full border-2 border-t-2 border-white h-4 w-4"></div>
        <p className="ml-2">Creating account</p>
      </div>
      );
      router.push("/dashboard");
    } else {
      const signup_error = await signup_api.json();
      setSignupError(signup_error.error || "Signup failed");
    }
  };

  return (
    <>
    <div className="flex flex-row items-center justify-between h-dvh w-full bg-white">
      <div className="w-1/2 h-full flex flex-col items-center justify-center">
        <div className="w-3/4 items-start justify-center">
          <div className="flex flex-row justify-start items-center">
            <h1 className="text-[30px] font-rethink font-medium">Create Organization</h1>
            <Image src={building} alt="building" width={30} height={30} className="ml-2"/>
          </div>
          {signupError && 
            <div className="flex flex-row items-center mt-1 mb-1">
              <Image src={erroricon} alt="error icon" width={15} height={15} className="mr-2"/> 
              <p className="text-red-500 font-rethink font-bold text-[12px]">{signupError}</p>
            </div>
          }
          <p className="w-full items-center justify-center text-gray-500 font-rethink text-[14px] mb-[10px]">
            Already have an account? <Link href="/login" className="text-black underline cursor-pointer font-semibold">log in</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="w-3/4 items-start justify-center">
              <div className="flex flex-col gap-2 mb-[10px]">
                <Label htmlFor="name" className="text-gray-700 text-[12px] font-rethink font-semibold">Name</Label>
                {errors.name && <p className="text-red-500 text-[12px] font-bold">{errors.name.message}</p>}
                <Input {...register("name")} id="name" type="text" placeholder="john doe" className="text-[12px] font-rethink font-semibold rounded-[10px]"/>
              </div>
              
              <div className="flex flex-col gap-2 mb-[10px]">
                <Label htmlFor="email" className="text-gray-700 text-[12px] font-rethink font-semibold">Email</Label>
                {errors.email && <p className="text-red-500 text-[12px] font-bold">{errors.email.message}</p>}
                <Input {...register("email")} id="email" type="email" placeholder="john.doe@example.com" className="text-[12px] font-rethink font-semibold rounded-[10px]"/>
              </div>
              
              <div className="flex flex-col gap-2 mb-[10px]">
                <Label htmlFor="password" className="text-gray-700 text-[12px] font-rethink font-semibold">Password</Label>
                {errors.password && <p className="text-red-500 text-[12px] font-bold">{errors.password.message}</p>}
                <Input {...register("password")} id="password" type="password" placeholder="enter your password" className="text-[12px] font-rethink font-semibold rounded-[10px]"/>
              </div>
                            
              <div className="flex flex-col gap-2 mb-[15px]">
                <Label htmlFor="organizationName" className="text-gray-700 text-[12px] font-rethink font-semibold">Organization Name</Label>
                {errors.organizationName && <p className="text-red-500 text-[12px] font-bold">{errors.organizationName.message}</p>}
                <Input {...register("organizationName")} id="organizationName" type="text" placeholder="acme inc" className="text-[12px] font-rethink font-semibold rounded-[10px]"/>
              </div>
              
              <div className="flex flex-row items-center gap-2 mb-[15px]">
                <Checkbox id="terms" className="rounded-[4px]" />
                <Label htmlFor="terms" className="font-rethink text-[12px] text-gray-400 cursor-pointer flex flex-row text-wrap">
                  agree to <span className="underline cursor-pointer text-black">Terms of Service</span> and <span className="underline cursor-pointer text-black">Privacy Policy</span>.
                </Label>
              </div>
              
              <button disabled={isSubmitting} type="submit" className=" bg-black hover:bg-gray-800 text-white font-geist font-bold py-[4px] px-[14px] rounded-[12px]">{signupButtonState}</button>
          </form>
        </div>
      </div>
      <div className="relative w-1/2 h-full">
        <Image src={signupImage} alt="signup image" placeholder="blur" fill className="object-cover"/>
      </div>
    </div>
    <div className="w-auto fixed bottom-7 right-7 z-50">
      <p className="font-rethink text-[20px] text-black font-medium text-right">“efficiently manage and</p>
      <p className="font-rethink text-[20px] text-black font-medium text-right leading-[12px]"> assign stuff to your workforce”</p>
    </div>
    </>
  );
}
