"use strict";
const select = document.getElementById("station");
const input = document.getElementById("key");
const status = document.getElementById("status");
const result = document.getElementById("result");
const button = document.getElementById("decrypt");
const message = document.getElementById("message");
let revision = 0;
function resetResult() {
  revision += 1;
  result.hidden = true;
  message.textContent = "";
  status.textContent = "";
}
function showStation() {
  resetResult();
  input.value = "";
  const station = LAB05_CHALLENGES.stations.find((entry) => entry.id === select.value);
  document.getElementById("recipe-panel").hidden = !station;
  document.getElementById("recipe").textContent = station ? station.recipe : "";
  document.getElementById("ciphertext").textContent = station ? station.ciphertext : "";
}
select.addEventListener("change", showStation);
showStation();
input.addEventListener("input", resetResult);
document.getElementById("decrypt-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  resetResult();
  if (!globalThis.crypto || !crypto.subtle) {
    status.textContent = "Open this page through the course HTTPS site or a localhost preview to enable decryption.";
    return;
  }
  const station = LAB05_CHALLENGES.stations.find((entry) => entry.id === select.value);
  if (!station || !Lab5CTFCrypto.normalizeKey(input.value)) {
    status.textContent = "Choose a station and enter your measurement key.";
    return;
  }
  const currentRevision = revision;
  button.disabled = true;
  status.textContent = "Decrypting…";
  try {
    const plaintext = await Lab5CTFCrypto.decrypt(station, input.value);
    if (currentRevision !== revision) return;
    message.textContent = plaintext;
    result.hidden = false;
    status.textContent = "Decryption complete.";
  } catch (error) {
    if (currentRevision === revision) {
      status.textContent = "Decryption could not run. Reload the page and try again.";
    }
  } finally {
    button.disabled = false;
  }
});
document.getElementById("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(message.textContent);
    status.textContent = "Message copied.";
  } catch (error) {
    status.textContent = "Select the recovered message and copy it manually.";
  }
});
document.getElementById("copy-ciphertext").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(document.getElementById("ciphertext").textContent);
    status.textContent = "Ciphertext copied.";
  } catch (error) {
    status.textContent = "Select the ciphertext and copy it manually.";
  }
});
