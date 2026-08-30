import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Master SVG template of the 3D Yellow Lightning Bolt on Dark Teal background
function getIconSvg(width: number, height: number, isForegroundOnly = false, isCircle = false): string {
  const cornerRadius = isCircle ? width / 2 : Math.round(width * 0.22);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="${width}" height="${height}">
  <defs>
    <!-- Background Gradient: Deep Teal / Cyan Depth -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a666e" />
      <stop offset="45%" stop-color="#1d4e55" />
      <stop offset="100%" stop-color="#12353a" />
    </linearGradient>

    <!-- Background Radial Soft Glow -->
    <radialGradient id="centerGlow" cx="48%" cy="46%" r="55%">
      <stop offset="0%" stop-color="#3c828d" stop-opacity="0.6" />
      <stop offset="70%" stop-color="#1a464c" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#0e2a2e" stop-opacity="0" />
    </radialGradient>

    <!-- Lightning Bolt Base Fill Gradient (Warm 3D Electric Yellow) -->
    <linearGradient id="boltGrad" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#ffeb60" />
      <stop offset="35%" stop-color="#fed136" />
      <stop offset="85%" stop-color="#f5b81a" />
      <stop offset="100%" stop-color="#e29b0a" />
    </linearGradient>

    <!-- Lightning Bolt Top Specular Lighting -->
    <linearGradient id="specularGrad" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#fff69b" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#fed136" stop-opacity="0" />
    </linearGradient>

    <!-- Lightning Bolt Bottom-Right 3D Extrusion Shade -->
    <linearGradient id="extrusionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d98904" />
      <stop offset="50%" stop-color="#b86f00" />
      <stop offset="100%" stop-color="#804a00" />
    </linearGradient>

    <!-- Warm Ambient Rim Lighting -->
    <radialGradient id="rimGlow" cx="58%" cy="54%" r="45%">
      <stop offset="0%" stop-color="#ffa812" stop-opacity="0.4" />
      <stop offset="50%" stop-color="#d97706" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#12353a" stop-opacity="0" />
    </radialGradient>

    <!-- Drop Shadow Filter for 3D Float -->
    <filter id="boltShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="24" dy="32" stdDeviation="28" flood-color="#07191c" flood-opacity="0.75" />
      <feDropShadow dx="8" dy="12" stdDeviation="12" flood-color="#0a2327" flood-opacity="0.5" />
    </filter>

    <!-- Soft Inner Shadow for Bevel -->
    <filter id="bevelHighlight" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="-4" dy="-6" stdDeviation="6" flood-color="#ffffff" flood-opacity="0.5" />
    </filter>
  </defs>

  ${
    !isForegroundOnly
      ? `
  <!-- Canvas Base -->
  <rect width="1024" height="1024" rx="${isCircle ? '512' : '220'}" fill="url(#bgGrad)" />
  <rect width="1024" height="1024" rx="${isCircle ? '512' : '220'}" fill="url(#centerGlow)" />
  <!-- Ambient Warm Rim Glow behind bolt -->
  <ellipse cx="530" cy="520" rx="340" ry="380" fill="url(#rimGlow)" />
  `
      : ''
  }

  <g transform="translate(18, 8)">
    <!-- 3D Extrusion / Side bevel geometry for depth -->
    <path d="M 642 54 
             C 644 60, 638 80, 630 96 
             L 374 466 
             C 368 474, 370 484, 380 488 
             L 538 522 
             L 384 964 
             C 380 976, 396 980, 404 968 
             L 734 462 
             C 740 452, 734 440, 722 440 
             L 576 440 
             L 646 64 
             Z"
          fill="url(#extrusionGrad)"
          filter="url(#boltShadow)" />

    <!-- Main Front 3D Yellow Lightning Bolt Body with rounded vertex caps -->
    <!-- Bolt coordinates scaled and tuned to match reference proportions -->
    <path d="M 632 68 
             C 638 60, 648 68, 644 80
             L 396 462 
             C 390 472, 398 484, 410 484 
             L 556 484 
             C 568 484, 574 498, 566 508 
             L 386 942 
             C 380 954, 394 964, 402 952 
             L 718 472 
             C 724 462, 716 450, 704 450 
             L 560 450 
             C 548 450, 542 436, 550 426 
             L 632 68 
             Z"
          fill="url(#boltGrad)" />

    <!-- Top Gloss Specular Highlight on Upper Lightning Fin -->
    <path d="M 632 68 
             L 550 426 
             C 544 434, 548 446, 558 448 
             L 590 448 
             L 640 82 
             Z" 
          fill="url(#specularGrad)" />

    <!-- Crisp Soft Bevel Accent Line along the spine -->
    <path d="M 628 84 
             L 410 470 
             L 552 470 
             L 396 930 
             L 704 464 
             L 566 464 
             Z" 
          stroke="#fff6a3" 
          stroke-width="6" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          fill="none" 
          opacity="0.4" />
  </g>
</svg>`;
}

// Splash Screen Template (centered icon with deep branded background)
function getSplashSvg(width: number, height: number): string {
  const iconSize = Math.min(width, height) * 0.44;
  const iconX = (width - iconSize) / 2;
  const iconY = (height - iconSize) / 2 - 20;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="splashBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f555d" />
      <stop offset="40%" stop-color="#153e44" />
      <stop offset="100%" stop-color="#0d282c" />
    </linearGradient>

    <radialGradient id="splashGlow" cx="50%" cy="48%" r="60%">
      <stop offset="0%" stop-color="#2d6e77" stop-opacity="0.8" />
      <stop offset="60%" stop-color="#153e44" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#091c1f" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="boltGrad" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#ffeb60" />
      <stop offset="35%" stop-color="#fed136" />
      <stop offset="85%" stop-color="#f5b81a" />
      <stop offset="100%" stop-color="#e29b0a" />
    </linearGradient>

    <linearGradient id="extrusionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d98904" />
      <stop offset="50%" stop-color="#b86f00" />
      <stop offset="100%" stop-color="#804a00" />
    </linearGradient>

    <filter id="splashShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="28" dy="36" stdDeviation="32" flood-color="#041012" flood-opacity="0.85" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#splashBg)" />
  <rect width="${width}" height="${height}" fill="url(#splashGlow)" />

  <!-- Centered Floating Logo -->
  <g transform="translate(${iconX}, ${iconY}) scale(${iconSize / 1024})">
    <!-- Icon Container Card -->
    <rect width="1024" height="1024" rx="220" fill="#1b4b52" filter="url(#splashShadow)" />
    <rect width="1024" height="1024" rx="220" fill="url(#splashGlow)" opacity="0.7" />

    <!-- Ambient Warm Glow -->
    <ellipse cx="530" cy="520" rx="340" ry="380" fill="#d97706" opacity="0.25" />

    <g transform="translate(18, 8)">
      <!-- Extrusion / Shadow -->
      <path d="M 642 54 L 374 466 C 368 474, 370 484, 380 488 L 538 522 L 384 964 C 380 976, 396 980, 404 968 L 734 462 C 740 452, 734 440, 722 440 L 576 440 L 646 64 Z"
            fill="url(#extrusionGrad)" />

      <!-- Main Bolt -->
      <path d="M 632 68 C 638 60, 648 68, 644 80 L 396 462 C 390 472, 398 484, 410 484 L 556 484 C 568 484, 574 498, 566 508 L 386 942 C 380 954, 394 964, 402 952 L 718 472 C 724 462, 716 450, 704 450 L 560 450 C 548 450, 542 436, 550 426 L 632 68 Z"
            fill="url(#boltGrad)" />

      <!-- Highlight -->
      <path d="M 628 84 L 410 470 L 552 470 L 396 930 L 704 464 L 566 464 Z" 
            stroke="#fff6a3" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.4" />
    </g>
  </g>

  <!-- Branded Typography at bottom -->
  <text x="${width / 2}" y="${iconY + iconSize + Math.max(36, height * 0.05)}" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${Math.max(22, Math.min(width, height) * 0.045)}" 
        font-weight="900" 
        letter-spacing="4" 
        fill="#ffffff" 
        text-anchor="middle">BUILDNOW</text>

  <text x="${width / 2}" y="${iconY + iconSize + Math.max(36, height * 0.05) + 24}" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${Math.max(11, Math.min(width, height) * 0.02)}" 
        font-weight="700" 
        letter-spacing="1" 
        fill="#94a3b8" 
        text-anchor="middle">KOLKATA EXPRESS DELIVERY</text>
</svg>`;
}

export { getIconSvg, getSplashSvg };
