import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    // ✅ Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file uploaded" }),
        { status: 400 }
      );
    }

    // ✅ Convert File → ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // ✅ Parse Excel
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    let rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // ✅ Remove empty rows
    rows = rows.filter((row) =>
      Object.values(row).some((v) => v !== "" && v !== null)
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Excel sheet is empty" }),
        { status: 400 }
      );
    }

    // ✅ Normalize headers (lowercase + trim)
    rows = rows.map((row) => {
      const normalized: Record<string, any> = {};
      for (const key in row) {
        normalized[key.toLowerCase().trim()] = row[key];
      }
      return normalized;
    });

    // ✅ Supabase client with SERVICE ROLE (safe here)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ❗ IMPORTANT: batch insert (prevents payload limits)
    const BATCH_SIZE = 500;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("employees").insert(batch);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted: rows.length,
      }),
      { status: 200 }
    );

  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});
