"""Prepare the independent client edition of the recovery reference."""

import colorsys
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

reference = Path(sys.argv[1]).resolve()
target = Path(sys.argv[2]).resolve()
shutil.copytree(reference / "source", target / "source", dirs_exist_ok=True)
source = target / "source"
business = {
    "name": "Dubai Car Recovery Near Me",
    "shortName": "Dubai Car Recovery Near Me",
    "phone": "", "phoneDisplay": "", "whatsapp": "", "email": "",
    "domain": "https://www.dubaicarrecoverynearme.com",
    "location": "Dubai, United Arab Emirates",
    "availability": "Subject to availability and pickup location.",
}
(source / "business.json").write_text(json.dumps(business, indent=2), encoding="utf-8")


def client_text(text):
    for old, new in {
        "DubaiCarRecovery.site": business["name"],
        "dubaicarrecovery.site": "www.dubaicarrecoverynearme.com",
        "Al Quoz Industrial Area": "Dubai",
        "Al Quoz, Dubai": "Dubai",
        "in Al Quoz": "in Dubai",
        "Based in Al Quoz.": "Dubai pickup coverage varies by location.",
        "Al Quoz": "Dubai",
        "Call +971 50 126 3137 to confirm 24/7 availability and a pickup quote.": "Confirm availability and a pickup quote with the team.",
        "on +971 50 126 3137": "",
        "Contact +971 50 126 3137 for questions about": "Ask the team about",
        "24/7 Reliable Service": "Availability by location",
        "Day or night, our team is ready to assist you.": "Confirm availability for your pickup location with the team.",
        "We welcome assistance enquiries day or night.": "Contact the team to confirm availability.",
        "24/7 ": "",
    }.items():
        text = text.replace(old, new)
    return text


builder = source / "build.py"
code = client_text(builder.read_text(encoding="utf-8"))
code = re.sub(r"^reviews=\[.*?^\]", "reviews=[]", code, flags=re.M | re.S)
code = re.sub(
    r'^<section class="section reviews-section".*?$',
    '<section class="section reviews-section" id="customer-reviews"><div class="wrap"><div class="reviews-heading" data-reveal><p class="eyebrow red">CUSTOMER REVIEWS</p><h2>Customer feedback</h2><p>Customer reviews will appear here once available.</p></div></div></section>',
    code, flags=re.M,
)
code = re.sub(r"^shutil.copyfile\(.*google2a1d0b0de1269394.*$", "", code, flags=re.M)
code = code.replace("robots_content='index,follow' if args.production", "robots_content='index,follow' if args.production and b['whatsapp']")
code = code.replace("237,18,54", "255,120,39")
builder.write_text(code, encoding="utf-8")
for path in [source / "about_content.py", source / "service_content.json", *(source / "blogs").glob("*")]:
    if path.is_file():
        path.write_text(client_text(path.read_text(encoding="utf-8")), encoding="utf-8")
guide_slugs = {
    "dubai-breakdown-recovery-checklist",
    "flatbed-luxury-vehicle-transport-dubai",
    "motorcycle-offroad-recovery-dubai",
}
metadata = source / "blogs" / "metadata.json"
guides = [guide for guide in json.loads(metadata.read_text(encoding="utf-8")) if guide["slug"] in guide_slugs]
metadata.write_text(json.dumps(guides, ensure_ascii=False), encoding="utf-8")


def recolor(match):
    color = match[1]
    if len(color) not in (3, 6, 8):
        return match[0]
    base = "".join(ch * 2 for ch in color) if len(color) == 3 else color[:6]
    hue, saturation, value = colorsys.rgb_to_hsv(*(int(base[i:i+2], 16) / 255 for i in (0, 2, 4)))
    if saturation < .16:
        return match[0]
    if hue < .09 or hue > .88 or .23 < hue < .51:
        hue = .067
    elif .51 <= hue <= .77:
        saturation *= .12
    else:
        return match[0]
    return "#" + "".join(f"{round(part * 255):02x}" for part in colorsys.hsv_to_rgb(hue, saturation, value)) + color[6:]


style = source / "styles.css"
css = re.sub(r"#([0-9a-fA-F]{3,8})(?![0-9a-fA-F])", recolor, style.read_text(encoding="utf-8"))
css += """
.hero .hero-copy {text-align:left}
.hero .hero-content {justify-content:flex-start}
.hero .hero-actions {margin-inline:0}
.hero .hero-contact-trio {justify-content:flex-start}
.hero .hero-condition,.hero .hero-vehicle-line {text-align:left}
.hero .hero-dubai-title {margin-inline:0}
.header-motion-background,.site-motion-background {filter:sepia(.75) saturate(1.3)}
.pending-contact {padding:1rem; margin-block:1rem; border-left:3px solid #ff7827}
.client-logo {width:3rem;height:3rem;flex:none}
.client-footer-brand {color:#fff;font-weight:800;text-decoration:none}
.service-carousel .card {--color-card:255,120,39}
"""
style.write_text(css, encoding="utf-8")
app = source / "app.js"
js = app.read_text(encoding="utf-8")
js = js.replace("e.preventDefault();clearDraft();", "e.preventDefault();clearDraft();if(!business.whatsapp)return;")
js = js.replace(" const text='Hello '+business.name", " if(!business.whatsapp)return;\n const text='Hello '+business.name")
app.write_text(js, encoding="utf-8")

subprocess.run([sys.executable, "-X", "utf8", str(builder), "--production"], check=True, cwd=target)
dist = target / "dist"
logo = '<svg class="client-logo" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="10" fill="#ff7827"/><g fill="none" stroke="#17100b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 15h20v15H8zm20 5h6l6 6v4H28"/><circle cx="15" cy="32" r="3"/><circle cx="34" cy="32" r="3"/></g></svg>'
(dist / "favicon.svg").write_text(logo.replace('class="client-logo"', 'xmlns="http://www.w3.org/2000/svg"'), encoding="utf-8")
legacy_route = dist / "services" / "breakdown-recovery"
legacy_route.mkdir(exist_ok=True)
(legacy_route / "index.html").write_text(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=/services/emergency-recovery/"><title>Breakdown recovery</title></head><body><a href="/services/emergency-recovery/">Continue to breakdown recovery</a></body></html>',
    encoding="utf-8",
)
for path in dist.rglob("*.html"):
    html = path.read_text(encoding="utf-8")
    html = re.sub(r'<img class="site-logo[^"]*"[^>]*>', lambda _: logo, html)
    html = html.replace('<div class="footer-logo-name">Dubai Car Recovery</div>', '<div class="footer-logo-name">Dubai Car Recovery Near Me</div>')
    html = re.sub(r'<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*>', '', html)
    html = html.replace('</title>', '</title><link rel="icon" href="/favicon.svg" type="image/svg+xml">')
    html = re.sub(r'<a\b[^>]*href="(?:tel:|mailto:|https://wa\.me/)"[^>]*>.*?</a>', '', html, flags=re.S)
    html = re.sub(r'<p>(?:Phone number: |Email: )</p>', '', html)
    html = re.sub(r'Call , message the same number on , or email \. ', '', html)
    html = html.replace('<h2>Call our team</h2>', '<h2>Prepare an enquiry</h2><p><a href="/book/">Open the booking form</a></p>')
    html = html.replace('<h2>Start on WhatsApp</h2>', '<h2>WhatsApp enquiries</h2><p>Online sending will be available when the business number is added.</p>')
    html = html.replace('type="submit"', 'type="submit" disabled')
    html = html.replace('<p class="form-note">', '<p class="pending-contact">Online sending will be available when the business WhatsApp number is added.</p><p class="form-note">')
    html = html.replace('<button class="btn location-share', '<a class="btn sticky-book" href="/book/">Prepare enquiry</a><button class="btn location-share')
    html = html.replace('/media/company-logo-footer.webp?v=circle-logo-3', '/favicon.svg')
    html = html.replace('>CAR &amp; BIKE TOWING</small>', '>NEAR ME</small>')
    def guide_link(match):
        slug = match[1]
        if slug in guide_slugs:
            return match[0]
        service_slug = slug.removeprefix('service-').removesuffix('-dubai')
        if slug.startswith('service-') and (dist / 'services' / service_slug / 'index.html').is_file():
            return f'href="/services/{service_slug}/"'
        return 'href="/blogs/"'
    html = re.sub(r'href="/blogs/([a-z0-9-]+)/"', guide_link, html)
    path.write_text(html, encoding="utf-8")
for path in dist.rglob("*.gz"):
    path.unlink()
for filename in ('favicon.png', 'favicon-32.png', 'favicon.ico', 'apple-touch-icon.png', 'app-icon-192.png', 'app-icon-512.png', 'site.webmanifest'):
    (dist / filename).unlink(missing_ok=True)
for path in (dist / "media").glob("company-logo*"):
    path.unlink()
for path in (dist / "media").glob("review-avatar*"):
    path.unlink()
