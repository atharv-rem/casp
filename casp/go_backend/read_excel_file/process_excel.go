package main

import (
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/xuri/excelize/v2"
)

/* -------------------- helpers -------------------- */

func normalize(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

func nullableString(s string) interface{} {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	return s
}

func nullableInt(i int) interface{} {
	if i == 0 {
		return nil
	}
	return i
}

/* -------------------- template types -------------------- */

type TemplateType string

const (
	EmployeeTemplate   TemplateType = "employees"
	ProjectTemplate    TemplateType = "projects"
	AssignmentTemplate TemplateType = "assignments"
	AllTemplate        TemplateType = "all"
)

/* -------------------- parsed row -------------------- */

type ParsedRow struct {
	EmployeeName  string
	EmployeeEmail string

	ProjectName string

	StartDate  time.Time
	EndDate    *time.Time
	Allocation *int

	EmployeeCustom map[string]string
	ProjectCustom  map[string]string
}

/* -------------------- expected headers -------------------- */

func expectedHeaders(
	template TemplateType,
	employeeFields []string,
	projectFields []string,
) []string {

	base := []string{}

	switch template {

	case EmployeeTemplate:
		base = []string{"employee name", "employee email"}
		for _, f := range employeeFields {
			base = append(base, normalize(f))
		}

	case ProjectTemplate:
		base = []string{"project name"}
		for _, f := range projectFields {
			base = append(base, normalize(f))
		}

	case AssignmentTemplate:
		base = []string{
			"employee email",
			"project name",
			"start date",
			"end date",
			"allocation %",
		}

	case AllTemplate:
		base = []string{
			"employee name",
			"employee email",
			"project name",
			"start date",
			"end date",
			"allocation %",
		}
		for _, f := range employeeFields {
			base = append(base, normalize(f))
		}
		for _, f := range projectFields {
			base = append(base, normalize(f))
		}
	}

	return base
}

/* -------------------- main entry -------------------- */

func ProcessExcel(
	file multipart.File,
	conn *pgx.Conn,
	orgID string,
	template TemplateType,
	customEmployeeFields []string,
	customProjectFields []string,
) error {

	ctx := context.Background()

	f, err := excelize.OpenReader(file)
	if err != nil {
		return err
	}

	rows, err := f.Rows("Sheet1")
	if err != nil {
		return err
	}

	if !rows.Next() {
		return fmt.Errorf("empty excel file")
	}

	/* ---------- headers ---------- */

	headers, _ := rows.Columns()
	col := map[string]int{}

	for i, h := range headers {
		col[normalize(h)] = i
	}

	for _, h := range expectedHeaders(template, customEmployeeFields, customProjectFields) {
		if _, ok := col[h]; !ok {
			return fmt.Errorf("missing required column: %s", h)
		}
	}

	/* ---------- parse rows ---------- */

	// helper to safely get cell value with bounds check
	getCell := func(r []string, idx int) string {
		if idx < len(r) {
			return r[idx]
		}
		return ""
	}

	var parsed []ParsedRow

	for rows.Next() {
		r, _ := rows.Columns()

		// skip empty rows
		if len(r) == 0 {
			continue
		}

		pr := ParsedRow{
			EmployeeCustom: map[string]string{},
			ProjectCustom:  map[string]string{},
		}

		if v, ok := col["employee name"]; ok {
			pr.EmployeeName = getCell(r, v)
		}
		if v, ok := col["employee email"]; ok {
			pr.EmployeeEmail = getCell(r, v)
		}
		if v, ok := col["project name"]; ok {
			pr.ProjectName = getCell(r, v)
		}

		if v, ok := col["start date"]; ok && getCell(r, v) != "" {
			pr.StartDate, _ = time.Parse("2006-01-02", getCell(r, v))
		}
		if v, ok := col["end date"]; ok && getCell(r, v) != "" {
			t, _ := time.Parse("2006-01-02", getCell(r, v))
			pr.EndDate = &t
		}
		if v, ok := col["allocation %"]; ok && getCell(r, v) != "" {
			i, _ := strconv.Atoi(getCell(r, v))
			pr.Allocation = &i
		}

		for _, f := range customEmployeeFields {
			key := normalize(f)
			if i, ok := col[key]; ok {
				pr.EmployeeCustom[key] = getCell(r, i)
			}
		}
		for _, f := range customProjectFields {
			key := normalize(f)
			if i, ok := col[key]; ok {
				pr.ProjectCustom[key] = getCell(r, i)
			}
		}

		parsed = append(parsed, pr)
	}

	/* ---------- execute ---------- */

	switch template {

	case EmployeeTemplate:
		return upsertEmployees(ctx, conn, orgID, parsed)

	case ProjectTemplate:
		return upsertProjects(ctx, conn, orgID, parsed)

	case AssignmentTemplate:
		return insertAssignments(ctx, conn, orgID, parsed)

	case AllTemplate:
		return processAllTemplate(ctx, conn, orgID, parsed)
	}

	return nil
}

/* -------------------- employees -------------------- */

func upsertEmployees(ctx context.Context, conn *pgx.Conn, orgID string, rows []ParsedRow) error {

	for _, r := range rows {

		systemJSON, _ := json.Marshal(map[string]string{
			"name":  r.EmployeeName,
			"email": r.EmployeeEmail,
		})
		customJSON, _ := json.Marshal(r.EmployeeCustom)

		_, err := conn.Exec(ctx, `
			INSERT INTO employees (organization_id, system_profile, custom_profile)
			VALUES ($1,$2,$3)
		`, orgID, systemJSON, customJSON)

		if err != nil {
			return err
		}
	}

	return nil
}

/* -------------------- projects -------------------- */

func upsertProjects(ctx context.Context, conn *pgx.Conn, orgID string, rows []ParsedRow) error {

	for _, r := range rows {

		metaJSON, _ := json.Marshal(r.ProjectCustom)

		_, err := conn.Exec(ctx, `
			INSERT INTO projects (organization_id, name, meta)
			VALUES ($1,$2,$3)
		`, orgID, r.ProjectName, metaJSON)

		if err != nil {
			return err
		}
	}

	return nil
}

/* -------------------- assignments -------------------- */

func insertAssignments(ctx context.Context, conn *pgx.Conn, orgID string, rows []ParsedRow) error {

	for _, r := range rows {

		var employeeID, projectID string

		err := conn.QueryRow(ctx,
			`SELECT id FROM employees
			 WHERE organization_id=$1
			   AND system_profile->>'email'=$2`,
			orgID, r.EmployeeEmail,
		).Scan(&employeeID)
		if err != nil {
			return fmt.Errorf("employee not found: %s", r.EmployeeEmail)
		}

		err = conn.QueryRow(ctx,
			`SELECT id FROM projects
			 WHERE organization_id=$1 AND name=$2`,
			orgID, r.ProjectName,
		).Scan(&projectID)
		if err != nil {
			return fmt.Errorf("project not found: %s", r.ProjectName)
		}

		_, err = conn.Exec(ctx, `
			INSERT INTO employee_project_assignments
			(organization_id, employee_id, project_id, start_date, end_date, allocation_percentage)
			VALUES ($1,$2,$3,$4,$5,$6)
		`,
			orgID,
			employeeID,
			projectID,
			r.StartDate,
			r.EndDate,
			r.Allocation,
		)

		if err != nil {
			return err
		}
	}

	return nil
}

/* -------------------- ALL TEMPLATE -------------------- */

func processAllTemplate(ctx context.Context, conn *pgx.Conn, orgID string, rows []ParsedRow) error {

	for _, r := range rows {

		// employee
		var employeeID string
		err := conn.QueryRow(ctx, `
			INSERT INTO employees (organization_id, system_profile, custom_profile)
			VALUES ($1,$2,$3)
			ON CONFLICT (organization_id, (system_profile->>'email'))
			DO UPDATE SET custom_profile=EXCLUDED.custom_profile
			RETURNING id
		`,
			orgID,
			mustJSON(map[string]string{
				"name":  r.EmployeeName,
				"email": r.EmployeeEmail,
			}),
			mustJSON(r.EmployeeCustom),
		).Scan(&employeeID)
		if err != nil {
			return err
		}

		// project
		var projectID string
		err = conn.QueryRow(ctx, `
			INSERT INTO projects (organization_id, name, meta)
			VALUES ($1,$2,$3)
			ON CONFLICT (organization_id, name)
			DO UPDATE SET meta=EXCLUDED.meta
			RETURNING id
		`,
			orgID,
			r.ProjectName,
			mustJSON(r.ProjectCustom),
		).Scan(&projectID)
		if err != nil {
			return err
		}

		// assignment (skip if exists)
		_, err = conn.Exec(ctx, `
			INSERT INTO employee_project_assignments
			(organization_id, employee_id, project_id, start_date, end_date, allocation_percentage)
			VALUES ($1,$2,$3,$4,$5,$6)
			ON CONFLICT (organization_id, employee_id, project_id)
			DO NOTHING
		`,
			orgID,
			employeeID,
			projectID,
			r.StartDate,
			r.EndDate,
			r.Allocation,
		)
		if err != nil {
			return err
		}
	}

	return nil
}

/* -------------------- utils -------------------- */

func mustJSON(v interface{}) []byte {
	b, _ := json.Marshal(v)
	return b
}
