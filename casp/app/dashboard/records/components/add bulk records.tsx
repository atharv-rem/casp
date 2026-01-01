'use client'
import Image from 'next/image'
import erroricon from "@/public/assets/error icon.svg"
import { useState, useRef } from 'react'
import readXlsxFile from 'read-excel-file'
import { add_multiple_employee_records } from '@/app/dashboard/records/action'

export default function AddBulkRecordButton() {
  const [uploadError, setUploadError] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')

  const handle_excel_sheet = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadStatus('Validating file...')
      setUploadError('')
      const rows = await readXlsxFile(file)
      if (!rows.length) {
        setUploadStatus('Empty Excel file')
        return
      }

      const excelHeaders = (rows[0] as string[])
        .map(h => String(h).toLowerCase().trim())

      const formData = new FormData()
      formData.append('file', file)

      await add_multiple_employee_records(formData, excelHeaders)
      setTimeout(() => {
        setUploadStatus('File uploaded successfully')
      }, 2000);
      setUploadError('')
    } catch (error: any) {
      setUploadError(error.message || 'Something went wrong')
      setUploadStatus('')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <>
      <label
        htmlFor="file-upload"
        className="bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(circle,black_0%,transparent_80%)] text-black font-rethink pl-[15px] pr-[10px] py-[5px] rounded-[15px] flex flex-col items-center justify-center cursor-pointer w-full h-[400px] "
      >
        {uploadStatus ?
          <div className="flex flex-col text-center">
            <p className="text-[18px] font-bold">{uploadStatus}</p>
          </div>
          :
          <div className="flex flex-col text-center">
            <p className="text-[18px] font-bold">Click to upload Excel file</p>
            <p className="text-[14px] text-gray-600">Supported formats: .xlsx, .xls</p>
            {uploadError && 
              <div className="flex flex-row items-center mt-1 mb-1">
                <Image src={erroricon} alt="error icon" width={20} height={20} className="mr-2"/> 
                <p className="text-red-500 font-rethink font-bold text-[15px]">{uploadError}</p>
              </div>}
          </div>
      }
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".xlsx,.xls"
        onChange={handle_excel_sheet}
        className="hidden"
      />
    </>
  )
}
