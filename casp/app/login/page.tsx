"use client";
import Image from "next/image";
import building from "@/public/assets/building.svg"
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  async function handleLogin(e: any) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    console.log("API STATUS:", res.status);

    if (res.ok) {
      console.log("REDIRECTING...")
      router.push("/dashboard");
    } else {
      alert("Invalid login");
    }
  }

  return (
    <div className="flex flex-row items-center justify-between h-dvh w-full bg-white">
      <div className="w-1/2 h-full flex flex-col items-center justify-center p-8">
        <div className="flex flex-row justify-center items-center mb-6">
          <h1 className="text-[40px] font-cal">Login</h1>
          <Image src={building} alt="building" width={40} height={40} className="ml-4"/>
        </div>

        <form onSubmit={handleLogin} className="w-full max-w-md">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-[20px] font-inter font-bold mb-2">email</label>
            <input id="email" type="email" placeholder="john.doe@example.com" className="shadow-md border-[1px] border-gray-300 rounded-[10px] font-inter font-bold w-full py-2 px-3 mb-[20px]"/>

            <label htmlFor="password" className="block text-gray-700 text-[20px] font-inter font-bold mb-2">password</label>
            <input id="password" type="password" placeholder="enter your password" className="shadow-md border-[1px] border-gray-300 rounded-[10px] font-inter font-bold w-full py-2 px-3"/>

            <button type="submit" className="mt-4 bg-black hover:bg-gray-800 text-white font-inter font-bold py-[5px] px-[10px] rounded-[12px]">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
