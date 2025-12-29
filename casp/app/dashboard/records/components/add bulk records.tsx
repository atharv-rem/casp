'use client'

import { useState } from 'react'
import readXlsxFile from 'read-excel-file'
import { add_multiple_employee_records } from '@/app/dashboard/records/action'

export default function AddBulkRecordButton() {
  const [status, setStatus] = useState('')

  const handle_excel_sheet = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setStatus('Validating file...')

      // read headers in browser
      const rows = await readXlsxFile(file)
      if (!rows.length) {
        setStatus('Empty Excel file')
        return
      }

      const excelHeaders = (rows[0] as string[])
        .map(h => String(h).toLowerCase().trim())

      const formData = new FormData()
      formData.append('file', file)

      await add_multiple_employee_records(formData, excelHeaders)

      setStatus('File uploaded successfully ✅')
    } catch (err: any) {
      console.error(err)
      setStatus(err.message || 'Something went wrong')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <>
      <label className="cursor-pointer bg-black text-white px-3 py-2 rounded">
        add multiple records
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handle_excel_sheet}
          className="hidden"
        />
      </label>

      {status && <p className="mt-2 text-sm">{status}</p>}
    </>
  )
}
