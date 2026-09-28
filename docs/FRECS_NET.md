# FReCS-Net: project name and compatibility

**FReCS-Net** stands for **Frequency Refinement and Evidence Consistency Segmentation Network**. It is an LViT-based text-guided chest X-ray infection segmentation network that combines FSDR and RACE. Its repository is [razaxq/FReCS-Net](https://github.com/razaxq/FReCS-Net).

- **FSDR** remains Frequency-aware Semantic–Detail Refinement.
- **RACE** remains Report-Anatomy Consistency and Evidence Fusion. Routing and binding-repaired auxiliary supervision are evaluated together as one module.
- Comparison figures retain the label **ours** for the combined model.
- The name describes the two studied mechanisms; it does not establish clinical reliability, report-error detection, or an independently validated benefit for every internal operation.

## Existing experiments remain reproducible

FReCS-Net replaces BetterLViT as the public project/model name. This is a naming and documentation change, not a new architecture or experiment. The implementation remains based on [LViT](https://github.com/HUANGLIZI/LViT), with its attribution and licence retained.

The following existing identifiers are intentionally unchanged:

| Identifier | Reason |
|---|---|
| `nets/BetterLViT.py`, class `BetterLViT`, configured model identifier | Preserve import paths, configuration validation and checkpoint loading |
| `BETTERLVIT_*` environment variables | Preserve existing training and evaluation commands |
| `best_model-BetterLViT.pth.tar`, `last_model-BetterLViT.pth.tar`, recorded output directories | Keep saved checkpoints and scripts usable without renaming |
| `eppa_*`, `up*.eppa.*`, historical architecture/profile names | Preserve tensor names, parameter shapes and experiment identity |
| Original commits, experiment tags, logs, hashes and archived result files | Preserve provenance; historical snapshots are not rewritten as new experiments |
| Historical Hugging Face archive names and object keys | Preserve the actual locations of saved models |

Use the original source revision and configuration associated with a checkpoint. Do not edit its stored provenance to make it appear to originate from the renaming commit. New documentation uses FReCS-Net; historical records retain the names under which the experiments ran.

See [results and evaluation limits](PAPER_RESULTS.md) and [FSDR compatibility](FSDR.md).
