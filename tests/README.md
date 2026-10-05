# Video publication regression checks

Run the dependency-free tests with Node.js 24:

```sh
node --experimental-strip-types --test-isolation=none --test tests/*.test.mjs
npm run build
```

The tests cover original URL preservation, real duration formatting, invalid or temporary sources, optional Firestore fields, acknowledged publication, rejected writes, guest publication, and canonical cloud content replacing stale cached content.

Browser verification should additionally check that a real video frame decodes before publication, playback starts at 1x with audio, source changes stop the previous video, HTML/404 sources cannot be published, and failed saves retain the draft. Use a local test backend for save failures; avoid publishing disposable test content to production.

The current repository publishes public video file URLs. A platform's share page or a temporary local blob URL is not a persistent video source. Invalid existing sources require the author's original public video URL. The committed Firebase API key is a placeholder; live account publication requires a valid Firebase web configuration.
