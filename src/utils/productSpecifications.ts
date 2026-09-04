/**
 * GIRIRAJ POWER - Universal Product Specifications Formatter
 * 
 * Normalizes any product specification shape (Supabase JSON, key/value arrays,
 * numeric-indexed objects, strings, grouped categories) into clean, human-readable
 * Key - Value pairs without showing raw technical artifacts (such as "0", "key", "value").
 */

export interface FormattedSpecItem {
  key: string;
  value: string;
}

export interface FormattedSpecGroup {
  groupName?: string;
  items: FormattedSpecItem[];
}

const KNOWN_ACRONYMS = new Set([
  'LED', 'PVC', 'CPVC', 'UPVC', 'SWR', 'ISI', 'BIS', 'FR', 'FRLS', 'LS',
  'AC', 'DC', 'MRP', 'SKU', 'IP', 'MCB', 'RCCB', 'DB', 'CAT', 'ROHS', 'UV',
  'MS', 'GI', 'SS', 'HP', 'RPM', 'KW', 'KVA', 'VA', 'AH', 'MAH', 'AMPS', 'AMP',
  'V', 'W', 'HZ', 'MM', 'CM', 'MTR', 'KG', 'GSM', 'DIN', 'IS', 'IEC', 'CE', 'ISO', 'RFID'
]);

/**
 * Formats raw specification keys into clean, capitalized labels.
 * e.g. "brand" -> "Brand", "conductor_material" -> "Conductor Material", "fr_ls" -> "FR LS"
 */
export function formatSpecKey(raw: string): string {
  if (!raw) return '';
  const str = String(raw).trim();

  // If it's a numeric index like "0", "1", return empty string
  if (/^\d+$/.test(str)) return '';

  // Clean separators
  const cleaned = str.replace(/[_\-:]+/g, ' ').trim();
  if (!cleaned) return '';

  // Split into words
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words
    .map((word) => {
      const upper = word.toUpperCase();
      if (KNOWN_ACRONYMS.has(upper)) return upper;
      // Handle special casing like "0.75Sqmm" or numbers
      if (/^\d/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Formats specification values, handling strings, numbers, booleans, and arrays.
 * Capitalizes lowercase brand names (e.g. "rr kabel" -> "RR Kabel").
 */
export function formatSpecValue(val: any, keyName?: string): string {
  if (val === null || val === undefined) return '';

  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .filter(Boolean)
      .join(', ');
  }

  if (typeof val === 'boolean') {
    return val ? 'Yes' : 'No';
  }

  if (typeof val === 'number') {
    return String(val);
  }

  if (typeof val === 'object') {
    if ('value' in val && val.value != null) return formatSpecValue(val.value, keyName);
    if ('val' in val && val.val != null) return formatSpecValue(val.val, keyName);
    if ('text' in val && val.text != null) return formatSpecValue(val.text, keyName);
    return Object.entries(val)
      .filter(([k]) => !/^\d+$/.test(k))
      .map(([k, v]) => `${formatSpecKey(k)}: ${v}`)
      .join(', ');
  }

  const str = String(val).trim();

  // If key is Brand and value is lowercase, format it nicely (e.g. "rr kabel" -> "RR Kabel")
  if (keyName && keyName.toLowerCase() === 'brand' && /^[a-z0-9\s]+$/i.test(str)) {
    return str
      .split(/\s+/)
      .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
      .join(' ');
  }

  return str;
}

/**
 * Detects if an object has { key, value } / { name, value } / { label, value } shape
 */
function extractFromKeyValObject(obj: any): FormattedSpecItem | null {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;

  const keyProps = ['key', 'name', 'label', 'title', 'property', 'attribute', 'trait', 'k', 'spec', 'field'];
  const valProps = ['value', 'val', 'v', 'text', 'content', 'description', 'detail', 'specification', 'ans'];

  let foundKey: string | undefined;
  let foundVal: any | undefined;

  for (const kp of keyProps) {
    if (kp in obj && obj[kp] != null) {
      foundKey = String(obj[kp]);
      break;
    }
  }

  for (const vp of valProps) {
    if (vp in obj && obj[vp] != null) {
      foundVal = obj[vp];
      break;
    }
  }

  // Case-insensitive check if not found yet
  if (!foundKey || foundVal === undefined) {
    for (const [k, v] of Object.entries(obj)) {
      const lower = k.toLowerCase().trim();
      if (!foundKey && keyProps.includes(lower)) {
        foundKey = String(v);
      } else if (foundVal === undefined && valProps.includes(lower)) {
        foundVal = v;
      }
    }
  }

  if (foundKey && foundVal !== undefined) {
    const formattedKey = formatSpecKey(foundKey);
    // Discard if the key itself is just "key", "value", or numeric
    if (!formattedKey || formattedKey.toLowerCase() === 'key' || formattedKey.toLowerCase() === 'value') {
      return null;
    }
    return {
      key: formattedKey,
      value: formatSpecValue(foundVal, formattedKey)
    };
  }

  // Single key-value entry in object: { "Brand": "RR Kabel" }
  const keys = Object.keys(obj);
  if (keys.length === 1 && !/^\d+$/.test(keys[0])) {
    const k = keys[0];
    const v = obj[k];
    if (typeof v !== 'object' || v === null) {
      const formattedKey = formatSpecKey(k);
      return {
        key: formattedKey,
        value: formatSpecValue(v, formattedKey)
      };
    }
  }

  return null;
}

/**
 * Universal parser that transforms any raw specifications structure into
 * structured FormattedSpecGroup[] with clean Left (Key) and Right (Value) pairs.
 */
export function formatProductSpecifications(
  rawSpecs: any,
  fallbackBrand?: string
): FormattedSpecGroup[] {
  if (!rawSpecs) {
    if (fallbackBrand && fallbackBrand !== 'Giriraj Genuine' && fallbackBrand.trim()) {
      return [{ items: [{ key: 'Brand', value: fallbackBrand.trim() }] }];
    }
    return [];
  }

  let parsed = rawSpecs;

  // 1. If it's a string, try JSON parse, otherwise parse by lines
  if (typeof parsed === 'string') {
    const trimmed = parsed.trim();
    if (!trimmed) return [];
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        parsed = trimmed;
      }
    } else {
      // Line separated e.g. "Brand: RR Kabel\nSize: 1.5 Sqmm"
      const lines = trimmed.split(/\r?\n/).filter((l) => l.trim());
      const items: FormattedSpecItem[] = [];
      for (const line of lines) {
        if (line.includes(':') || line.includes('–') || line.includes('-')) {
          const parts = line.split(/[:–—]/);
          const k = formatSpecKey(parts[0]);
          const v = formatSpecValue(parts.slice(1).join(':'), k);
          if (k && v) items.push({ key: k, value: v });
        } else {
          items.push({ key: 'Specification', value: line.trim() });
        }
      }
      return items.length > 0 ? [{ items }] : [];
    }
  }

  // 2. Unwrap generic top-level wrapper keys if present
  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    const keys = Object.keys(parsed);
    const wrapperKeys = ['specifications', 'specification', 'specs', 'technical_specifications', 'details', 'data', 'attributes'];
    if (keys.length === 1 && wrapperKeys.includes(keys[0].toLowerCase())) {
      parsed = parsed[keys[0]];
    }
  }

  const groups: FormattedSpecGroup[] = [];
  const rootItems: FormattedSpecItem[] = [];

  // 3. Process Array
  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (!item) continue;
      if (typeof item === 'string') {
        if (item.includes(':') || item.includes('–')) {
          const parts = item.split(/[:–]/);
          const k = formatSpecKey(parts[0]);
          const v = formatSpecValue(parts.slice(1).join(':'), k);
          if (k && v) rootItems.push({ key: k, value: v });
        } else {
          rootItems.push({ key: 'Specification', value: item.trim() });
        }
        continue;
      }

      const extracted = extractFromKeyValObject(item);
      if (extracted) {
        rootItems.push(extracted);
        continue;
      }

      // Object with arbitrary keys
      if (typeof item === 'object' && item !== null) {
        for (const [k, v] of Object.entries(item)) {
          if (/^\d+$/.test(k)) continue;
          if (k.toLowerCase() === 'key' || k.toLowerCase() === 'value') continue;
          const formattedKey = formatSpecKey(k);
          if (formattedKey && v != null) {
            rootItems.push({ key: formattedKey, value: formatSpecValue(v, formattedKey) });
          }
        }
      }
    }
  } else if (typeof parsed === 'object' && parsed !== null) {
    // 4. Process Object
    // Check if the object is effectively an array stored as { "0": {...}, "1": {...} }
    const keys = Object.keys(parsed);
    const areAllKeysNumeric = keys.length > 0 && keys.every((k) => /^\d+$/.test(k));

    if (areAllKeysNumeric) {
      for (const idx of keys) {
        const item = parsed[idx];
        const extracted = extractFromKeyValObject(item);
        if (extracted) {
          rootItems.push(extracted);
        } else if (typeof item === 'string') {
          if (item.includes(':')) {
            const parts = item.split(':');
            const k = formatSpecKey(parts[0]);
            const v = formatSpecValue(parts.slice(1).join(':'), k);
            if (k && v) rootItems.push({ key: k, value: v });
          } else {
            rootItems.push({ key: 'Specification', value: item });
          }
        } else if (typeof item === 'object' && item !== null) {
          for (const [k, v] of Object.entries(item)) {
            if (/^\d+$/.test(k) || k.toLowerCase() === 'key' || k.toLowerCase() === 'value') continue;
            const formattedKey = formatSpecKey(k);
            if (formattedKey && v != null) {
              rootItems.push({ key: formattedKey, value: formatSpecValue(v, formattedKey) });
            }
          }
        }
      }
    } else {
      // Categorized or flat object
      for (const [catKey, catVal] of Object.entries(parsed)) {
        // Skip numeric keys, or literal "key" / "value"
        if (/^\d+$/.test(catKey) || catKey.toLowerCase() === 'key' || catKey.toLowerCase() === 'value') {
          const extracted = extractFromKeyValObject(catVal);
          if (extracted) rootItems.push(extracted);
          continue;
        }

        // Check if catVal is a key-value object directly
        const singleExtract = extractFromKeyValObject(catVal);
        if (singleExtract) {
          rootItems.push(singleExtract);
          continue;
        }

        // Check if catVal is a nested group (e.g. "General": { "Brand": "RR", "Model": "X" })
        if (typeof catVal === 'object' && catVal !== null && !Array.isArray(catVal)) {
          const subKeys = Object.keys(catVal);
          const areSubKeysNumeric = subKeys.length > 0 && subKeys.every((k) => /^\d+$/.test(k));

          const groupItems: FormattedSpecItem[] = [];

          if (areSubKeysNumeric) {
            for (const sk of subKeys) {
              const subItem = (catVal as any)[sk];
              const ext = extractFromKeyValObject(subItem);
              if (ext) groupItems.push(ext);
            }
          } else {
            for (const [subK, subV] of Object.entries(catVal)) {
              if (/^\d+$/.test(subK) || subK.toLowerCase() === 'key' || subK.toLowerCase() === 'value') continue;
              const formattedSubKey = formatSpecKey(subK);
              if (formattedSubKey && subV != null) {
                groupItems.push({
                  key: formattedSubKey,
                  value: formatSpecValue(subV, formattedSubKey)
                });
              }
            }
          }

          if (groupItems.length > 0) {
            const groupName = formatSpecKey(catKey);
            groups.push({ groupName, items: groupItems });
          }
        } else if (Array.isArray(catVal)) {
          const groupItems: FormattedSpecItem[] = [];
          for (const item of catVal) {
            const ext = extractFromKeyValObject(item);
            if (ext) groupItems.push(ext);
          }
          if (groupItems.length > 0) {
            groups.push({ groupName: formatSpecKey(catKey), items: groupItems });
          }
        } else if (catVal != null) {
          // Flat key-value: e.g. "Brand": "RR Kabel"
          const formattedKey = formatSpecKey(catKey);
          if (formattedKey) {
            rootItems.push({
              key: formattedKey,
              value: formatSpecValue(catVal, formattedKey)
            });
          }
        }
      }
    }
  }

  // Deduplicate items within rootItems
  const uniqueRootItems: FormattedSpecItem[] = [];
  const seenRootKeys = new Set<string>();
  for (const item of rootItems) {
    const lowerKey = item.key.toLowerCase();
    if (!seenRootKeys.has(lowerKey)) {
      seenRootKeys.add(lowerKey);
      uniqueRootItems.push(item);
    }
  }

  // If we have a fallbackBrand (e.g. from product.brand), make sure Brand is present at the beginning
  const allExistingKeys = new Set<string>();
  uniqueRootItems.forEach((it) => allExistingKeys.add(it.key.toLowerCase()));
  groups.forEach((g) => g.items.forEach((it) => allExistingKeys.add(it.key.toLowerCase())));

  if (fallbackBrand && fallbackBrand.trim() && !allExistingKeys.has('brand')) {
    uniqueRootItems.unshift({
      key: 'Brand',
      value: formatSpecValue(fallbackBrand, 'Brand')
    });
  }

  const finalGroups: FormattedSpecGroup[] = [];

  if (uniqueRootItems.length > 0) {
    finalGroups.push({ items: uniqueRootItems });
  }

  for (const g of groups) {
    if (g.items.length > 0) {
      finalGroups.push(g);
    }
  }

  return finalGroups;
}

/**
 * Returns a simple flat list of all specification items, combining any groups.
 * Useful for concise tables (like Quick View modals or order receipts).
 */
export function getFlattenedSpecifications(
  rawSpecs: any,
  fallbackBrand?: string
): FormattedSpecItem[] {
  const groups = formatProductSpecifications(rawSpecs, fallbackBrand);
  const flattened: FormattedSpecItem[] = [];
  const seen = new Set<string>();

  for (const g of groups) {
    for (const it of g.items) {
      const lower = it.key.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        flattened.push(it);
      }
    }
  }

  return flattened;
}
