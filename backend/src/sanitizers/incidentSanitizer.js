/**
 * Sanitizes and normalizes an incident payload.
 * 
 * - Normalizes Source Names (e.g. <SourceTypeEnum.PROMETHEUS: "PROMETHEUS"> -> PROMETHEUS).
 * - Supported values: PROMETHEUS, KIBANA, GITHUB, ARGO.
 * - Recursively trims specific fields and all string values inside dynamic `source.data`.
 * - Defaults missing/null `sources` array to `[]`.
 * - Defaults missing `description` in sources to "".
 * - Preserves dynamic, schema-less `source.data` structure.
 * 
 * @param {object} payload 
 * @returns {object} Sanitized incident payload
 */
export function sanitizeIncidentPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  // 1. Default sources
  if (payload.sources === undefined || payload.sources === null) {
    payload.sources = [];
  }

  // Helper to recursively trim strings
  const trimStringsRecursively = (val) => {
    if (typeof val === 'string') {
      return val.trim();
    }
    if (Array.isArray(val)) {
      return val.map(trimStringsRecursively);
    }
    if (val !== null && typeof val === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(val)) {
        result[key] = trimStringsRecursively(value);
      }
      return result;
    }
    return val;
  };

  // Trim root fields
  if (payload.heading !== undefined && typeof payload.heading === 'string') {
    payload.heading = payload.heading.trim();
  }
  if (payload.summary !== undefined && typeof payload.summary === 'string') {
    payload.summary = payload.summary.trim();
  }

  // Process and sanitize sources list
  if (Array.isArray(payload.sources)) {
    payload.sources = payload.sources.map((source) => {
      if (!source || typeof source !== 'object') {
        return source;
      }

      // Default description
      let description = source.description;
      if (description === undefined || description === null) {
        description = '';
      } else if (typeof description === 'string') {
        description = description.trim();
      }

      // Normalize source name
      let name = source.name;
      if (name) {
        const nameStr = String(name);
        const match = nameStr.match(/<SourceTypeEnum\.([A-Z_]+):\s*\\?["']?([A-Z_]+)\\?["']?>/i);
        if (match) {
          name = match[2].toUpperCase();
        } else {
          name = nameStr.trim().toUpperCase();
        }
      }

      // Preserve dynamic source.data while recursively trimming string values
      let data = {};
      if (source.data !== undefined && source.data !== null) {
        data = trimStringsRecursively(source.data);
      }

      return {
        name,
        description,
        data
      };
    });
  }

  return payload;
}
