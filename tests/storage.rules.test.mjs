import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeApp, deleteApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth';
import { connectStorageEmulator, deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

// Opt in explicitly: this integration test must never touch a real Firebase project.
const enabled = process.env.FIREBASE_STORAGE_EMULATOR_HOST === '127.0.0.1:9199'
  && process.env.FIREBASE_AUTH_EMULATOR_HOST === '127.0.0.1:9099';

test('local Storage rules preserve original bytes and isolate ordinary user uploads', { skip: !enabled }, async (t) => {
  const apps = [];
  async function client(name, authenticated) {
    const app = initializeApp({
      apiKey: 'demo-only-key', projectId: 'demo-original-video',
      authDomain: 'demo-original-video.firebaseapp.com', storageBucket: 'demo-original-video.appspot.com',
    }, name);
    apps.push(app);
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    const storage = getStorage(app);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    storage.maxUploadRetryTime = 1000;
    storage.maxOperationRetryTime = 1000;
    const uid = authenticated ? (await signInAnonymously(auth)).user.uid : undefined;
    return { storage, uid };
  }
  const original = new Uint8Array([0, 1, 2, 3, 254, 255]);
  try {
    const owner = await client('ordinary-owner', true);
    const other = await client('ordinary-other', true);
    const guest = await client('guest', false);
    const path = `videos/${owner.uid}/integration-original/original.mp4`;
    const metadata = { contentType: 'video/mp4', customMetadata: { originalFileName: 'original.mp4', originalSize: '6' } };
    const denied = (operation) => assert.rejects(operation, (error) => error.code === 'storage/unauthorized');

    await t.test('unauthenticated users cannot upload', async () => {
      await denied(uploadBytes(ref(guest.storage, `videos/${owner.uid}/guest/clip.mp4`), original, metadata));
    });
    await t.test('another UID cannot upload into the original owner path', async () => {
      await denied(uploadBytes(ref(other.storage, `videos/${owner.uid}/other/clip.mp4`), original, metadata));
    });
    await t.test('an ordinary authenticated owner can upload and guests read exact original bytes', async () => {
      await uploadBytes(ref(owner.storage, path), original, metadata);
      const url = await getDownloadURL(ref(guest.storage, path));
      assert.match(url, /^http:\/\/127\.0\.0\.1:9199\//);
      const response = await fetch(url);
      assert.equal(response.status, 200);
      assert.deepEqual(new Uint8Array(await response.arrayBuffer()), original);
    });
    await t.test('replacing an existing original is rejected even for its owner', async () => {
      await denied(uploadBytes(ref(owner.storage, path), new Uint8Array([99, 88]), metadata));
    });
    await t.test('empty and nonvideo uploads are rejected', async () => {
      await denied(uploadBytes(ref(owner.storage, `videos/${owner.uid}/bad-mime/clip.txt`), original, { contentType: 'text/plain' }));
      await denied(uploadBytes(ref(owner.storage, `videos/${owner.uid}/empty/clip.mp4`), new Uint8Array(), metadata));
    });
    await t.test('files above 100 MiB are rejected by the server rule', async () => {
      await denied(uploadBytes(ref(owner.storage, `videos/${owner.uid}/oversize/clip.mp4`), new Uint8Array(100 * 1024 * 1024 + 1), metadata));
    });
    await t.test('another UID and guests cannot delete; owner can remove an unpublished upload', async () => {
      await denied(deleteObject(ref(other.storage, path)));
      await denied(deleteObject(ref(guest.storage, path)));
      await deleteObject(ref(owner.storage, path));
      await assert.rejects(getDownloadURL(ref(owner.storage, path)), (error) => error.code === 'storage/object-not-found');
    });
    await t.test('other storage paths are closed even to authenticated users', async () => {
      await denied(uploadBytes(ref(owner.storage, 'other/uncontrolled.mp4'), original, metadata));
    });
  } finally {
    await Promise.all(apps.map((app) => deleteApp(app)));
  }
});
