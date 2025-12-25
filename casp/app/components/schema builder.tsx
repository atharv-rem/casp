'use client';
import { useState } from 'react';
import Image from 'next/image';
import cross from "@/public/assets/cross.svg"
import plus from "@/public/assets/plus.svg"
const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Yes / No' },
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
    <div className="w-full">
      {/* Existing fields */}
      <div className="flex flex-col gap-3 w-full mb-[10px]">
        {fields.map((field) => (
          <div key={field.id} className="flex items-center justify-between">      
            <div className="flex flex-row bg-[#f4f4f4] rounded-[15px] px-[15px] py-[10px] w-full justify-between items-center">
              <div className="font-bold font-rethink text-[15px] flex flex-row items-center gap-3 justify-center">
                <p className="text-[black]">{field.label.toUpperCase()}</p>
                <p className="text-[#8c8c8c]">{field.type.toUpperCase()}</p>
              </div>
              <Image onClick={() => removeField(field.id)} src={cross} alt="Remove Field" className="size-[12px]"/>            </div>
          </div>
        ))}
      </div>

      {/* Add new column */}
      <div className="gap-3 flex flex-col font-rethink">
        <input value={newField} onChange={(e) => setNewField(e.target.value)} placeholder="column name (eg: name)" className="w-full border-[1px] border-[#b9b9b9] rounded-[15px] px-[15px] py-[10px] text-[15px] font-rethink"/>
        <label htmlFor="schema-field-type" className="hidden">Column type</label>
        <select id="schema-field-type" value={fieldType} onChange={(e) => setFieldType(e.target.value)} className="appearence-none w-full rounded-[15px] px-[15px] py-[10px] text-[15px] font-rethink font-semibold border-[1px] border-[#b9b9b9]">
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value} className="font-semibold">
              {t.label}
            </option>
          ))}
        </select>

        <div onClick={addField} className="border-[1px] border-dashed border-[#b9b9b9] rounded-[15px] py-[5px] text-center cursor-pointer font-semibold font-geist hover:bg-gray-50 flex flex-row justify-center items-center">
          <Image src={plus} alt="Add Field" className="w-4 h-4 mr-2"/>
          <p>ADD COLUMN</p>
        </div>
      </div>
    </div>
  );
}
