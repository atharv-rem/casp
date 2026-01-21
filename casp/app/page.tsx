import Image from "next/image";
import logo from "../public/assets/black casp logo.png";
import arrowRight from "../public/assets/arrow icon.svg";
import github from "../public/assets/github logo.svg";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-[30px] h-auto w-full flex flex-row items-center justify-between border-[2px] border-dashed border-t-[#EAEAEA] border-b-[#EAEAEA] bg-white z-10 px-[30px] py-[5px]">
        <div className="flex flex-row items-center justify-start">
          <Image src={logo} alt="CASP Logo" width={20} height={20} className="ml-[10px]" />
          <p className="font-rethink font-bold text-[20px] ml-[5px]">casp</p>
          <p className="font-rethink font-bold text-[12px] ml-[5px] px-[8px] py-[1px] bg-[#d9d9d9] text-black rounded-[7px]">beta</p>
        </div>
        <div className="flex flex-row items-center gap-[15px] mr-[5px]">
          <p className="font-rethink font-bold text-[18px] text-black">pricing</p>
          <p className="font-rethink font-bold text-[18px] text-black">dashboard</p>
          <Image src={github} alt="GitHub Logo" width={18} height={18} className="mr-[5px]" />
          <Link href="/login" className="py-[2px] px-[15px] bg-black text-white text-[18px] font-rethink font-bold rounded-[10px] w-auto h-auto shadow-md hover:bg-gray-800">
            login
          </Link>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="flex flex-row items-center justify-between h-dvh w-full">
        <div className="flex flex-col items-start gap-5 ml-[30px]">
          <h1 className="font-rethink font-semibold text-[60px] leading-[55px]">
            Employee <br /> Management OS
          </h1>

          <p className="font-rethink font-medium text-[23px] text-[#8f8f8f] leading-[25px]">
            allocate manpower efficiently to <br />
            get the most out of your workforce.
          </p>

          <Link href="/signup" className="flex flex-row pt-[2px] pb-[5px] pl-[13px] pr-[3px] bg-black text-white text-[20px] font-rethink font-medium rounded-[15px] w-auto h-auto shadow-md items-center justify-center hover:translate-x-1 hover:duration-300 hover:bg-gray-800">
            <div className="font-medium">get started</div>
            <Image src={arrowRight} alt="Arrow Right" width={22} height={22} className="ml-[5px]" />
          </Link>
        </div>
      </div>
    </>
  );
}
