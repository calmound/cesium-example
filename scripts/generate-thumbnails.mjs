import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const THUMBNAILS_DIR = path.join(ROOT, 'public', 'thumbnails');

const ALL_EXAMPLES = [
  'viewer-init', 'camera-control', 'coordinate-system', 'mouse-events', 'scene-mode',
  'xyz-tiles', 'wms-service', 'wmts-service', 'tianditu-layer', 'imagery-4490', 'dynamic-imagery',
  'pixel-point', 'billboard-icon', 'label-text', 'div-marker', 'panorama-point', 'cluster-points', 'draggable-point',
  'polyline-basic', 'curved-line', 'pipe-line', 'migration-effect', 'flight-path', 'roaming-route', 'road-network',
  'polygon-face', 'rectangle-circle', 'wall-geometry', 'box-3d', 'sphere-3d',
  'geojson-loader', 'kml-loader', 'czml-animation', 'wfs-query', 'route-planning', 'primitive-vector',
  'terrain-basic', 'terrain-excavation', 'terrain-flattening', 'contour-line', 'slope-analysis', 'flood-analysis', 'underground-mode',
  'tiles-basic', 'tiles-offset', 'tiles-style', 'tiles-custom-shader', 'tiles-flattening',
  'distance-measure', 'viewshed-analysis', 'sunshine-analysis', 'buffer-analysis', 'volume-calculation',
  'video-material', 'video-2d-projection', 'video-3d-projection', 'video-editor',
  'rain-effect', 'snow-effect', 'fog-effect', 'skybox-scene', 'particle-effects', 'point-light', 'volume-cloud',
  'radar-scan', 'diffusion-point', 'water-ripple', 'flowing-line', 'building-flicker', 'custom-shader-intro',
  'heatmap-3d', 'wind-field', 'hexagon-heatmap', 'isocontour', 'ocean-current',
  'smart-park', 'smart-traffic', 'typhoon-track', 'city-roaming', 'cesium-three-integration', 'drone-aerial', 'massive-drone-primitive',
];

function getExamplesNeedingThumbnail() {
  return ALL_EXAMPLES.filter(id => {
    const filePath = path.join(THUMBNAILS_DIR, `${id}.png`);
    return !fs.existsSync(filePath);
  });
}

async function generateThumbnail(page, id) {
  const outputPath = path.join(THUMBNAILS_DIR, `${id}.png`);
  const url = `http://localhost:5173/examples/${id}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(4000);

    const iframe = page.frameLocator('iframe[title="Cesium Preview"]');
    const cesium = iframe.locator('#cesiumContainer');
    const box = await cesium.boundingBox();

    if (!box || box.width === 0 || box.height === 0) {
      return { success: false, reason: 'no cesium container' };
    }

    await page.screenshot({
      type: 'png',
      path: outputPath,
      clip: { x: box.x, y: box.y, width: box.width, height: box.height }
    });

    const stats = fs.statSync(outputPath);
    if (stats.size < 5000) {
      fs.unlinkSync(outputPath);
      return { success: false, reason: 'too small' };
    }

    return { success: true, size: stats.size, width: box.width, height: box.height };
  } catch (e) {
    return { success: false, reason: e.message.substring(0, 50) };
  }
}

async function main() {
  if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
  }

  const examples = getExamplesNeedingThumbnail();

  if (examples.length === 0) {
    console.log('All thumbnails already exist!');
    return;
  }

  console.log(`Found ${examples.length} thumbnails needing generation\n`);
  console.log(`Output directory: ${THUMBNAILS_DIR}\n`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  let success = 0;
  let failed = 0;
  const failedList = [];

  for (let i = 0; i < examples.length; i++) {
    const id = examples[i];
    process.stdout.write(`[${i + 1}/${examples.length}] ${id}... `);

    const result = await generateThumbnail(page, id);

    if (result.success) {
      console.log(`✓ (${Math.round(result.size / 1024)}KB, ${result.width}x${result.height})`);
      success++;
    } else {
      console.log(`✗ (${result.reason})`);
      failed++;
      failedList.push(id);
    }
  }

  await browser.close();

  console.log(`\n=== Summary ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  if (failedList.length > 0) {
    console.log(`Failed: ${failedList.join(', ')}`);
  }
}

main().catch(console.error);
