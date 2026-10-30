# FReCS-Net 15-minute defence preparation

Prepared on 30 October 2026 against the authoritative thesis PDF compiled on 28 October 2026 (108 pages). The PDF source SHA-256 is recorded in `source_manifest.json`. The existing thesis and presentation were read without modification.

The preparation PDF contains a 13-slide, 14:20 outline with 40 seconds of buffer, 1,503 words of English rehearsal material, Chinese visual and recall prompts, and 20 oral Q&A examples. The supplied assessment email specifies 15 minutes plus 5 minutes of Q&A, no reading out the presentation, and no electronic aids during Q&A; it does not supply rubric categories or weights. Rehearsal targets are estimates and must be checked against the student's own timed delivery. The PDF is practice material, not material to consult during Q&A.

The main narrative uses the single-cycle cosine matched ablation. It adds the latest thesis analyses of errors, small lesions, text interventions and computational cost. Warm restarts remain a separate oral preparation topic. The left/right reorder result is limited to the recognised region-preserving subset. Seven unparsed side swaps in the thesis need separate treatment before broader interpretation. Three-seed SD and patient-bootstrap uncertainty remain distinct.

## Rebuild

Run `build_prep.py` with the Codex bundled Python dependencies, including reportlab, pypdf and pypdfium2. It reads `content.json` and `source_manifest.json` next to the script, writes the PDF into `output/`, and renders all pages into `render/` for visual inspection. Windows Calibri and SimSun fonts are used. Set `FRECS_PREP_WORK` to use a different working directory containing the same inputs. The render and text extracts are private QA intermediates and are not needed to use the delivered PDF.

The source manifest identifies the thesis snapshot. It does not package the whole thesis. English rehearsal paragraphs and Q&A answers are illustrative and should be learned as explanations, not memorised verbatim. The older 24-slide PowerPoint has not been changed by this preparation task.
