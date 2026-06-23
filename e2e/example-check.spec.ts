import { test } from '@playwright/test';

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

const allErrors: { id: string; error: string }[] = [];
const nonWebGLErrors: { id: string; error: string }[] = [];

for (const id of EXAMPLES) {
  test(`check example: ${id}`, async ({ page }) => {
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        pageErrors.push(text);
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    console.log(`Testing: ${id}`);
    await page.goto(`http://localhost:5173/examples/${id}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(5000);

    for (const err of pageErrors) {
      allErrors.push({ id, error: err });
      if (!err.includes('WebGL') && !err.includes('webgl')) {
        nonWebGLErrors.push({ id, error: err });
        console.log(`  REAL ERROR: ${err.substring(0, 200)}`);
      }
    }

    if (pageErrors.length === 0) {
      console.log(`  OK`);
    }
  });
}

test.afterAll(async () => {
  console.log(`\n=== TOTAL ERRORS: ${allErrors.length} (${nonWebGLErrors.length} non-WebGL) ===`);
  if (nonWebGLErrors.length > 0) {
    console.log('\n=== NON-WEBGL ERRORS ===');
    nonWebGLErrors.forEach((e) => console.log(`${e.id}: ${e.error.substring(0, 300)}`));
  }
});
