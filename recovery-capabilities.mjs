/** @typedef {{id: string, label: string, compact: string, description: string, outline: string, accent: string, name?: string}} Capability */

/** @type {Capability[]} */
const definitions = [
  { id: 'car-towing', label: 'Towing', compact: 'Tow', description: 'Vehicle towing across Dubai.',
    outline: 'M3 28h4m9 0h10l2-4h7l2 4h6v-7l-3-5h-7v8M3 28V18l4-7h11l5 7v10M3 18h20M8 25a3 3 0 1 0 6 0m15 3a3 3 0 1 0 6 0M36 19h5',
    accent: 'M23 24h5l3-4' },
  { id: 'motorcycle-towing', label: 'Motorcycle', compact: 'Moto', description: 'Transport enquiries for motorcycles.',
    outline: 'M5 25a6 6 0 1 0 12 0 6 6 0 1 0-12 0Zm22 0a6 6 0 1 0 12 0 6 6 0 1 0-12 0ZM11 25l7-9h9l6 9H21l-6-7m14-7h-4l2 5m-16 0h6',
    accent: 'M3 34h38m-6-3 6 3-6 3' },
  { id: 'desert-recovery', name: 'Desert & Off-Road Recovery', label: 'Off-road', compact: 'Trail', description: 'Recovery for difficult terrain.',
    outline: 'M7 24v-7l4-1 4-6h14l5 6 5 2v6h-5m-7 0h-9m-7 0H7m4-8h23m-14-6v6m-9 8a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0Zm16 0a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0Z',
    accent: 'M2 34c7-5 12-5 19-1s13-4 21-3' },
  { id: 'roadside-assistance', label: 'Roadside', compact: 'Help', description: 'Help when you’re stranded.',
    outline: 'm23 19-6-7H9l-3 6-2 2v9h25v-8l-6-2H6m2 11v3m17-3v3M9 24h4m8 0h4m12 1v8m-3 0h6',
    accent: 'M34 21a4 4 0 0 1 6 0m-9-4a8 8 0 0 1 12 0m-14-4a12 12 0 0 1 15 0' },
  { id: 'accident-recovery', label: 'Accident', compact: 'Crash', description: 'Recovery enquiries after an accident.',
    outline: 'M3 27v-6l5-7h12l4 7v7H3m4-7h14m-14 8v3m13-3v3m-12-7h2m8 0h2M26 30l8-16 8 16H26m8-10v4m0 3v.5',
    accent: 'M30 10l-2-3m6 2V5m4 5 2-3' },
  { id: 'emergency-recovery', label: 'Breakdown', compact: 'Fault', description: 'Support when a vehicle can’t continue.',
    outline: 'M5 27h8l5-8h8l4 4h8v7H5v-3Zm4 3v3m24-3v3m-14-14-3-6m-7 0 7-3h7m-13 15h3m20 0h3',
    accent: 'M30 9h5l4 4v4l-4 4h-4m3-9v4m0 2v.2' },
  { id: 'luxury-car-transport', name: 'Luxury & Sports Car Recovery', label: 'Luxury', compact: 'Sport', description: 'Transport for specialist vehicles.',
    outline: 'M3 25v4h6m7 0h14m7 0h4v-6l-10-3-6-6H14l-5 7-6 4Zm6 4a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0Zm21 0a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0ZM12 20h19M19 14v6',
    accent: 'M4 24l11-2h16l9 2' },
  { id: 'flatbed-towing', label: 'Flatbed', compact: 'Deck', description: 'Platform-based vehicle transport.',
    outline: 'M3 27h25v-9h7l5 6v5h-3m-8 0h-8m-8 0H3m24-4V12m7 10h3M13 29a4 4 0 1 0 8 0m8 0a4 4 0 1 0 8 0M6 23v-3l5-2 3-5h7l3 6v4m-12-5h10',
    accent: 'M3 24h24' },
];

export function recoveryCapabilities(services) {
  return definitions.map(({ id, name, ...detail }) => {
    const service = services.find(([slug]) => slug === id);
    if (!service) throw new Error(`Missing recovery service ${id}`);
    return { id, name: name ?? service[1].replace(/\b\w/g, character => character.toUpperCase()), ...detail };
  });
}

const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

function pictogram({ outline, accent }) {
  return `<svg class="cap-icon" viewBox="0 0 44 40" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${outline}"/><path class="cap-accent" pathLength="1" d="${accent}"/></svg>`;
}

export function capabilityDisplay(capabilities, tag) {
  return `<div class="cap-display">
    <div class="cap-reflection" aria-hidden="true"></div>
    <div class="cap-header">
      ${tag}
      <div class="cap-count" aria-label="${capabilities.length} recovery services"><span aria-hidden="true">${String(capabilities.length).padStart(2, '0')}</span></div>
    </div>
    <div class="cap-body">
      <div class="cap-selector" role="radiogroup" aria-label="Recovery services">
        ${capabilities.map((service, index) => `<label class="cap-item"><input type="radio" name="recovery-capability" value="${service.id}" aria-label="${escape(service.name)}" aria-describedby="cap-description-${service.id}"${index === 0 ? ' checked' : ''}><span class="cap-key" aria-hidden="true">${pictogram(service)}<span class="cap-label">${escape(service.label)}</span><span class="cap-label-short">${escape(service.compact)}</span></span></label>`).join('')}
      </div>
      <div class="cap-preview-stage">
        ${capabilities.map(service => `<div class="cap-preview" data-capability="${service.id}"><div class="cap-art">${pictogram(service)}</div><div class="cap-preview-copy"><strong>${escape(service.name)}</strong><span id="cap-description-${service.id}">${escape(service.description)}</span></div></div>`).join('')}
      </div>
    </div>
  </div>`;
}
