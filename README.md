# Yingjin Li — Academic Homepage

Live site: https://yingjinli.github.io/

A personal research observatory for visual anomaly detection, multimodal learning, and vision-language models.

## Structure

- `index.html`: biography, complete publication list, research stories, academic background, and contact information.
- `observatory.css`: warm paper / ink blue design, responsive layouts, reading mode, and print styles.
- `observatory.js`: publication filters, reading mode, and illustrative research interactions.
- `gallery.css`: a lightweight editorial gallery of research illustrations in the hero.
- `road-visual.svg`, `prism-visual.svg`, `fashion-visual.svg`: original conceptual illustrations linking to the corresponding research sections.
- `specimen-normal.svg`, `specimen-anomaly.svg`: original conceptual artwork for the reconstruction comparison.
- `fashion-visual.svg`: original conceptual illustration for multimodal retrieval.
- `profile.png`: original portrait.
- `Yingjin_Li_Academic_CV.pdf`: the current academic CV.
- Fonts: self-hosted DM Sans and DM Serif Display, with their OFL license files included.

The site has no build step, analytics, external scripts, external font requests, or model-inference services. GitHub Pages deploys the root of `main`. The optional reading-mode preference is stored locally in the visitor's browser.

## Interactions and accessibility

The ROAD example has manually defined responses. The PriSM-AD comparison and localization overlay are conceptual illustrations. Neither is an experimental result or live model output. The hero gallery uses conceptual research illustrations.

Controls support keyboard use. The gallery has no continuous animation; hover transitions and the user-triggered driving illustration respect reduced-motion preferences. Core academic content remains readable without JavaScript.

## Content notes

- ROAD: accepted at NeurIPS 2026, as confirmed by Yingjin Li.
- PriSM-AD: under review at IEEE Transactions on Multimedia.
- Fashion image retrieval: CASA 2024; the Springer proceedings were published in 2025.
- No experimental performance numbers are inferred from the decorative illustrations.

Paper status and personal details should be updated from the author's confirmed information.

Earlier artwork and CSS files are retained for compatibility; the current page uses `observatory.css` and `gallery.css`.
