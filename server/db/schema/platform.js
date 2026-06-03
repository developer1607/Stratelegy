/** Core platform tables: auth, tickets, invites, audit logs. */

export async function createPlatformTables(execute) {
  await execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      avatar_url TEXT,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      departments VARCHAR(500) NULL,
      categories VARCHAR(500) NULL,
      created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS app_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(36),
      page_name VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS tickets (
      id VARCHAR(36) PRIMARY KEY,
      ticket_number INT UNSIGNED NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'open',
      priority VARCHAR(20) NOT NULL DEFAULT 'medium',
      category VARCHAR(100) NOT NULL,
      department VARCHAR(100) NULL,
      source VARCHAR(50) NULL DEFAULT 'web',
      assigned_to VARCHAR(255) NULL,
      requester VARCHAR(255) NULL,
      requester_email VARCHAR(255) NULL,
      created_by VARCHAR(36) NULL,
      created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_tickets_status (status),
      INDEX idx_tickets_priority (priority),
      INDEX idx_tickets_category (category),
      INDEX idx_tickets_department (department),
      INDEX idx_tickets_assigned_to (assigned_to),
      INDEX idx_tickets_number (ticket_number),
      INDEX idx_tickets_created (created_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS ticket_comments (
      id VARCHAR(36) PRIMARY KEY,
      ticket_id VARCHAR(36) NOT NULL,
      message TEXT NOT NULL,
      is_internal TINYINT(1) NOT NULL DEFAULT 0,
      author VARCHAR(255) NULL,
      author_email VARCHAR(255) NULL,
      created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ticket_comments_ticket (ticket_id),
      CONSTRAINT fk_ticket_comments_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS user_notifications (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(500) NOT NULL,
      body TEXT,
      link_path VARCHAR(500) NULL,
      entity_type VARCHAR(50) NULL,
      entity_id VARCHAR(36) NULL,
      read_at DATETIME NULL,
      created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notif_user_read (user_id, read_at),
      INDEX idx_notif_user_created (user_id, created_date),
      INDEX idx_notif_entity (user_id, entity_type, entity_id),
      CONSTRAINT fk_notif_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS invites (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      portal_role_id VARCHAR(36) NULL,
      token VARCHAR(64) NOT NULL UNIQUE,
      invited_by VARCHAR(36),
      created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      accepted_at DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
