/** Portal roles and role → permission mappings. */

export async function createRoleTables(execute) {
  await execute(`
    CREATE TABLE IF NOT EXISTS roles (
      id VARCHAR(36) PRIMARY KEY,
      slug VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      description TEXT NULL,
      is_system TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_roles_sort (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id VARCHAR(36) NOT NULL,
      permission_key VARCHAR(64) NOT NULL,
      PRIMARY KEY (role_id, permission_key),
      CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
