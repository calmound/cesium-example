import { chromium } from '@playwright/test';

const EXAMPLES = [
  'viewer-init', 'camera-control', 'coordinate-system', 'mouse-events', 'scene-mode',
  'xyz-tiles', 'wms-service', 'wmts-service', 'tianditu-layer', 'imagery-4490', 'dynamic-imagery',
  'pixel-point', 'billboard-icon', 'label-text', 'div-marker', 'panorama-point', 'cluster-points', 'draggable-point',
  'polyline-basic', 'curved-line', 'pipe-line', 'migration-effect', 'flight-path', 'roaming-route', 'road-network',
  'polygon-face', 'rectangle-circle', 'wall-geometry', 'box-3d', 'sphere-3d',
  'geojson-loader', 'kml-loader', 'czml-animation', 'wfs-query', 'route-planning', 'primitive-vector',
  'terrain-basic', 'terrain-excavation', 'terrain-flattening', 'contour-line', 'slope-analysis', 'flood-analysis', 'underground-mode',
  'tiles-basic', 'tiles-offset', 'tiles-style', 'tiles-custom-shader', 'tiles-flattening',
  'distance-measure', 'viewshed-analysis', 'sunshine-analysis', 'buffer-analysis', 'volume-calculation',
  'water-surface', 'flood-simulation', 'dynamic-river', 'water-gate',
  'video-material', 'video-2d-projection', 'video-3d-projection', 'video-editor',
  'weather-effects', 'skybox-scene', 'particle-effects', 'point-light', 'volume-cloud',
  'radar-scan', 'diffusion-point', 'water-ripple', 'flowing-line', 'building-flicker', 'custom-shader-intro',
  'heatmap-3d', 'wind-field', 'hexagon-heatmap', 'isocontour', 'ocean-current',
  'radar-coverage', 'satellite-track', 'uav-track', 'cone-sensor',
  'smart-park', 'smart-traffic', 'typhoon-track', 'city-roaming', 'cesium-three-integration',
];

const allErrors = [];
const nonWebGLErrors = [];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      allErrors.push({ id: currentId, error: text });
      if (!text.toLowerCase().includes('webgl')) {
        nonWebGLErrors.push({ id: currentId, error: text });
      }
    }
  });

  page.on('pageerror', (err) => {
    allErrors.push({ id: currentId, error: err.message });
    if (!err.message.toLowerCase().includes('webgl')) {
      nonWebGLErrors.push({ id: currentId, error: err.message });
    }
  });

  let currentId = '';

  for (const id of EXAMPLES) {
    currentId = id;
    console.log(`Testing: ${id}`);
    try {
      await page.goto(`http://localhost:5173/examples/${id}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log(`  FAILED: ${e.message}`);
    }
  }

  await browser.close();

  console.log(`\n=== TOTAL ERRORS: ${allErrors.length} ===`);
  console.log(`=== NON-WEBGL ERRORS: ${nonWebGLErrors.length} ===`);

  if (nonWebGLErrors.length > 0) {
    console.log('\n=== NON-WEBGL ERRORS DETAIL ===');
    for (const e of nonWebGLErrors) {
      console.log(`\n${e.id}:`);
      console.log(`  ${e.error.substring(0, 500)}`);
    }
  }
}

main().catch(console.error);
