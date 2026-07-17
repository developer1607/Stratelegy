const subscribers = new Map();

function safeWrite(entityName, res, chunk) {
  try {
    res.write(chunk);
    return true;
  } catch {
    removeEntitySubscriber(entityName, res);
    return false;
  }
}

export function notifyEntityChange(entityName, record, oldRecord = null) {
  const subs = subscribers.get(entityName);
  if (!subs) return;
  const event = {
    type: record ? "update" : "delete",
    data: record,
    old_data: oldRecord,
  };
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of [...subs]) {
    safeWrite(entityName, res, payload);
  }
}

export function addEntitySubscriber(entityName, res) {
  if (!subscribers.has(entityName)) subscribers.set(entityName, new Set());
  subscribers.get(entityName).add(res);
}

export function removeEntitySubscriber(entityName, res) {
  subscribers.get(entityName)?.delete(res);
}

export function closeAllSubscribers() {
  for (const subs of subscribers.values()) {
    for (const res of subs) {
      try {
        res.end();
      } catch {
        // Client already disconnected.
      }
    }
    subs.clear();
  }
  subscribers.clear();
}
