# Bangla Number Words BD 🇧🇩

A free, fully offline bilingual (বাংলা / English) Bengali numeral toolkit:
turn numbers into Bengali words, write cheque-style amounts in words
(টাকা / পয়সা / মাত্র), convert digits inside any text between English and
Bengali, and see big numbers explained in lakh–crore vs million–billion.

## Problem

Writing a cheque, a receipt, or an official document in Bangladesh often
means writing an amount in Bengali words by hand — slow and error-prone.
Online converters need internet and send your figures to a server. This tool
does every conversion locally, in your browser, with nothing leaving your
device.

## Features

- **সংখ্যা → কথায়** — whole numbers (0 – 99,99,99,999) to Bengali words,
  e.g. `123456789` → “বারো কোটি চৌত্রিশ লক্ষ ছাপ্পান্ন হাজার সাতশত ঊননব্বই”
- **টাকার অঙ্ক (cheque-style)** — amounts to words with টাকা / পয়সা / মাত্র,
  e.g. `2500.50` → “দুই হাজার পাঁচশত টাকা পঞ্চাশ পয়সা মাত্র”
- **অঙ্ক রূপান্তরকারী** — English ↔ Bengali digit conversion inside any text,
  e.g. `Order 123` → `Order ১২৩`
- **বড় সংখ্যা ব্যাখ্যাকারী** — BD grouping (`2,50,00,000`) plus
  lakh / crore / million / billion side by side
- Bilingual UI (বাংলা / English) with persisted language choice
- One-tap example chips, copy-to-clipboard, input validation with clear
  error messages, empty / error states on every tool
- Responsive at 390px mobile widths; zero network requests

## Stack

- Vanilla HTML + CSS + JavaScript (no build step, no dependencies)
- Pure-function core engine (`js/words.js`, works in Node and the browser)
- Node.js for unit tests; headless Chromium (CDP) for smoke tests

## Prerequisites

- Any modern browser (open `index.html` — no server needed)
- Node.js 18+ only for running the tests

## Install / run

```bash
# just open it — no install, no build
open index.html        # macOS
xdg-open index.html    # Linux
```

Or serve it locally:

```bash
npx serve .            # or: python3 -m http.server 8000
```

## Dev commands

```bash
node tests/test.js                  # engine unit tests (76 assertions)
node tests/smoke.js                 # desktop smoke tests (headless Chrome, 21 checks)
node tests/smoke.js --viewport=mobile   # mobile 390px smoke tests (21 checks)
```

## Env

None — no API keys, no backend, no configuration.

## Testing

- `tests/test.js`: 76 assertions covering digit conversion, every decade of
  0–99 word forms, hundreds/thousands/lakh/crore composition, cheque-style
  amounts (including rounding `10.999` → `এগারো টাকা মাত্র`), BD grouping,
  scale breakdowns, and all validation error paths — **76/76 passing**.
- `tests/smoke.js`: 21 headless-Chrome checks per viewport covering boot,
  default Bengali UI, all four tools end-to-end, validation errors, example
  chips, digit conversion both directions, language toggle + localStorage
  persistence across reload, copy buttons, and zero horizontal overflow —
  **21/21 desktop, 21/21 mobile, 0 console/page errors**.

## Deployment

Static site — copy the folder to any static host (GitHub Pages, Netlify,
or plain file hosting). No build step required.

## Limitations

- Whole numbers only up to 999,999,999 (99 কোটি 99 লক্ষ); amounts support
  up to 2 decimal places.
- Word forms follow standard Bengali spelling conventions; regional
  variations exist.
- Paisa is rounded to the nearest পয়সা (e.g. `10.999` → `এগারো টাকা`).
- Words are generated for personal/official-draft use — for legal
  documents, verify the wording against your institution's requirements.

## Status

Built and verified locally. 100% offline — all computation happens in the
browser; no data is collected or transmitted.
