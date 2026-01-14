"use client";
import Image from "next/image";
import building from "@/public/assets/building.svg"
import signupImage from "@/public/assets/signup image.avif"
import erroricon from "@/public/assets/error icon.svg"
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function LoginPage() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginButtonState, setLoginButtonState] = useState<string | null>("LOGIN");

  async function handleLogin(e: any) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const login_api = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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
    <div className="flex flex-row items-center justify-between h-dvh w-full bg-white">
      <div className="w-1/2 h-full flex flex-col items-center justify-center">
        <div className="w-3/4 items-start justify-center">
          <div className="flex flex-row justify-start items-center">
            <h1 className="text-[35px] font-rethink font-medium">Login</h1>
            <Image src={building} alt="building" width={35} height={35} className="ml-4"/>
          </div>
          {loginError && 
            <div className="flex flex-row items-center mt-1 mb-1">
              <Image src={erroricon} alt="error icon" width={20} height={20} className="mr-2"/>
              <p className="text-red-500 font-rethink font-bold text-[15px]">{loginError}</p>
            </div>
          }
          <p className="w-full items-center justify-center text-gray-500 font-rethink text-[15px] mb-[10px]">
            Don't have an account? <span className="text-black underline cursor-pointer" onClick={() => router.push("/signup")}>sign up</span>
          </p>

          <form onSubmit={handleLogin} className="w-full max-w-md">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-[15px] font-rethink font-semibold mb-[6px]">Email</label>
              <input id="email" type="email" placeholder="john.doe@example.com" className="text-[15px] font-rethink font-semibold border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[10px]"/>
              <label htmlFor="password" className="block text-gray-700 text-[15px] font-rethink font-semibold mb-[6px]">Password</label>
              <input id="password" type="password" placeholder="enter your password" className="text-[15px] font-rethink font-semibold border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[15px]"/>
              <button type="submit" className="bg-black hover:bg-gray-800 text-white font-geist font-bold py-[4px] px-[14px] rounded-[12px]">{loginButtonState}</button>
            </div>
          </form>
        </div>
      </div>
      <div className="relative w-1/2 h-full">
        <Image src={signupImage} alt="signup image" fill className="object-cover"/>
      </div>
    </div>
  );
}
