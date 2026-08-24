from __future__ import annotations

import json
import re
import time
from pathlib import Path
from urllib.parse import quote

import requests
from PIL import Image
from io import BytesIO

API = "https://commons.wikimedia.org/w/api.php"
ROOT = Path("/home/ubuntu/tourgen/heritage-assets")
RAW = ROOT / "raw"
OPT = ROOT / "client" / "src" / "assets" / "heritage"
ROOT.mkdir(parents=True, exist_ok=True)
RAW.mkdir(parents=True, exist_ok=True)
OPT.mkdir(parents=True, exist_ok=True)

sites = [
    ("bodh-gaya", "Mahabodhi Temple Bodh Gaya Bihar"),
    ("nalanda", "Nalanda Mahavihara ruins Bihar"),
    ("rajgir", "Rajgir Bihar heritage"),
    ("golghar", "Golghar Patna Bihar"),
    ("vikramshila", "Vikramshila ruins Bihar"),
    ("kesariya", "Kesariya Stupa Bihar"),
]

headers = {"User-Agent": "TourGen heritage asset preparation/1.0"}
manifest = []

for slug, query in sites:
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": 6,
        "gsrlimit": 12,
        "prop": "imageinfo|info",
        "iiprop": "url|size|mime|extmetadata",
        "iiurlwidth": 1800,
        "format": "json",
        "formatversion": 2,
    }
    response = requests.get(API, params=params, headers=headers, timeout=30)
    response.raise_for_status()
    pages = response.json().get("query", {}).get("pages", [])
    pages = [p for p in pages if p.get("imageinfo") and p["imageinfo"][0].get("mime", "").startswith("image/")]
    if not pages:
        print(f"No image found for {slug}")
        continue

    def score(page: dict) -> tuple[int, int]:
        title = page.get("title", "").lower()
        info = page["imageinfo"][0]
        width, height = info.get("width", 0), info.get("height", 0)
        landscape = 1 if width >= height else 0
        keywords = sum(1 for word in query.lower().split() if word in title)
        return landscape, keywords

    page = sorted(pages, key=score, reverse=True)[0]
    info = page["imageinfo"][0]
    image_url = info.get("thumburl") or info.get("url")
    source_page = f"https://commons.wikimedia.org/wiki/{quote(page['title'].replace(' ', '_'))}"
    filename = f"{slug}.jpg"
    raw_path = RAW / filename
    opt_path = OPT / filename

    clean_image_url = image_url.split("?", 1)[0]
    image_response = None
    for attempt in range(4):
        image_response = requests.get(clean_image_url, headers=headers, timeout=60)
        if image_response.status_code != 429:
            break
        time.sleep(2 ** attempt)
    image_response.raise_for_status()
    raw_path.write_bytes(image_response.content)
    image = Image.open(BytesIO(image_response.content)).convert("RGB")
    width, height = image.size
    target_width = min(width, 1600)
    target_height = round(height * target_width / width)
    image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
    image.save(opt_path, "JPEG", quality=86, optimize=True, progressive=True)

    metadata = info.get("extmetadata", {})
    def meta(key: str) -> str:
        return re.sub(r"<[^>]+>", "", metadata.get(key, {}).get("value", "")).strip()

    record = {
        "slug": slug,
        "site": query,
        "title": page.get("title"),
        "source_page": source_page,
        "image_url": clean_image_url,
        "author": meta("Artist"),
        "license": meta("LicenseShortName"),
        "license_url": meta("LicenseUrl"),
        "description": meta("ImageDescription"),
        "local_path": str(opt_path.relative_to(Path("/home/ubuntu/tourgen"))),
        "dimensions": {"width": target_width, "height": target_height},
    }
    manifest.append(record)
    print(f"Prepared {slug}: {page.get('title')}")

(ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
print(f"Wrote {len(manifest)} assets to {ROOT / 'manifest.json'}")
