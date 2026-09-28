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
| Hugging Face object keys and checkpoint filenames | Preserve every archived object beneath the renamed bucket |

Use the original source revision and configuration associated with a checkpoint. Do not edit its stored provenance to make it appear to originate from the renaming commit. New documentation uses FReCS-Net; historical records retain the names under which the experiments ran.

See [results and evaluation limits](PAPER_RESULTS.md) and [FSDR compatibility](FSDR.md).

## Hugging Face archive

The experiment archive is now [razaxq/FReCS-Net](https://huggingface.co/buckets/razaxq/FReCS-Net), addressed as `hf://buckets/razaxq/FReCS-Net/`. The original bucket was renamed in place; its public visibility and internal identity are unchanged. Every object path, byte size and Xet content hash was compared before and after the rename and matched.

For historical records containing `hf://buckets/razaxq/BetterLViT/<object-key>`, use `hf://buckets/razaxq/FReCS-Net/<object-key>` with the same object key. For example, the retained J3 seed-2027 Best remains under `38b54196/models/best_model-BetterLViT.pth.tar`. Original manifests and receipts preserve the address at the time of the experiment; they are not rewritten. The rename does not make every archived checkpoint the final model: use the configuration, original source revision and checksum associated with each experiment.
