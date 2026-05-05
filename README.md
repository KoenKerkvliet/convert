# ImageConverter

Een browser-only image converter door [Design Pixels](https://designpixels.nl).
Alle conversies gebeuren lokaal — er gaat geen enkel bestand naar een server.

**Live:** https://convert.designpixels.nl

## Features

- Drag-and-drop upload, single en bulk
- Doelformaten: **JPG, PNG, WebP, AVIF, GIF, SVG, TIFF, BMP, ICO**
- Bronformaten: alle bovenstaande + **HEIC/HEIF**
- Kwaliteitsslider (voor formaten die het ondersteunen)
- Max breedte / max hoogte
- Behoud aspect ratio (toggle)
- Hernoempatroon met `{name}`, `{n}`, `{index}` placeholders
- Voortgangsbalk per bestand
- Per-image download + ZIP-download van alles
- Toont % kleiner / groter per afbeelding
- Light theme met brand-kleur `#9d88fe`
- Lazy-loading van zware decoders (HEIC) zodat de hoofdbundle klein blijft

## Tech stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 3
- `jszip` voor ZIP-downloads
- `heic2any` voor HEIC/HEIF decoding (lazy)
- `utif` voor TIFF encode/decode
- Custom encoders voor BMP en ICO
- Browser-native canvas voor JPG/PNG/WebP/AVIF

## Lokaal draaien

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # productiebundle in /dist
npm run preview      # preview de build lokaal
npm run typecheck
```

## Deploy naar GitHub Pages + custom subdomein

Het project bevat een GitHub Actions workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) die bij iedere push naar `main` automatisch deployt.

**Eenmalige setup:**

1. **GitHub repo settings → Pages**
   - Source: *GitHub Actions*

2. **DNS bij designpixels.nl** — voeg deze CNAME-record toe:
   ```
   Type:   CNAME
   Name:   convert
   Value:  koenkerkvliet.github.io
   TTL:    3600
   ```

3. **Push naar `main`** — de workflow bouwt en publiceert. Het bestand `public/CNAME` zorgt dat GitHub Pages het domein `convert.designpixels.nl` koppelt.

4. In **GitHub repo settings → Pages** zie je na deploy een toggle voor *Enforce HTTPS* — aanvinken zodra het certificaat klaar is (kan 5-15 min duren).

## Notes over formaten

| Formaat | Decode | Encode | Toelichting |
|---------|--------|--------|-------------|
| JPG     | ✅ native | ✅ native | Quality slider 10-100% |
| PNG     | ✅ native | ✅ native | Lossless |
| WebP    | ✅ native | ✅ native | Quality slider |
| AVIF    | ✅ native | ⚠️ Chrome 85+/Edge | Vereist canvas-encoder support |
| GIF     | ✅ native | ⚠️ single-frame as PNG | Browsers hebben geen native GIF-encoder. Geanimeerde GIFs worden niet behouden. |
| SVG     | ✅ native | ✅ wrapper | Output is een SVG die de raster als base64 PNG inbedt. |
| TIFF    | ✅ via UTIF | ✅ via UTIF | |
| BMP     | ✅ native | ✅ custom | 32-bit BGRA met alpha |
| ICO     | ✅ native | ✅ custom | PNG-in-ICO, max 256×256 |
| HEIC/HEIF | ✅ via heic2any | ❌ | Geen browser-encoder beschikbaar. Output kies je zelf in een ander formaat. |

## Geparkeerd voor later

### Globale conversie-teller

De footer toont nu een sessie-teller (X afbeeldingen geconverteerd in deze sessie). Voor een echt globaal totaal heb je een lichte backend nodig — bijvoorbeeld Supabase met een RPC die een counter ophoogt en uitleest. De UI heeft daar al ruimte voor: zie [src/components/StatsCounter.tsx](src/components/StatsCounter.tsx) — vervang `fetchTotal()` door je eigen endpoint.

### Daglimiet per gebruiker

Volledig client-side rate limiting is triviaal te omzeilen, dus voor een echte daglimiet heb je dezelfde backend nodig (IP-based of fingerprint + Supabase row). De componenten voor opties en de Convert-knop zijn zo opgezet dat een `dailyLimitReached` flag eenvoudig de knop kan disablen met een melding.

## Licentie

© Design Pixels. Alle rechten voorbehouden.
