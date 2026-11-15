#!/usr/bin/env bash
# Explicit frozen repositories only. No Test evaluation or automatic extension.
set -euo pipefail
c4_repo="${1:?C4 repository required}"
p9_repo="${2:?P9 repository required}"
output="${3:?New output directory required}"
python_bin="${FRECSNET_PYTHON:-python}"
test ! -e "$output"
mkdir -p "$output"
exec 9>/root/frecsnet_race_pe.lock
flock -n 9
trap 'printf "failed\n" > "$output/chain.status"' ERR
export HF_HOME="${HF_HOME:-${XDG_CACHE_HOME:-$HOME/.cache}/huggingface}"
export HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1 TOKENIZERS_PARALLELISM=false
export CUBLAS_WORKSPACE_CONFIG=:4096:8 PYTHONHASHSEED=1219
export FRECSNET_SEED=1219 FRECSNET_EPOCHS=80 FRECSNET_BATCH_SIZE=16
export FRECSNET_TRAIN_DROP_LAST=1 FRECSNET_NUM_WORKERS=4
export FRECSNET_DETERMINISTIC=1 FRECSNET_CUDNN_ENABLED=1 FRECSNET_VIS_FREQUENCY=100000
export AUTO_TEST_EVALUATE=0 AUTO_EVALUATE=0 TEST_SPLIT_ALLOWED=0
for arm in c4 p9; do
    if [ "$arm" = c4 ]; then
        repo="$c4_repo"; profile=c4_race_pe_control
    else
        repo="$p9_repo"; profile=p9_race_pe
    fi
    export FRECSNET_EXPERIMENT="$profile"
    export FRECSNET_GIT_COMMIT
    FRECSNET_GIT_COMMIT=$(git -C "$repo" rev-parse HEAD)
    test -z "$(git -C "$repo" status --porcelain --untracked-files=no)"
    "$python_bin" -c 'import json,sys; d=json.load(open(sys.argv[1])); assert d["profile"]==sys.argv[2] and d["epochs"]==80 and d["test_split_allowed"] is False' "$repo/experiment_manifests/active_race_pe.json" "$profile"
    printf '%s %s\n' "$profile" "$FRECSNET_GIT_COMMIT" >> "$output/provenance.txt"
    printf '%s_training\n' "$arm" > "$output/chain.status"
    (cd "$repo" && "$python_bin" train_model.py) > "$output/${arm}_train.log" 2>&1
    printf '%s_exporting\n' "$arm" > "$output/chain.status"
    checkpoint=$(find "$repo/Covid19/FReCS-Net/$profile" -type f -name 'best_model-FReCS-Net.pth.tar' -print)
    test -f "$checkpoint"
    (cd "$repo" && "$python_bin" tools/export_validation_metrics.py --experiment "$profile" \
        --checkpoint "$checkpoint" --output "$output/${arm}_validation.json" --batch-size 16 --threshold 0.5) \
        > "$output/${arm}_export.log" 2>&1
done
printf 'comparing\n' > "$output/chain.status"
(cd "$p9_repo" && "$python_bin" tools/compare_race_pe.py --control "$output/c4_validation.json" \
    --candidate "$output/p9_validation.json" --output "$output/c4_vs_p9.json" --seed 1219) \
    > "$output/compare.log" 2>&1
printf 'complete\n' > "$output/chain.status"
