(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Lab08 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function parseHex(text) {
    const compact = String(text).replace(/\s/g, "");
    if (!compact || compact.length % 2 || !/^[0-9a-f]+$/i.test(compact)) {
      throw new Error("Enter complete pairs of hex digits (0–9, A–F). Spaces are allowed.");
    }
    return Array.from({length: compact.length / 2}, (_, i) => parseInt(compact.slice(i * 2, i * 2 + 2), 16));
  }
  const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
  const printable = bytes => Array.from(bytes, b => b >= 32 && b <= 126 ? String.fromCharCode(b) : "·").join("");
  function asciiBytes(text) {
    const bytes = Array.from(String(text), c => c.codePointAt(0));
    if (bytes.some(b => b > 127)) throw new Error("Use ASCII characters only; non-ASCII text is not silently converted.");
    return bytes;
  }
  function crc8(bytes) {
    let crc = 0;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = ((crc << 1) ^ ((crc & 0x80) ? 0x07 : 0)) & 255;
    }
    return crc;
  }
  function parity(bytes, mode = "even") {
    if (!["even", "odd"].includes(mode)) throw new Error("Parity must be even or odd.");
    let value = 0;
    for (const byte of bytes) {
      let b = byte;
      for (let i = 0; i < 8; i++, b >>= 1) value ^= b & 1;
    }
    return value ^ (mode === "odd" ? 1 : 0);
  }
  function frame(bytes) {
    if (bytes.length !== 8) throw new Error("A frame must contain exactly eight bytes: 16 hex digits.");
    return {id: bytes[0], command: printable(bytes.slice(1, 5)), extras: bytes.slice(5, 7), check: bytes[7],
      crc: crc8(bytes.slice(0, 7)), even: parity(bytes.slice(0, 7)), odd: parity(bytes.slice(0, 7), "odd")};
  }
  function *searchCandidates(digits, locked) {
    const compact = String(digits).replace(/\s/g, "").toUpperCase();
    const bytes = parseHex(compact);
    frame(bytes);
    if (locked.length !== 16 || !locked[14] || !locked[15]) throw new Error("Lock both digits of byte 7 to keep the target CRC fixed. Use Vary extra bytes only for a ready-made lock pattern.");
    const free = locked.map((value, index) => value ? -1 : index).filter(i => i >= 0);
    if (!free.length) throw new Error("Unlock at least one payload digit to search.");
    if (free.length > 4) throw new Error("Unlock at most four payload digits (65,536 candidates). One adjustable byte needs only 256.");
    const total = 16 ** free.length;
    const chars = compact.split("");
    for (let candidate = 0; candidate < total; candidate++) {
      let value = candidate;
      for (let j = free.length - 1; j >= 0; j--, value >>= 4) chars[free[j]] = (value & 15).toString(16).toUpperCase();
      const result = parseHex(chars.join(""));
      const isOriginal = chars.join("") === compact;
      yield {bytes: result, tested: candidate + 1, total, match: !isOriginal && crc8(result.slice(0, 7)) === bytes[7]};
    }
  }
  return {parseHex, hex, printable, asciiBytes, crc8, parity, frame, searchCandidates};
});
