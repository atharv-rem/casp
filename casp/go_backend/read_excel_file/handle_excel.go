package main

import (
	"encoding/json"
	"net/http"
)

/* -------------------- schema -------------------- */

type SchemaField struct {
	Key string `json:"key"`
}

/* -------------------- handler -------------------- */

func UploadExcel(w http.ResponseWriter, r *http.Request) {

	/* ---------- parse multipart ---------- */

	if err := r.ParseMultipartForm(200 << 20); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "file missing", http.StatusBadRequest)
		return
	}
	defer file.Close()

	/* ---------- org ---------- */

	orgID := r.Header.Get("x-org-id")
	if orgID == "" {
		http.Error(w, "missing org id", http.StatusUnauthorized)
		return
	}

	/* ---------- template type ---------- */

	templateRaw := r.Header.Get("x-template-type")
	if templateRaw == "" {
		http.Error(w, "missing template type", http.StatusBadRequest)
		return
	}

	template := TemplateType(templateRaw)
	if template != EmployeeTemplate &&
		template != ProjectTemplate &&
		template != AssignmentTemplate {
		http.Error(w, "invalid template type", http.StatusBadRequest)
		return
	}

	/* ---------- employee schema ---------- */

	var employeeFields []string

	rawEmpSchema := r.Header.Get("x-employee-schema")
	if rawEmpSchema != "" {
		var fields []SchemaField
		if err := json.Unmarshal([]byte(rawEmpSchema), &fields); err != nil {
			http.Error(w, "invalid employee schema", http.StatusBadRequest)
			return
		}
		for _, f := range fields {
			employeeFields = append(employeeFields, f.Key)
		}
	}

	/* ---------- project schema ---------- */

	var projectFields []string

	rawProjSchema := r.Header.Get("x-project-schema")
	if rawProjSchema != "" {
		var fields []SchemaField
		if err := json.Unmarshal([]byte(rawProjSchema), &fields); err != nil {
			http.Error(w, "invalid project schema", http.StatusBadRequest)
			return
		}
		for _, f := range fields {
			projectFields = append(projectFields, f.Key)
		}
	}

	/* ---------- db ---------- */

	conn, err := Connect()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer conn.Close(r.Context())

	/* ---------- process ---------- */

	err = ProcessExcel(
		file,
		conn,
		orgID,
		template,
		employeeFields,
		projectFields,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Upload successful"))
}
