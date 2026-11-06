# Facilities Security — Backup Communications Acceptance Test

## Assignment brief

Report FS-BC-026 | Dataset DC10-CELL-02 | Issued November 5, 2026

To: Security Engineering | From: Facilities Communications

During a recent wired Internet outage, several security alerts reached the monitoring center late. Facilities must install a cellular backup gateway for intrusion, forced-door and tamper alerts. Management favors the security office because its signal-strength reading looks strongest. Review the acceptance-test evidence and recommend where to install the gateway antenna.

This packet is simulated evidence for analysis, not a record of an actual workplace incident or live measurements collected by your team.

## Test conditions

Three identical gateways with the same firmware, carrier service and antenna type were tested simultaneously at A (security office), B (equipment room) and C (upper-floor window). Each unit used cellular service for the entire test. Wired connectivity did not carry the test messages.

The test ran from November 2, 2026 at 00:00 through November 4 at 23:50: one scheduled message every 10 minutes, 432 per location and 1,296 total. All timestamps use the same local clock, MST (UTC−07:00). The file is grouped by location and then time. Each unit kept its log locally even when an acknowledgement did not arrive. Actual security alerts would be sent when an event occurs; the ten-minute interval applies only to this acceptance test.

Each message carried a unique ID. ACK means the monitoring center acknowledged that ID within the 60-second observation window; ack_delay_s is elapsed time measured by the gateway. TIMEOUT means no matching acknowledgement was observed within 60 seconds. Its blank delay is unknown, not zero. A timeout does not establish whether the outgoing message or its acknowledgement was lost, or whether it arrived later.

## Acceptance requirements

- At least 99.0% of the 432 scheduled messages at a location must be acknowledged within 10.00 seconds, inclusive.
- There must be no two consecutive failed tests at that location. A failed test is a late ACK (over 10.00 seconds) or a TIMEOUT.
- Both requirements must be met. These are this organization's acceptance requirements, not universal cellular thresholds. Do not round a percentage before deciding whether it passes.

## Operations notes

- Loading-dock activity and nearby electrical equipment usually increase between 14:00 and 15:00 each day. No controlled on/off experiment was recorded.
- A routine gateway-management job was scheduled for November 3 between 11:00 and 12:00. Per-device completion logs were not retained.
- No confirmed interference incident or transmitter identification was recorded. These notes are leads to investigate, not established causes.

## Attached evidence

- [Message log (CSV)](lab-10-cellular-log.csv): all 1,296 scheduled tests, including failures.
- [Engineering diagnostic appendix (CSV)](lab-10-cellular-diagnostics.csv): compatible wanted, interference and noise powers for three selected records.

| Column | Meaning |
| --- | --- |
| timestamp_local | Scheduled test time in MST (UTC−07:00) |
| location_id / location_name | Candidate antenna placement, A, B or C |
| message_id | Unique scheduled message ID, also used in the diagnostic appendix |
| rsrp_dbm | Reported reference-signal received power; dBm is relative to 1 mW |
| rsrq_db | Reported reference-signal received quality; a bandwidth-adjusted ratio involving reference and total received power |
| sinr_db | Reported wanted-to-interference-plus-noise ratio, in dB |
| ack_delay_s | Time to matching acknowledgement, in seconds; blank for a timeout |
| delivery_status | ACK or TIMEOUT, using the 60-second observation window |

RSRP answers a power question; RSRQ and SINR answer different quality questions. For comparable readings here, larger values are stronger or better. Downlink radio readings do not directly measure alert delivery in the other direction. Use the acknowledgement results to assess the complete round trip. Neither poor quality nor a missed acknowledgement establishes a deliberate attack. The RTL-SDR activity does not provide these cellular metrics.

## Engineering diagnostic appendix

These three reference-resource power budgets use compatible resources, time windows and pW units for wanted signal S, interference I and noise N. Do not mix them with total-band RSSI or an arbitrary spectrum peak. You do not need to calculate RSRP or RSRQ. Calculate SINR = S / (I + N), then SINR_dB = 10 log10(SINR). Keep the unrounded ratio for the logarithm; round only the displayed answers. Compare with the matching message's reported SINR; allow for rounding.

| Case | Message ID | Location / time (MST) | S (pW) | I (pW) | N (pW) |
| --- | --- | --- | --- | --- | --- |
| D1 | A-0086 | A / Nov 2, 14:10 | 32 | 80 | 16 |
| D2 | B-0203 | B / Nov 3, 09:40 | 0.64 | 0.048 | 0.016 |
| D3 | C-0213 | C / Nov 3, 11:20 | 0.125 | 0.002 | 0.0005 |

## Analysis worksheet instructions

Allow about 2 minutes to read the brief, 8 minutes to calculate, 4 minutes to graph and 6 minutes to decide and record your evidence. Import the CSV with its header row into Excel; do not type the records manually. Keep columns A–I in their supplied order. Use the full file, not only the previewed rows. If your Excel locale requires semicolons, replace formula argument commas with semicolons.

### Check delivery

Add J1 = on_time and enter this in J2: `=IF(AND(I2="ACK",ISNUMBER(H2),H2<=10),1,0)`. Fill down through J1297. One means on time; zero means a failed test. A blank timeout delay must never count as a fast acknowledgement.

Add K1 = failure_run and enter this in K2: `=IF(J2=1,0,IF(B2=B1,K1+1,1))`. Fill down through K1297 without changing the location/time order. This counts consecutive failed scheduled tests and resets at a success or a new location. A late ACK and a timeout both extend the run. If you sort the file, restore location then timestamp order before using this formula.

For location A's test count use `=COUNTIF(B2:B1297,"A")`. For its on-time fraction use `=COUNTIFS(B2:B1297,"A",J2:J1297,1)/COUNTIF(B2:B1297,"A")` and format as a percentage with two decimal places. Substitute B or C for the other locations.

The data rows are A: 2–433, B: 434–865 and C: 866–1297. For A's longest failure run use `=MAX(K2:K433)`. For its typical power use `=MEDIAN(E2:E433)` and typical SINR use `=MEDIAN(G2:G433)`; use the corresponding ranges for B and C. A median describes the middle reported value, not an average linear power. Also inspect RSRQ near the failures. Record results in Table 3 and apply both acceptance requirements.

### Verify SINR and make one plot

Open the diagnostic CSV separately. Its signal, interference and noise powers are in columns E, F and G. In H2 enter `=10*LOG10(E2/(F2+G2))` and fill through H4. Record each case's linear ratio and dB result to two decimal places.

Make one line chart with time on the horizontal axis and reported SINR (dB) on the vertical axis. Use the 432 A timestamps in A2:A433 for the time axis, and three series from G2:G433, G434:G865 and G866:G1297. The B and C records have the same scheduled times as A. Label each series by location and retain all three days. Include the chart and a readable summary of your delivery calculations as evidence.

### Send your recommendation

Recommend a location, state whether each candidate meets both requirements, and support your choice with delivery counts, failure patterns and radio readings. Explain one case in which good-looking radio readings do not establish dependable alert delivery. Assess whether the evidence establishes deliberate interference, give one alternative explanation and propose one follow-up test. Ten-minute sampling identifies runs of failed tests, not the exact start, duration or end of a communications outage.
