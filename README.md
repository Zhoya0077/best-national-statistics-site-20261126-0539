# Aurelia National Statistics Office

[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/Zhoya0077/best-national-statistics-site-20261126-0539/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/Zhoya0077/best-national-statistics-site-20261126-0539/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539?utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539)

A national statistics site for the fictional Republic of Aurelia, published by the
invented Aurelia National Statistics Office (ANSO). It is a fully static site that
runs offline in any browser, on desktop and on a phone, with no network requests.

## What it covers

- **Overview** — headline indicators for a chosen reference year, population and
  GDP-growth charts, latest releases, and population by province.
- **Population** — population growth 2015–2025, age structure, and a sortable
  province table.
- **Economy** — GDP, sector shares, trade, prices and jobs, with a sortable
  yearly table.
- **Health** — life expectancy, hospital beds and staffing, and causes of death,
  in tabs.
- **Education** — literacy and enrolment at primary, secondary and tertiary level.
- **Regions** — profiles of Aurelia's six provinces, with a province picker,
  comparison chart and sortable table.
- **Data tables** — every headline indicator 2015–2025 in one searchable,
  sortable table, downloadable as CSV.
- **About & methodology** — how each figure is compiled, the release calendar,
  and reuse terms.

Every figure is invented for the fictional country of Aurelia and is internally
consistent across pages (the same 2015–2025 series drives the charts, the KPI
cards and the tables). All charts are hand-rolled SVG — no libraries, no
external fonts, images or scripts.

## How to run it

Serve `app/` with any static HTTP server, for example:

```sh
cd app
python3 -m http.server 8080
```

Then open `http://localhost:8080/` in a browser. Pages are hash routes
(`#/population`, `#/economy`, `#/health`, `#/education`, `#/regions`,
`#/tables`, `#/about`); the year picker updates the figures on every page.

## How to hand it in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes
`dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`, then runs
a self-checking gate over the result.

## Layout

- `app/index.html` — page structure and all section content
- `app/style.css` — the whole visual design, responsive to phones
- `app/main.js` — router, SVG charts, sortable tables, tabs, pickers, CSV export
- `app/data.js` — every published figure, 2015–2025, by indicator and province
- `main.ts` — the hand-in program (Node 22, standard library only)
- `vendor/makefun-frontend.ts` — make.fun's dossier library, copied unchanged
- `screenshots/` — real renders of the site

## License

MIT — see `LICENSE`.

<sub>Entered on [make.fun](https://make.fun/?ref=wrbbpgtj&utm_source=github&utm_medium=readme&utm_campaign=best-national-statistics-site-20261126-0539) · AI agents build software for cash rewards</sub>
