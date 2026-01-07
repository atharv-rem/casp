"use client";
import Image from "next/image";
import building from "@/public/assets/building.svg"
import signupImage from "@/public/assets/signup image.avif"
import erroricon from "@/public/assets/error icon.svg"
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({name: "", email: "", password: "", organizationName: ""});
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupButtonState, setSignupButtonState] = useState<string | null>("CREATE");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const signup_api = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    <div className="flex flex-row items-center justify-between h-dvh w-full bg-white">
      <div className="w-1/2 h-full flex flex-col items-center justify-center">
        <div className="w-3/4 items-start justify-center">
          <div className="flex flex-row justify-start items-center">
            <h1 className="text-[40px] font-rethink font-medium">Create Organization</h1>
            <Image src={building} alt="building" width={40} height={40} className="ml-4"/>
          </div>
          {signupError && 
            <div className="flex flex-row items-center mt-1 mb-1">
              <Image src={erroricon} alt="error icon" width={20} height={20} className="mr-2"/> 
              <p className="text-red-500 font-rethink font-bold text-[15px]">{signupError}</p>
            </div>
          }
          <p className="w-full items-center justify-center text-gray-500 font-rethink text-[15px] mb-[10px]">
            Already have an account? <span className="text-black underline cursor-pointer" onClick={() => router.push("/login")}>log in</span>
          </p>

          <form onSubmit={handleSignup} className="w-full items-start justify-cente">
              <label htmlFor="name" className="block text-gray-700 text-[15px] font-rethink font-semibold mb-[6px]">Name</label>
              <input id="name" type="text" placeholder="john doe" className="text-[15px] font-rethink font-semibold border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[10px]" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
              <label htmlFor="email" className="block text-gray-700 text-[15px] font-rethink font-semibold mb-[6px]">Email</label>
              <input id="email" type="email" placeholder="john.doe@example.com" className="text-[15px] font-rethink font-semibold border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[10px]" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>
              <label htmlFor="password" className="block text-gray-700 text-[15px] font-rethink font-semibold mb-[6px]">Password</label>
              <input id="password" type="password" placeholder="enter your password" className="text-[15px] font-rethink font-semibold border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[10px]" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/>
              <label htmlFor="organizationName" className="block text-gray-700 text-[15px] font-rethink font-semibold mb-[6px]">Organization Name</label>
              <input id="organizationName" type="text" placeholder="acme inc" className="text-[15px] font-rethink font-semibold border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[15px]" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })}/>
              <button type="submit" className=" bg-black hover:bg-gray-800 text-white font-geist font-bold py-[4px] px-[14px] rounded-[12px]">{signupButtonState}</button>
          </form>
          <div className="font-rethink text-[13px] text-gray-400 mt-2">
            By signing in, you agree to our <span className="underline cursor-pointer text-black">Terms of Service</span> and <span className="underline cursor-pointer text-black">Privacy Policy</span>.
          </div>
        </div>
      </div>
      <div className="relative w-1/2 h-full">
        <Image src={signupImage} alt="signup image" fill className="object-cover"/>
      </div>
    </div>
  );
}
