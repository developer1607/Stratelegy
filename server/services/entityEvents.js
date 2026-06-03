const subscribers = new Map();

export function notifyEntityChange(entityName, record, oldRecord = null) {
  const subs = subscribers.get(entityName);
  if (!subs) return;
  const event = { type: record ? 'update' : 'delete', data: record, old_data: oldRecord };
  for (const res of subs) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }
}

export function addEntitySubscriber(entityName, res) {
  if (!subscribers.has(entityName)) subscribers.set(entityName, new Set());
  subscribers.get(entityName).add(res);
}

export function removeEntitySubscriber(entityName, res) {
  subscribers.get(entityName)?.delete(res);
}
