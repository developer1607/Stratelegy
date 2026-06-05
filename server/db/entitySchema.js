import { ENTITY_REGISTRY, SAAS_ENTITY_NAMES } from "./entityDefinitions.js";

const TYPE_TO_SQL = {
  string: (spec) => `VARCHAR(${spec.maxLength || 255})`,
  text: () => "TEXT",
  int: () => "INT",
  decimal: () => "DECIMAL(15,2)",
  bool: () => "TINYINT(1)",
  datetime: () => "DATETIME",
};

function columnDefinitionSql(name, spec) {
  const sqlType = TYPE_TO_SQL[spec.type]?.(spec) || "VARCHAR(255)";
  const parts = [`\`${name}\` ${sqlType}`];

  if (name === "id") {
    parts.push("PRIMARY KEY");
    return parts.join(" ");
  }

  if (spec.required) {
    parts.push("NOT NULL");
  } else if (spec.optional !== false && spec.type !== "bool") {
    parts.push("NULL");
  }

  if (spec.default !== undefined) {
    if (spec.type === "bool") {
      parts.push(`DEFAULT ${spec.default ? 1 : 0}`);
    } else if (spec.type === "int" || spec.type === "decimal") {
      parts.push(`DEFAULT ${spec.default}`);
    } else {
      parts.push(`DEFAULT '${spec.default}'`);
    }
  } else if (spec.type === "bool") {
    parts.push("NOT NULL DEFAULT 0");
  }

  if (name === "created_date") {
    parts.push("NOT NULL DEFAULT CURRENT_TIMESTAMP");
  }
  if (name === "updated_date") {
    parts.push(
      "NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    );
  }

  return parts.join(" ");
}

function columnSql(name, spec) {
  return columnDefinitionSql(name, spec);
}

function buildCreateTable(entityName, def) {
  const colDefs = Object.entries(def.columns).map(([name, spec]) =>
    columnSql(name, spec),
  );
  const indexDefs = (def.indexes || []).map((idx) => {
    const cols = idx.columns.map((c) => `\`${c}\``).join(", ");
    const unique = idx.unique ? "UNIQUE " : "";
    return `${unique}INDEX \`${idx.name}\` (${cols})`;
  });

  const allDefs = [...colDefs, ...indexDefs].join(",\n      ");
  return `
    CREATE TABLE IF NOT EXISTS \`${def.table}\` (
      ${allDefs}
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
}

/** Create dedicated entity tables (excludes external ticket store tables). */
export async function createEntityTables(execute) {
  for (const entityName of SAAS_ENTITY_NAMES) {
    const def = ENTITY_REGISTRY[entityName];
    await execute(buildCreateTable(entityName, def));
  }
}

export { ENTITY_REGISTRY, SAAS_ENTITY_NAMES, columnDefinitionSql };
