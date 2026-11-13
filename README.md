# Bonsai Neuron Cloud

Watch a 1.58-bit language model think, in your browser.

**Live:** https://shayansanjideh.github.io/bonsai-neuron-cloud/

The page loads Ternary-Bonsai-2-2B with PrismML's WebGPU engine and runs it on your own GPU. Because the model is local, the page can read its activations after every layer and edit its weights in place.

- **Neuron cloud.** 192 neurons from each of the 24 MLP layers, copied off the GPU after every layer for every token, drawn as a 3D cloud. Dots light up by how far each neuron is from its usual level, and an orange path follows the strongest firing up the stack. Spot-checked against PrismML's llama.cpp (correlation 0.9999).
- **Word map.** Each word's internal state at a chosen layer, squashed to 2D.
- **Next token.** The top 5 candidates and their probabilities at every word.
- **Surgery.** Mark the token mixer or the MLP of any layers, press Apply, and they are switched off by zeroing the f16 scale shared by each group of 128 ternary weights. Edits are made in GPU memory and restored bit-exactly. A reference loss (nats per token on a fixed paragraph of easy facts) tracks the damage, and the text is rewritten so the cloud shows it.

New to language models? Press **Take the tour** on the page (or open it with `?tour`). Nine short steps explain tokens, odds, layers, neurons and surgery in plain language, with something to try at each one.

## Run it

Serve this folder from any static host, or locally:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. You need a browser with WebGPU. Add `?stub=1` to try the UI with a tiny fake model and no GPU.

## Test

```bash
node tests/ui-test.cjs
node tests/tour-test.cjs
```

These drive the page with the stub model in headless Chromium (needs Playwright): load, generate, click a word, switch a block off, restore, and every step of the tour.

`lab/` holds two pages that check the real model on your GPU: `lab/surgery-check.html` and `lab/lesion-scan.html`.

## Credits

The engine in `vendor/` is PrismML's WebGPU runtime from their Talk app, under Apache-2.0 (see `vendor/LICENSE` and `vendor/NOTICE`). This project started inside [bonsai-life](https://github.com/shayansanjideh/bonsai-life).
