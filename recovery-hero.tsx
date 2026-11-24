import { useId, type CSSProperties } from "react";
import { ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react";

const journeys = [
  { id: "expo-creek", color: "#b84216", pickup: "Expo Centre Dubai (outside)", destination: "Dubai Creek Harbour", start: [763, 963], finish: [1235, 410], pickupLabel: [820, 960], dropLabel: [1080, 445], labelWidth: 350, vehicle: null, path: "M763 963 L777 921 L790 887 Q794 862 780 844 L690 861 L570 877 Q539 882 520 865 L542 830 L585 789 L640 735 L690 686 Q722 651 776 638 L930 625 L1060 584 L1160 554 L1280 534 Q1303 510 1285 482 L1260 447 L1235 410" },
  { id: "jumeirah-barsha", color: "#1263b7", pickup: "Jumeirah", destination: "Al Barsha", start: [686, 340], finish: [590, 716], pickupLabel: [360, 280], dropLabel: [520, 745], labelWidth: 310, vehicle: "/assets/truck-blue-porsche.webp", path: "M686 340 L716 354 L748 366 Q742 384 721 404 L680 450 L620 510 L565 570 Q548 593 520 610 L485 641 Q474 653 468 670 L505 684 L550 704 L590 716" },
  { id: "jebel-ali-deira", color: "#654294", pickup: "Jebel Ali", destination: "Deira", start: [210, 895], finish: [1025, 110], pickupLabel: [40, 938], dropLabel: [750, 145], labelWidth: 310, vehicle: "/assets/truck-black-lamborghini.webp", path: "M210 895 L250 840 L300 780 L360 752 Q390 740 410 700 L460 637 L520 590 Q550 560 565 523 L620 454 L680 397 L735 366 L770 318 L806 252 L843 183 Q851 160 870 146 L895 126 Q907 115 915 100 L950 110 L985 115 L1025 110" },
  { id: "airport-e311", color: "#ba1839", pickup: "DXB airport (outside)", destination: "Sheikh Mohammed Rd (E311)", start: [1280, 325], finish: [1180, 780], pickupLabel: [1070, 170], dropLabel: [1060, 820], labelWidth: 370, vehicle: "/assets/truck-black-ferrari.webp", path: "M1280 325 L1320 340 L1375 360 Q1390 370 1400 379 L1388 430 L1370 480 L1354 540 L1330 608 L1303 684 Q1292 725 1268 750 L1220 772 L1180 780" },
];

function RouteScene() {
  const prefix = useId();
  return (
    <figure className="route-scene">

      <svg className="scene-map" viewBox="0 0 1448 1086" role="img" aria-label="Four illustrative road-aligned recovery journeys: the road outside Expo Centre Dubai at Expo City Dubai to Dubai Creek Harbour; Jumeirah to Al Barsha; Jebel Ali to Deira; and outside Dubai International Airport to Sheikh Mohammed bin Zayed Road, E311.">
        <defs>
          <clipPath id={prefix + "-vehicle"} clipPathUnits="userSpaceOnUse">
            <path d="M40 251L50 226 56 184 88 172 163 157 225 135 283 128 385 129 447 142 503 178 525 193 590 202 592 184 614 174 657 163 705 162 735 176 757 203 773 228 791 235 796 246 813 260 824 278 831 301 829 321 817 337 805 359 786 368 769 361 759 344 727 351 681 354 524 381 506 408 486 420 458 422 429 411 414 388 376 394 221 408 166 427 143 412 134 390 123 385 130 370 143 366 142 309 118 305 82 298 48 290 40 276Z" />
          </clipPath>
        </defs>
        <image href="/assets/dubai-recovery-map.webp" width="1448" height="1086" />
        {journeys.map(journey => <g key={journey.id} className="map-road" style={{ "--route-color": journey.color } as CSSProperties}>
          <path d={journey.path} className="route-bed" />
          <path d={journey.path} className="route-trace" data-route={journey.id} pathLength="1" strokeDasharray="1 1" strokeDashoffset="1" />
        </g>)}
        {journeys.map((journey, index) => (
          <g key={journey.id} className="map-journey" data-journey={journey.id} data-delivered="false" style={{ "--route-color": journey.color } as CSSProperties}>
            <line x1={journey.start[0]} y1={journey.start[1]} x2={Math.max(journey.pickupLabel[0] + 12, Math.min(journey.start[0], journey.pickupLabel[0] + journey.labelWidth - 12))} y2={journey.start[1] > journey.pickupLabel[1] + 73 ? journey.pickupLabel[1] + 73 : journey.pickupLabel[1]} stroke={journey.color} strokeWidth="2" strokeDasharray="5 5" />
            <line x1={journey.finish[0]} y1={journey.finish[1]} x2={Math.max(journey.dropLabel[0] + 12, Math.min(journey.finish[0], journey.dropLabel[0] + journey.labelWidth - 12))} y2={journey.finish[1] > journey.dropLabel[1] + 73 ? journey.dropLabel[1] + 73 : journey.dropLabel[1]} stroke={journey.color} strokeWidth="2" strokeDasharray="5 5" />
            <circle cx={journey.start[0]} cy={journey.start[1]} r="13" className="map-pin-ring" />
            <circle cx={journey.start[0]} cy={journey.start[1]} r="5" className="map-pin-core" />
            <circle cx={journey.finish[0]} cy={journey.finish[1]} r="15" className="map-pin-ring map-pin-drop" />
            <circle cx={journey.finish[0]} cy={journey.finish[1]} r="6" className="map-pin-core" />
            <circle cx={journey.finish[0]} cy={journey.finish[1]} r="15" className="map-pin-pulse" fill="none" stroke="#2e784a" />
            <g className="route-truck" transform={`translate(${journey.start[0]} ${journey.start[1]})`}>
              <g className="route-truck-body">
              {index === 0 ? <svg x="-125" y="-103" width="250" height="141" viewBox="0 0 900 506" className="map-vehicle">
                <image href="/flatbed.webp" width="900" height="506" clipPath={"url(#" + prefix + "-vehicle)"} />
                <g className="route-wheel" data-center="463 376"><Wheel x={463} y={376} radius={23} /></g>
                <g className="route-wheel" data-center="790 335"><Wheel x={790} y={335} radius={15} /></g>
              </svg> : <image href={journey.vehicle ?? ""} x="-125" y="-98" width="250" height="112" className="map-vehicle" />}
              </g>
            </g>
            <g className="map-stop-label" transform={`translate(${journey.pickupLabel[0]} ${journey.pickupLabel[1]})`}>
              <rect width={journey.labelWidth} height="73" rx="12" />
              <text x="14" y="29">Pickup {index + 1}</text><text x="14" y="57" className="map-stop-place" style={index === 0 ? { fontSize: 21 } : undefined}>{journey.pickup}</text>
            </g>
            <g className="map-stop-label route-label-drop" transform={`translate(${journey.dropLabel[0]} ${journey.dropLabel[1]})`}>
              <rect width={journey.labelWidth} height="73" rx="12" />
              <text x="14" y="29" className="route-drop-text">Drop-off {index + 1}</text><text x="14" y="29" className="route-delivered-text">Delivered {index + 1}</text>
              <text x="14" y="57" className="map-stop-place">{journey.destination}</text>
            </g>
          </g>
        ))}
      </svg>
      <figcaption className="route-photo-credit"><span><a href="https://commons.wikimedia.org/wiki/File:Transport_autoturism_electric_pe_platforma_auto_de_tip_%22flatbed%22.jpg">Truck photo by Traiantkd</a>{" · Cutout · "}<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></span></figcaption>
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
        <div className="hero-copy hero-ad">
          <div className="hero-ad-intro">
          <p className="eyebrow"><span className="hero-icon"><MapPin size={15} /></span> <span>Vehicle pickup in Dubai, with delivery anywhere within Dubai or across the UAE.</span></p>
          <h1 id="recovery-title"><span><b className="hero-chrome">Car towing &amp;</b></span><em><strong>Car recovery in Dubai 24/7</strong></em></h1>
          <p className="hero-arrival"><span>Within Dubai arrival time 15 minutes</span></p>
          </div>
          <figure className="hero-ad-visual">
            <div className="hero-drive"><img className="hero-ad-truck" src="/assets/hero-bugatti-recovery-1280.webp" srcSet="/assets/hero-bugatti-recovery-640.webp 640w, /assets/hero-bugatti-recovery-1280.webp 1280w" sizes="(max-width: 700px) 100vw, 55vw" width="1536" height="1024" alt="Unbranded black and red luxury sports car secured on a charcoal flatbed recovery truck with orange trim" fetchPriority="high" decoding="async" /><svg className="hero-wheel-overlay" viewBox="0 0 1280 853" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
              {[[143, 614, 15, 38], [540, 687, 29, 53]].map(([x, y, rx, ry], i) => (
                <g key={i} transform={`translate(${x} ${y}) scale(${rx} ${ry})`}>
                  <defs><clipPath id={'hero-rim-' + i} clipPathUnits="userSpaceOnUse"><circle r="1" /></clipPath></defs>
                  <g clipPath={'url(#hero-rim-' + i + ')'}><g className="hero-rim-spin">
                    <image href="/assets/hero-bugatti-recovery-1280.webp" x={-x / rx} y={-y / ry} width={1280 / rx} height={853 / ry} />
                  </g></g>
                </g>
              ))}
            </svg></div>
            <span className="hero-ad-diamond" aria-hidden="true"><img src="/assets/hero-bugatti-recovery-640.webp" width="640" height="427" alt="" decoding="async" /></span>
          </figure>
          <div className="hero-ad-details">
          <p className="hero-description"><strong className="hero-service-list">Car towing, Luxury &amp; Sports car recovery/towing, Flatbed car towing &amp; recovery, roadside assistance, car breakdown recovery, desert and off-road car recovery, motorcycle transport, accident car recovery, Full DOWN AND BOX CAR RECOVERY, emergency car recovery and towing, Basement car recovery</strong><span className="hero-availability">Call us. We are available 24 by 7.</span></p>
          <div className="hero-actions" data-contact-count={Number(Boolean(callHref)) + Number(Boolean(whatsappHref)) + 1}>
            {callHref && <div className="hero-call-stack"><a className="hero-phone-button" href={callHref}>{callHref.replace(/^tel:/, "")}</a><a className="contact-cta contact-cta--call" href={callHref}><Phone size={18} aria-hidden="true" /> Call now</a></div>}
            {whatsappHref && <a className="contact-cta contact-cta--whatsapp" href={whatsappHref}><MessageCircle size={18} aria-hidden="true" /> WhatsApp</a>}
            {!callHref && !whatsappHref && <a className="contact-cta contact-cta--call" href={bookingHref}>Request recovery <ArrowUpRight size={18} aria-hidden="true" /></a>}
            <a className="contact-cta contact-cta--location" href={bookingHref} data-use-pickup-location aria-label="Use my current location"><MapPin size={18} aria-hidden="true" /><span className="hero-location-full">Use my current location</span><span className="hero-location-short">My location</span></a>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RecoveryMap() {
  return <section className="recovery-map" aria-label="Illustrative pickup and drop-off routes"><div className="hero-map-surround"><RouteScene /></div></section>;
}
