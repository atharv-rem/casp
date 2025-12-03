import Image from "next/image";
import workplace from "../public/homepage photo.png";
import logo from "../public/assets/black casp logo.png";

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-[20px] left-[30px] right-[30px] h-[40px] flex flex-row items-center justify-between border-[1px] border-gray-300 bg-white z-10 rounded-[15px] shadow-2xl">
        <div className="flex flex-row items-center justify-start">
          <Image src={logo} alt="CASP Logo" width={23} height={23} className="ml-[10px]" />
          <p className="font-ibm font-bold text-[20px] ml-[5px]">casp</p>
        </div>
        <div className="flex flex-row items-center gap-8 mr-[20px]">
          <p className="font-ibm font-semibold text-[18px] text-black">PRICING</p>
          <p className="font-ibm font-semibold text-[18px] text-black">DASHBOARD</p>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="flex flex-row items-center justify-between h-dvh w-full">
        <div className="flex flex-col items-start gap-5 ml-[30px]">
          <h1 className="font-ibm font-bold text-[60px] leading-[55px]">
            Employee <br /> management OS
          </h1>

          <p className="font-ibm font-semibold text-[23px] text-[#8f8f8f] leading-[25px]">
            ALLOCATE MANPOWER EFFCIENTLY TO <br />
            GET THE MOST OUT OF YOUR WORKFORCE
          </p>

          <div className="px-[10px] py-[5px] bg-black text-white text-[20px] font-ibm font-semibold rounded-[15px] w-auto h-auto shadow-md">
            Get Started
          </div>
        </div>

        <Image
          src={workplace}
          alt="Employee Management"
          width={488}
          height={497}
        />
      </div>
    </>
  );
}
