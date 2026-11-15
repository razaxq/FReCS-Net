# FReCS-Net project and checkpoint names

**FReCS-Net** stands for **Frequency Refinement and Evidence Consistency Segmentation Network**. It is an LViT-based text-guided chest X-ray infection segmentation network that combines FSDR and RACE. Its repository is [razaxq/FReCS-Net](https://github.com/razaxq/FReCS-Net).

- **FSDR** remains Frequency-aware Semantic–Detail Refinement.
- **RACE** remains Report-Anatomy Consistency and Evidence Fusion. Routing and binding-repaired auxiliary supervision are evaluated together as one module.
- Comparison figures retain the label **ours** for the combined model.
- The name describes the two studied mechanisms; it does not establish clinical reliability, report-error detection, or an independently validated benefit for every internal operation.

## Training and evaluation

The Python model is `nets.frecs_net.FReCSNet`. The configured model name and output directory are `FReCS-Net`. Training and evaluation use the `FRECSNET_*` settings shown in the [training guide](../README.md#训练模型). The experiment profile controls the text encoder, decoder and supervision settings.

New runs write `best_model-FReCS-Net.pth.tar` and `last_model-FReCS-Net.pth.tar`. Use `--checkpoint` to pass an explicit weight file to the evaluator. For historical experiments, use the recorded source revision, environment and launch commands. The upstream [LViT](https://github.com/HUANGLIZI/LViT) attribution and the [FSDR tensor names](FSDR.md) apply throughout.

## Archived weights and results

Use the model index for the experiment to identify its source commit, seed and checkpoint SHA-256. Where the index gives an `hf_prefix`, open that directory in the [Hugging Face archive](https://huggingface.co/buckets/razaxq/FReCS-Net) and select the Best weight by its checksum. Pass its downloaded path to the evaluation command for that revision.

The published result tables use paths relative to the original local workspace and placeholders for machine-specific directories. `{run_checkout}` is the checkout for that run, `{model_directory}` is its output subdirectory under `Covid19`, `{hf_cache}` is the Hugging Face cache root, and `best_model-*.pth.tar` identifies the Best weight by filename pattern. Consult the [import receipts](results/IMPORT_PROVENANCE.json) for the original revision and file checksums. See [paper results](PAPER_RESULTS.md) for evaluation details.
