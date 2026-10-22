"use strict";
(() => {
  const P = window.Lab08;
  const $ = id => document.getElementById(id);
  const inputs = [], locks = [];
  let generation = 0, searching = false;
  function result(id, text, error = false) {
    $(id).textContent = text;
    $(id).classList.toggle("error", error);
  }
  function cancelSearch(message = "Search cancelled. No packet was sent.") {
    generation++;
    if (searching) result("search-result", message);
    searching = false;
    $("search").disabled = false;
    $("cancel").disabled = true;
  }
  function changed() {
    cancelSearch("Packet or locks changed; search cancelled.");
    $("packet-output").value = "";
    result("inspection", "Packet changed. Inspect it again before copying.");
  }
  for (let byte = 0; byte < 7; byte++) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "byte" + (byte === 6 ? " check-byte" : "");
    const legend = document.createElement("legend");
    legend.textContent = `${byte}: ${["Device", "Command", "Command", "Command", "Command", "Extra", "Check"][byte]}`;
    fieldset.append(legend);
    const digits = document.createElement("div");
    digits.className = "digits";
    for (let nibble = 0; nibble < 2; nibble++) {
      const index = byte * 2 + nibble;
      const container = document.createElement("div"); container.className = "digit";
      const input = document.createElement("input");
      input.type = "text"; input.maxLength = 1; input.autocomplete = "off"; input.spellcheck = false;
      input.setAttribute("aria-label", `Byte ${byte} ${nibble ? "low" : "high"} hex digit`);
      input.addEventListener("input", () => { input.value = input.value.toUpperCase(); changed(); });
      const label = document.createElement("label"); label.textContent = "Lock";
      const lock = document.createElement("input"); lock.type = "checkbox"; lock.checked = true;
      lock.setAttribute("aria-label", `Lock byte ${byte} ${nibble ? "low" : "high"} digit`);
      lock.addEventListener("change", changed);
      label.append(lock); container.append(input, label); digits.append(container);
      inputs[index] = input; locks[index] = lock;
    }
    fieldset.append(digits); $("hex-grid").append(fieldset);
  }
  function bytesFromGrid() {
    if (inputs.some(input => !/^[0-9A-F]$/i.test(input.value))) throw new Error("Fill all 14 boxes with one hex digit each (0–9, A–F).");
    return P.parseHex(inputs.map(input => input.value).join(""));
  }
  function loadBytes(bytes) {
    P.frame(bytes);
    const digits = P.hex(bytes).replace(/ /g, "");
    inputs.forEach((input, index) => { input.value = digits[index]; });
    $("packet-input").value = P.hex(bytes);
  }
  function inspect() {
    const bytes = bytesFromGrid(), f = P.frame(bytes);
    const convention = $("parity-mode").value, expected = P.parity(bytes.slice(0, 6), convention);
    result("inspection", `Device: ${P.hex([f.id])}\nCommand ASCII: ${f.command}\nExtra byte: ${P.hex([f.padding])}\nStage 1 ${convention} parity: expected ${P.hex([expected])}; ${f.check === expected ? "CHECK MATCH" : "CHECK MISMATCH"}\nStages 2–3 CRC-8: expected ${P.hex([f.crc])}; ${f.check === f.crc ? "CHECK MATCH" : "CHECK MISMATCH"}\nArduino state, device-ID acceptance, whitelist, and flags are NOT checked here.`);
    $("packet-output").value = P.hex(bytes);
    $("packet-input").value = P.hex(bytes);
  }
  function safe(action) {
    return () => { try { action(); } catch (error) { result("inspection", error.message, true); } };
  }
  $("decode").addEventListener("click", () => {
    try {
      const bytes = P.parseHex($("hex-input").value);
      $("ascii-input").value = P.printable(bytes);
      result("converter-result", `ASCII: ${P.printable(bytes)}\n${bytes.length} bytes. Nonprintable bytes are ·; keep the original hex for exact data.`);
    } catch (error) { result("converter-result", error.message, true); }
  });
  $("encode").addEventListener("click", () => {
    try {
      const bytes = P.asciiBytes($("ascii-input").value);
      if (!bytes.length) throw new Error("Enter ASCII text first.");
      $("hex-input").value = P.hex(bytes);
      result("converter-result", `${bytes.length} ASCII bytes. This converts your text, not the nonprintable bytes represented by ·.`);
    } catch (error) { result("converter-result", error.message, true); }
  });
  $("load").addEventListener("click", safe(() => { changed(); loadBytes(P.parseHex($("packet-input").value)); inspect(); }));
  $("inspect").addEventListener("click", safe(inspect));
  $("parity-mode").addEventListener("change", changed);
  $("all-lock").addEventListener("click", () => { changed(); locks.forEach(lock => { lock.checked = true; }); });
  $("padding-only").addEventListener("click", () => { changed(); locks.forEach((lock, index) => { lock.checked = index < 10 || index >= 12; }); });
  for (const [id, fn] of [["write-crc", P.crc8], ["write-parity", bytes => P.parity(bytes, $("parity-mode").value)]]) {
    $(id).addEventListener("click", safe(() => { const bytes = bytesFromGrid(); changed(); bytes[6] = fn(bytes.slice(0, 6)); loadBytes(bytes); inspect(); }));
  }
  $("cancel").addEventListener("click", () => cancelSearch());
  $("search").addEventListener("click", async () => {
    cancelSearch();
    const token = generation;
    try {
      const original = bytesFromGrid();
      const iterator = P.searchCandidates(P.hex(original).replace(/ /g, ""), locks.map(lock => lock.checked));
      searching = true; $("search").disabled = true; $("cancel").disabled = false;
      $("packet-output").value = "";
      let tested = 0, total = 0;
      for (const candidate of iterator) {
        if (generation !== token) return;
        tested = candidate.tested; total = candidate.total;
        if (candidate.match) {
          loadBytes(candidate.bytes); inspect();
          result("search-result", `CRC match found after ${tested} of ${total} candidates.\n${P.hex(candidate.bytes)}\nCommand: ${P.frame(candidate.bytes).command}. Check this against your goal; an unchanged packet is not a new collision.\nNo packet was sent. Test the result on your Arduino and record its actual response.`);
          return;
        }
        if (tested % 256 === 0) {
          result("search-result", `Checked ${tested} of ${total} candidates…`);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      result("search-result", `No match in ${tested} candidates. Recheck your target CRC and which payload digits are unlocked. No packet was sent.`);
    } catch (error) { result("search-result", error.message, true); }
    finally {
      if (generation === token) { searching = false; $("search").disabled = false; $("cancel").disabled = true; }
    }
  });
  $("copy").addEventListener("click", async () => {
    const text = $("packet-output").value;
    if (!text) { result("search-result", "Inspect a packet or find a match before copying.", true); return; }
    try { await navigator.clipboard.writeText(text); result("search-result", "Packet copied. Paste into Serial Monitor and send with a newline; the Arduino determines acceptance."); }
    catch (_) { $("packet-output").focus(); $("packet-output").select(); result("search-result", "Clipboard access is unavailable. The packet is selected; copy it manually."); }
  });
})();
