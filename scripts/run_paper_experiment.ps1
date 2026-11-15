param(
    [Parameter(Mandatory = $true)]
    [ValidateSet(
        'b0_baseline',
        'a0_lora',
        'a1_lora_focal',
        'a2_lora_freq',
        'a3_lora_fmiseg',
        'a4_lora_freq_focal',
        'a9_frozen_freq_focal'
    )]
    [string]$Experiment,
    [int]$Seed = 1219,
    [ValidateRange(1, 10000)]
    [int]$Epochs = 100,
    [ValidateRange(1, 64)]
    [int]$BatchSize = 2,
    [string]$ResumePath = ''
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$python = if ($env:FRECSNET_PYTHON) { $env:FRECSNET_PYTHON } else { Join-Path $repoRoot '.venv\Scripts\python.exe' }

if (-not (Test-Path -LiteralPath $python)) {
    throw "Local AMD environment not found: $python"
}

$existing = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -match '^python(\.exe)?$' -and
    $_.CommandLine -match 'train_model\.py'
}
if ($existing) {
    $details = ($existing | ForEach-Object {
        "PID=$($_.ProcessId) $($_.CommandLine)"
    }) -join [Environment]::NewLine
    throw "A training process is already running:`n$details"
}

$env:FRECSNET_EXPERIMENT = $Experiment
$env:FRECSNET_SEED = [string]$Seed
$env:FRECSNET_EPOCHS = [string]$Epochs
$env:FRECSNET_BATCH_SIZE = [string]$BatchSize
$env:FRECSNET_VIS_FREQUENCY = '100000'
$env:HF_HUB_OFFLINE = '1'
$env:TRANSFORMERS_OFFLINE = '1'
$env:TOKENIZERS_PARALLELISM = 'false'
# MIOpen FAST uses FindDb/immediate fallback instead of benchmarking every
# solver at each fresh process start. This avoids multi-minute CPU-only first
# batches and the unstable exhaustive-search path on Windows ROCm.
$env:MIOPEN_FIND_MODE = 'FAST'
$env:FRECSNET_DETERMINISTIC = '1'
$env:FRECSNET_MIOPEN_ENABLED = '0'
$env:FRECSNET_TRAIN_DROP_LAST = '1'
if ($ResumePath) {
    $resolvedResumePath = (Resolve-Path -LiteralPath $ResumePath).Path
    $env:FRECSNET_RESUME_PATH = $resolvedResumePath
} else {
    Remove-Item Env:FRECSNET_RESUME_PATH -ErrorAction SilentlyContinue
}

Set-Location -LiteralPath $repoRoot
& $python train_model.py
exit $LASTEXITCODE
