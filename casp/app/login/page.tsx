"use client";
import Image from "next/image";
import building from "@/public/assets/building.svg"
import Link from "next/link";
import loginImage from "@/public/assets/signup image.png"
import erroricon from "@/public/assets/error icon.svg"
import {useRouter } from "next/navigation";
import {useState } from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from '@supabase/supabase-js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginSchema = z.infer<typeof loginSchema>;


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export default function LoginPage() {
  const router = useRouter();
  const {register,handleSubmit,watch,formState:{errors,isSubmitting}} = useForm<LoginSchema>({resolver: zodResolver(loginSchema)});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [loginButtonState, setLoginButtonState] = useState<string | null>("login");

  const forgotPassword = async () => {
    const email = watch("email")

    if (!email) {
      setAlertTitle("Email required")
      setAlertMessage("To change your password, please enter your email address first.")
      setAlertOpen(true)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
    })

    if (error) {
      setAlertTitle("Reset failed")
      setAlertMessage(error.message)
    } else {
      setAlertTitle("Check your inbox")
      setAlertMessage("A password reset link has been sent to your email.")
    }

    setAlertOpen(true)
  }

  const LoginSubmit = async (data: LoginSchema) => {
    const login_api = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (login_api.ok) {
      setLoginButtonState("logging in...");
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
          <p className="w-full items-center justify-center text-gray-500 font-rethink text-[14px] mb-[10px]">
            Don't have an account? <Link href="/signup" className="text-black underline cursor-pointer font-semibold">sign up</Link>
          </p>

          <form onSubmit={handleSubmit(LoginSubmit)} className="w-3/4">
            <div className="mb-4">
              <div className="flex flex-col gap-2 mb-[10px]">
                <Label htmlFor="email" className="text-gray-700 text-[12px] font-rethink font-semibold">Email</Label>
                {errors.email && <p className="text-red-500 text-[12px] font-bold">{errors.email.message}</p>}
                <Input {...register("email")} id="email" type="email" placeholder="john.doe@example.com" className="text-[12px] font-rethink font-semibold rounded-[10px]"/>
              </div>
              <div className="flex flex-col gap-2 mb-[15px] items-start justify-center">
                <Label htmlFor="password" className="text-gray-700 text-[12px] font-rethink font-semibold">Password</Label>
                {errors.password && <p className="text-red-500 text-[12px] font-bold">{errors.password.message}</p>}
                <Input {...register("password")} id="password" type="password" placeholder="enter your password" className="text-[12px] font-rethink font-semibold rounded-[10px]" />
                <button type="button" onClick={forgotPassword} className="text-[14px] font-rethink font-semibold text-black underline">Forgot password?</button>
              </div>
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

    {/* Alert Dialog for notifications */}
    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
      <AlertDialogContent className="w-[400px] p-[20px] rounded-[10px]">
        <AlertDialogHeader className="gap-[5px]">
          <AlertDialogTitle className="font-rethink font-bold text-[20px]">{alertTitle}</AlertDialogTitle>
          <AlertDialogDescription className="font-rethink font-medium text-[14px] leading-[18px]">
            {alertMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setAlertOpen(false)} className="bg-black hover:bg-gray-800 text-white font-rethink font-extrabold px-[10px] py-0 rounded-[10px] text-[14px]">
            OKAY
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
