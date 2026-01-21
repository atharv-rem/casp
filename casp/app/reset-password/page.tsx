'use client'
import Image from "next/image";
import frorgotPasswordImage from "@/public/assets/signup image.png"
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import passwordResetIcon from "@/public/assets/password-reset.svg"

const forgotPasswordSchema = z.object({
  password: z.string().min(10, "Password must be at least 10 characters").regex(/[A-Z]/, "Must contain at least one uppercase letter").regex(/[a-z]/, "Must contain at least one lowercase letter").regex(/[0-9]/, "Must contain at least one number").regex(/[#@$!%*?&]/, "Must contain at least one special character (@$!%*?&]"),
});
type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ForgotPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const {register,handleSubmit,formState:{errors,isSubmitting}} = useForm<ForgotPasswordSchema>({resolver: zodResolver(forgotPasswordSchema)});

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('User can reset password')
      }
    })
  }, [])

  const updatePassword = async (data: ForgotPasswordSchema) => {
    setLoading(true)
    const {error } = await supabase.auth.updateUser({ password: data.password })
    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      alert('Password updated successfully')
    }
  }


  return (
    <>
    <div className="flex flex-row items-center justify-between h-dvh w-full bg-white">
      <div className="w-1/2 h-full flex flex-col items-center justify-center">
        <div className="w-3/4 items-start justify-center">
          <div className="flex flex-row justify-start items-center mb-[5px]">
            <h1 className="text-[30px] font-rethink font-medium">Reset Password</h1>
            <Image  src={passwordResetIcon} alt="password reset icon" width={30} height={30} className="ml-2"/>
          </div>
          <form onSubmit={handleSubmit(updatePassword)} className="w-3/4 items-start justify-center">
            <div className="flex flex-col gap-[5px] mb-[20px]">
              <Label htmlFor="password" className="text-gray-700 text-[12px] font-rethink font-semibold">Password</Label>
              {errors.password && <p className="text-red-500 text-[12px] font-bold">{errors.password.message}</p>}
              <Input {...register("password")} id="password" type="password" placeholder="enter your password" className="text-[12px] font-rethink font-semibold rounded-[10px]"/>
            </div>
            <button disabled={isSubmitting} type="submit" className=" bg-black hover:bg-gray-800 text-white font-geist font-bold py-[4px] px-[14px] rounded-[12px]">
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
      <div className="relative w-1/2 h-full">
        <Image src={frorgotPasswordImage} alt="forgot password image" fill placeholder="blur" className="object-cover"/>
      </div>
    </div>
    <div className="w-auto fixed bottom-7 right-7 z-50">
      <p className="font-rethink text-[20px] text-black font-medium text-right">“efficiently manage and</p>
      <p className="font-rethink text-[20px] text-black font-medium text-right leading-[12px]"> assign stuff to your workforce”</p>
    </div>
    </>
  );
}
