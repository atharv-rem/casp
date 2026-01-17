'use client';
import { useState } from 'react';
import Image from 'next/image';
import cross from "@/public/assets/cross.svg"
import plus from "@/public/assets/plus.svg"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const field_types = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Yes / No' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'time', label: 'Time' },
  { value: 'file', label: 'File Attachment' },
  { value: 'rating', label: 'Rating' },
];

export default function SchemaBuilder({ fields, setFields }) {
  const [newField, setNewField] = useState('');
  const [fieldType, setFieldType] = useState('text');

  const addField = () => {
    if (!newField.trim()) return;

    setFields([
      ...fields,
      {
        id: crypto.randomUUID(),
        label: newField.toUpperCase(),
        key: newField.toLowerCase().replace(/\s+/g, '_'),
        type: fieldType,
        required: false,
      },
    ]);

    setNewField('');
    setFieldType('text');
  };

  const removeField = (id) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  return (
    <div className="w-full grid grid-cols-2 gap-x-[20px]">

      {/* Add new column */}
      <div className="flex flex-col font-rethink gap-[12px]">
        <div className="flex flex-col gap-y-[5px]">
          <Label htmlFor="column-name" className="text-gray-700 text-[12px] font-rethink font-semibold">
            Column name
          </Label>
          <Input
            id="column-name"
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            placeholder="description"
            className="font-medium font-rethink rounded-[10px] text-[12px] focus:placeholder-transparent"
          />
        </div>

        <div className="flex flex-col gap-y-[5px]">
          <Label htmlFor="column-type" className="text-gray-700 text-[12px] font-rethink font-semibold">
            Column type
          </Label>
          <Select value={fieldType} onValueChange={setFieldType}>
            <SelectTrigger className="w-full rounded-[15px] px-[15px] py-[10px] h-auto text-[12px] font-rethink font-medium rounded-[10px]">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {field_types.map((t) => (
                <SelectItem key={t.value} value={t.value} className="font-semibold font-rethink text-[12px]">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div onClick={addField} className="border-[2px] border-dashed border-[#b9b9b9] rounded-[10px] py-[4px] text-center cursor-pointer font-bold text-[14px] font-rethink hover:bg-gray-50 flex flex-row justify-center items-center mt-4">
          <Image src={plus} alt="Add Field" className="w-4 h-4 mr-2"/>
          <p>{`Add ${newField} Column`}</p>
        </div>
      </div>
      
      {/* Existing fields */}
      <div className="flex flex-col">
        {fields.length > 0 && <h1 className="font-rethink font-medium text-[12px] mb-[5px]">New Columns</h1>}
        <div className="flex flex-col gap-[12px] w-full mb-[10px]">
          {fields.map((field) => (
            <div key={field.id} className="flex items-center justify-between">      
              <div className="flex flex-row bg-[#f4f4f4] rounded-[10px] py-2 px-3 w-full justify-between items-center">
                <div className="font-rethink text-[12px] flex flex-row items-center gap-3 justify-center rounded-[10px] font-rethink focus:placeholder-transparent">
                  <p className="text-[black] font-bold">{field.label.toUpperCase()}</p>
                  <p className="text-[#8c8c8c] font-medium">{field.type.toUpperCase()}</p>
                </div>
                <Image onClick={() => removeField(field.id)} src={cross} alt="Remove Field" className="size-[10px] cursor-pointer"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
