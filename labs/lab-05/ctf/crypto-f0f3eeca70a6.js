/* Shared by the browser decryptor and the private generator's checks. */
(function (root) {
  "use strict";
  function decodeBase64(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }
  function normalizeKey(value) {
    return value.trim().toLowerCase().replace(/\s+/g, "");
  }
  async function derive(password, salt, iterations, cryptoAPI) {
    const material = await cryptoAPI.subtle.importKey(
      "raw", new TextEncoder().encode(normalizeKey(password)), "PBKDF2", false, ["deriveKey"]
    );
    return cryptoAPI.subtle.deriveKey(
      {name: "PBKDF2", salt, iterations, hash: "SHA-256"},
      material, {name: "AES-CTR", length: 256}, true, ["encrypt", "decrypt"]
    );
  }
  async function fingerprint(key, cryptoAPI) {
    const bytes = await cryptoAPI.subtle.exportKey("raw", key);
    const hash = new Uint8Array(await cryptoAPI.subtle.digest("SHA-256", bytes));
    return Array.from(hash, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  async function decrypt(station, password, cryptoAPI = root.crypto) {
    const passwordKey = await derive(password, decodeBase64(station.salt), station.iterations, cryptoAPI);
    const keyFingerprint = await fingerprint(passwordKey, cryptoAPI);
    // Accepted rounding variants unwrap the same content key. An unmatched
    // password still unwraps bytes and produces a visible scrambled result.
    const wrapper = station.keyWrappers.find((item) => item.fingerprint === keyFingerprint)
      || station.keyWrappers[0];
    const rawKey = await cryptoAPI.subtle.decrypt(
      {name: "AES-CTR", counter: decodeBase64(wrapper.counter), length: 64},
      passwordKey, decodeBase64(wrapper.wrappedKey)
    );
    const contentKey = await cryptoAPI.subtle.importKey(
      "raw", rawKey, {name: "AES-CTR"}, false, ["decrypt"]
    );
    const plaintext = await cryptoAPI.subtle.decrypt(
      {name: "AES-CTR", counter: decodeBase64(station.counter), length: 64},
      contentKey, decodeBase64(station.ciphertext)
    );
    return new TextDecoder().decode(plaintext).replace(
      /[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, "\uFFFD"
    );
  }
  root.Lab5CTFCrypto = {normalizeKey, derive, decrypt, fingerprint};
  if (typeof module !== "undefined") module.exports = root.Lab5CTFCrypto;
})(globalThis);
