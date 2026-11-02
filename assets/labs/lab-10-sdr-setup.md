# SDR++ Setup for macOS and Windows

## Before you start

Use SDR++ for the local RTL-SDR receiver. WebSDR runs separately in your browser and needs no installation or USB receiver. Install SDR++ before lab; there are only two shared dongles. Without one, you can check that the application opens, then finish the hardware checks during your assigned turn.

Use the [official SDR++ download page](https://www.sdrpp.org/) and its [nightly release assets](https://github.com/AlexandreRouma/SDRPlusPlus/releases/tag/nightly). The package names below were checked November 1, 2026. Keep the extracted files together. Do not download the source-code ZIP. The instructor should retain one tested build for both shared computers rather than update during lab.

## macOS

### 1. Choose the correct download

Open Apple menu → About This Mac. If it lists an Apple chip, choose `sdrpp_macos_arm.zip`. If it lists an Intel processor, choose `sdrpp_macos_intel.zip`. A USB-C Mac also needs a USB adapter or hub that supports data.

### 2. Install and open

Double-click the ZIP in Downloads, then drag `SDR++.app` to Applications. Open it from Applications. Use the app bundle; you do not need to compile SDR++.

If macOS blocks this downloaded app, first check that it came from the official project. After attempting to open it, go to System Settings → Privacy & Security and use the per-app Open Anyway option if available. Confirm the app you are opening. Do not turn off Gatekeeper globally. See [Apple’s instructions for downloaded apps](https://support.apple.com/en-us/102445).

The current project instructions recommend the app bundle. The older PDF manual mentions a `zstd` dependency. If your particular build reports a missing `zstd` library, use [Homebrew’s official installation instructions](https://brew.sh/) and then run `brew install zstd` in Terminal. Do not install an entire development toolchain just to run the bundle. If a different library is missing, save the exact error and ask the instructor to use the tested build.

### 3. Connect the receiver

Connect the antenna to the V3’s SMA socket, then connect the dongle to USB. Open SDR++. macOS does not use Zadig or the Windows WinUSB setup. Continue with First reception below.

## Windows 10 or 11

### 1. Download and extract

On a standard Intel/AMD 64-bit Windows computer, download `sdrpp_windows_x64.zip`. In File Explorer, choose Extract All and extract to a writable folder, such as Documents → SDRPP. Open `sdrpp.exe` from the extracted folder, not from inside the ZIP. Keep all accompanying DLLs and folders with it. ARM-based Windows computers need a separate compatibility check; use a prepared lab computer if necessary.

### 2. Set up the dongle’s USB driver

Close SDR++ and any other SDR program. Plug the RTL-SDR into USB. Download Zadig from [its official site](https://zadig.akeo.ie/) and run it as administrator. This requires administrator rights; complete it before lab or use the prepared receiver computer.

In Zadig, choose Options → List All Devices. Select the RTL-SDR’s **Bulk-In, Interface (Interface 0)** entry. It may instead be called RTL2832U or RTL2832UHIDIR. The manufacturer’s guide lists the usual USB ID as `0BDA 2838 00`. Confirm the entry belongs to the dongle by unplugging/replugging it and checking which entry disappears/reappears. Use Interface 0, not Interface 1.

Check that the target driver on the right is **WinUSB**, then choose Install Driver or Replace Driver. Do not replace a keyboard, mouse, hub or unrelated device’s driver. If you cannot positively identify the receiver, stop and use the instructor’s prepared computer. Follow the [manufacturer’s driver steps](https://www.rtl-sdr.com/rtl-sdr-quick-start-guide/) rather than installing the bundled television-viewing software. No SDR# installation is required for this SDR++ activity.

### 3. Connect the receiver

Connect its antenna, reopen SDR++, and continue below. If driver installation is blocked by your computer’s policy, use the prepared receiver computer rather than changing its system-wide protections.

## First reception — both platforms

### 1. Select your source

Open the left menu if hidden. Expand Source, choose **RTL-SDR**, click Refresh and select the assigned dongle. Only one application can use that USB receiver at a time. Leave **Bias-T off** with the passive antenna.

### 2. Check normal reception, then prepare AM

For the instructor’s initial hardware check, use normal Quadrature sampling on a known local FM broadcast in the 88–108 MHz band and select WFM. Start with a 2.4 MS/s sample rate and moderate tuner gain, then press Play. Enter the actual known station frequency in the large frequency display at the top and increase volume gradually. This only checks that the dongle, antenna and audio work; the lab comparison uses AM.

Stop reception before changing source settings. For an **RTL-SDR Blog V3** with a conventional driver, choose **Direct Sampling → Q branch** for AM broadcast reception below about 2 MHz. Some builds label it Q input. The current RTL-SDR Blog driver can switch to direct sampling automatically below 28.8 MHz; use the instructor-tested setting for the installed driver. Direct sampling selects how the signal reaches the ADC; AM is still selected separately in Radio. See the [V3 feature guide](https://www.rtl-sdr.com/rtl-sdr-blog-v-3-dongles-user-guide/). These instructions are for the lab’s V3, not a V4.

### 3. Tune and listen to AM

Enter the assigned AM frequency in the top frequency display. SDR++ uses Hz: `1000 kHz = 1,000,000 Hz` and `1 MHz = 1,000,000 Hz`. Select **AM**, start with a **10 kHz filter width**, leave squelch off, press Play, and gradually raise audio volume. Keep the prepared source gain settings; tuner gain may be unavailable in direct sampling.

The spectrum shows signal level versus frequency. The waterfall shows how that changes over time. Zoom around the carrier to see its sidebands, and keep the frequency axis visible in screenshots. The selected receiver filter width is not the transmitted signal’s measured width. SDR++ levels are usually dBFS, not calibrated dBm.

### 4. Open the remote receiver

Use the instructor’s tested WebSDR bookmark. A candidate is [Northern Utah WebSDR](https://www.sdrutah.org/): choose WebSDR1 → AM Broadcast on its landing page. Your instructor will supply a tested bookmark to the receiver itself. Confirm the receiver location, choose AM, enter the assigned frequency in the page’s displayed units (often kHz), enable browser audio if prompted, and adjust its filter near 10 kHz if supported. You do not connect the USB dongle to WebSDR.

The two receivers can hear the same station, different stations, or too little signal to decide. Record the evidence. Internet audio buffering can produce a delay; do not interpret it as radio propagation time.

## If something does not work

| Symptom | What to try |
| --- | --- |
| App opens but no RTL-SDR appears | Reconnect the dongle, use a data-capable USB adapter, close other SDR apps, click Refresh; on Windows check the Interface 0 WinUSB driver. |
| Device is busy | Stop and close the other receiver application, including another copy of SDR++. |
| Spectrum moves but audio is silent | Check Play, AM/WFM choice, selected frequency, mute, output device, volume and squelch; WebSDR may require a browser audio click. |
| FM works but AM is weak or absent | Check V3 Q/direct sampling, tune units, AM mode and antenna. A short dipole may receive AM poorly; use the instructor’s tested receiving antenna/location. |
| RF gain is unavailable on AM | This can be normal in direct sampling. Keep the prepared settings; gain adjustment is not a required task. |
| Remote page fails or is full | Use the instructor’s alternate bookmarked receiver or labeled supplied captures. Record the failure rather than wait through your turn. |
| Mac reports a damaged app or missing library | Re-download the correct architecture from the official project; save the exact error. Use the tested lab computer if unresolved; do not disable system-wide security settings. |

## Finish

Stop SDR++ before unplugging the dongle. Restore the assigned AM frequency and settings, close your WebSDR tab, and return the receiver and headphones.
