import Image from "next/image";
import addfile from "@/public/assets/add file.svg"

export default function RecordsPage() {
    return (
        <div className="flex flex-col items-start justify-start w-full h-full px-[20px]">
            <h1 className="text-[25px] font-cal mt-[10px]">Add New Record</h1>
            <div className="flex flex-row mt-[5px]">
                <button className="text-[14px] mb-4 bg-black hover:bg-gray-800 text-white font-inter font-bold py-[5px] px-[10px] rounded-[10px]"> add single record</button>
                <button className="text-[14px] ml-4 mb-4 bg-black hover:bg-gray-800 text-white font-inter font-bold py-[5px] px-[10px] rounded-[10px]">add bulk records</button>
            </div>
            <div className="bg-[#fbfbfb] w-full h-[300px] rounded-[30px] flex flex-col items-center justify-center">
                <Image src={addfile} alt="records illustration" width={50} height={50}/>
                <p className="text-[15px] font-inter font-medium mt-4">Drag and drop your files here to upload</p>
                <p className="text-[13px] font-inter font-regular mt-2 text-gray-400">Supported formats: CSV, XLSX, JSON</p>

            </div>
        </div>
    );
}