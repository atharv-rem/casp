package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

/* -------------------- schema -------------------- */

type SchemaField struct {
	Key string `json:"key"`
}

type UploadRequest struct {
	OrgID          string        `json:"org_id"`
	TemplateType   string        `json:"template_type"`
	EmployeeSchema []SchemaField `json:"employee_schema"`
	ProjectSchema  []SchemaField `json:"project_schema"`
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

	/* ---------- parse JSON body from form field ---------- */

	metadataRaw := r.FormValue("metadata")
	if metadataRaw == "" {
		http.Error(w, "missing metadata field", http.StatusBadRequest)
		return
	}

	var req UploadRequest
	if err := json.Unmarshal([]byte(metadataRaw), &req); err != nil {
		http.Error(w, fmt.Sprintf("invalid metadata JSON: %v", err), http.StatusBadRequest)
		return
	}

	/* ---------- validate org ---------- */

	if req.OrgID == "" {
		http.Error(w, "missing org_id", http.StatusUnauthorized)
		return
	}

	/* ---------- validate template type ---------- */

	if req.TemplateType == "" {
		http.Error(w, "missing template_type", http.StatusBadRequest)
		return
	}

	template := TemplateType(req.TemplateType)
	if template != EmployeeTemplate &&
		template != ProjectTemplate &&
		template != AssignmentTemplate {
		http.Error(w, "invalid template type", http.StatusBadRequest)
		return
	}

	/* ---------- extract employee schema keys ---------- */

	var employeeFields []string
	for _, f := range req.EmployeeSchema {
		employeeFields = append(employeeFields, f.Key)
	}

	/* ---------- extract project schema keys ---------- */

	var projectFields []string
	for _, f := range req.ProjectSchema {
		projectFields = append(projectFields, f.Key)
	}

	log.Printf("debug: orgID=%s, template=%s, empFields=%v, projFields=%v",
		req.OrgID, template, employeeFields, projectFields)

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
		req.OrgID,
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
