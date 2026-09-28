# After Rain

After Rain: a gentle practice of RAIN meditation (Recognize, Allow, Investigate, Nurture), for iPhone and the web.

I've been meditating for a long time, but I've seen the most progress with RAIN (Recognize, Allow, Investigate, Nurture), a practice created by Michele McDonald and shared widely by Tara Brach. I built the After Rain app as a free tool for myself and anyone else who finds RAIN helpful and wants a more consistent practice. As you move through the four steps, a lotus slowly blooms in soft, calming colors, and your progress is tracked over time.

Try it on the web: https://after-rain-smoky.vercel.app/

App Store: coming soon

## Setup 
```sh
npm install
npm run dev     # local dev server
npm run build   # type-check and build
npm run lint
```

## Ambient sounds

`public/sounds/rain.mp3`, `bowl.mp3` and `wind.mp3` are original loops
generated for this app, so there's nothing to license or credit. The birdsong
at the end of a meditation is synthesized live in `src/audio/ambient.ts`. To change one, replace the file under the same name; the
player loops it seamlessly and trims MP3 encoder padding automatically.
