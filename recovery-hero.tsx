import { useId } from "react";
import { ArrowUpRight, Check, Flag, MapPin, MessageCircle, Phone, ShieldCheck, Truck } from "lucide-react";

const route = "M126 346 H204 Q241 346 241 309 V274 Q241 237 278 237 H361 Q400 237 400 198 V172 Q400 135 437 135 H482 Q520 135 520 98 H553";
const start = { x: 126, y: 346 };
const finish = { x: 553, y: 98 };

function RouteScene({ playing }: { playing: boolean }) {
  const prefix = useId();
  return (
    <figure className="route-scene">
      <figcaption className="scene-caption">
        <span><MapPin size={15} /> Dubai, UAE</span>
        <span>Illustrative route</span>
      </figcaption>
      <svg className="scene-map" viewBox="0 0 660 430" aria-hidden="true">
        <defs>
          <pattern id={prefix + "-grid"} width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke="#77888d" strokeOpacity=".10" />
          </pattern>
          <radialGradient id={prefix + "-light"}>
            <stop stopColor="#de662c" stopOpacity=".19" />
            <stop offset="1" stopColor="#de662c" stopOpacity="0" />
          </radialGradient>
          <clipPath id={prefix + "-vehicle"} clipPathUnits="userSpaceOnUse">
            <path d="M40 251L50 226 56 184 88 172 163 157 225 135 283 128 385 129 447 142 503 178 525 193 590 202 592 184 614 174 657 163 705 162 735 176 757 203 773 228 791 235 796 246 813 260 824 278 831 301 829 321 817 337 805 359 786 368 769 361 759 344 727 351 681 354 524 381 506 408 486 420 458 422 429 411 414 388 376 394 221 408 166 427 143 412 134 390 123 385 130 370 143 366 142 309 118 305 82 298 48 290 40 276Z" />
          </clipPath>
        </defs>
        <rect width="660" height="430" fill="#e4e9e9" />
        <path d="M0 0H310l-45 33-48 14-35 43-44 12-39 56-51 27L0 205Z" fill="#c5d6dd" stroke="#6f8791" strokeOpacity=".55"/>
        <rect width="660" height="430" fill={"url(#" + prefix + "-grid)"} />
        <g className="map-roads">
          <path d="M-20 275l105-57 50-48 88-32 61-75L389 9M0 330l107-64 59-50 99-36 56-65L451 39 493 0M0 401l98-60 92-49 74-36 67-67 77-39L556 12M70 430l87-62 81-31 100-71 82-55 88-48L660 37M216 430l76-61 60-60 98-61 102-57 108-92M371 430l56-55 90-53 81-75 62-33"/>
          <path d="M68 188l45 80 83 67 76 95M172 109l48 81 64 56 45 92 77 92M263 52l58 68 81 68 65 93 41 83 69 66M382 0l72 100 50 63 51 67 60 89 45 25M506 0l45 58 53 51 56 20"/>
        </g>
        <ellipse cx="342" cy="252" rx="266" ry="182" fill={"url(#" + prefix + "-light)"} />
        <path d={route} className="route-bed" />
        <path d={route} className="route-trace" pathLength="1" strokeDasharray="1 1" strokeDashoffset="0" />
        <circle cx={start.x} cy={start.y} r="10" className="map-pin-ring" />
        <circle cx={start.x} cy={start.y} r="4" className="map-pin-core" />
        <circle cx={finish.x} cy={finish.y} r="12" className="map-pin-ring map-pin-drop" />
        <circle cx={finish.x} cy={finish.y} r="4" className="map-pin-core" />
        <circle cx={finish.x} cy={finish.y} r="12" className="map-pin-pulse" fill="none" stroke="#2e784a" />
        <g className="route-truck" transform={`translate(${start.x} ${start.y})`}>
          <ellipse cx="0" cy="1" rx="64" ry="10" fill="#4e5356" opacity=".38" />
          <svg x="-82" y="-77" width="174" height="98" viewBox="0 0 900 506" className="map-vehicle">
            <image href="/flatbed.webp" width="900" height="506" clipPath={"url(#" + prefix + "-vehicle)"} />
            <g className="route-wheel" data-center="463 376"><Wheel x={463} y={376} radius={23} /></g>
            <g className="route-wheel" data-center="790 335"><Wheel x={790} y={335} radius={15} /></g>
          </svg>
        </g>
      </svg>
      <div className="route-label route-label-pickup"><MapPin size={16} /><span>Pickup</span></div>
      <div className="route-label route-label-drop" data-delivered="false">
        <Flag className="route-drop-icon" size={16} /><Check className="route-delivered-icon" size={16} />
        <span className="route-drop-text">Drop-off</span><span className="route-delivered-text">Delivered</span>
      </div>
      <div className="scene-footer">
        <span>
          <a href="https://commons.wikimedia.org/wiki/File:Transport_autoturism_electric_pe_platforma_auto_de_tip_%22flatbed%22.jpg">Photo by Traiantkd</a>
          {" · Cutout · "}
          <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
        </span>
      </div>
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
      <div className="highway-background" aria-hidden="true" />
      <div className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow"><span className="hero-icon"><MapPin size={15} /></span> Dubai, United Arab Emirates</p>
          <h1 id="recovery-title"><span><b className="hero-chrome">Car towing &amp;</b></span><em><strong>recovery in Dubai.</strong></em></h1>
          <p className="hero-description">Stuck after a breakdown or need to move a vehicle? Share your pickup point and destination to arrange recovery across Dubai.</p>
          <div className="hero-actions">
            {callHref && <a className="contact-cta contact-cta--call" href={callHref}><Phone size={18} aria-hidden="true" /> Call now</a>}
            {whatsappHref && <a className="contact-cta contact-cta--whatsapp" href={whatsappHref}><MessageCircle size={18} aria-hidden="true" /> WhatsApp</a>}
            {!callHref && !whatsappHref && <a className="contact-cta contact-cta--call" href={bookingHref}>Request recovery <ArrowUpRight size={18} aria-hidden="true" /></a>}
            <a className="contact-cta contact-cta--location" href={bookingHref} data-use-pickup-location><MapPin size={18} aria-hidden="true" /> Use my current location</a>
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
