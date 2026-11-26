# 🚍 Dhaka Local Bus Route Finder

Pick a start and a destination in Dhaka and see which local buses cover both stops, with the full route, service type and a photo of the bus. Works in English and Bangla.

**Live demo:** [_Dhaka Local Bus Route Finder_](https://mdfahimhassan.github.io/Dhaka-Local-Bus-Route-Finder/)

## Features
- 156 local bus services and ~290 stops
- Autocomplete that matches anywhere in the stop name (and Bangla names where translated)
- English / বাংলা toggle (remembered between visits)
- Search history saved in the browser, with one-click re-search and "Clear All"
- Bus detail pop-up with full route
- Responsive layout, keyboard-friendly, images lazy-loaded and compressed to WebP

## Tech
Plain HTML, CSS and vanilla JavaScript. Tailwind via CDN. No build step. Data lives in `buses.json`.

## Run locally
`fetch()` needs a web server, so don't just double-click `index.html`:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy
Repo **Settings → Pages → Deploy from branch → `main` / root**.

## Data format
```json
{
  "english": "Achim Paribahan",
  "bangla": "আছিম পরিবহন",
  "image": "achim-paribahan.webp",
  "routes": ["Gabtoli", "Technical", "Mirpur 1"],
  "time": "",
  "service_type": "Semi-Sitting Service(Check System)"
}
```

## Known limitations / roadmap
- Search checks that a bus serves both stops; it doesn't yet respect travel direction or stop order
- No transfer suggestions when no single bus covers the trip
- Bus time / service type missing for many buses; only 27 stops have Bangla names yet

## Credits
Route data compiled manually. Bus photos belong to their respective owners.
