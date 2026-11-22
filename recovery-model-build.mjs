import { writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { buildRecoveryVehicle } from './recovery-vehicle-model.mjs';

// Build geometry on the server, keeping the modelling work off mobile CPUs.
export async function buildRecoveryModels() {
  const previous = globalThis.FileReader;
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.(); });
    }
  };
  try {
    for (const kind of ['gwagen', 'rolls', 'lamborghini', 'bugatti']) {
      const model = buildRecoveryVehicle(kind);
      const binary = await new GLTFExporter().parseAsync(model, { binary: true });
      await writeFile(`dist/assets/recovery-model-${kind}.glb.gz`, gzipSync(Buffer.from(binary), { level: 9 }));
      model.traverse(object => { if (object.isMesh) object.geometry.dispose(); });
    }
  } finally {
    if (previous === undefined) delete globalThis.FileReader;
    else globalThis.FileReader = previous;
  }
}
