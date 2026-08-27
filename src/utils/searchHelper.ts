import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

export interface SearchMatchResult {
  product: Product;
  score: number;
  category: 'electrical' | 'construction';
}

const CONSTRUCTION_KEYWORDS = [
  'cement', 'concrete', 'tmt', 'steel', 'rebar', 'tile', 'tiling', 'roff', 'grout',
  'paint', 'putty', 'primer', 'distemper', 'emulsion', 'asian paints', 'berger', 'nerolac',
  'waterproof', 'waterproofing', 'dr fixit', 'fixit', 'damp', 'dampguard', 'dampblock',
  'plywood', 'ply', 'board', 'mdf', 'hdhmr', 'centuryply', 'action tesa', 'greenply',
  'adhesive', 'fevicol', 'fevibond', 'marine', 'heatx', 'sh',
  'sink', 'faucet', 'tap', 'kitchen sink', 'cock', 'sanitary', 'commode', 'cistern', 'toilet',
  'jaquar', 'hindware', 'cera', 'geberit', 'parryware',
  'hinge', 'channel', 'drawer', 'slide', 'handle', 'tower bolt', 'aldrop', 'hettich', 'ebco', 'hafele',
  'tandem', 'spice basket', 'kitchen basket', 'hydraulic', 'bed fitting', 'wardrobe',
  'lock', 'padlock', 'door lock', 'godrej', 'dorset', 'europa',
  'pipe', 'cpvc', 'upvc', 'pvc pipe', 'plumbing', 'astral', 'supreme', 'finolex pipe', 'ashirvad',
  'tank', 'water tank', 'sintex', 'drill', 'grinder', 'bosch', 'power tool', 'saw',
  'hardware', 'ladder', 'tarpaulin', 'tripal', 'hammer', 'screw', 'fastener', 'nail'
];

const ELECTRICAL_KEYWORDS = [
  'wire', 'cable', 'cord', 'copper', 'rr kabel', 'polycab', 'finolex', 'havells',
  'switch', 'socket', 'plug', 'plate', 'regulator', 'roma', 'anchor', 'schneider', 'legrand', 'wipro', 'crabtree',
  'mcb', 'rccb', 'elcb', 'db', 'distribution board', 'isolator', 'fuse', 'l&t', 'siemens',
  'light', 'led', 'bulb', 'batten', 'panel light', 'cob', 'downlight', 'spotlight', 'flood light', 'philips', 'syska',
  'fan', 'ceiling fan', 'exhaust fan', 'pedestal fan', 'wall fan', 'crompton', 'atomberg', 'orient', 'bajaj', 'usha',
  'pvc conduit', 'conduit', 'junction box', 'casing', 'capping', 'modular box', 'gi box',
  'cctv', 'camera', 'dvr', 'nvr', 'hikvision', 'cp plus', 'dahua',
  'geyser', 'water heater', 'immersion rod', 'room heater', 'iron', 'luminous', 'inverter', 'battery'
];

/**
 * Determines whether a query is primarily for Electrical or Construction
 */
export function detectQueryCategory(
  query: string,
  allProducts: Product[] = INITIAL_PRODUCTS
): 'electrical' | 'construction' {
  const q = query.toLowerCase().trim();
  if (!q) return 'electrical';

  // Check matching products
  const electricalMatches = allProducts.filter(
    (p) => p.category === 'electrical' && isProductMatch(p, q)
  );
  const constructionMatches = allProducts.filter(
    (p) => p.category === 'construction' && isProductMatch(p, q)
  );

  if (constructionMatches.length > electricalMatches.length && constructionMatches.length > 0) {
    return 'construction';
  }
  if (electricalMatches.length > constructionMatches.length && electricalMatches.length > 0) {
    return 'electrical';
  }

  // Keyword check
  let constructionScore = 0;
  let electricalScore = 0;

  for (const kw of CONSTRUCTION_KEYWORDS) {
    if (q.includes(kw)) {
      constructionScore += kw.length > 4 ? 3 : 1.5;
    }
  }

  for (const kw of ELECTRICAL_KEYWORDS) {
    if (q.includes(kw)) {
      electricalScore += kw.length > 4 ? 3 : 1.5;
    }
  }

  if (constructionScore > electricalScore) {
    return 'construction';
  }
  return 'electrical';
}

/**
 * Checks if a product matches a search query using multi-token matching
 */
export function isProductMatch(product: Product, query: string): boolean {
  if (!query.trim()) return true;

  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);

  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const subCategory = (product.subCategory || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const tags = (product.tags || []).map((t) => t.toLowerCase()).join(' ');
  const specs = typeof product.specs === 'object' ? JSON.stringify(product.specs).toLowerCase() : '';

  const searchableText = `${name} ${brand} ${subCategory} ${category} ${tags} ${specs} ${description}`;

  // Check if all tokens are present in the searchable text
  return tokens.every((token) => searchableText.includes(token));
}

/**
 * Calculates relevance score for sorting matching products
 */
export function calculateRelevanceScore(product: Product, query: string): number {
  if (!query.trim()) return 1;

  const q = query.toLowerCase().trim();
  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const subCategory = (product.subCategory || '').toLowerCase();
  const tags = (product.tags || []).map((t) => t.toLowerCase()).join(' ');

  let score = 0;

  // Exact full string matches get highest boost
  if (name === q) score += 100;
  else if (name.startsWith(q)) score += 60;
  else if (name.includes(q)) score += 40;

  if (brand === q) score += 50;
  else if (brand.includes(q)) score += 30;

  if (subCategory.includes(q)) score += 25;
  if (tags.includes(q)) score += 20;

  // Token matching bonus
  const tokens = q.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (name.includes(token)) score += 15;
    if (brand.includes(token)) score += 10;
    if (subCategory.includes(token)) score += 8;
  }

  return score;
}

/**
 * Searches all products and returns ranked results with destination metadata
 */
export function searchAllProducts(
  query: string,
  allProducts: Product[] = INITIAL_PRODUCTS,
  limit: number = 8
): {
  results: Product[];
  electricalCount: number;
  constructionCount: number;
  suggestedCategory: 'electrical' | 'construction';
} {
  const q = query.toLowerCase().trim();
  if (!q) {
    return {
      results: [],
      electricalCount: 0,
      constructionCount: 0,
      suggestedCategory: 'electrical'
    };
  }

  const matched = allProducts.filter((p) => isProductMatch(p, q));

  const electricalCount = matched.filter((p) => p.category === 'electrical').length;
  const constructionCount = matched.filter((p) => p.category === 'construction').length;

  const ranked = matched
    .map((product) => ({
      product,
      score: calculateRelevanceScore(product, q)
    }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product)
    .slice(0, limit);

  const suggestedCategory = detectQueryCategory(q, allProducts);

  return {
    results: ranked,
    electricalCount,
    constructionCount,
    suggestedCategory
  };
}
