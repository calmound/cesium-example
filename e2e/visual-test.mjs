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
  'video-material', 'video-2d-projection', 'video-3d-projection', 'video-editor',
  'rain-effect', 'snow-effect', 'fog-effect', 'skybox-scene', 'particle-effects', 'point-light', 'volume-cloud',
  'radar-scan', 'diffusion-point', 'water-ripple', 'flowing-line', 'building-flicker', 'custom-shader-intro',
  'heatmap-3d', 'wind-field', 'hexagon-heatmap', 'isocontour', 'ocean-current',
  'smart-park', 'smart-traffic', 'typhoon-track', 'city-roaming', 'cesium-three-integration', 'drone-aerial', 'massive-drone-primitive',
];

const errors = [];
const screenshots = [];

async function main() {
  console.log('Launching Chromium browser...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.toLowerCase().includes('webgl') && !text.toLowerCase().includes('net::err')) {
        errors.push({ id: currentId, error: text });
        console.log(`  JS ERROR: ${text.substring(0, 100)}`);
      }
    }
  });

  page.on('pageerror', (err) => {
    if (!err.message.toLowerCase().includes('webgl')) {
      errors.push({ id: currentId, error: err.message });
      console.log(`  PAGE ERROR: ${err.message.substring(0, 100)}`);
    }
  });

  let currentId = '';

  for (const id of EXAMPLES) {
    currentId = id;
    console.log(`\n[${EXAMPLES.indexOf(id) + 1}/${EXAMPLES.length}] Testing: ${id}`);

    try {
      await page.goto(`http://localhost:5173/examples/${id}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      await page.waitForTimeout(2000);

      const screenshotPath = `/tmp/example-${id}.png`;
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      screenshots.push({ id, path: screenshotPath });
      console.log(`  Screenshot: ${screenshotPath}`);

    } catch (e) {
      console.log(`  FAILED: ${e.message}`);
    }
  }

  await browser.close();

  console.log('\n=== SUMMARY ===');
  console.log(`Total examples tested: ${EXAMPLES.length}`);
  console.log(`Screenshots captured: ${screenshots.length}`);
  console.log(`Non-WebGL errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n=== ERRORS ===');
    errors.forEach((e) => console.log(`${e.id}: ${e.error.substring(0, 200)}`));
  }

  console.log('\n=== SCREENSHOTS ===');
  screenshots.forEach((s) => console.log(`${s.id}: ${s.path}`));
}

let currentId = '';
main().catch(console.error);
