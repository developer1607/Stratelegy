import { queryOne } from './query.js';
import { createEntity } from '../services/saasStore.js';
import { ENTITY_REGISTRY } from './entityDefinitions.js';

const DEFAULT_CONFIG = {
  ContactSource: [
    { name: 'Website', order: 1 },
    { name: 'Referral', order: 2 },
    { name: 'Email', order: 3 },
    { name: 'Phone', order: 4 },
    { name: 'Trade Show', order: 5 },
  ],
  LeadStage: [
    { name: 'New', order: 1, color: '#3b82f6' },
    { name: 'Contacted', order: 2, color: '#8b5cf6' },
    { name: 'Qualified', order: 3, color: '#f59e0b' },
    { name: 'Proposal', order: 4, color: '#10b981' },
    { name: 'Won', order: 5, color: '#22c55e' },
    { name: 'Lost', order: 6, color: '#ef4444' },
  ],
  ActivityType: [
    { name: 'Call', order: 1 },
    { name: 'Email', order: 2 },
    { name: 'Meeting', order: 3 },
    { name: 'Task', order: 4 },
    { name: 'Note', order: 5 },
  ],
  AccountTier: [
    { name: 'Standard', order: 1 },
    { name: 'Premium', order: 2 },
    { name: 'Enterprise', order: 3 },
  ],
  Industry: [
    { name: 'Technology', order: 1 },
    { name: 'Healthcare', order: 2 },
    { name: 'Finance', order: 3 },
    { name: 'Retail', order: 4 },
    { name: 'Other', order: 5 },
  ],
};

async function countTable(entityName) {
  const table = ENTITY_REGISTRY[entityName]?.table;
  if (!table) return 0;
  const row = await queryOne(`SELECT COUNT(*) AS c FROM \`${table}\``);
  return Number(row?.c ?? 0);
}

export async function seedDefaultConfig() {
  for (const [entityName, items] of Object.entries(DEFAULT_CONFIG)) {
    if ((await countTable(entityName)) > 0) continue;
    for (const item of items) {
      await createEntity(entityName, item);
    }
  }
}
