import Image from "next/image";
import logo from "../public/assets/black casp logo.png";
import arrowRight from "../public/assets/arrow icon.svg";
import github from "../public/assets/github logo.svg";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-4 sm:top-8 h-auto w-full flex flex-row items-center justify-between border-2 border-dashed border-t-[#EAEAEA] border-b-[#EAEAEA] bg-white z-10 px-4 sm:px-8 py-2 sm:py-1">
        <div className="flex flex-row items-center justify-start">
          <Image src={logo} alt="CASP Logo" width={20} height={20} className="ml-1 sm:ml-2.5" />
          <p className="font-rethink font-bold text-lg sm:text-[20px] ml-1">casp</p>
          <p className="font-rethink font-bold text-[10px] sm:text-[12px] ml-1 px-2 py-px bg-[#d9d9d9] text-black rounded-[7px]">beta</p>
        </div>
        <div className="flex flex-row items-center gap-2 sm:gap-4 mr-1">
          <p className="hidden md:block font-rethink font-bold text-[18px] text-black">pricing</p>
          <p className="hidden md:block font-rethink font-bold text-[18px] text-black">dashboard</p>
          <Image src={github} alt="GitHub Logo" width={18} height={18} className="hidden sm:block mr-1" />
          <Link href="/login" className="py-1 sm:py-0.5 px-3 sm:px-4 bg-black text-white text-sm sm:text-[18px] font-rethink font-bold rounded-[10px] w-auto h-auto shadow-md hover:bg-gray-800">
            login
          </Link>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="flex items-center min-h-dvh w-full px-4 sm:px-8 pt-28 sm:pt-32 pb-10">
        <div className="flex flex-col items-start gap-4 sm:gap-5 max-w-3xl">
          <h1 className="font-rethink font-semibold text-[38px] leading-none sm:text-[60px] sm:leading-none">
            Employee <br /> Management OS
          </h1>

          <p className="font-rethink font-medium text-[18px] sm:text-[23px] text-[#8f8f8f] leading-tight sm:leading-6">
            allocate manpower efficiently to <br className="hidden sm:block" />
            get the most out of your workforce.
          </p>

          <Link href="/signup" className="flex flex-row pt-0.5 pb-1 pl-3 pr-1 bg-black text-white text-[18px] sm:text-[20px] font-rethink font-medium rounded-[15px] w-auto h-auto shadow-md items-center justify-center hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
            <div className="font-medium">get started</div>
            <Image src={arrowRight} alt="Arrow Right" width={20} height={20} className="ml-1" />
          </Link>
        </div>
      </div>
    </>
  );
}
