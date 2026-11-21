import { useId, type CSSProperties } from "react";
import { ArrowUpRight, MapPin, MessageCircle, Phone, ShieldCheck, Truck } from "lucide-react";

const journeys = [
  { id: "marina", color: "#b84216", pickup: "Dubai Marina", destination: "Downtown Dubai", start: [410, 700], finish: [880, 445], path: "M410 700 Q435 677 460 637 L520 590 Q550 560 565 523 L620 454 L680 397 Q709 375 735 366 Q767 374 790 400 L835 429 L880 445" },
  { id: "barsha", color: "#1263b7", pickup: "Al Barsha", destination: "Dubai Creek Harbour", start: [650, 735], finish: [1235, 410], path: "M650 735 L710 687 Q747 661 780 644 L930 625 L1060 584 L1160 554 L1280 534 Q1303 510 1285 482 L1260 447 L1235 410" },
];

function RouteScene() {
  const prefix = useId();
  return (
    <figure className="route-scene">
      <figcaption className="scene-caption">
        <span><MapPin size={15} /> Dubai, UAE</span>
        <span>Illustrative routes</span>
      </figcaption>
      <svg className="scene-map" viewBox="0 0 1448 1086" role="img" aria-label="Illustrative recovery journeys from Dubai Marina to Downtown Dubai and Al Barsha to Dubai Creek Harbour, with two recovery trucks.">
        <defs>
          <clipPath id={prefix + "-vehicle"} clipPathUnits="userSpaceOnUse">
            <path d="M40 251L50 226 56 184 88 172 163 157 225 135 283 128 385 129 447 142 503 178 525 193 590 202 592 184 614 174 657 163 705 162 735 176 757 203 773 228 791 235 796 246 813 260 824 278 831 301 829 321 817 337 805 359 786 368 769 361 759 344 727 351 681 354 524 381 506 408 486 420 458 422 429 411 414 388 376 394 221 408 166 427 143 412 134 390 123 385 130 370 143 366 142 309 118 305 82 298 48 290 40 276Z" />
          </clipPath>
        </defs>
        <image href="/assets/dubai-recovery-map.png" width="1448" height="1086" />
        {journeys.map((journey, index) => (
          <g key={journey.id} className="map-journey" data-journey={journey.id} data-delivered="false" style={{ "--route-color": journey.color } as CSSProperties}>
            <path d={journey.path} className="route-bed" />
            <path d={journey.path} className="route-trace" pathLength="1" strokeDasharray="1 1" strokeDashoffset="1" />
            <circle cx={journey.start[0]} cy={journey.start[1]} r="13" className="map-pin-ring" />
            <circle cx={journey.start[0]} cy={journey.start[1]} r="5" className="map-pin-core" />
            <circle cx={journey.finish[0]} cy={journey.finish[1]} r="15" className="map-pin-ring map-pin-drop" />
            <circle cx={journey.finish[0]} cy={journey.finish[1]} r="6" className="map-pin-core" />
            <circle cx={journey.finish[0]} cy={journey.finish[1]} r="15" className="map-pin-pulse" fill="none" stroke="#2e784a" />
            <g className="route-truck" transform={`translate(${journey.start[0]} ${journey.start[1]})`}>
              {index === 0 ? <svg x="-125" y="-103" width="250" height="141" viewBox="0 0 900 506" className="map-vehicle">
                <image href="/flatbed.webp" width="900" height="506" clipPath={"url(#" + prefix + "-vehicle)"} />
                <g className="route-wheel" data-center="463 376"><Wheel x={463} y={376} radius={23} /></g>
                <g className="route-wheel" data-center="790 335"><Wheel x={790} y={335} radius={15} /></g>
              </svg> : <svg x="-116" y="-86" width="232" height="104" viewBox="0 0 232 104" className="map-vehicle" aria-hidden="true">
                <ellipse cx="112" cy="91" rx="110" ry="10" fill="#263c4b" opacity=".25" />
                <path d="M8 62H164V42H199L224 63V84H8Z" fill="#1263b7" stroke="#18394e" strokeWidth="3" />
                <path d="M171 48H197L213 63H171Z" fill="#b9e7f4" stroke="#18394e" strokeWidth="2" />
                <path d="M12 58H159V65H12Z" fill="#c6d3db" stroke="#273f50" strokeWidth="2" />
                <path d="M28 43L43 22H101L126 40L143 44V56H22V46Z" fill="#f7fafc" stroke="#445b69" strokeWidth="3" />
                <path d="M49 26H70V40H37ZM76 26H99L117 40H76Z" fill="#466c83" />
                <circle cx="43" cy="55" r="10" fill="#1d2830" /><circle cx="120" cy="55" r="10" fill="#1d2830" />
                <path d="M166 70H195M216 68H225" stroke="#f8d44a" strokeWidth="5" />
                {[43, 145, 202].map(x => <g key={x}><circle cx={x} cy="83" r="14" fill="#1d2830" /><circle cx={x} cy="83" r="7" fill="#b9cbd6" /><g className="route-wheel" data-center={`${x} 83`}><Wheel x={x} y={83} radius={7} /></g></g>)}
              </svg>}
            </g>
            <g className="map-stop-label" transform={`translate(${journey.start[0] + (index === 1 ? 30 : -155)} ${journey.start[1] + 24})`}>
              <rect width="310" height="73" rx="12" />
              <text x="14" y="29">Pickup {index + 1}</text><text x="14" y="57" className="map-stop-place">{journey.pickup}</text>
            </g>
            <g className="map-stop-label route-label-drop" transform={`translate(${journey.finish[0] - 135} ${journey.finish[1] - 100})`}>
              <rect width="310" height="73" rx="12" />
              <text x="14" y="29" className="route-drop-text">Drop-off {index + 1}</text><text x="14" y="29" className="route-delivered-text">Delivered {index + 1}</text>
              <text x="14" y="57" className="map-stop-place">{journey.destination}</text>
            </g>
          </g>
        ))}
      </svg>
      <div className="scene-footer"><span><a href="https://commons.wikimedia.org/wiki/File:Transport_autoturism_electric_pe_platforma_auto_de_tip_%22flatbed%22.jpg">Truck photo by Traiantkd</a>{" · Cutout · "}<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></span></div>
    </figure>
  );
}

function Wheel({ x, y, radius }: { x: number; y: number; radius: number }) {
  return <g opacity=".55" fill="none" stroke="#d4d1c9" strokeWidth="3.5">
    <circle cx={x} cy={y} r={radius} strokeOpacity=".65" />
    <path d={"M" + (x - radius) + " " + y + "H" + (x + radius) + " M" + x + " " + (y - radius) + "V" + (y + radius)} />
  </g>;
}

export function RecoveryHero({ bookingHref, callHref, whatsappHref }: { bookingHref: string; callHref: string; whatsappHref: string }) {
  return (
    <section className="recovery-hero" data-playing="false" aria-labelledby="recovery-title">
      <div className="highway-background" aria-hidden="true"><canvas width="1" height="1" /></div>
      <div className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow"><span className="hero-icon"><MapPin size={15} /></span> Dubai, United Arab Emirates</p>
          <h1 id="recovery-title"><span><b className="hero-chrome">Car towing &amp;</b></span><em><strong>recovery in Dubai.</strong></em></h1>
          <p className="hero-description">Stuck after a breakdown or need to move a vehicle? Share your pickup point and destination to arrange recovery across Dubai.</p>
          <div className="hero-actions" data-contact-count={Number(Boolean(callHref)) + Number(Boolean(whatsappHref)) + 1}>
            {callHref && <a className="contact-cta contact-cta--call hero-call" href={callHref}><span className="hero-call-number">{callHref.replace(/^tel:/, "")}</span><span className="hero-call-label"><Phone size={18} aria-hidden="true" /> Call now</span></a>}
            {whatsappHref && <a className="contact-cta contact-cta--whatsapp" href={whatsappHref}><MessageCircle size={18} aria-hidden="true" /> WhatsApp</a>}
            {!callHref && !whatsappHref && <a className="contact-cta contact-cta--call" href={bookingHref}>Request recovery <ArrowUpRight size={18} aria-hidden="true" /></a>}
            <a className="contact-cta contact-cta--location" href={bookingHref} data-use-pickup-location aria-label="Use my current location"><MapPin size={18} aria-hidden="true" /><span className="hero-location-full">Use my current location</span><span className="hero-location-short">My location</span></a>
          </div>
          <ul className="hero-trust">
            <li><span className="hero-icon"><Truck size={17} /></span> Breakdown recovery &amp; flatbed towing</li>
            <li><span className="hero-icon"><ShieldCheck size={17} /></span> Luxury vehicle transport</li>
          </ul>
        </div>
        <RouteScene />
      </div>
    </section>
  );
}
