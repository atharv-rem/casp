package main

import (
	"encoding/json"
	"net/http"
)

type SchemaField struct {
	Key string `json:"key"`
}

func UploadExcel(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(200 << 20) // 200MB
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "file missing", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// TEMP: org_id from header (JWT later)
	orgID := r.Header.Get("x-org-id")
	if orgID == "" {
		http.Error(w, "missing org id", http.StatusUnauthorized)
		return
	}

	// 🔥 NEW: read employee schema from header
	rawSchema := r.Header.Get("x-employee-schema")
	if rawSchema == "" {
		http.Error(w, "employee schema missing", http.StatusBadRequest)
		return
	}

	var fields []SchemaField
	if err := json.Unmarshal([]byte(rawSchema), &fields); err != nil {
		http.Error(w, "invalid schema format", http.StatusBadRequest)
		return
	}

	// extract only keys
	schemaFields := make([]string, 0, len(fields))
	for _, f := range fields {
		schemaFields = append(schemaFields, f.Key)
	}

	conn, err := Connect()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer conn.Close(r.Context())

	// 🔥 UPDATED CALL (new signature)
	err = ProcessExcel(file, conn, orgID, schemaFields)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Write([]byte("Upload successful"))
}
