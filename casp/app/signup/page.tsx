"use client";
import Image from "next/image";
import building from "@/public/assets/building.svg"
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({name: "", email: "", password: ""});

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Signup failed. Try again.");
    }
  };

  return (
    <div className="flex flex-row items-center justify-between h-dvh w-full bg-white">
      <div className="w-1/2 h-full flex flex-col items-center justify-center p-8">
        <div className="flex flex-row justify-center items-center mb-6">
          <h1 className="text-[40px] font-cal">Create Organization</h1>
          <Image src={building} alt="building" width={40} height={40} className="ml-4"/>
        </div>

        <form onSubmit={handleSignup} className="w-full max-w-md">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-[20px] font-inter font-regular mb-2">name</label>
            <input id="name" type="text" placeholder="john doe" className="shadow-md border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[20px]" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
            <label htmlFor="email" className="block text-gray-700 text-[20px] font-inter font-medium mb-2">email</label>
            <input id="email" type="email" placeholder="john.doe@example.com" className="shadow-md border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[20px]" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>

            <label htmlFor="password" className="block text-gray-700 text-[20px] font-inter font-medium mb-2">password</label>
            <input id="password" type="password" placeholder="enter your password" className="shadow-md border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/>

            <button type="submit" className="mt-4 bg-black hover:bg-gray-800 text-white font-inter font-medium py-[5px] px-[10px] rounded-[12px]">Create</button>
          </div>
        </form>
        <div className="font-inter text-[13px] text-gray-400">
          By signing in, you agree to our <span className="underline cursor-pointer text-black">Terms of Service</span> and <span className="underline cursor-pointer text-black">Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
}
