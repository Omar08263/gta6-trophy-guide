# Leonida Platinum — GTA VI Trophy Guide & Tracker

An offline, open-source guide and tracker for all **55 PlayStation 5 trophies** of
Grand Theft Auto VI: every trophy with its official name, description and grade, a
guide in our own words that cites its sources, a 7-stage roadmap to the platinum,
missable flags, and a checklist that saves in your browser.

- **Guide & checklist** — search, filter by tier / kind / earned / missable, and a
  detail pane with each trophy's guide, steps, difficulty, rough time and sources.
- **Spoiler setting** — hides the names and descriptions of story trophies until
  they are earned.
- **Tracker** — progress saved in localStorage (X/55 and %), with Export and
  Import of your progress as a JSON file.
- **Platinum roadmap** — 7 stages built from the official descriptions, with
  per-stage progress.
- **Missables** — the 9 trophies flagged "missable in the moment" from the
  official descriptions, with the set-up each one needs.

## Sources

Trophy names, descriptions, grades and PSN counts are the official ones, as
listed by Exophase and PSNProfiles (the two agree on every name, description and
grade). Every guide is written in our own words from the official description;
where the description does not pin down a place, step or trigger, the guide says
so instead of guessing. Nothing was copied from another guide, and no Rockstar
artwork, logos or game images are used. Guides are not yet verified in-game.

## Run it

```sh
node serve.ts          # serves app/ at http://localhost:8080
```

Open `app/index.html` in any desktop browser. The app is plain static files and
works with the network off — it makes no network requests.

## Hand in (make.fun entry)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library.

## Details

- Owner: Omar08263
- Repository: gta6-trophy-guide
- Competition: gta6-trophy-guide-01 on make.fun
- Referral code: {referral_code}
- License: MIT (see LICENSE)
