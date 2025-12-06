"use client";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  async function handleSubmit(e: any) {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Invalid login");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto p-4">
      <input name="email" type="email" placeholder="Email" className="border p-2" />
      <input name="password" type="password" placeholder="Password" className="border p-2" />
      <button className="bg-black text-white p-2">Login</button>
    </form>
  );
}
