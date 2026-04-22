# AI Apprenticeship

A framework and app for building real things with AI, stage by stage.

Most people using AI today delegate to it. This project is organized around a different posture: thinking *with* AI while the person doing the work retains the judgment. The framework is five stages, derived from one practitioner's experience building four applications without a technical background.

## Hora

Hora is the app that guides users through the framework across the full lifecycle of a real project. It is a PWA: installable on any device, works offline, and stores all project data locally in the browser. No account, no subscription, no server.

- Live site: https://pmrotter333.github.io/ai-apprenticeship/
- Open the app: https://pmrotter333.github.io/ai-apprenticeship/app/

## What's in this repo

Everything that serves the live site lives under `docs/`. GitHub Pages publishes from that directory.

- `docs/` — the public site and the Hora app
- `docs/app/` — the Hora PWA (Alpine.js, Dexie/IndexedDB, service worker)
- `docs/shared/` — design system, shared shell, fonts

No build step. The site is HTML, CSS, and vanilla JavaScript with a few vendored libraries.

## License

MIT. See [LICENSE](LICENSE).

## Contact

Paul Rotter. pmrotter333@gmail.com.
