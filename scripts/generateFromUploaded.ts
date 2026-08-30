import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SRC_IMAGE = path.resolve('./public/buildnow.png');

if (!fs.existsSync(SRC_IMAGE)) {
  console.error('Source image public/buildnow.png does not exist!');
  process.exit(1);
}

function runCmd(cmd: string) {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e: any) {
    console.error(`Error running command "${cmd}":`, e.message);
  }
}

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 1. Standard square/rounded resize
function generateStandardIcon(outPath: string, size: number) {
  ensureDir(outPath);
  runCmd(`convert "${SRC_IMAGE}" -resize ${size}x${size} -quality 95 "${outPath}"`);
  console.log(`✓ Generated Icon: ${outPath} (${size}x${size})`);
}

// 2. Circular icon for Android ic_launcher_round
function generateRoundIcon(outPath: string, size: number) {
  ensureDir(outPath);
  // Create circular mask on resized image
  runCmd(
    `convert "${SRC_IMAGE}" -resize ${size}x${size} \\( +clone -alpha extract -draw "fill black polygon 0,0 0,${size} ${size},${size} ${size},0 fill white circle ${size / 2},${size / 2} ${size / 2},0" \\) -alpha off -compose CopyOpacity -composite -quality 95 "${outPath}"`
  );
  console.log(`✓ Generated Round Icon: ${outPath} (${size}x${size})`);
}

// 3. Foreground icon for Adaptive Icons (centered with padding on transparent canvas)
function generateForegroundIcon(outPath: string, size: number) {
  ensureDir(outPath);
  const innerSize = Math.round(size * 0.72);
  runCmd(
    `convert -size ${size}x${size} xc:none \\( "${SRC_IMAGE}" -resize ${innerSize}x${innerSize} \\) -gravity center -composite -quality 95 "${outPath}"`
  );
  console.log(`✓ Generated Foreground Icon: ${outPath} (${size}x${size})`);
}

// 4. Splash Screen (Centered icon with background color picked from source image or styled)
function generateSplashScreen(outPath: string, width: number, height: number) {
  ensureDir(outPath);
  const iconSize = Math.round(Math.min(width, height) * 0.42);
  // Background deep dark teal: #163e44 to match your image
  runCmd(
    `convert -size ${width}x${height} xc:"#153d43" \\( "${SRC_IMAGE}" -resize ${iconSize}x${iconSize} \\) -gravity center -composite -quality 95 "${outPath}"`
  );
  console.log(`✓ Generated Splash Screen: ${outPath} (${width}x${height})`);
}

async function run() {
  console.log('Generating all APK and Web assets from uploaded public/buildnow.png...');

  // Web & PWA
  generateStandardIcon('./public/favicon.png', 64);
  generateStandardIcon('./public/favicon.ico', 32);
  generateStandardIcon('./public/icons/icon-192.png', 192);
  generateStandardIcon('./public/icons/icon-512.png', 512);
  generateStandardIcon('./public/icons/icon-192-maskable.png', 192);
  generateStandardIcon('./public/icons/icon-512-maskable.png', 512);

  // Android mipmap icons
  const androidIcons = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
  ];

  for (const { dir, size, fgSize } of androidIcons) {
    const basePath = `./android/app/src/main/res/${dir}`;
    generateStandardIcon(`${basePath}/ic_launcher.png`, size);
    generateRoundIcon(`${basePath}/ic_launcher_round.png`, size);
    generateForegroundIcon(`${basePath}/ic_launcher_foreground.png`, fgSize);
  }

  // Android Splash screens
  const androidSplashes = [
    { path: 'drawable/splash.png', w: 480, h: 320 },
    { path: 'drawable-land-mdpi/splash.png', w: 480, h: 320 },
    { path: 'drawable-port-mdpi/splash.png', w: 320, h: 480 },
    { path: 'drawable-land-hdpi/splash.png', w: 800, h: 480 },
    { path: 'drawable-port-hdpi/splash.png', w: 480, h: 800 },
    { path: 'drawable-land-xhdpi/splash.png', w: 1280, h: 720 },
    { path: 'drawable-port-xhdpi/splash.png', w: 720, h: 1280 },
    { path: 'drawable-land-xxhdpi/splash.png', w: 1600, h: 960 },
    { path: 'drawable-port-xxhdpi/splash.png', w: 960, h: 1600 },
    { path: 'drawable-land-xxxhdpi/splash.png', w: 1920, h: 1280 },
    { path: 'drawable-port-xxxhdpi/splash.png', w: 1280, h: 1920 },
  ];

  for (const { path: splashSubPath, w, h } of androidSplashes) {
    generateSplashScreen(`./android/app/src/main/res/${splashSubPath}`, w, h);
  }

  // iOS App Icon & Splash Screens
  generateStandardIcon('./ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', 1024);

  const iosSplashes = [
    './ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png',
    './ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png',
    './ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png',
  ];

  for (const iosSplash of iosSplashes) {
    generateSplashScreen(iosSplash, 2732, 2732);
  }

  console.log('✅ ALL APK launcher icons and splash screens successfully updated from public/buildnow.png!');
}

run();
