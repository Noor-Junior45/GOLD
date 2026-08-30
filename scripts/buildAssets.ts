import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';
import { getIconSvg, getSplashSvg } from './generateAssets';

function renderSvgToPng(svgContent: string, outputPath: string, width: number, height: number) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    const resvg = new Resvg(svgContent, {
      fitTo: {
        mode: 'width',
        value: width,
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    fs.writeFileSync(outputPath, pngBuffer);
    console.log(`✓ Rendered ${outputPath} (${width}x${height})`);
  } catch (err: any) {
    console.error(`Failed rendering ${outputPath}:`, err.message);
  }
}

async function run() {
  console.log('Generating BuildNow Logo & Splash Assets...');

  // 1. Master Web Assets
  renderSvgToPng(getIconSvg(1024, 1024), './public/buildnow.png', 1024, 1024);
  renderSvgToPng(getIconSvg(512, 512), './public/icons/icon-512.png', 512, 512);
  renderSvgToPng(getIconSvg(192, 192), './public/icons/icon-192.png', 192, 192);
  renderSvgToPng(getIconSvg(512, 512, false, false), './public/icons/icon-512-maskable.png', 512, 512);
  renderSvgToPng(getIconSvg(192, 192, false, false), './public/icons/icon-192-maskable.png', 192, 192);
  renderSvgToPng(getIconSvg(64, 64), './public/favicon.png', 64, 64);
  renderSvgToPng(getIconSvg(32, 32), './public/favicon.ico', 32, 32);

  // 2. Android App Launcher Icons (Standard, Round & Foreground)
  const androidIcons = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
  ];

  for (const { dir, size, fgSize } of androidIcons) {
    const basePath = `./android/app/src/main/res/${dir}`;
    renderSvgToPng(getIconSvg(size, size, false, false), `${basePath}/ic_launcher.png`, size, size);
    renderSvgToPng(getIconSvg(size, size, false, true), `${basePath}/ic_launcher_round.png`, size, size);
    renderSvgToPng(getIconSvg(fgSize, fgSize, true, false), `${basePath}/ic_launcher_foreground.png`, fgSize, fgSize);
  }

  // 3. Android Splash Screens (Replacing all splash.png)
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
    renderSvgToPng(getSplashSvg(w, h), `./android/app/src/main/res/${splashSubPath}`, w, h);
  }

  // 4. iOS Assets
  renderSvgToPng(
    getIconSvg(1024, 1024),
    './ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
    1024,
    1024
  );

  const iosSplashes = [
    './ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png',
    './ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png',
    './ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png',
  ];

  for (const iosSplash of iosSplashes) {
    renderSvgToPng(getSplashSvg(2732, 2732), iosSplash, 2732, 2732);
  }

  console.log('🎉 All Android, iOS, and Web launcher icons & splash screens successfully updated with buildnow.png!');
}

run();
