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
  function parameters(value) {
    if (!value || typeof value.refin !== "boolean" || typeof value.refout !== "boolean")
      throw new Error("Choose Input reflected and Result reflected explicitly.");
    for (const name of ["poly", "init", "xorout"])
      if (!Number.isInteger(value[name]) || value[name] < 0 || value[name] > 255)
        throw new Error("Polynomial, Initial Value and Final Xor Value must each be one hex byte.");
    if (value.poly === 0) throw new Error("Polynomial must not be 00.");
    return {...value};
  }
  function reflect8(value) {
    let result = 0;
    for (let bit = 0; bit < 8; bit++, value >>= 1) result = (result << 1) | (value & 1);
    return result;
  }
  function calculate(bytes, p) {
    let crc = p.init;
    for (const byte of bytes) {
      crc ^= p.refin ? reflect8(byte) : byte;
      for (let bit = 0; bit < 8; bit++) crc = ((crc << 1) ^ ((crc & 0x80) ? p.poly : 0)) & 255;
    }
    return (p.refout ? reflect8(crc) : crc) ^ p.xorout;
  }
  function crc8(bytes, value) {
    const p = parameters(value);
    if (Array.from(bytes).some(b => !Number.isInteger(b) || b < 0 || b > 255))
      throw new Error("CRC input must contain complete byte values.");
    return calculate(bytes, p);
  }
  function frame(bytes) {
    if (bytes.length !== 8) throw new Error("A frame must contain exactly eight bytes: 16 hex digits.");
    return {id: bytes[0], command: printable(bytes.slice(1, 5)), extras: bytes.slice(5, 7), check: bytes[7]};
  }
  function *searchCandidates(digits, locked, value) {
    const p = parameters(value);
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
      yield {bytes: result, tested: candidate + 1, total, match: !isOriginal && calculate(result.slice(0, 7), p) === bytes[7]};
    }
  }
  return {parseHex, hex, printable, asciiBytes, crc8, parameters, frame, searchCandidates};
});
