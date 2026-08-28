import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Zap,
  Building2,
  Sparkles,
  Layers,
  Home,
  Plus,
  Minus,
  RotateCcw,
  MessageSquare,
  ShoppingCart,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Truck,
  Loader2,
  CheckCircle2,
  PackageCheck,
  Sliders,
  Sparkle,
  BadgePercent,
  Check,
  Search,
  Trash2,
  PlusCircle
} from 'lucide-react';
import { Product, CartItem } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

interface MaterialCostCalculatorProps {
  products?: Product[];
  onAddToCart?: (product: Product, quantity?: number) => void;
  cartItems?: CartItem[];
  currentArea?: {
    name: string;
    pincode: string;
    deliveryMinutes?: number;
  };
}

interface AIResponseData {
  summary: string;
  sanctionedLoadRecommendation?: string;
  electrical?: {
    wireCoilsLight?: { qty: number };
    wireCoilsPower?: { qty: number };
    modularSwitches?: { qty: number };
    mcbDistribution?: { qty: number };
    pvcConduits?: { qty: number };
  };
  construction?: {
    cementBags?: { qty: number };
    tmtSteelKg?: { qty: number };
    waterproofingLiters?: { qty: number };
    wallPuttyBags?: { qty: number };
  };
  engineeringAdvice?: string[];
}

export const MaterialCostCalculator: React.FC<MaterialCostCalculatorProps> = ({
  products,
  onAddToCart,
  currentArea
}) => {
  // ---------------------------------------------------------------------------
  // 1. Primary User Selections
  // ---------------------------------------------------------------------------
  const [projectScope, setProjectScope] = useState<'both' | 'electrical' | 'construction'>('both');
  const [propertyPreset, setPropertyPreset] = useState<'1bhk' | '2bhk' | '3bhk' | '4bhk' | 'commercial'>('2bhk');
  const [houseAreaSqFt, setHouseAreaSqFt] = useState<number>(950);
  const [qualityTier, setQualityTier] = useState<'standard' | 'premium' | 'heavy_duty'>('premium');

  // ---------------------------------------------------------------------------
  // 2. Material Quantities State
  // ---------------------------------------------------------------------------
  // Electrical
  const [wireCoilsLight, setWireCoilsLight] = useState<number>(3);
  const [wireCoilsPower, setWireCoilsPower] = useState<number>(2);
  const [modularSwitches, setModularSwitches] = useState<number>(26);
  const [mcbBoxes, setMcbBoxes] = useState<number>(1);
  const [pvcConduits, setPvcConduits] = useState<number>(14);

  // Construction
  const [cementBags, setCementBags] = useState<number>(60);
  const [tmtSteelKg, setTmtSteelKg] = useState<number>(500);
  const [waterproofingLiters, setWaterproofingLiters] = useState<number>(10);
  const [wallPuttyBags, setWallPuttyBags] = useState<number>(4);

  // ---------------------------------------------------------------------------
  // 3. Custom Selected Products From Catalog State
  // ---------------------------------------------------------------------------
  const [customSelectedItems, setCustomSelectedItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState<boolean>(false);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<'all' | 'electrical' | 'construction'>('all');

  // Available backend store products
  const availableProducts = useMemo(() => {
    return products && products.length > 0 ? products : INITIAL_PRODUCTS;
  }, [products]);

  // Filter available catalog products by category & search - showing backend items
  const filteredCatalogProducts = useMemo(() => {
    return availableProducts.filter((p) => {
      const matchesCategory =
        catalogCategory === 'all' || p.category === catalogCategory;
      const matchesSearch =
        !catalogSearch.trim() ||
        p.name.toLowerCase().includes(catalogSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [availableProducts, catalogCategory, catalogSearch]);

  const handleAddProductFromCatalog = (product: Product) => {
    setCustomSelectedItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCatalogSearch('');
    setIsProductPickerOpen(false);
  };

  const handleUpdateCustomQuantity = (productId: string, delta: number) => {
    setCustomSelectedItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveCustomProduct = (productId: string) => {
    setCustomSelectedItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearAllItems = () => {
    setWireCoilsLight(0);
    setWireCoilsPower(0);
    setModularSwitches(0);
    setMcbBoxes(0);
    setPvcConduits(0);
    setCementBags(0);
    setTmtSteelKg(0);
    setWaterproofingLiters(0);
    setWallPuttyBags(0);
    setCustomSelectedItems([]);
  };

  // ---------------------------------------------------------------------------
  // 4. AI Assist State (Simplified & Compact)
  // ---------------------------------------------------------------------------
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiAdvice, setAiAdvice] = useState<string[] | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState<boolean>(false);

  // Preset Handler
  const handlePresetSelect = (preset: '1bhk' | '2bhk' | '3bhk' | '4bhk' | 'commercial') => {
    setPropertyPreset(preset);

    if (preset === '1bhk') {
      setHouseAreaSqFt(550);
      setWireCoilsLight(2);
      setWireCoilsPower(1);
      setModularSwitches(16);
      setMcbBoxes(1);
      setPvcConduits(8);
      setCementBags(30);
      setTmtSteelKg(250);
      setWaterproofingLiters(5);
      setWallPuttyBags(2);
    } else if (preset === '2bhk') {
      setHouseAreaSqFt(950);
      setWireCoilsLight(3);
      setWireCoilsPower(2);
      setModularSwitches(26);
      setMcbBoxes(1);
      setPvcConduits(14);
      setCementBags(60);
      setTmtSteelKg(500);
      setWaterproofingLiters(10);
      setWallPuttyBags(4);
    } else if (preset === '3bhk') {
      setHouseAreaSqFt(1400);
      setWireCoilsLight(5);
      setWireCoilsPower(3);
      setModularSwitches(42);
      setMcbBoxes(2);
      setPvcConduits(22);
      setCementBags(100);
      setTmtSteelKg(850);
      setWaterproofingLiters(20);
      setWallPuttyBags(7);
    } else if (preset === '4bhk') {
      setHouseAreaSqFt(2100);
      setWireCoilsLight(7);
      setWireCoilsPower(5);
      setModularSwitches(60);
      setMcbBoxes(3);
      setPvcConduits(32);
      setCementBags(160);
      setTmtSteelKg(1350);
      setWaterproofingLiters(30);
      setWallPuttyBags(11);
    } else if (preset === 'commercial') {
      setHouseAreaSqFt(1200);
      setWireCoilsLight(6);
      setWireCoilsPower(6);
      setModularSwitches(35);
      setMcbBoxes(3);
      setPvcConduits(28);
      setCementBags(50);
      setTmtSteelKg(400);
      setWaterproofingLiters(15);
      setWallPuttyBags(6);
    }
  };

  // Adjust material price multipliers based on quality tier
  const priceTierMultiplier = useMemo(() => {
    if (qualityTier === 'standard') return 0.92;
    if (qualityTier === 'heavy_duty') return 1.15;
    return 1.0; // premium
  }, [qualityTier]);

  // Wholesale unit rates (Kolkata Kasba Depot Rates)
  const rates = useMemo(() => {
    return {
      wireLight: Math.round(3600 * priceTierMultiplier),
      wirePower: Math.round(4200 * priceTierMultiplier),
      switchPoint: Math.round(140 * priceTierMultiplier),
      mcbBox: Math.round(1150 * priceTierMultiplier),
      conduitPipe: 120,
      cementBag: Math.round(385 * (qualityTier === 'heavy_duty' ? 1.05 : 1.0)),
      tmtKg: 62,
      wpLiter: 135,
      puttyBag: 690
    };
  }, [priceTierMultiplier, qualityTier]);

  // Custom Selected Products Subtotal
  const customItemsSubtotal = useMemo(() => {
    return customSelectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [customSelectedItems]);

  // Live itemized cost calculations
  const calculatedCosts = useMemo(() => {
    const electricalSubtotal =
      wireCoilsLight * rates.wireLight +
      wireCoilsPower * rates.wirePower +
      modularSwitches * rates.switchPoint +
      mcbBoxes * rates.mcbBox +
      pvcConduits * rates.conduitPipe;

    const constructionSubtotal =
      cementBags * rates.cementBag +
      tmtSteelKg * rates.tmtKg +
      waterproofingLiters * rates.wpLiter +
      wallPuttyBags * rates.puttyBag;

    let baseGrandTotal = 0;
    if (projectScope === 'electrical') {
      baseGrandTotal = electricalSubtotal;
    } else if (projectScope === 'construction') {
      baseGrandTotal = constructionSubtotal;
    } else {
      baseGrandTotal = electricalSubtotal + constructionSubtotal;
    }

    const grandTotal = baseGrandTotal + customItemsSubtotal;

    return {
      electricalSubtotal,
      constructionSubtotal,
      customItemsSubtotal,
      grandTotal,
      gstAmount: Math.round(grandTotal * 0.18)
    };
  }, [
    projectScope,
    wireCoilsLight,
    wireCoilsPower,
    modularSwitches,
    mcbBoxes,
    pvcConduits,
    cementBags,
    tmtSteelKg,
    waterproofingLiters,
    wallPuttyBags,
    customItemsSubtotal,
    rates
  ]);

  // Call Gemini AI server-side endpoint for smart recommendations
  const handleGeminiEstimate = async (promptOverride?: string) => {
    const promptToUse = promptOverride || customPrompt;
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/gemini/estimate-materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientName: 'Valued Customer',
          phone: '9830012345',
          area: currentArea?.name || 'Kasba Depot, Kolkata',
          pincode: currentArea?.pincode || '700039',
          houseAreaSqFt,
          propertyType: propertyPreset.toUpperCase(),
          floors: 1,
          projectScope,
          qualityTier,
          customRequirements: promptToUse
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: AIResponseData = await response.json();
      setAiSummary(data.summary || 'AI tailored material quantities based on your specifications.');
      if (data.engineeringAdvice) {
        setAiAdvice(data.engineeringAdvice);
      }

      // Sync the interactive matrix with Gemini recommendations
      if (data.electrical) {
        if (data.electrical.wireCoilsLight?.qty) setWireCoilsLight(data.electrical.wireCoilsLight.qty);
        if (data.electrical.wireCoilsPower?.qty) setWireCoilsPower(data.electrical.wireCoilsPower.qty);
        if (data.electrical.modularSwitches?.qty) setModularSwitches(data.electrical.modularSwitches.qty);
        if (data.electrical.mcbDistribution?.qty) setMcbBoxes(data.electrical.mcbDistribution.qty);
        if (data.electrical.pvcConduits?.qty) setPvcConduits(data.electrical.pvcConduits.qty);
      }

      if (data.construction) {
        if (data.construction.cementBags?.qty) setCementBags(data.construction.cementBags.qty);
        if (data.construction.tmtSteelKg?.qty) setTmtSteelKg(data.construction.tmtSteelKg.qty);
        if (data.construction.waterproofingLiters?.qty) setWaterproofingLiters(data.construction.waterproofingLiters.qty);
        if (data.construction.wallPuttyBags?.qty) setWallPuttyBags(data.construction.wallPuttyBags.qty);
      }
    } catch (err) {
      console.warn('Gemini estimation error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 1-Click "Add All Materials to Cart"
  const handleAddAllToCart = () => {
    if (!onAddToCart) return;

    // Helper to verify if an item exists in the actual inventory catalog and check stock
    const checkInventoryStatus = (
      id: string,
      searchTerms: {
        brand?: string;
        category?: string;
        subCategory?: string;
        keywords?: string[];
      }
    ): { matchedProduct: Product | null; inStock: boolean; stockCount: number } => {
      const storeCatalog = products && products.length > 0 ? products : INITIAL_PRODUCTS;

      // 1. Direct ID match if it's already an existing store catalog ID
      let matched = storeCatalog.find((p) => p.id === id);

      // 2. Search by category / brand / keywords
      if (!matched && searchTerms.keywords && searchTerms.keywords.length > 0) {
        matched = storeCatalog.find((p) => {
          if (searchTerms.category && p.category !== searchTerms.category) return false;
          const pName = (p.name || '').toLowerCase();
          const pBrand = (p.brand || '').toLowerCase();
          const pTags = (p.tags || []).map((t) => t.toLowerCase());

          const matchesBrand =
            !searchTerms.brand ||
            pBrand.includes(searchTerms.brand.toLowerCase()) ||
            pName.includes(searchTerms.brand.toLowerCase());
          const matchesKeyword = searchTerms.keywords!.some(
            (kw) => pName.includes(kw.toLowerCase()) || pTags.some((t) => t.includes(kw.toLowerCase()))
          );

          return matchesBrand && matchesKeyword;
        });
      }

      // If matched in store inventory, verify its stock status
      if (matched) {
        const isStockAvailable = Boolean(
          matched.inStock && (matched.stockCount === undefined || matched.stockCount > 0)
        );
        return {
          matchedProduct: matched,
          inStock: isStockAvailable,
          stockCount: isStockAvailable ? (matched.stockCount ?? 100) : 0
        };
      }

      // If not present in store inventory
      return {
        matchedProduct: null,
        inStock: false,
        stockCount: 0
      };
    };

    const createEstProduct = (
      id: string,
      name: string,
      brand: string,
      category: 'electrical' | 'construction',
      subCategory: string,
      price: number,
      originalPrice: number,
      unit: string,
      deliveryMinutes: number,
      image: string,
      description: string,
      searchKeywords?: string[]
    ): Product => {
      const inv = checkInventoryStatus(id, {
        brand,
        category,
        subCategory,
        keywords: searchKeywords || [name.split(' ')[0], subCategory]
      });

      return {
        id: inv.matchedProduct ? inv.matchedProduct.id : id,
        name: inv.matchedProduct ? inv.matchedProduct.name : name,
        brand: inv.matchedProduct ? inv.matchedProduct.brand : brand,
        category,
        subCategory,
        price: inv.matchedProduct ? inv.matchedProduct.price : price,
        originalPrice: inv.matchedProduct ? (inv.matchedProduct.originalPrice || originalPrice) : originalPrice,
        discountPercentage: Math.max(0, Math.round(((originalPrice - price) / originalPrice) * 100)),
        unit: inv.matchedProduct ? (inv.matchedProduct.unit || unit) : unit,
        rating: inv.matchedProduct ? (inv.matchedProduct.rating || 4.9) : 4.9,
        reviewsCount: inv.matchedProduct ? (inv.matchedProduct.reviewsCount || 142) : 142,
        deliveryMinutes: inv.matchedProduct ? (inv.matchedProduct.deliveryMinutes || deliveryMinutes) : deliveryMinutes,
        image: inv.matchedProduct?.image || image,
        inStock: inv.inStock,
        stockCount: inv.stockCount,
        isEmergency: false,
        specs: inv.matchedProduct?.specs || {
          Origin: inv.inStock ? 'Depot Stock' : 'Out of Stock (On-Demand Direct Dispatch)',
          Certification: 'ISI Certified'
        },
        description: inv.matchedProduct?.description || description,
        tags: inv.matchedProduct?.tags || [category, subCategory, 'Wholesale']
      };
    };

    const itemsToAdd: Array<{ product: Product; quantity: number }> = [];

    if (projectScope === 'electrical' || projectScope === 'both') {
      if (wireCoilsLight > 0) {
        itemsToAdd.push({
          product: createEstProduct(
            'est-wire-light',
            'Polycab FR-LSH 1.5 sq.mm Copper Wire Coil (90m)',
            'Polycab',
            'electrical',
            'Wires & Cables',
            rates.wireLight,
            rates.wireLight + 400,
            'Coil (90m)',
            60,
            'https://i.imgur.com/8QZpP5E.png',
            '100% Pure Electrolytic Copper wire ISI 694 certified for lighting & fans.',
            ['1.5', 'wire', 'polycab']
          ),
          quantity: wireCoilsLight
        });
      }

      if (wireCoilsPower > 0) {
        itemsToAdd.push({
          product: createEstProduct(
            'est-wire-power',
            'RR Kabel FlameX 2.5/4.0 sq.mm Heavy Power Cable (90m)',
            'RR Kabel',
            'electrical',
            'Wires & Cables',
            rates.wirePower,
            rates.wirePower + 500,
            'Coil (90m)',
            60,
            'https://i.imgur.com/G9LIx1R.jpeg',
            'Heavy duty fire retardant cable for Air Conditioners, Geysers and Induction.',
            ['2.5', '4.0', 'power', 'wire', 'cable']
          ),
          quantity: wireCoilsPower
        });
      }

      if (modularSwitches > 0) {
        itemsToAdd.push({
          product: createEstProduct(
            'est-modular-switches',
            'Schneider Opale 6A/16A Modular Switch & Socket Set',
            'Schneider',
            'electrical',
            'Modular Switches',
            rates.switchPoint,
            rates.switchPoint + 30,
            'Point Set',
            60,
            'https://i.imgur.com/Kz3Hn96.jpeg',
            'Gloss white fire-resistant polycarbonate modular switch points with safety shutter.',
            ['switch', 'schneider', 'socket']
          ),
          quantity: modularSwitches
        });
      }

      if (mcbBoxes > 0) {
        itemsToAdd.push({
          product: createEstProduct(
            'est-mcb-box',
            'Havells Double Door SPN/TPN MCB Distribution Box + Isolator',
            'Havells',
            'electrical',
            'Distribution Boards',
            rates.mcbBox,
            rates.mcbBox + 250,
            'Set',
            60,
            'https://i.imgur.com/SQXJ1g6.jpeg',
            'IP43 rated sheet metal distribution box with DIN rail and neutral bus bar.',
            ['mcb', 'distribution', 'havells']
          ),
          quantity: mcbBoxes
        });
      }

      if (pvcConduits > 0) {
        itemsToAdd.push({
          product: createEstProduct(
            'est-pvc-conduit',
            'Heavy Rigid PVC Electrical Conduit Pipe (20mm/25mm - 3m)',
            'Finolex',
            'electrical',
            'PVC Items',
            rates.conduitPipe,
            rates.conduitPipe + 25,
            'Pipe (3m)',
            60,
            'https://i.imgur.com/G9LIx1R.jpeg',
            'Unplasticised heavy PVC pipe for wall and slab concealed wiring.',
            ['conduit', 'pvc', 'pipe']
          ),
          quantity: pvcConduits
        });
      }
    }

    if (projectScope === 'construction' || projectScope === 'both') {
      if (cementBags > 0) {
        itemsToAdd.push({
          product: createEstProduct(
            'est-cement-bag',
            'UltraTech 53 Grade Fresh OPC Cement (50kg Bag)',
            'UltraTech',
            'construction',
            'Cement & Concrete',
            rates.cementBag,
            rates.cementBag + 40,
            '50kg Bag',
            120,
            'https://i.imgur.com/u0PYh6L.png',
            'Fresh OPC 53 Grade high-early strength structural cement from factory depot.',
            ['cement', 'ultratech']
          ),
          quantity: cementBags
        });
      }

      if (tmtSteelKg > 0) {
        itemsToAdd.push({
          product: createEstProduct(
            'est-tmt-steel',
            'Tata Tiscon 550D Super Ductile Fe TMT Rebar (kg)',
            'Tata Tiscon',
            'construction',
            'TMT Steel',
            rates.tmtKg,
            rates.tmtKg + 6,
            'kg',
            120,
            'https://i.imgur.com/WwkWGNa.jpeg',
            'Primary mill high-ductility seismic earthquake resistant TMT steel bars.',
            ['tmt', 'steel', 'tiscon']
          ),
          quantity: tmtSteelKg
        });
      }

      if (waterproofingLiters > 0) {
        itemsToAdd.push({
          product: createEstProduct(
            'est-waterproofing',
            'Dr. Fixit 101 LW+ Integral Waterproofing Liquid (1L)',
            'Dr. Fixit',
            'construction',
            'Waterproofing',
            rates.wpLiter,
            rates.wpLiter + 20,
            'Liter',
            60,
            'https://i.imgur.com/PmoHsyt.png',
            'Corrosion inhibitor liquid waterproofing admixture for concrete and plaster.',
            ['waterproof', 'fixit']
          ),
          quantity: waterproofingLiters
        });
      }

      if (wallPuttyBags > 0) {
        itemsToAdd.push({
          product: createEstProduct(
            'est-wall-putty',
            'Asian Paints TruCare Polymer White Wall Putty (20kg Bag)',
            'Asian Paints',
            'construction',
            'Paints & Putty',
            rates.puttyBag,
            rates.puttyBag + 60,
            '20kg Bag',
            60,
            'https://i.imgur.com/PZgJwqo.png',
            'White cement based water-resistant polymer putty for smooth interior finish.',
            ['putty', 'asian paints']
          ),
          quantity: wallPuttyBags
        });
      }
    }

    // Add custom selected items from catalog (verifying their live stock)
    customSelectedItems.forEach((item) => {
      if (item.quantity > 0) {
        const storeCatalog = products && products.length > 0 ? products : INITIAL_PRODUCTS;
        const catalogMatch = storeCatalog.find((p) => p.id === item.product.id);
        const inStock = Boolean(
          catalogMatch
            ? catalogMatch.inStock && (catalogMatch.stockCount === undefined || catalogMatch.stockCount > 0)
            : item.product.inStock && (item.product.stockCount === undefined || item.product.stockCount > 0)
        );
        const stockCount = inStock ? (catalogMatch?.stockCount ?? item.product.stockCount ?? 50) : 0;

        itemsToAdd.push({
          product: {
            ...item.product,
            inStock,
            stockCount
          },
          quantity: item.quantity
        });
      }
    });

    itemsToAdd.forEach((item) => {
      onAddToCart(item.product, item.quantity);
    });

    setAddedToCartSuccess(true);
    setTimeout(() => {
      setAddedToCartSuccess(false);
    }, 4000);
  };

  // WhatsApp quotation link with ALL items formatted clearly
  const whatsappQuoteUrl = useMemo(() => {
    const itemsList: string[] = [];

    // Electrical Items
    if (projectScope === 'electrical' || projectScope === 'both') {
      const elecItems: string[] = [];
      if (wireCoilsLight > 0) {
        elecItems.push(
          `  • Polycab 1.5 sq.mm FR Copper Wire (90m): ${wireCoilsLight} coils × ₹${rates.wireLight} = ₹${(wireCoilsLight * rates.wireLight).toLocaleString('en-IN')}`
        );
      }
      if (wireCoilsPower > 0) {
        elecItems.push(
          `  • RR Kabel 2.5/4.0 sq.mm Power Cable (90m): ${wireCoilsPower} coils × ₹${rates.wirePower} = ₹${(wireCoilsPower * rates.wirePower).toLocaleString('en-IN')}`
        );
      }
      if (modularSwitches > 0) {
        elecItems.push(
          `  • Modular Switches & Sockets: ${modularSwitches} points × ₹${rates.switchPoint} = ₹${(modularSwitches * rates.switchPoint).toLocaleString('en-IN')}`
        );
      }
      if (mcbBoxes > 0) {
        elecItems.push(
          `  • Havells Double Door MCB Box: ${mcbBoxes} units × ₹${rates.mcbBox} = ₹${(mcbBoxes * rates.mcbBox).toLocaleString('en-IN')}`
        );
      }
      if (pvcConduits > 0) {
        elecItems.push(
          `  • Heavy PVC Conduit Pipes (3m): ${pvcConduits} pipes × ₹${rates.conduitPipe} = ₹${(pvcConduits * rates.conduitPipe).toLocaleString('en-IN')}`
        );
      }
      if (elecItems.length > 0) {
        itemsList.push(
          `⚡ ELECTRICAL MATERIALS:\n${elecItems.join('\n')}\n   Subtotal: ₹${calculatedCosts.electricalSubtotal.toLocaleString('en-IN')}`
        );
      }
    }

    // Construction Items
    if (projectScope === 'construction' || projectScope === 'both') {
      const constItems: string[] = [];
      if (cementBags > 0) {
        constItems.push(
          `  • UltraTech 53 Grade Fresh OPC Cement: ${cementBags} Bags × ₹${rates.cementBag} = ₹${(cementBags * rates.cementBag).toLocaleString('en-IN')}`
        );
      }
      if (tmtSteelKg > 0) {
        constItems.push(
          `  • Tata Tiscon 550D TMT Steel Rebars: ${tmtSteelKg} kg × ₹${rates.tmtKg} = ₹${(tmtSteelKg * rates.tmtKg).toLocaleString('en-IN')}`
        );
      }
      if (waterproofingLiters > 0) {
        constItems.push(
          `  • Dr. Fixit 101 LW+ Waterproofing Liquid: ${waterproofingLiters} L × ₹${rates.wpLiter} = ₹${(waterproofingLiters * rates.wpLiter).toLocaleString('en-IN')}`
        );
      }
      if (wallPuttyBags > 0) {
        constItems.push(
          `  • Asian Paints TruCare Polymer Wall Putty (20kg): ${wallPuttyBags} Bags × ₹${rates.puttyBag} = ₹${(wallPuttyBags * rates.puttyBag).toLocaleString('en-IN')}`
        );
      }
      if (constItems.length > 0) {
        itemsList.push(
          `🏗️ BUILDING & CIVIL MATERIALS:\n${constItems.join('\n')}\n   Subtotal: ₹${calculatedCosts.constructionSubtotal.toLocaleString('en-IN')}`
        );
      }
    }

    // Additional Custom Selected Items
    const activeCustom = customSelectedItems.filter((i) => i.quantity > 0);
    if (activeCustom.length > 0) {
      const customList = activeCustom.map(
        (i) =>
          `  • ${i.product.name}: ${i.quantity} ${i.product.unit || 'units'} × ₹${i.product.price} = ₹${(i.quantity * i.product.price).toLocaleString('en-IN')}`
      );
      itemsList.push(
        `📦 ADDITIONAL SELECTED ITEMS:\n${customList.join('\n')}\n   Subtotal: ₹${calculatedCosts.customItemsSubtotal.toLocaleString('en-IN')}`
      );
    }

    const itemsSection = itemsList.join('\n\n');

    const message = encodeURIComponent(
      `Hello Giriraj Power Kasba Hub! ⚡\n` +
      `Here is my complete material estimate inquiry:\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🏠 Property: ${propertyPreset.toUpperCase()} (~${houseAreaSqFt} sq.ft)\n` +
      `📋 Scope: ${projectScope.toUpperCase()} | Tier: ${qualityTier.toUpperCase()}\n` +
      `📍 Delivery: ${currentArea?.name || 'Kolkata'} (${currentArea?.pincode || '700039'})\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${itemsSection}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚡ Electrical Subtotal: ₹${calculatedCosts.electricalSubtotal.toLocaleString('en-IN')}\n` +
      `🏗️ Building Subtotal: ₹${calculatedCosts.constructionSubtotal.toLocaleString('en-IN')}\n` +
      (calculatedCosts.customItemsSubtotal > 0 ? `📦 Custom Items Subtotal: ₹${calculatedCosts.customItemsSubtotal.toLocaleString('en-IN')}\n` : '') +
      `📊 Estimated GST (18% approx): ₹${calculatedCosts.gstAmount.toLocaleString('en-IN')}\n` +
      `💰 GRAND TOTAL: ₹${calculatedCosts.grandTotal.toLocaleString('en-IN')}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Please check current depot stock availability, share the GST invoice, and confirm delivery schedule.`
    );
    return `https://wa.me/918777400280?text=${message}`;
  }, [
    propertyPreset,
    houseAreaSqFt,
    projectScope,
    qualityTier,
    currentArea,
    wireCoilsLight,
    wireCoilsPower,
    modularSwitches,
    mcbBoxes,
    pvcConduits,
    cementBags,
    tmtSteelKg,
    waterproofingLiters,
    wallPuttyBags,
    customSelectedItems,
    calculatedCosts,
    rates
  ]);

  return (
    <section id="unified-material-cost-calculator" className="space-y-3 sm:space-y-4 pt-1">
      {/* -------------------------------------------------------------------
          Header
          ------------------------------------------------------------------- */}
      <div className="text-center max-w-xl mx-auto space-y-1 px-2">
        <div className="inline-flex items-center justify-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shadow-2xs">
            <Calculator className="w-4.5 h-4.5 text-amber-600" />
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-sf-pro text-slate-900 tracking-tight">
            Material &amp; Cost Estimator
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Instant wholesale depot rates for electrical &amp; construction supplies
        </p>
      </div>

      {/* -------------------------------------------------------------------
          Single Unified Container (Merged All Boxes in One Clean Card)
          ------------------------------------------------------------------- */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        
        {/* =================================================================
            TOP BAR: Scope Tabs (Left) + Quality Grade Tabs (Right) + Borderless Scale
            ================================================================= */}
        <div className="p-3 sm:p-4 space-y-3 bg-slate-50/50">
          
          {/* Top Control Bar: Left (Scope) & Right (Grade) - Simple Borderless Design */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Scope buttons (Left) - Borderless Simple Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setProjectScope('electrical')}
                className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-lg text-xs font-bold font-sf-pro transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  projectScope === 'electrical'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${projectScope === 'electrical' ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                <span>Electrical</span>
              </button>

              <button
                type="button"
                onClick={() => setProjectScope('construction')}
                className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-lg text-xs font-bold font-sf-pro transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  projectScope === 'construction'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${projectScope === 'construction' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>Building</span>
              </button>

              <button
                type="button"
                onClick={() => setProjectScope('both')}
                className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-lg text-xs font-bold font-sf-pro transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  projectScope === 'both'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${projectScope === 'both' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>Both</span>
              </button>
            </div>

            {/* Grade buttons (Right) - Borderless Simple Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {[
                { id: 'standard', label: 'Standard' },
                { id: 'premium', label: 'Premium' },
                { id: 'heavy_duty', label: 'Heavy Duty' }
              ].map((tier) => {
                const isSelected = qualityTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setQualityTier(tier.id as any)}
                    className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-lg text-xs font-bold font-sf-pro transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Both Scales: Borderless Design (Only Heading, Scale, Value) */}
          <div className="space-y-3 pt-2">
            {/* Scale 1: Property Size Preset */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 w-24 sm:w-28 shrink-0 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Property Size</span>
              </span>
              <div className="flex-1 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={(() => {
                    const presets = ['1bhk', '2bhk', '3bhk', '4bhk', 'commercial'];
                    const idx = presets.indexOf(propertyPreset);
                    return idx >= 0 ? idx : 1;
                  })()}
                  onChange={(e) => {
                    const presets: Array<'1bhk' | '2bhk' | '3bhk' | '4bhk' | 'commercial'> = [
                      '1bhk',
                      '2bhk',
                      '3bhk',
                      '4bhk',
                      'commercial'
                    ];
                    const selected = presets[Number(e.target.value)];
                    if (selected) {
                      handlePresetSelect(selected);
                    }
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-600 focus:outline-none"
                />
              </div>
              <span className="text-xs font-black text-slate-900 w-20 sm:w-24 text-right shrink-0">
                {propertyPreset === '1bhk'
                  ? '1 BHK'
                  : propertyPreset === '2bhk'
                  ? '2 BHK'
                  : propertyPreset === '3bhk'
                  ? '3 BHK'
                  : propertyPreset === '4bhk'
                  ? '4 BHK'
                  : 'Shop'}
              </span>
            </div>

            {/* Scale 2: Property Area */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 w-24 sm:w-28 shrink-0 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Property Area</span>
              </span>
              <div className="flex-1 flex items-center">
                <input
                  type="range"
                  min={300}
                  max={3500}
                  step={50}
                  value={houseAreaSqFt}
                  onChange={(e) => setHouseAreaSqFt(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-600 focus:outline-none"
                />
              </div>
              <span className="text-xs font-black text-slate-900 w-20 sm:w-24 text-right shrink-0">
                {houseAreaSqFt} sq.ft
              </span>
            </div>
          </div>
        </div>

        {/* =================================================================
            MIDDLE SECTION: Itemized Materials (Clean Compact List)
            ================================================================= */}
        <div className="p-3 sm:p-4 space-y-3">
          {/* Header Row: Depot Material Quantities in one straight line + Delete/Clear All button */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <PackageCheck className="w-4 h-4 text-slate-700 shrink-0" />
              Depot Material Quantities
            </span>
            <button
              type="button"
              onClick={handleClearAllItems}
              className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs"
              title="Clear all materials to 0"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear All</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Electrical Materials */}
            {(projectScope === 'electrical' || projectScope === 'both') && (
              <>
                {/* 1.5mm Wire */}
                <div className={`py-2.5 px-1 flex items-center justify-between gap-3 transition-colors ${
                  wireCoilsLight === 0 ? 'opacity-40' : ''
                }`}>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 leading-snug break-words">
                      1.5mm Light Wire
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      ₹{rates.wireLight}/coil (90m)
                    </div>
                  </div>
                  <div className="w-[88px] flex items-center justify-end gap-1 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setWireCoilsLight(Math.max(0, wireCoilsLight - 1))}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 hover:from-rose-400 hover:via-red-500 hover:to-rose-600 active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-rose-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-1.5px_2px_rgba(0,0,0,0.3),0_2px_6px_rgba(225,29,72,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">-</span>
                    </button>
                    <span className={`w-6 text-center text-xs font-black select-none ${wireCoilsLight === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                      {wireCoilsLight}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWireCoilsLight(wireCoilsLight + 1)}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-[#FDE047] via-[#FBBF24] to-[#F59E0B] hover:from-[#FEF08A] hover:via-[#FCD34D] hover:to-[#FBBF24] active:scale-90 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-yellow-100/70 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(180,83,9,0.25),0_2px_6px_rgba(245,158,11,0.28)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/50 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10">+</span>
                    </button>
                  </div>
                </div>

                {/* 2.5/4mm Wire */}
                <div className={`py-2.5 px-1 flex items-center justify-between gap-3 transition-colors ${
                  wireCoilsPower === 0 ? 'opacity-40' : ''
                }`}>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 leading-snug break-words">
                      2.5/4mm Power Wire
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      ₹{rates.wirePower}/coil (90m)
                    </div>
                  </div>
                  <div className="w-[88px] flex items-center justify-end gap-1 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setWireCoilsPower(Math.max(0, wireCoilsPower - 1))}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 hover:from-rose-400 hover:via-red-500 hover:to-rose-600 active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-rose-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-1.5px_2px_rgba(0,0,0,0.3),0_2px_6px_rgba(225,29,72,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">-</span>
                    </button>
                    <span className={`w-6 text-center text-xs font-black select-none ${wireCoilsPower === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                      {wireCoilsPower}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWireCoilsPower(wireCoilsPower + 1)}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-[#FDE047] via-[#FBBF24] to-[#F59E0B] hover:from-[#FEF08A] hover:via-[#FCD34D] hover:to-[#FBBF24] active:scale-90 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-yellow-100/70 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(180,83,9,0.25),0_2px_6px_rgba(245,158,11,0.28)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/50 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10">+</span>
                    </button>
                  </div>
                </div>

                {/* Modular Switches */}
                <div className={`py-2.5 px-1 flex items-center justify-between gap-3 transition-colors ${
                  modularSwitches === 0 ? 'opacity-40' : ''
                }`}>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 leading-snug break-words">
                      Modular Switches
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      ₹{rates.switchPoint}/point
                    </div>
                  </div>
                  <div className="w-[88px] flex items-center justify-end gap-1 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setModularSwitches(Math.max(0, modularSwitches <= 2 ? 0 : modularSwitches - 2))}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 hover:from-rose-400 hover:via-red-500 hover:to-rose-600 active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-rose-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-1.5px_2px_rgba(0,0,0,0.3),0_2px_6px_rgba(225,29,72,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">-</span>
                    </button>
                    <span className={`w-6 text-center text-xs font-black select-none ${modularSwitches === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                      {modularSwitches}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModularSwitches(modularSwitches + 2)}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-[#FDE047] via-[#FBBF24] to-[#F59E0B] hover:from-[#FEF08A] hover:via-[#FCD34D] hover:to-[#FBBF24] active:scale-90 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-yellow-100/70 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(180,83,9,0.25),0_2px_6px_rgba(245,158,11,0.28)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/50 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10">+</span>
                    </button>
                  </div>
                </div>

                {/* MCB Box */}
                <div className={`py-2.5 px-1 flex items-center justify-between gap-3 transition-colors ${
                  mcbBoxes === 0 ? 'opacity-40' : ''
                }`}>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 leading-snug break-words">
                      MCB Box + Isolator
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      ₹{rates.mcbBox}/box
                    </div>
                  </div>
                  <div className="w-[88px] flex items-center justify-end gap-1 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setMcbBoxes(Math.max(0, mcbBoxes - 1))}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 hover:from-rose-400 hover:via-red-500 hover:to-rose-600 active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-rose-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-1.5px_2px_rgba(0,0,0,0.3),0_2px_6px_rgba(225,29,72,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">-</span>
                    </button>
                    <span className={`w-6 text-center text-xs font-black select-none ${mcbBoxes === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                      {mcbBoxes}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMcbBoxes(mcbBoxes + 1)}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-[#FDE047] via-[#FBBF24] to-[#F59E0B] hover:from-[#FEF08A] hover:via-[#FCD34D] hover:to-[#FBBF24] active:scale-90 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-yellow-100/70 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(180,83,9,0.25),0_2px_6px_rgba(245,158,11,0.28)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/50 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10">+</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Construction Materials */}
            {(projectScope === 'construction' || projectScope === 'both') && (
              <>
                {/* Cement */}
                <div className={`py-2.5 px-1 flex items-center justify-between gap-3 transition-colors ${
                  cementBags === 0 ? 'opacity-40' : ''
                }`}>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 leading-snug break-words">
                      UltraTech Cement
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      ₹{rates.cementBag}/50kg bag
                    </div>
                  </div>
                  <div className="w-[88px] flex items-center justify-end gap-1 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setCementBags(Math.max(0, cementBags <= 5 ? 0 : cementBags - 5))}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 hover:from-rose-400 hover:via-red-500 hover:to-rose-600 active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-rose-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-1.5px_2px_rgba(0,0,0,0.3),0_2px_6px_rgba(225,29,72,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">-</span>
                    </button>
                    <span className={`w-6 text-center text-xs font-black select-none ${cementBags === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                      {cementBags}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCementBags(cementBags + 5)}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-[#34D399] via-[#10B981] to-[#059669] hover:from-[#6EE7B7] hover:via-[#34D399] hover:to-[#10B981] active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-emerald-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.6),inset_0_-1.5px_2px_rgba(0,0,0,0.25),0_2px_6px_rgba(5,150,105,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">+</span>
                    </button>
                  </div>
                </div>

                {/* TMT Steel */}
                <div className={`py-2.5 px-1 flex items-center justify-between gap-3 transition-colors ${
                  tmtSteelKg === 0 ? 'opacity-40' : ''
                }`}>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 leading-snug break-words">
                      Tata Tiscon TMT
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      ₹{rates.tmtKg}/kg
                    </div>
                  </div>
                  <div className="w-[88px] flex items-center justify-end gap-1 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setTmtSteelKg(Math.max(0, tmtSteelKg <= 50 ? 0 : tmtSteelKg - 50))}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 hover:from-rose-400 hover:via-red-500 hover:to-rose-600 active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-rose-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-1.5px_2px_rgba(0,0,0,0.3),0_2px_6px_rgba(225,29,72,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">-</span>
                    </button>
                    <span className={`w-6 text-center text-xs font-black select-none ${tmtSteelKg === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                      {tmtSteelKg}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTmtSteelKg(tmtSteelKg + 50)}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-[#34D399] via-[#10B981] to-[#059669] hover:from-[#6EE7B7] hover:via-[#34D399] hover:to-[#10B981] active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-emerald-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.6),inset_0_-1.5px_2px_rgba(0,0,0,0.25),0_2px_6px_rgba(5,150,105,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">+</span>
                    </button>
                  </div>
                </div>

                {/* Waterproofing */}
                <div className={`py-2.5 px-1 flex items-center justify-between gap-3 transition-colors ${
                  waterproofingLiters === 0 ? 'opacity-40' : ''
                }`}>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 leading-snug break-words">
                      Dr. Fixit Liquid
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      ₹{rates.wpLiter}/Liter
                    </div>
                  </div>
                  <div className="w-[88px] flex items-center justify-end gap-1 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setWaterproofingLiters(Math.max(0, waterproofingLiters - 1))}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 hover:from-rose-400 hover:via-red-500 hover:to-rose-600 active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-rose-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-1.5px_2px_rgba(0,0,0,0.3),0_2px_6px_rgba(225,29,72,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">-</span>
                    </button>
                    <span className={`w-6 text-center text-xs font-black select-none ${waterproofingLiters === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                      {waterproofingLiters}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWaterproofingLiters(waterproofingLiters + 1)}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-[#34D399] via-[#10B981] to-[#059669] hover:from-[#6EE7B7] hover:via-[#34D399] hover:to-[#10B981] active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-emerald-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.6),inset_0_-1.5px_2px_rgba(0,0,0,0.25),0_2px_6px_rgba(5,150,105,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">+</span>
                    </button>
                  </div>
                </div>

                {/* Wall Putty */}
                <div className={`py-2.5 px-1 flex items-center justify-between gap-3 transition-colors ${
                  wallPuttyBags === 0 ? 'opacity-40' : ''
                }`}>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 leading-snug break-words">
                      Asian Paints Putty
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      ₹{rates.puttyBag}/20kg
                    </div>
                  </div>
                  <div className="w-[88px] flex items-center justify-end gap-1 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={() => setWallPuttyBags(Math.max(0, wallPuttyBags - 1))}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 hover:from-rose-400 hover:via-red-500 hover:to-rose-600 active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-rose-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-1.5px_2px_rgba(0,0,0,0.3),0_2px_6px_rgba(225,29,72,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">-</span>
                    </button>
                    <span className={`w-6 text-center text-xs font-black select-none ${wallPuttyBags === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
                      {wallPuttyBags}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWallPuttyBags(wallPuttyBags + 1)}
                      className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-[#34D399] via-[#10B981] to-[#059669] hover:from-[#6EE7B7] hover:via-[#34D399] hover:to-[#10B981] active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-emerald-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.6),inset_0_-1.5px_2px_rgba(0,0,0,0.25),0_2px_6px_rgba(5,150,105,0.3)] transition-all duration-150"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">+</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Custom Selected Catalog Products - Borderless, No Photos, Name with line break & Price below */}
            {customSelectedItems.map((item) => (
              <div
                key={item.product.id}
                className={`py-2.5 px-1 flex items-center justify-between gap-3 transition-colors ${
                  item.quantity === 0 ? 'opacity-40' : ''
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-xs font-bold text-slate-900 leading-snug break-words">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <span>₹{item.product.price}{item.product.unit ? ` / ${item.product.unit}` : ''}</span>
                    {item.product.brand && (
                      <>
                        <span>·</span>
                        <span className="text-amber-800 font-semibold">{item.product.brand}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-[88px] flex items-center justify-end gap-1 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleUpdateCustomQuantity(item.product.id, -1)}
                    className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 hover:from-rose-400 hover:via-red-500 hover:to-rose-600 active:scale-90 text-white flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-rose-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.5),inset_0_-1.5px_2px_rgba(0,0,0,0.3),0_2px_6px_rgba(225,29,72,0.3)] transition-all duration-150"
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[6px]" />
                    <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">-</span>
                  </button>
                  <span
                    className={`w-6 text-center text-xs font-black select-none ${
                      item.quantity === 0 ? 'text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateCustomQuantity(item.product.id, 1)}
                    className="relative overflow-hidden w-7 h-7 rounded-lg bg-gradient-to-b from-[#FDE047] via-[#FBBF24] to-[#F59E0B] hover:from-[#FEF08A] hover:via-[#FCD34D] hover:to-[#FBBF24] active:scale-90 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 select-none cursor-pointer border border-yellow-100/70 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(180,83,9,0.25),0_2px_6px_rgba(245,158,11,0.28)] transition-all duration-150"
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/50 to-transparent rounded-t-[6px]" />
                    <span className="relative z-10">+</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* =================================================================
              CUSTOM PRODUCT SELECTOR: Interactive Dropdown / Search Box
              ================================================================= */}
          <div className="pt-2">
            {!isProductPickerOpen ? (
              /* Empty Box State: Appears below all products so user can choose more */
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(true)}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-amber-500 bg-slate-50/80 hover:bg-amber-50/40 text-slate-800 hover:text-slate-950 flex items-center justify-between gap-3 transition-all cursor-pointer group text-left shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs sm:text-sm font-bold truncate group-hover:text-amber-950">
                    Select More Materials from Store
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 transition-transform group-hover:translate-y-0.5" />
              </button>
            ) : (
              /* Open Dropdown / Product Picker Box */
              <div className="p-3 rounded-2xl bg-white border-2 border-amber-400 shadow-md space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-black text-slate-900">
                    <span>Select Product to Add</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProductPickerOpen(false);
                      setCatalogSearch('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900 font-semibold px-2 py-0.5 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {/* Filter Pills & Search Input */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Category Filter */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                    {(['all', 'electrical', 'construction'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCatalogCategory(cat)}
                        className={`flex-1 sm:flex-initial py-1 px-2.5 rounded-md text-[11px] font-bold capitalize transition-all cursor-pointer ${
                          catalogCategory === cat
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Search material name..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Product Dropdown List - ONLY SHOWS PRODUCT NAME FROM BACKEND */}
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
                  {filteredCatalogProducts.length > 0 ? (
                    filteredCatalogProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddProductFromCatalog(p)}
                        className="w-full py-2 px-2.5 rounded-lg hover:bg-amber-50/80 transition-all flex items-center justify-between text-left cursor-pointer group"
                      >
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-amber-950 truncate">
                          {p.name}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No products found matching "{catalogSearch}".
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =================================================================
            BOTTOM ACTION BAR: Stacked Total Breakdown + Direct Action Buttons
            ================================================================= */}
        <div className="p-3.5 sm:p-5 bg-slate-50/70 space-y-3.5">
          {/* Stacked Cost Breakdown: Pure text, borderless, Left Name & Right Value on same line */}
          <div className="space-y-1.5 max-w-md">
            {(projectScope === 'electrical' || projectScope === 'both') && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-600 font-medium">Electrical</span>
                <span className="font-bold text-slate-900">
                  ₹{calculatedCosts.electricalSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {(projectScope === 'construction' || projectScope === 'both') && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-600 font-medium">Building</span>
                <span className="font-bold text-slate-900">
                  ₹{calculatedCosts.constructionSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {calculatedCosts.customItemsSubtotal > 0 && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-600 font-medium">Additional Materials</span>
                <span className="font-bold text-slate-900">
                  ₹{calculatedCosts.customItemsSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
              <span>GST (18% approx)</span>
              <span className="font-medium">
                ₹{calculatedCosts.gstAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-sm sm:text-base">
              <span className="font-black text-slate-950">Total Amount</span>
              <span className="font-black text-slate-950 text-base sm:text-xl">
                ₹{calculatedCosts.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action buttons (Phone & Desktop: Left = WhatsApp, Right = Add to Cart, Equal Size) */}
          <div className="flex items-center gap-2.5 w-full pt-1">
            <a
              href={whatsappQuoteUrl}
              target="_blank"
              rel="noreferrer"
              className="relative overflow-hidden flex-1 py-3 px-3 rounded-xl bg-gradient-to-b from-[#10B981] via-[#059669] to-[#047857] hover:from-[#34D399] hover:via-[#10B981] hover:to-[#059669] text-white font-black font-sf-pro text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.98] text-center border border-emerald-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.25),0_4px_12px_rgba(5,150,105,0.35)]"
            >
              {/* Apple-style Top Specular Liquid Glass Sheen */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/35 to-transparent rounded-t-[10px]" />
              <svg className="w-4 h-4 fill-white shrink-0 relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleAddAllToCart}
              className={`relative overflow-hidden flex-1 py-3 px-3 rounded-xl font-black font-sf-pro text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                addedToCartSuccess
                  ? 'bg-gradient-to-b from-[#10B981] via-[#059669] to-[#047857] text-white border border-emerald-300/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.25),0_4px_12px_rgba(5,150,105,0.35)]'
                  : 'bg-gradient-to-b from-[#FDE047] via-[#FBBF24] to-[#F59E0B] hover:from-[#FEF08A] hover:via-[#FCD34D] hover:to-[#FBBF24] text-slate-950 border border-yellow-100/70 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(180,83,9,0.25),0_4px_12px_rgba(245,158,11,0.32)]'
              }`}
            >
              {/* Apple-style Top Specular Liquid Glass Sheen */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/45 to-transparent rounded-t-[10px]" />
              {addedToCartSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
                  <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-slate-950 relative z-10" />
                  <span className="relative z-10">Add to Cart</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
