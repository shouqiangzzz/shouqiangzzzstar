# Original local video upload checks

Run with Node.js 24:

```sh
node --experimental-strip-types --test-isolation=none --test tests/*.test.mjs
npm run build
```

The tests cover local file validation, upload of the original File without transformation, progress and cancellation, uploaded media metadata, real duration, acknowledged publication, rejected writes, and cloud content replacing stale cached content.

In the browser, choose a local video through the actual file picker. Verify the local preview, normal playback with sound, original bytes after upload and readback, and published playback after reopening the content. A local blob URL must never be stored in a published record. Upload and metadata-save failures must retain the selected file and draft; retrying a failed metadata save should reuse the completed file upload.

New publications use local file uploads. There is no video URL entry field. Existing content can still play its stored media URL. For live verification, supply the valid Firebase configuration and deploy the supplied Storage rules; local tests must not write disposable content to production.
