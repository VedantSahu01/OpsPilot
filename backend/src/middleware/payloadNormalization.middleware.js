import { repairJsonPayload } from '../sanitizers/jsonRepair.js';
import { sanitizeIncidentPayload } from '../sanitizers/incidentSanitizer.js';

/**
 * Deep equality checker to compare original parsed payload with sanitized payload
 */
function isDeepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const k of keysA) {
    if (!keysB.includes(k)) return false;
    if (!isDeepEqual(a[k], b[k])) return false;
  }
  return true;
}

/**
 * Middleware that normalizes AI incident payloads before validation and database insertion.
 */
export const payloadNormalizationMiddleware = (req, res, next) => {
  const rawInput = req.body;

  // If the body is already parsed (or not a string), we can still run repair/sanitize on it.
  // But our custom body-parser ensures req.body is a raw string.
  if (!rawInput) {
    return next();
  }

  let originalParsed = null;
  let parseFailed = false;

  if (typeof rawInput === 'string') {
    try {
      originalParsed = JSON.parse(rawInput);
    } catch (err) {
      parseFailed = true;
    }
  } else {
    // If it's already an object, use it directly as original
    originalParsed = rawInput;
  }

  try {
    // 1. Repair JSON wrapper, quotes, and baseline structure
    const repaired = repairJsonPayload(rawInput);

    // 2. Sanitize and normalize properties
    const sanitized = sanitizeIncidentPayload(repaired);

    // 3. Compare to determine if changes occurred
    let changesDetected = false;
    if (parseFailed) {
      changesDetected = true;
    } else {
      changesDetected = !isDeepEqual(originalParsed, sanitized);
    }

    if (changesDetected) {
      console.log(JSON.stringify({
        event: 'payload_repaired',
        timestamp: new Date().toISOString(),
        changesDetected: true
      }));
    }

    // Set body to sanitized object for validator/controller downstream
    req.body = sanitized;
    next();
  } catch (err) {
    next(err);
  }
};
