"use strict";
(() => {
  const P = window.Lab08;
  const $ = id => document.getElementById(id);
  const inputs = [], locks = [], searchInputs = [], searchLocks = [];
  function syncFrame() {
    searchInputs.forEach((input, index) => { input.value = inputs[index].value; });
    searchLocks.forEach((lock, index) => { lock.checked = locks[index].checked; });
  }
  let generation = 0, searching = false, session = null;
  function result(id, text, error = false) {
    $(id).textContent = text;
    $(id).classList.toggle("error", error);
  }
  function cancelSearch(message = "Search cancelled. No packet was sent.") {
    generation++;
    if (searching) result("search-result", message);
    session = null;
    searching = false;
    $("search").disabled = false;
    $("next").disabled = true;
    $("cancel").disabled = true;
  }
  function changed() {
    syncFrame();
    cancelSearch("Packet or locks changed; search cancelled.");
    $("packet-output").value = "";
    result("crc-result", "Packet or settings changed. Calculate again.");
    result("inspection", "Packet changed. Inspect it again before copying.");
    result("search-result", "Packet or locks changed. Start a new search; previous matches were cleared.");
  }
  function focusDigit(index, group = inputs) {
    if (index >= 0 && index < group.length) { group[index].focus(); group[index].select(); }
  }
  function createGrid(target, groupInputs, groupLocks) {
  for (let byte = 0; byte < 8; byte++) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "byte" + (byte === 7 ? " check-byte" : "");
    const legend = document.createElement("legend");
    legend.textContent = `${byte}: ${["Device", "Command", "Command", "Command", "Command", "Extra 1", "Extra 2", "Check"][byte]}`;
    fieldset.append(legend);
    const digits = document.createElement("div");
    digits.className = "digits";
    for (let nibble = 0; nibble < 2; nibble++) {
      const index = byte * 2 + nibble;
      const container = document.createElement("div"); container.className = "digit";
      const input = document.createElement("input");
      input.type = "text"; input.maxLength = 1; input.autocomplete = "off"; input.spellcheck = false;
      const location = target === "hex-grid" ? "Message" : "Collision search";
      input.setAttribute("aria-label", `${location} byte ${byte} ${nibble ? "low" : "high"} hex digit`);
      input.addEventListener("focus", () => input.select());
      input.addEventListener("input", () => {
        input.value = input.value.toUpperCase(); inputs[index].value = input.value; changed();
        if (/^[0-9A-F]$/.test(input.value)) focusDigit(index + 1, groupInputs);
      });
      input.addEventListener("keydown", event => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault(); focusDigit(index + (event.key === "ArrowLeft" ? -1 : 1), groupInputs);
        } else if (event.key === "Backspace" && !input.value) {
          event.preventDefault(); focusDigit(index - 1, groupInputs);
        }
      });
      input.addEventListener("paste", event => {
        event.preventDefault();
        const text = event.clipboardData.getData("text").replace(/\s/g, "").toUpperCase();
        if (!/^[0-9A-F]+$/.test(text) || text.length > 16 - index) {
          result("inspection", "Paste hex digits only, with optional spaces, that fit the remaining boxes.", true); return;
        }
        Array.from(text).forEach((digit, offset) => { inputs[index + offset].value = digit; });
        changed();
        focusDigit(Math.min(index + text.length, 15), groupInputs);
      });
      const label = document.createElement("label"); label.textContent = "Lock";
      const lock = document.createElement("input"); lock.type = "checkbox"; lock.checked = false;
      lock.setAttribute("aria-label", `${location} lock byte ${byte} ${nibble ? "low" : "high"} digit`);
      lock.addEventListener("change", () => { locks[index].checked = lock.checked; changed(); });
      label.append(lock); container.append(input, label); digits.append(container);
      groupInputs[index] = input; groupLocks[index] = lock;
    }
    fieldset.append(digits); $(target).append(fieldset);
  }
  }
  createGrid("hex-grid", inputs, locks);
  createGrid("search-hex-grid", searchInputs, searchLocks);
  syncFrame();
  function bytesFromGrid() {
    if (inputs.some(input => !/^[0-9A-F]$/i.test(input.value))) throw new Error("Fill all 16 boxes with one hex digit each (0–9, A–F).");
    return P.parseHex(inputs.map(input => input.value).join(""));
  }
  function loadBytes(bytes) {
    P.frame(bytes);
    result("crc-result", "Packet loaded. Calculate again with the current CRC parameters.");
    const digits = P.hex(bytes).replace(/ /g, "");
    inputs.forEach((input, index) => { input.value = digits[index]; });
    syncFrame();
    $("packet-input").value = P.hex(bytes);
  }
  function inspect() {
    const bytes = bytesFromGrid(), f = P.frame(bytes);
    result("inspection", `Device: ${P.hex([f.id])}\nCommand ASCII: ${f.command}\nExtra bytes: ${P.hex(f.extras)}\nAttached check: ${P.hex([f.check])}`);
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
  function crcParameters() {
    const hexField = id => {
      const text = $(id).value.trim();
      if (!/^(?:0x)?[0-9a-f]{1,2}$/i.test(text)) throw new Error("Enter one hex byte for Polynomial, Initial Value and Final Xor Value.");
      return parseInt(text.replace(/^0x/i, ""), 16);
    };
    if (!["true", "false"].includes($("crc-refin").value) || !["true", "false"].includes($("crc-refout").value))
      throw new Error("Choose Input reflected and Result reflected explicitly.");
    return P.parameters({refin: $("crc-refin").value === "true", refout: $("crc-refout").value === "true",
      poly: hexField("crc-poly"), init: hexField("crc-init"), xorout: hexField("crc-xorout")});
  }
  for (const id of ["crc-refin", "crc-refout", "crc-poly", "crc-init", "crc-xorout"])
    $(id).addEventListener(id.startsWith("crc-ref") ? "change" : "input", changed);
  $("all-lock").addEventListener("click", () => { locks.forEach(lock => { lock.checked = true; }); changed(); });
  $("all-unlock").addEventListener("click", () => { locks.forEach(lock => { lock.checked = false; }); changed(); });
  $("padding-only").addEventListener("click", () => { locks.forEach((lock, index) => { lock.checked = index < 10 || index >= 14; }); changed(); });
  $("calculate-crc").addEventListener("click", () => {
    try {
      const bytes = bytesFromGrid(), value = P.crc8(bytes.slice(0, 7), crcParameters());
      result("crc-result", `CRC: ${P.hex([value])}\nCovers bytes 0–6. Attached check: ${P.hex([bytes[7]])}; ${value === bytes[7] ? "CHECK MATCH" : "CHECK MISMATCH"}.\nPacket unchanged. Enter the calculated byte manually if you intend to replace its check.`);
    } catch (error) { result("crc-result", error.message, true); }
  });
  $("cancel").addEventListener("click", () => cancelSearch());
  async function findNext(restart) {
    if (searching) return;
    if (restart) cancelSearch();
    const token = generation;
    try {
      if (!session) {
        const original = bytesFromGrid();
        session = {iterator: P.searchCandidates(P.hex(original), locks.map(lock => lock.checked), crcParameters()), matches: [], index: -1, done: false};
      }
      const current = session;
      searching = true; $("search").disabled = true; $("next").disabled = true; $("cancel").disabled = false;
      $("packet-output").value = "";
      if (!current.done) {
        while (true) {
          if (generation !== token) return;
          const step = current.iterator.next();
          if (step.done) { current.done = true; current.index = 0; break; }
          const candidate = step.value;
          current.tested = candidate.tested;
          if (candidate.match) {
            current.matches.push(candidate); current.index = current.matches.length - 1;
            break;
          }
          if (candidate.tested % 256 === 0) {
            result("search-result", `Checked ${candidate.tested} of ${candidate.total} candidates… Starting packet excluded.`);
            await new Promise(resolve => setTimeout(resolve, 0));
            if (generation !== token) return;
          }
        }
        if (!current.matches.length) {
          current.done = true;
          result("search-result", `No different matching packet in ${current.tested} candidates. The starting packet is excluded. Unlock more payload digits or recheck your target CRC. No packet was sent.`);
          session = null;
          return;
        }
        if (current.done) current.index = 0;
      } else {
        current.index = (current.index + 1) % current.matches.length;
      }
      const candidate = current.matches[current.index];
      loadBytes(candidate.bytes); inspect();
      result("search-result", `Collision ${current.index + 1}${current.done ? ` of ${current.matches.length}; cycling all matches` : "; use Next collision for another"}. Found at candidate ${candidate.tested} of ${candidate.total}.\n${P.hex(candidate.bytes)}\nThe starting packet is excluded. Locked digits are unchanged.\nNo packet was sent. Test the result on your Arduino and record its actual response.`);
    } catch (error) { session = null; result("search-result", error.message, true); }
    finally {
      if (generation === token) { searching = false; $("search").disabled = false; $("next").disabled = !session || !session.matches.length; $("cancel").disabled = true; }
    }
  }
  $("search").addEventListener("click", () => findNext(!session));
  $("next").addEventListener("click", () => findNext(false));
  $("copy").addEventListener("click", async () => {
    const text = $("packet-output").value;
    if (!text) { result("search-result", "Inspect a packet or find a match before copying.", true); return; }
    try { await navigator.clipboard.writeText(text); result("search-result", "Packet copied. Paste into Serial Monitor and send with a newline; the Arduino determines acceptance."); }
    catch (_) { $("packet-output").focus(); $("packet-output").select(); result("search-result", "Clipboard access is unavailable. The packet is selected; copy it manually."); }
  });
})();
