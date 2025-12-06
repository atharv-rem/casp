"use client";
import Image from "next/image";
import workplace from "@/public/assets/homepage photo.png";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({name: "", email: "", password: ""});

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/signup", {
      method: "POST",
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
      <Image
        src={workplace}
        alt="Casp Logo"
        className="w-1/2 h-full object-cover"
      />

      <div className="w-1/2 h-full flex flex-col items-center justify-center p-8">
        <h1 className="text-[40px] font-bold font-ibm mb-6">Sign Up</h1>

        <form onSubmit={handleSignup} className="w-full max-w-md">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-[20px] font-bold mb-2">Name</label>
            <input id="name" type="text" className="shadow-md border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[20px]" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/>
            <label htmlFor="email" className="block text-gray-700 text-[20px] font-bold mb-2">Email</label>
            <input id="email" type="email" className="shadow-md border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3 mb-[20px]" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/>

            <label htmlFor="password" className="block text-gray-700 text-[20px] font-bold mb-2">Password</label>
            <input id="password" type="password" className="shadow-md border-[1px] border-gray-300 rounded-[10px] w-full py-2 px-3" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/>

            <button type="submit" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  );
}
