"use client";
import Image from "next/image";
import building from "@/public/assets/building.svg"
import loginImage from "@/public/assets/signup image.png"
import erroricon from "@/public/assets/error icon.svg"
import { useRouter } from "next/navigation";
import { useState } from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginSchema = z.infer<typeof loginSchema>;


export default function LoginPage() {
  const router = useRouter();
  const {register,handleSubmit,formState:{errors,isSubmitting}} = useForm<LoginSchema>({resolver: zodResolver(loginSchema)});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginButtonState, setLoginButtonState] = useState<string | null>("login");

  const onSubmit = async (data: LoginSchema) => {
    const login_api = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (login_api.ok) {
      setLoginButtonState(
      <div className="flex flex-row items-center justify-center">
        <div className="loader ease-linear rounded-full border-2 border-t-2 border-white h-4 w-4"></div>
        <p className="ml-2">Logging in</p>
      </div>);
      router.push("/dashboard");
    } else {
      const login_error = await login_api.json();
      setLoginError(login_error.error || "Login failed");
    }
  }

  return (
    <>
    <div className="flex flex-row items-center justify-between h-dvh w-full bg-white">
      <div className="w-1/2 h-full flex flex-col items-center justify-center">
        <div className="w-3/4 items-start justify-center">
          <div className="flex flex-row justify-start items-center">
            <h1 className="text-[30px] font-rethink font-medium">Login</h1>
            <Image src={building} alt="building" width={30} height={30} className="ml-2"/>
          </div>
          {loginError && 
            <div className="flex flex-row items-center mt-1 mb-1">
              <Image src={erroricon} alt="error icon" width={20} height={20} className="mr-2"/>
              <p className="text-red-500 font-rethink font-bold text-[12px]">{loginError}</p>
            </div>
          }
          <p className="w-full items-center justify-center text-gray-500 font-rethink text-[12px] mb-[10px]">
            Don't have an account? <span className="text-black underline cursor-pointer" onClick={() => router.push("/signup")}>sign up</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="w-3/4">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-[12px] font-rethink font-semibold mb-[6px]">Email</label>
              {errors.email && <p className="text-red-500 text-[12px] mb-[2px] font-bold">{errors.email.message}</p>}
              <input {...register("email")} 
              id="email" type="email" placeholder="john.doe@example.com" className="text-[12px] font-rethink font-semibold border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[6px]"/>
              <label htmlFor="password" className="block text-gray-700 text-[12px] font-rethink font-semibold mb-[6px]">Password</label>
              {errors.password && <p className="text-red-500 text-[12px] mb-[2px] font-bold">{errors.password.message}</p>}
              <input 
              {...register("password")} 
              id="password" type="password" placeholder="enter your password" className="text-[12px] font-rethink font-semibold border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[15px]"/>
              <button disabled={isSubmitting} type="submit" className="bg-black hover:bg-gray-800 text-white font-geist font-bold py-[4px] px-[14px] rounded-[12px]">{loginButtonState}</button>
            </div>
          </form>
        </div>
      </div>
      <div className="relative w-1/2 h-full">
        <Image src={loginImage} alt="login image" fill placeholder="blur" className="object-cover"/>
      </div>
    </div>
    <div className="w-auto fixed bottom-7 right-7 z-50">
      <p className="font-rethink text-[20px] text-black font-medium text-right">“efficiently manage and</p>
      <p className="font-rethink text-[20px] text-black font-medium text-right leading-[12px]"> assign stuff to your workforce”</p>
    </div>
    </>
  );
}
