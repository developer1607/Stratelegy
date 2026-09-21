/** PBX scheduled report tables. */

export async function createPbxReportTables(execute) {
  await execute(`
    CREATE TABLE IF NOT EXISTS pbx_report_schedules (
      id VARCHAR(36) PRIMARY KEY,
      type VARCHAR(64) NOT NULL,
      domain VARCHAR(255) NULL,
      times_json JSON NOT NULL,
      days_json JSON NULL,
      recipients_json JSON NOT NULL,
      options_json JSON NULL,
      enabled TINYINT(1) NOT NULL DEFAULT 1,
      created_by VARCHAR(36) NULL,
      last_sent_at DATETIME NULL,
      last_run_status VARCHAR(50) NULL,
      last_run_message TEXT NULL,
      created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_pbx_sched_type (type),
      INDEX idx_pbx_sched_enabled (enabled),
      INDEX idx_pbx_sched_last_sent (last_sent_at),
      CONSTRAINT fk_pbx_sched_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
