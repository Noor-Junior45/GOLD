import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // =========================================================================
  // ELECTRICAL - WIRES & CABLES
  // =========================================================================
  {
    "id": "p1",
    "name": "RR Kabel Wire FR LS 0.75 Sqmm, 200 MTR",
    "brand": "RR Kabel",
    "category": "electrical",
    "subCategory": "Wiring",
    "price": 3065,
    "originalPrice": 3200,
    "discountPercentage": 4,
    "unit": "1 Coil",
    "rating": 4.8,
    "reviewsCount": 124,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 50,
    "tags": ["wire", "rr kabel", "electrical", "wiring"],
    "isEmergency": false,
    "specs": {
      "Size": "0.75 Sqmm",
      "Length": "200 MTR",
      "Insulation": "Flame Retardant Low Smoke (FR LS)"
    },
    "description": "High quality FR LS copper wire from RR Kabel for safe residential concealed conduit wiring."
  },
  {
    "id": "p2",
    "name": "RR Kabel Wire FR LS 1.0 Sqmm, 200 MTR",
    "brand": "RR Kabel",
    "category": "electrical",
    "subCategory": "Wiring",
    "price": 4005,
    "originalPrice": 4200,
    "discountPercentage": 5,
    "unit": "1 Coil",
    "rating": 4.9,
    "reviewsCount": 98,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 50,
    "tags": ["wire", "rr kabel", "electrical", "wiring"],
    "isEmergency": false,
    "specs": {
      "Size": "1.0 Sqmm",
      "Length": "200 MTR"
    },
    "description": "High quality FR LS wire from RR Kabel for light and fan circuits."
  },
  {
    "id": "p3",
    "name": "RR Kabel Wire FR LS 1.5 Sqmm, 200 MTR",
    "brand": "RR Kabel",
    "category": "electrical",
    "subCategory": "Wiring",
    "price": 5787,
    "originalPrice": 6000,
    "discountPercentage": 4,
    "unit": "1 Coil",
    "rating": 4.7,
    "reviewsCount": 156,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 40,
    "tags": ["wire", "rr kabel", "electrical", "wiring"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Size": "1.5 Sqmm",
      "Length": "200 MTR"
    },
    "description": "High quality FR LS wire from RR Kabel for socket and utility load points."
  },
  {
    "id": "p4",
    "name": "Polycab Optima Plus FR Wire 2.5 Sqmm, 200 MTR",
    "brand": "Polycab",
    "category": "electrical",
    "subCategory": "Wiring",
    "price": 9431,
    "originalPrice": 9800,
    "discountPercentage": 4,
    "unit": "1 Coil",
    "rating": 4.8,
    "reviewsCount": 210,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 30,
    "tags": ["wire", "polycab", "electrical", "wiring"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Size": "2.5 Sqmm",
      "Length": "200 MTR",
      "Conductor": "100% Electrolytic Copper"
    },
    "description": "Heavy load power wire for air conditioner, geyser and microwave circuits."
  },
  {
    "id": "p5",
    "name": "Finolex 4.0 Sqmm Single Core Industrial Cable (90 Mtr)",
    "brand": "Finolex",
    "category": "electrical",
    "subCategory": "Wiring",
    "price": 6850,
    "originalPrice": 7400,
    "discountPercentage": 7,
    "unit": "1 Coil",
    "rating": 4.9,
    "reviewsCount": 85,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 25,
    "tags": ["wire", "finolex", "electrical", "wiring"],
    "isEmergency": false,
    "specs": {
      "Size": "4.0 Sqmm",
      "Length": "90 MTR"
    },
    "description": "Premium industrial grade copper conductor wire for high amp main panels."
  },

  // =========================================================================
  // ELECTRICAL - CEILING FANS & EXHAUST
  // =========================================================================
  {
    "id": "p-fan-1",
    "name": "Crompton High Breeze 1200mm Ceiling Fan (Opal White)",
    "brand": "Crompton",
    "category": "electrical",
    "subCategory": "Fans",
    "price": 2450,
    "originalPrice": 2990,
    "discountPercentage": 18,
    "unit": "1 Piece",
    "rating": 4.8,
    "reviewsCount": 340,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 40,
    "tags": ["fan", "crompton", "ceiling fan", "electrical"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Sweep Size": "1200 mm (48 Inch)",
      "Air Delivery": "230 CMM",
      "Speed": "380 RPM",
      "Motor": "100% Copper Winding"
    },
    "description": "High air thrust aerodynamic blades with double ball bearing for whisper-quiet performance."
  },
  {
    "id": "p-fan-2",
    "name": "Atomberg Renesa 1200mm BLDC Motor Smart Ceiling Fan with Remote",
    "brand": "Atomberg",
    "category": "electrical",
    "subCategory": "Fans",
    "price": 3699,
    "originalPrice": 4790,
    "discountPercentage": 22,
    "unit": "1 Piece",
    "rating": 4.9,
    "reviewsCount": 420,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 35,
    "tags": ["fan", "atomberg", "bldc", "ceiling fan"],
    "isEmergency": false,
    "specs": {
      "Power": "28 Watts BLDC (65% Power Saving)",
      "Sweep": "1200 mm",
      "Speed Control": "Smart RF Remote with Timer & Boost Mode"
    },
    "description": "Energy-efficient 5-star rated BLDC motor fan running 3x longer on home inverters."
  },
  {
    "id": "p-fan-3",
    "name": "Havells Ventilair DB 150mm High Speed Exhaust Fan (White)",
    "brand": "Havells",
    "category": "electrical",
    "subCategory": "Fans",
    "price": 1250,
    "originalPrice": 1550,
    "discountPercentage": 19,
    "unit": "1 Piece",
    "rating": 4.7,
    "reviewsCount": 115,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 50,
    "tags": ["fan", "havells", "exhaust fan", "ventilation"],
    "isEmergency": false,
    "specs": {
      "Sweep": "150 mm (6 Inch)",
      "Body": "Rust-proof ABS Plastic with Bird Guard Shutter",
      "RPM": "2000 RPM"
    },
    "description": "Quiet and powerful ventilation exhaust fan for modern bathrooms and kitchens."
  },

  // =========================================================================
  // ELECTRICAL - SWITCHES & SOCKETS
  // =========================================================================
  {
    "id": "p-sw-1",
    "name": "Schneider Vivace 6A 1-Way Modular Switch (White)",
    "brand": "Schneider",
    "category": "electrical",
    "subCategory": "Switches",
    "price": 45,
    "originalPrice": 62,
    "discountPercentage": 27,
    "unit": "1 Piece",
    "rating": 4.9,
    "reviewsCount": 380,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 500,
    "tags": ["switch", "schneider", "modular", "switches"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Rating": "6A 240V AC",
      "Material": "Fire Retardant Polycarbonate",
      "Contact": "Silver Cadmium Oxide Contacts"
    },
    "description": "Sleek and slim modular switch tested for over 100,000 operational clicks."
  },
  {
    "id": "p-sw-2",
    "name": "Anchor Roma 6/16A Universal Heavy Duty Combined Socket with Shutter",
    "brand": "Anchor",
    "category": "electrical",
    "subCategory": "Switches",
    "price": 145,
    "originalPrice": 185,
    "discountPercentage": 21,
    "unit": "1 Piece",
    "rating": 4.8,
    "reviewsCount": 290,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 300,
    "tags": ["socket", "anchor", "roma", "switches"],
    "isEmergency": false,
    "specs": {
      "Rating": "16 Ampere",
      "Safety": "Child Protection Safety Shutters"
    },
    "description": "Heavy-duty power socket for refrigerators, geysers and heavy appliances."
  },
  {
    "id": "p-sw-3",
    "name": "Legrand Mylinc 100W 4-Step Rotary Fan Step Regulator",
    "brand": "Legrand",
    "category": "electrical",
    "subCategory": "Switches",
    "price": 285,
    "originalPrice": 360,
    "discountPercentage": 20,
    "unit": "1 Piece",
    "rating": 4.8,
    "reviewsCount": 160,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 120,
    "tags": ["regulator", "legrand", "fan regulator", "switches"],
    "isEmergency": false,
    "specs": {
      "Steps": "4 Step 360 Degree Rotation",
      "Capacity": "100 Watts (Capacitive Hum-free)"
    },
    "description": "Hum-free capacitive electronic step regulator for ceiling fans."
  },

  // =========================================================================
  // ELECTRICAL - MCB & DISTRIBUTION BOARDS
  // =========================================================================
  {
    "id": "p-mcb-1",
    "name": "Havells Euro-II 16A Single Pole (SP) C-Curve MCB (10kA)",
    "brand": "Havells",
    "category": "electrical",
    "subCategory": "MCBs",
    "price": 195,
    "originalPrice": 260,
    "discountPercentage": 25,
    "unit": "1 Piece",
    "rating": 4.9,
    "reviewsCount": 210,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 150,
    "tags": ["mcb", "havells", "switchgear", "breaker"],
    "isEmergency": false,
    "specs": {
      "Current Rating": "16A",
      "Breaking Capacity": "10 kA",
      "Standard": "IS/IEC 60898-1"
    },
    "description": "High breaking capacity miniature circuit breaker protecting wires from short-circuits."
  },
  {
    "id": "p-mcb-2",
    "name": "Schneider Electric Easy9 8-Way SPN Distribution Board (Double Door)",
    "brand": "Schneider",
    "category": "electrical",
    "subCategory": "MCBs",
    "price": 1250,
    "originalPrice": 1600,
    "discountPercentage": 21,
    "unit": "1 Box",
    "rating": 4.8,
    "reviewsCount": 85,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 45,
    "tags": ["db box", "schneider", "distribution board", "mcb"],
    "isEmergency": false,
    "specs": {
      "Ways": "8 Way Single Pole & Neutral",
      "Door": "IP43 Metallic Double Door"
    },
    "description": "Flush mounting industrial grade sheet steel enclosure for home power distribution."
  },

  // =========================================================================
  // ELECTRICAL - LIGHTING
  // =========================================================================
  {
    "id": "p-light-1",
    "name": "Philips Stellar Bright 9W B22 Cool Day LED Bulbs (Pack of 4)",
    "brand": "Philips",
    "category": "electrical",
    "subCategory": "Lights",
    "price": 380,
    "originalPrice": 520,
    "discountPercentage": 26,
    "unit": "Pack of 4",
    "rating": 4.9,
    "reviewsCount": 540,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 180,
    "tags": ["led", "bulb", "philips", "lighting"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Wattage": "9W (900 Lumens)",
      "Cap": "B22 Pin Base",
      "Color Temp": "6500K Cool Day Light",
      "Surge Protection": "Up to 4kV"
    },
    "description": "Energy-saving eye-safe LED bulbs with wide beam distribution."
  },
  {
    "id": "p-light-2",
    "name": "Havells Adore 12W Square Slim Recessed LED Panel Light",
    "brand": "Havells",
    "category": "electrical",
    "subCategory": "Lights",
    "price": 340,
    "originalPrice": 460,
    "discountPercentage": 26,
    "unit": "1 Piece",
    "rating": 4.8,
    "reviewsCount": 190,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 90,
    "tags": ["panel light", "havells", "recessed", "lighting"],
    "isEmergency": false,
    "specs": {
      "Wattage": "12W",
      "Mounting": "False Ceiling Recessed Square",
      "Driver": "Isolated Surge-Proof Internal Driver"
    },
    "description": "Ultra-slim anti-glare diffuser panel for living rooms and false ceilings."
  },
  {
    "id": "p-light-3",
    "name": "Wipro 50W IP66 Waterproof Heavy Outdoor LED Floodlight",
    "brand": "Wipro",
    "category": "electrical",
    "subCategory": "Lights",
    "price": 1299,
    "originalPrice": 1800,
    "discountPercentage": 27,
    "unit": "1 Piece",
    "rating": 4.7,
    "reviewsCount": 78,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 35,
    "tags": ["flood light", "wipro", "outdoor", "lighting"],
    "isEmergency": false,
    "specs": {
      "Wattage": "50W",
      "Ingress Protection": "IP66 Heavy Rainproof",
      "Body": "Die-cast Aluminum Heat Sink"
    },
    "description": "High powered exterior floodlight for building facades, gardens and boundary walls."
  },

  // =========================================================================
  // ELECTRICAL - CONDUITS & GI BOXES
  // =========================================================================
  {
    "id": "p-dalda-pipe-3-4",
    "name": "3/4\" Dalda PVC Conduit Pipe (10 Ft Length, Heavy Duty)",
    "brand": "Dalda",
    "category": "electrical",
    "subCategory": "Pipes",
    "price": 65,
    "originalPrice": 80,
    "discountPercentage": 19,
    "unit": "1 Piece (10ft)",
    "rating": 4.9,
    "reviewsCount": 118,
    "deliveryMinutes": 30,
    "image": "https://i.imgur.com/G9LIx1R.jpeg",
    "images": ["https://i.imgur.com/G9LIx1R.jpeg"],
    "image_urls": ["https://i.imgur.com/G9LIx1R.jpeg"],
    "inStock": true,
    "stockCount": 350,
    "tags": ["pipe", "dalda", "pvc", "conduit", "3/4 pipe", "dalda pipe", "electrical"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Size": "3/4 Inch (20mm)",
      "Brand": "Dalda",
      "Length": "10 Feet (3 Metres)",
      "Material": "Heavy Virgin Rigid PVC",
      "Standard": "IS 9537 Part 3",
      "Available Colors": "Ivory/White, Black, Grey, Blue, Red, Yellow",
      "Application": "Concealed RCC Slab Casting & Wall Chasing Wiring"
    },
    "description": "High-durability 3/4\" Dalda rigid PVC conduit pipe with high impact strength, shock protection, and flame-retardant formulation for residential and commercial building electrical conduit routing."
  },
  {
    "id": "p10",
    "name": "25mm Heavy Duty PVC Conduit Straight Pipe (10 Ft Length, AKG)",
    "brand": "AKG",
    "category": "electrical",
    "subCategory": "PVC Items",
    "price": 70,
    "originalPrice": 85,
    "discountPercentage": 17,
    "unit": "1 Piece (10ft)",
    "rating": 4.7,
    "reviewsCount": 88,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 200,
    "tags": ["pipe", "pvc", "akg", "conduit"],
    "isEmergency": false,
    "specs": {
      "Diameter": "25mm (1 Inch)",
      "Grade": "Medium Duty (MMS)",
      "Length": "10 Feet (3 Mtr)"
    },
    "description": "Shock-proof fire-retardant rigid PVC conduit pipe for concrete wall chasing."
  },
  {
    "id": "p-gi-1",
    "name": "8-Module Galvanized Iron (GI) Flush Modular Switch Box (18 Gauge)",
    "brand": "Generic",
    "category": "electrical",
    "subCategory": "PVC Items",
    "price": 85,
    "originalPrice": 110,
    "discountPercentage": 22,
    "unit": "1 Box",
    "rating": 4.8,
    "reviewsCount": 160,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=400&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 250,
    "tags": ["gi box", "metal box", "modular box", "electrical"],
    "isEmergency": false,
    "specs": {
      "Capacity": "8 Module",
      "Thickness": "18 Gauge Heavy Zinc Coated GI Sheet",
      "Earthing": "Pre-welded Brass Earthing Screw"
    },
    "description": "Rust-proof concealed metal modular switchboard box."
  },

  // =========================================================================
  // ELECTRICAL - CCTV & SURVEILLANCE
  // =========================================================================
  {
    "id": "p-cctv-1",
    "name": "Hikvision 2MP Full HD 1080P IR Dome Security Camera (Night Vision)",
    "brand": "Hikvision",
    "category": "electrical",
    "subCategory": "CCTV & Surveillance",
    "price": 1450,
    "originalPrice": 1950,
    "discountPercentage": 25,
    "unit": "1 Unit",
    "rating": 4.8,
    "reviewsCount": 130,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 35,
    "tags": ["cctv", "camera", "hikvision", "surveillance"],
    "isEmergency": false,
    "specs": {
      "Resolution": "1080P Full HD (2 Megapixels)",
      "Night Vision Range": "20 Meters Smart IR",
      "Lens": "3.6mm Wide Angle Lens"
    },
    "description": "Indoor security dome camera with crystal clear day and night infrared recording."
  },
  {
    "id": "p-cctv-2",
    "name": "CP Plus 4-Channel HD DVR Digital Video Recorder with Mobile App View",
    "brand": "CP Plus",
    "category": "electrical",
    "subCategory": "CCTV & Surveillance",
    "price": 2890,
    "originalPrice": 3600,
    "discountPercentage": 19,
    "unit": "1 Unit",
    "rating": 4.7,
    "reviewsCount": 85,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 20,
    "tags": ["cctv", "dvr", "cp plus", "surveillance"],
    "isEmergency": false,
    "specs": {
      "Channels": "4 Channel HD Video Inputs",
      "Compression": "H.265+ High Efficiency Storage",
      "Connectivity": "HDMI / VGA / LAN / Cloud Phone App"
    },
    "description": "Standalone DVR recorder with real-time smartphone remote monitoring."
  },

  // =========================================================================
  // ELECTRICAL - HOME APPLIANCES & POWER BACKUP
  // =========================================================================
  {
    "id": "p-app-1",
    "name": "Crompton Arno Neo 15-Litre 5-Star Storage Water Heater (Geyser)",
    "brand": "Crompton",
    "category": "electrical",
    "subCategory": "Home Appliances",
    "price": 6290,
    "originalPrice": 8400,
    "discountPercentage": 25,
    "unit": "1 Unit",
    "rating": 4.9,
    "reviewsCount": 280,
    "deliveryMinutes": 60,
    "image": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 25,
    "tags": ["geyser", "water heater", "crompton", "appliances"],
    "isEmergency": false,
    "specs": {
      "Capacity": "15 Litres",
      "Energy Rating": "5 Star BEE Certified",
      "Pressure": "8 Bar High Rise Apartment Suitable",
      "Tank": "Superior Glassline Coated Inner Tank"
    },
    "description": "Fast heating anti-scale water geyser with advanced multi-tier safety valve system."
  },
  {
    "id": "p-app-2",
    "name": "Luminous Zelio+ 1100 Pure Sine Wave Home Inverter (900VA / 12V)",
    "brand": "Luminous",
    "category": "electrical",
    "subCategory": "Home Appliances",
    "price": 6499,
    "originalPrice": 7900,
    "discountPercentage": 17,
    "unit": "1 Unit",
    "rating": 4.9,
    "reviewsCount": 195,
    "deliveryMinutes": 60,
    "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 20,
    "tags": ["inverter", "luminous", "power backup", "appliances"],
    "isEmergency": false,
    "specs": {
      "Capacity": "900 VA / 12V DC",
      "Waveform": "Pure Sine Wave (Safe for Electronics)",
      "Display": "Smart LCD Showing Backup Hours & Battery %"
    },
    "description": "Silent inverter with 32-bit DSP processor protecting fans and delicate home devices."
  },

  // =========================================================================
  // CONSTRUCTION - CEMENT & CONCRETE
  // =========================================================================
  {
    "id": "c1",
    "name": "UltraTech Super Cement OPC 53 Grade (50 Kg Bag)",
    "brand": "UltraTech",
    "category": "construction",
    "subCategory": "Cement & Concrete",
    "price": 385,
    "originalPrice": 425,
    "discountPercentage": 9,
    "unit": "50 Kg Bag",
    "rating": 4.9,
    "reviewsCount": 184,
    "deliveryMinutes": 120,
    "image": "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 200,
    "tags": ["cement", "ultratech", "construction", "opc 53"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Grade": "OPC 53 Grade",
      "Weight": "50 Kg",
      "Packaging": "Tamper-proof Laminated HDPE Bag",
      "Setting Time": "Initial > 30 min, Final < 600 min"
    },
    "description": "UltraTech 53 Grade OPC cement engineered for high strength RCC slabs, beams and pillars."
  },
  {
    "id": "c-cem-2",
    "name": "ACC Concrete Plus High Strength Silico-Mineral Cement (50 Kg)",
    "brand": "ACC",
    "category": "construction",
    "subCategory": "Cement & Concrete",
    "price": 375,
    "originalPrice": 415,
    "discountPercentage": 10,
    "unit": "50 Kg Bag",
    "rating": 4.8,
    "reviewsCount": 140,
    "deliveryMinutes": 120,
    "image": "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 150,
    "tags": ["cement", "acc", "concrete", "construction"],
    "isEmergency": false,
    "specs": {
      "Grade": "PPC Concrete Special",
      "Feature": "Dense Microstructure Impermeable to Water"
    },
    "description": "Advanced cement with microfine particles preventing corrosion of reinforcement steel."
  },

  // =========================================================================
  // CONSTRUCTION - TMT & STEEL
  // =========================================================================
  {
    "id": "c2",
    "name": "Tata Tiscon 550D Superlinks TMT Rebars (10mm, 12 Mtr Length)",
    "brand": "Tata Tiscon",
    "category": "construction",
    "subCategory": "TMT & Steel",
    "price": 640,
    "originalPrice": 710,
    "discountPercentage": 10,
    "unit": "1 Piece (12m)",
    "rating": 4.9,
    "reviewsCount": 142,
    "deliveryMinutes": 180,
    "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 150,
    "tags": ["tmt", "steel", "tata tiscon", "rebar"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Diameter": "10mm",
      "Grade": "Fe 550D High Ductility",
      "Standard": "IS 1786:2008"
    },
    "description": "Earthquake resistant high-ductility Fe 550D TMT steel rebars direct from Tata Tiscon factory depot."
  },

  // =========================================================================
  // CONSTRUCTION - TILING & ADHESIVES
  // =========================================================================
  {
    "id": "c-tile-1",
    "name": "Roff New Construction Tile Adhesive (NSA Grey, 20 Kg Bag)",
    "brand": "Roff",
    "category": "construction",
    "subCategory": "Tiling & Adhesives",
    "price": 460,
    "originalPrice": 550,
    "discountPercentage": 16,
    "unit": "20 Kg Bag",
    "rating": 4.9,
    "reviewsCount": 110,
    "deliveryMinutes": 60,
    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 80,
    "tags": ["tile", "adhesive", "roff", "tiling"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Weight": "20 Kg",
      "Type": "Polymer Modified Cementitious Tile Adhesive",
      "Application": "Floor and Wall Ceramic / Vitrified Tiles"
    },
    "description": "High shear bond strength tile adhesive preventing hollow sounds and debonding."
  },
  {
    "id": "c-tile-2",
    "name": "Roff Cera Clean Rapid Action Tile & Ceramic Cleaner (1 Litre)",
    "brand": "Roff",
    "category": "construction",
    "subCategory": "Tiling & Adhesives",
    "price": 195,
    "originalPrice": 240,
    "discountPercentage": 18,
    "unit": "1 Litre Bottle",
    "rating": 4.8,
    "reviewsCount": 95,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 120,
    "tags": ["cleaner", "tile cleaner", "roff", "tiling"],
    "isEmergency": false,
    "specs": {
      "Volume": "1 Litre",
      "Usage": "Removes Cement Stains, Limescale and Grout Residues"
    },
    "description": "Heavy duty chemical cleaner restoring shine on vitrified tiles and bathroom fittings."
  },

  // =========================================================================
  // CONSTRUCTION - PAINTS & PUTTY
  // =========================================================================
  {
    "id": "c5",
    "name": "Asian Paints TruCare White Cement Wall Putty (20 Kg Bag)",
    "brand": "Asian Paints",
    "category": "construction",
    "subCategory": "Paints & Putty",
    "price": 680,
    "originalPrice": 760,
    "discountPercentage": 11,
    "unit": "20 Kg Bag",
    "rating": 4.8,
    "reviewsCount": 112,
    "deliveryMinutes": 90,
    "image": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 90,
    "tags": ["paint", "putty", "asian paints", "wall prep"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Weight": "20 Kg",
      "Coverage": "14-16 sq ft/kg",
      "Base": "White Portland Cement with Polymer Resins"
    },
    "description": "Silky-smooth white cement wall putty creating flawless water-resistant base for luxury paints."
  },
  {
    "id": "c-paint-2",
    "name": "Asian Paints Apex Ultima Dust Proof Exterior Emulsion (4 Litre, Brilliant White)",
    "brand": "Asian Paints",
    "category": "construction",
    "subCategory": "Paints & Putty",
    "price": 1490,
    "originalPrice": 1780,
    "discountPercentage": 16,
    "unit": "4 Litre Bucket",
    "rating": 4.9,
    "reviewsCount": 75,
    "deliveryMinutes": 60,
    "image": "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 45,
    "tags": ["paint", "asian paints", "exterior paint", "paints"],
    "isEmergency": false,
    "specs": {
      "Volume": "4 Litre",
      "Warranty": "7 Year Anti-Algal Exterior Warranty"
    },
    "description": "High performance exterior wall paint with anti-fungal silicone additives."
  },

  // =========================================================================
  // CONSTRUCTION - WATERPROOFING
  // =========================================================================
  {
    "id": "c3",
    "name": "Dr. Fixit 101 LW+ Integral Liquid Waterproofing Compound (5 Litre)",
    "brand": "Dr. Fixit",
    "category": "construction",
    "subCategory": "Waterproofing",
    "price": 650,
    "originalPrice": 750,
    "discountPercentage": 13,
    "unit": "5 L Can",
    "rating": 4.8,
    "reviewsCount": 96,
    "deliveryMinutes": 60,
    "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 60,
    "tags": ["waterproofing", "dr fixit", "chemical", "mortar"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Volume": "5 Litre",
      "Dosage": "200ml per 50kg cement bag",
      "Application": "Plaster, Concrete, Slabs & Basements"
    },
    "description": "Integral waterproofing liquid compound preventing hairline shrinkage cracks and dampness."
  },
  {
    "id": "c-wp-2",
    "name": "Dr. Fixit Dampguard Interior Wall Damp-Proof Coating (1 Kg Pack)",
    "brand": "Dr. Fixit",
    "category": "construction",
    "subCategory": "Waterproofing",
    "price": 420,
    "originalPrice": 510,
    "discountPercentage": 17,
    "unit": "1 Kg Kit",
    "rating": 4.7,
    "reviewsCount": 82,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 40,
    "tags": ["dampguard", "dr fixit", "waterproofing", "dampness"],
    "isEmergency": false,
    "specs": {
      "Weight": "1 Kg (2-Part Epoxy Coating)",
      "Coverage": "30-35 sq ft / kg / 2 coats"
    },
    "description": "Epoxy water-based damp proofing barrier blocking severe efflorescence and wall flaking."
  },

  // =========================================================================
  // CONSTRUCTION - PLYWOOD, MDF & HDHMR
  // =========================================================================
  {
    "id": "c-ply-1",
    "name": "CenturyPly Club Prime 710 BWP Boiling Waterproof Plywood (18mm, 8x4 Ft)",
    "brand": "CenturyPly",
    "category": "construction",
    "subCategory": "Plywood & Boards",
    "price": 3840,
    "originalPrice": 4400,
    "discountPercentage": 13,
    "unit": "1 Sheet (32 sqft)",
    "rating": 4.9,
    "reviewsCount": 65,
    "deliveryMinutes": 180,
    "image": "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 35,
    "tags": ["plywood", "centuryply", "marine", "boards"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Thickness": "18mm",
      "Dimensions": "8 Ft x 4 Ft",
      "Grade": "IS 710 Marine Grade BWP",
      "Warranty": "25-Year Guarantee"
    },
    "description": "Boiling waterproof calibrated plywood with glue line borer and termite treatment."
  },
  {
    "id": "c-ply-2",
    "name": "Action TESA Heavy Density HDHMR Board (12mm, 8x4 Ft Sheet)",
    "brand": "Action TESA",
    "category": "construction",
    "subCategory": "Plywood & Boards",
    "price": 2350,
    "originalPrice": 2750,
    "discountPercentage": 15,
    "unit": "1 Sheet (32 sqft)",
    "rating": 4.8,
    "reviewsCount": 54,
    "deliveryMinutes": 180,
    "image": "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 40,
    "tags": ["hdhmr", "action tesa", "board", "plywood"],
    "isEmergency": false,
    "specs": {
      "Thickness": "12mm",
      "Density": "> 850 kg/m³ High Moisture Resistance"
    },
    "description": "Green core HDHMR panel ideal for CNC routing, modular wardrobes and kitchen cabinets."
  },

  // =========================================================================
  // CONSTRUCTION - ADHESIVES & FEVICOL
  // =========================================================================
  {
    "id": "c-fev-1",
    "name": "Fevicol SH Synthetic Resin Wood Adhesive (5 Kg Tub)",
    "brand": "Fevicol",
    "category": "construction",
    "subCategory": "Adhesives & Fevicol",
    "price": 1150,
    "originalPrice": 1320,
    "discountPercentage": 13,
    "unit": "5 Kg Tub",
    "rating": 4.9,
    "reviewsCount": 210,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 85,
    "tags": ["fevicol", "adhesive", "wood glue", "construction"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Weight": "5 Kg",
      "Bonding Time": "6-8 Hours",
      "Application": "Plywood, Laminates, MDF and Wood joints"
    },
    "description": "India's trusted synthetic resin adhesive with unbeatable bonding strength for carpentry."
  },
  {
    "id": "c-fev-2",
    "name": "Fevicol Marine Waterproof Wood Adhesive (5 Kg Bucket)",
    "brand": "Fevicol",
    "category": "construction",
    "subCategory": "Adhesives & Fevicol",
    "price": 1420,
    "originalPrice": 1650,
    "discountPercentage": 14,
    "unit": "5 Kg Bucket",
    "rating": 4.9,
    "reviewsCount": 135,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 60,
    "tags": ["fevicol marine", "waterproof glue", "fevicol"],
    "isEmergency": false,
    "specs": {
      "Type": "D3 Waterproof Wood Adhesive",
      "Specialty": "Resistant to 48 Hours Continuous Boiling Water"
    },
    "description": "Marine grade wood glue specially engineered for kitchens, bathrooms and exterior doors."
  },

  // =========================================================================
  // CONSTRUCTION - KITCHEN SINKS & FAUCETS
  // =========================================================================
  {
    "id": "c-sink-1",
    "name": "SS 304 Heavy Duty Handmade Stainless Steel Kitchen Sink (24x18 Inch, Satin Finish)",
    "brand": "Giriraj Genuine",
    "category": "construction",
    "subCategory": "Kitchen Sinks & Faucets",
    "price": 3890,
    "originalPrice": 5200,
    "discountPercentage": 25,
    "unit": "1 Unit with Waste Coupling & Basket",
    "rating": 4.8,
    "reviewsCount": 78,
    "deliveryMinutes": 60,
    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 25,
    "tags": ["sink", "kitchen sink", "stainless steel", "faucets"],
    "isEmergency": false,
    "specs": {
      "Size": "24 x 18 x 9 Inch Deep Bowl",
      "Material": "SUS 304 Grade Stainless Steel (1.2mm Thick)",
      "Sound Proofing": "Heavy Rubber Sound Deadening Pads"
    },
    "description": "Deep single bowl handmade sink with anti-condensation undercoating."
  },
  {
    "id": "c-sink-2",
    "name": "Jaquar Alive Chrome Swan Neck Table Mounted Kitchen Faucet Tap",
    "brand": "Jaquar",
    "category": "construction",
    "subCategory": "Kitchen Sinks & Faucets",
    "price": 1850,
    "originalPrice": 2400,
    "discountPercentage": 23,
    "unit": "1 Piece",
    "rating": 4.9,
    "reviewsCount": 110,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 30,
    "tags": ["faucet", "tap", "jaquar", "kitchen"],
    "isEmergency": false,
    "specs": {
      "Spout": "360 Degree Swivel High Arch Spout",
      "Cartridge": "Ceramic Disc Cartridge (500k Cycles)"
    },
    "description": "Mirror chrome plated solid brass swan neck sink faucet with honeycomb aerator."
  },

  // =========================================================================
  // CONSTRUCTION - SANITARY & BATH FITTINGS
  // =========================================================================
  {
    "id": "c-san-1",
    "name": "Hindware Italian Collection Wall Hung Western Commode Toilet (Soft-Close Seat)",
    "brand": "Hindware",
    "category": "construction",
    "subCategory": "Sanitary & Bath Fittings",
    "price": 6490,
    "originalPrice": 8500,
    "discountPercentage": 24,
    "unit": "1 Set",
    "rating": 4.8,
    "reviewsCount": 92,
    "deliveryMinutes": 120,
    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 20,
    "tags": ["commode", "hindware", "sanitary", "toilet"],
    "isEmergency": false,
    "specs": {
      "Mounting": "Wall Hung Concealed Fixing",
      "Flushing": "Rimless Vortex Power Flush System",
      "Seat Cover": "Hydraulic Soft Close UF Seat"
    },
    "description": "Modern rimless wall-hung ceramic commode toilet with anti-bacterial glaze."
  },
  {
    "id": "c-san-2",
    "name": "Geberit Concealed Cistern Flush Tank with Dual Flush Chrome Actuator Plate",
    "brand": "Geberit",
    "category": "construction",
    "subCategory": "Sanitary & Bath Fittings",
    "price": 4750,
    "originalPrice": 5900,
    "discountPercentage": 19,
    "unit": "1 Unit",
    "rating": 4.9,
    "reviewsCount": 65,
    "deliveryMinutes": 60,
    "image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 25,
    "tags": ["cistern", "geberit", "flush", "sanitary"],
    "isEmergency": false,
    "specs": {
      "Tank Capacity": "Dual Flush (3L / 6L Water Saving)",
      "Installation": "In-wall Brick / Drywall Concealed"
    },
    "description": "Leak-proof Swiss engineered in-wall flush cistern with quiet fill valve."
  },

  // =========================================================================
  // CONSTRUCTION - HINGES, CHANNELS & HANDLES
  // =========================================================================
  {
    "id": "c-hinge-1",
    "name": "Hettich Sensys Soft-Close Concealed Auto Hinges 0 Crank (Pack of 4)",
    "brand": "Hettich",
    "category": "construction",
    "subCategory": "Hinges & Hardware",
    "price": 680,
    "originalPrice": 850,
    "discountPercentage": 20,
    "unit": "Pack of 4",
    "rating": 4.9,
    "reviewsCount": 140,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1508873696983-2df5293cb395?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 90,
    "tags": ["hinges", "hettich", "soft close", "hardware"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Type": "0 Crank Full Overlay Auto Concealed Hinge",
      "Mechanism": "Integrated Silent System Cushioning"
    },
    "description": "German engineered soft-close hydraulic cabinet hinges tested for 200,000 door cycles."
  },
  {
    "id": "c-hinge-2",
    "name": "Godrej Telescopic Soft-Close Drawer Ball Bearing Channels (18 Inch, Pair)",
    "brand": "Godrej",
    "category": "construction",
    "subCategory": "Hinges & Hardware",
    "price": 540,
    "originalPrice": 690,
    "discountPercentage": 22,
    "unit": "1 Pair (Left + Right)",
    "rating": 4.8,
    "reviewsCount": 115,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1508873696983-2df5293cb395?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 80,
    "tags": ["drawer channels", "godrej", "telescopic", "hardware"],
    "isEmergency": false,
    "specs": {
      "Length": "18 Inch (450 mm)",
      "Load Capacity": "45 Kg Heavy Load",
      "Steel": "Zinc Plated High-Tensile Steel"
    },
    "description": "Smooth full extension drawer slide channels with hydraulic self-closing dampers."
  },

  // =========================================================================
  // CONSTRUCTION - KITCHEN SYSTEMS & ACCESSORIES
  // =========================================================================
  {
    "id": "c-kit-1",
    "name": "Stainless Steel 304 Pull-Out Spice Rack 2-Tier Organizer (150mm Width)",
    "brand": "Giriraj Genuine",
    "category": "construction",
    "subCategory": "Kitchen Systems & Accessories",
    "price": 2490,
    "originalPrice": 3200,
    "discountPercentage": 22,
    "unit": "1 Set with Soft-Close Slides",
    "rating": 4.8,
    "reviewsCount": 64,
    "deliveryMinutes": 60,
    "image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 25,
    "tags": ["kitchen", "modular", "spice rack", "tandem"],
    "isEmergency": false,
    "specs": {
      "Width": "150 mm Cabinet Width",
      "Wire Material": "100% SS 304 Solid Round Wire with Chrome Nickel Plating"
    },
    "description": "Modular under-counter pull-out wire basket system for oil bottles and spice containers."
  },

  // =========================================================================
  // CONSTRUCTION - WARDROBE & BED FITTINGS
  // =========================================================================
  {
    "id": "c-bed-1",
    "name": "Heavy Duty Gas Hydraulic Bed Lift Mechanism with Struts (120 Kg Capacity, Pair)",
    "brand": "Giriraj Genuine",
    "category": "construction",
    "subCategory": "Wardrobe & Bed Fittings",
    "price": 2150,
    "originalPrice": 2800,
    "discountPercentage": 23,
    "unit": "1 Pair (Bed Lift Hinges + Gas Springs)",
    "rating": 4.8,
    "reviewsCount": 85,
    "deliveryMinutes": 60,
    "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 30,
    "tags": ["bed lift", "hydraulic", "gas pump", "wardrobe"],
    "isEmergency": false,
    "specs": {
      "Piston Force": "1200N (120 Kg Weight Lift)",
      "Bracket": "Cold-rolled Heavy Gauge Steel Frame"
    },
    "description": "Smooth lifting pneumatic gas struts allowing effortless access to under-bed box storage."
  },

  // =========================================================================
  // CONSTRUCTION - DOOR LOCKS & HARDWARE
  // =========================================================================
  {
    "id": "c-lock-1",
    "name": "Godrej Advantis Smart Touchscreen Digital & Biometric Fingerprint Main Door Lock",
    "brand": "Godrej",
    "category": "construction",
    "subCategory": "Door Locks & Hardware",
    "price": 11990,
    "originalPrice": 15500,
    "discountPercentage": 23,
    "unit": "1 Set",
    "rating": 4.9,
    "reviewsCount": 160,
    "deliveryMinutes": 60,
    "image": "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 20,
    "tags": ["smart lock", "godrej", "biometric", "door lock"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Access Modes": "Fingerprint (100 Prints) / RFID Card / PIN Code / Mechanical Key",
      "Body": "Heavy Aluminum Alloy Die Cast Body with Anti-tamper Alarm"
    },
    "description": "High security digital lock with 3-minute auto lock and fire alert sensors."
  },
  {
    "id": "c-lock-2",
    "name": "Godrej Nav-Tal 7 Levers Heavy Brass Body Padlock (with 3 Keys)",
    "brand": "Godrej",
    "category": "construction",
    "subCategory": "Door Locks & Hardware",
    "price": 490,
    "originalPrice": 610,
    "discountPercentage": 20,
    "unit": "1 Piece",
    "rating": 4.9,
    "reviewsCount": 350,
    "deliveryMinutes": 30,
    "image": "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 150,
    "tags": ["padlock", "godrej", "nav tal", "lock"],
    "isEmergency": false,
    "specs": {
      "Material": "Solid Brass Extruded Body with Hardened Steel Shackle",
      "Mechanism": "7 Brass Levers (Pick-proof)"
    },
    "description": "Traditional heavy brass padlock securing main gates, shutters and warehouses."
  },

  // =========================================================================
  // CONSTRUCTION - CPVC PIPES & OVERHEAD TANKS
  // =========================================================================
  {
    "id": "c4",
    "name": "Astral CPVC Pro High Pressure Pipe (1 Inch, 3 Mtr Length)",
    "brand": "Astral",
    "category": "construction",
    "subCategory": "Plumbing & Pipes",
    "price": 420,
    "originalPrice": 480,
    "discountPercentage": 12,
    "unit": "1 Length (3m)",
    "rating": 4.7,
    "reviewsCount": 78,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 80,
    "tags": ["plumbing", "pipe", "astral", "cpvc"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Diameter": "1 Inch (25mm)",
      "SDR": "SDR 11 Class 1",
      "Temperature": "Up to 93°C Hot & Cold Water"
    },
    "description": "NSF-certified chlorination polyvinyl chloride pipe for domestic water distribution."
  },
  {
    "id": "c-pipe-2",
    "name": "Supreme 1000 Litre Heavy Triple Layer UV Protected Water Storage Tank",
    "brand": "Supreme",
    "category": "construction",
    "subCategory": "Plumbing & Pipes",
    "price": 6890,
    "originalPrice": 8200,
    "discountPercentage": 16,
    "unit": "1 Tank",
    "rating": 4.8,
    "reviewsCount": 85,
    "deliveryMinutes": 180,
    "image": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 15,
    "tags": ["water tank", "supreme", "overhead tank", "plumbing"],
    "isEmergency": false,
    "specs": {
      "Capacity": "1000 Litres",
      "Layers": "3 Layers (Outer White UV Shield + Middle Black + Inner Food Grade Anti-Microbial)"
    },
    "description": "Roto-molded 100% virgin polymer overhead water storage tank."
  },

  // =========================================================================
  // CONSTRUCTION - POWER TOOLS & ACCESSORIES
  // =========================================================================
  {
    "id": "c6",
    "name": "Bosch GSB 500W Professional Impact Drill Kit with 100 Accessories",
    "brand": "Bosch",
    "category": "construction",
    "subCategory": "Power Tools",
    "price": 3890,
    "originalPrice": 4500,
    "discountPercentage": 14,
    "unit": "1 Kit with Carry Case",
    "rating": 4.9,
    "reviewsCount": 230,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1508873696983-2df5293cb395?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 25,
    "tags": ["drill", "bosch", "power tool", "hardware"],
    "isBestSeller": true,
    "isEmergency": false,
    "specs": {
      "Power": "500 Watts",
      "Chuck": "10mm Keyed",
      "Speed": "0-2600 RPM Variable Speed & Reverse Switch"
    },
    "description": "Compact and powerful impact drill kit for concrete, steel and woodwork."
  },
  {
    "id": "c-tool-2",
    "name": "Bosch GWS 600 Professional 4-Inch 670W Angle Grinder",
    "brand": "Bosch",
    "category": "construction",
    "subCategory": "Power Tools",
    "price": 2790,
    "originalPrice": 3400,
    "discountPercentage": 18,
    "unit": "1 Unit with Protective Guard",
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1508873696983-2df5293cb395?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 30,
    "tags": ["grinder", "bosch", "angle grinder", "tools"],
    "isEmergency": false,
    "specs": {
      "Power": "670 Watts",
      "Disc Diameter": "100 mm (4 Inch)",
      "Speed": "11,000 RPM No-load"
    },
    "description": "Ergonomic slim housing angle grinder for cutting metal rebars, masonry and tile grinding."
  },

  // =========================================================================
  // CONSTRUCTION - GENERAL HARDWARE & TOOLS
  // =========================================================================
  {
    "id": "c-gen-1",
    "name": "Heavy Duty 5-Step Aluminum Folding Step Ladder (Slip-Resistant Ribbed Steps)",
    "brand": "Giriraj Genuine",
    "category": "construction",
    "subCategory": "General Hardware & Tools",
    "price": 2890,
    "originalPrice": 3600,
    "discountPercentage": 20,
    "unit": "1 Ladder",
    "rating": 4.8,
    "reviewsCount": 95,
    "deliveryMinutes": 60,
    "image": "https://images.unsplash.com/photo-1508873696983-2df5293cb395?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 20,
    "tags": ["ladder", "step ladder", "hardware", "tools"],
    "isEmergency": false,
    "specs": {
      "Steps": "5 Steps (Top Platform at 4.5 Ft)",
      "Load Capacity": "150 Kg Tested Weight",
      "Material": "High Strength Anodized Aluminum"
    },
    "description": "Ultra lightweight foldable step ladder with safety top guard rail and non-skid rubber feet."
  },
  {
    "id": "c-gen-2",
    "name": "Heavy Duty Waterproof HDPE Tarpaulin Sheet (12x18 Ft, 250 GSM)",
    "brand": "Giriraj Genuine",
    "category": "construction",
    "subCategory": "General Hardware & Tools",
    "price": 1150,
    "originalPrice": 1450,
    "discountPercentage": 21,
    "unit": "1 Piece",
    "rating": 4.7,
    "reviewsCount": 68,
    "deliveryMinutes": 45,
    "image": "https://images.unsplash.com/photo-1508873696983-2df5293cb395?q=80&w=600&auto=format&fit=crop",
    "inStock": true,
    "stockCount": 45,
    "tags": ["tarpaulin", "tirpal", "cover", "hardware"],
    "isEmergency": false,
    "specs": {
      "Size": "12 Ft x 18 Ft",
      "GSM": "250 GSM 100% Water & UV Proof",
      "Eyelets": "Reinforced Aluminum Eyelets Every 3 Feet"
    },
    "description": "Heavy monsoon protection tarpaulin sheet for cement bags, construction aggregates and roofing."
  }
];
