package main

import (
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/xuri/excelize/v2"
)

func normalize(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

func ProcessExcel(
	file multipart.File,
	conn *pgx.Conn,
	orgID string,
	schemaFields []string, // custom fields only
) error {

	f, err := excelize.OpenReader(file)
	if err != nil {
		return err
	}

	ctx := context.Background()

	// expected columns = system + custom
	expected := map[string]bool{
		"name":  true,
		"email": true,
	}

	for _, field := range schemaFields {
		expected[normalize(field)] = true
	}

	rows, err := f.Rows("Sheet1")
	if err != nil {
		return err
	}

	// --- read header row ---
	if !rows.Next() {
		return fmt.Errorf("empty excel file")
	}

	headers, _ := rows.Columns()
	columnIndex := make(map[string]int)

	for i, h := range headers {
		key := normalize(h)
		if !expected[key] {
			return fmt.Errorf("unexpected column: %s", h)
		}
		columnIndex[key] = i
	}

	if len(columnIndex) != len(expected) {
		return fmt.Errorf("missing required columns")
	}

	batch := [][]interface{}{}
	BATCH_SIZE := 500

	for rows.Next() {
		row, _ := rows.Columns()

		// --- system_profile ---
		systemProfile := map[string]interface{}{
			"name":  row[columnIndex["name"]],
			"email": row[columnIndex["email"]],
		}

		// --- custom_profile ---
		customProfile := map[string]interface{}{}
		for _, field := range schemaFields {
			key := normalize(field)
			customProfile[key] = row[columnIndex[key]]
		}

		systemJSON, _ := json.Marshal(systemProfile)
		customJSON, _ := json.Marshal(customProfile)

		batch = append(batch, []interface{}{
			orgID,
			systemJSON,
			customJSON,
		})

		if len(batch) == BATCH_SIZE {
			_, err = conn.CopyFrom(
				ctx,
				pgx.Identifier{"employees"},
				[]string{
					"organization_id",
					"system_profile",
					"custom_profile",
				},
				pgx.CopyFromRows(batch),
			)
			if err != nil {
				return err
			}
			batch = batch[:0]
		}
	}

	if len(batch) > 0 {
		_, err = conn.CopyFrom(
			ctx,
			pgx.Identifier{"employees"},
			[]string{
				"organization_id",
				"system_profile",
				"custom_profile",
			},
			pgx.CopyFromRows(batch),
		)
		if err != nil {
			return err
		}
	}

	return nil
}
