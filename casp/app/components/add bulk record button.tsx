'use client'
import {useState} from 'react'

export default function AddBulkRecordButton() {
    const [status, setStatus] = useState('');
    const handle_excel_sheet = async(e) => {
        const file = e.target.files[0];
        if (!file) {
            setStatus('No file selected');
            return;
        }

        const MAX_SIZE = 5 * 1024 * 1024; 
        if (file.size > MAX_SIZE) {
        setStatus("Error: File size exceeds 5MB.");
        e.target.value = null; 
        return; 
        }

        const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
        ];
        
        const isExcelExtension = /\.(xlsx|xls)$/i.test(file.name);

        if (!allowedMimeTypes.includes(file.type) && !isExcelExtension) {
        setStatus("Error: Only Excel files (.xlsx, .xls) are allowed.");
        e.target.value = null; 
        return; 
        }

        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch(
                'http://localhost:54321/functions/v1/excel-parsing',
                {
                    method: 'POST',
                    headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                    body: formData,
                }
                );
            const text=await response.text();
            if (response.ok) {
                setStatus('File uploaded successfully');
            } else {
                setStatus(`File upload failed: ${text}`);
            }
        } catch (error) {
            setStatus('An error occurred during file upload');

        }
        e.target.value = null;
    };

    return (
        <>
        <label className="text-[14px] mb-4 bg-black hover:bg-gray-800 text-white font-albert font-bold py-[5px] px-[10px] rounded-[10px] cursor-pointer inline-block">
            <span>add multiple records</span>
            <input 
                type="file" 
                onChange={handle_excel_sheet} 
                accept=".xlsx,.xls" 
                className="hidden" 
            />
        </label>
        {status && <p className="mt-2 text-[12px] font-albert">{status}</p>}
        </>
    )
}