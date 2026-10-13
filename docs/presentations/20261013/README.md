# FSDR / RACE defence revision — 13 October 2026

This revision starts from the user's actual 23-slide `FSDR_RACE_20260922.pptx`, rather than the earlier 21-slide archived export. The original is retained as `source_20260922_user.pptx` (SHA-256 `13cb1f714b8e8a68d915ef6135d5f7f8d81e3562b169bd3c1133e12eeafb25d4`).

## Contents

- `FSDR_RACE_defence_20261013.pptx`: revised 24-slide deck, including 15 main/Q&A slides and 9 backup slides.
- `build.mjs`: import and editing source, including native architecture diagrams, native tables, an editable chart and bilingual speaker notes.
- `verify_final.mjs`: renders the exact finalized PPTX and compares it with the visually reviewed authoring preview.
- `assets/`: original images, masks and existing error-overlay figures. The presentation uses native image crops for detail views; predictions are not modified.
- `evidence/`: primary and external result snapshots, qualitative provenance, source slide contents and exact paired dataset descriptions.
- `speaker_notes.json`: slide-level bilingual notes and source pointers.
- `manifest.json`: content hashes and evidence boundaries.

## Presentation changes

The main flow is task → contributions → LViT placement → PLAM/FSDR fusion → FSDR detail → RACE → matched protocol → results → paired-seed chart → external context → two qualitative cases → conclusions. The two thesis table-of-contents screenshots are removed. Architectures use short labels and native objects on a white background. Adaptive filter details are in the backup.

Main tables show two decimal places. The chart contains all three seeds for three principal contrasts, with six-decimal chart values for Excel portability and two-decimal labels. Four-decimal runs and all five paired contrasts remain in the backup. The original unrounded measurements remain in the source JSON.

C07 illustrates reduced false negatives. G18 explicitly retains the lower IoU of the combined checkpoint relative to PLAM + RACE. The selected qualitative models use different seeds (J0/J2 = 3407, J1/J3 = 2027); these are illustrative cases, not paired-seed causal comparisons. Green/red/blue indicate TP/FP/FN.

No new training or model evaluation was performed. All headline scores remain from the completed single-cycle cosine Test study. Complete RACE includes auxiliary training; the existing single-seed routing diagnosis and its interval crossing zero are retained. DD-CMD's slightly higher external result and the retrospective Test/split-audit limitations remain disclosed.

## Rebuild

Requires the Codex bundled Node runtime with `@oai/artifact-tool` 2.8.93, its Python dependencies, and the presentation skill bundle `26.1011.11113`. Set `CODEX_DEPENDENCIES` and `PRESENTATIONS_SKILL` if installed elsewhere. Run `node build.mjs` with that bundled Node executable. `PPT_BUILD_ROOT` sets the private working directory; `PPT_OUTPUT_NAME` sets a new final filename. The finalizer intentionally refuses to overwrite an existing final output.

On this host, use the C: NTFS volume for `PPT_BUILD_ROOT`. D: did not expose the finalizer's temporary hard-linked files as ordinary readable files. The finalized PPTX can be copied to D: unchanged after validation. The original input is never overwritten.

The packaged finalizer validates package structure, geometry, fonts, native tables, chart workbook data and re-import. `node verify_final.mjs [final.pptx]` renders every finalized slide. Visual verification is separate from native Microsoft PowerPoint execution; no native PowerPoint execution is claimed.
