# FReCS-Net

**结合胸部 X 光图像与文字描述的医学图像分割研究项目。**

**FReCS-Net**：Frequency Refinement and Evidence Consistency Segmentation Network（频率细化与证据一致性分割网络）。模型名称概括 FSDR 的频率细化与 RACE 的证据一致性；对比图中仍标注为 **ours**。

FReCS-Net 基于 [LViT](https://github.com/HUANGLIZI/LViT)，学习在图像中标出目标病灶区域。当前完整模型采用 **FSDR + RACE**，主要实验使用 QaTa-COV19-v2 数据集。

你可以在这里了解模型效果、准备数据、训练自己的模型，以及评估已有训练权重。当前提供的是 Python 研究代码，需要命令行和 NVIDIA GPU 环境；没有安装即用的桌面应用或网页演示。

[查看实验结果](docs/PAPER_RESULTS.md) · [准备运行环境](#准备运行环境) · [准备数据](#准备数据) · [训练模型](#训练模型) · [评估模型](#评估模型) · [常见问题](#常见问题)

## 这个项目能做什么

- **输入图像与描述，预测分割区域**：模型结合胸部 X 光图像和对应的英文描述，输出病灶区域的概率图。
- **训练自己的模型**：使用配套图像、分割标注和文字描述进行训练，保存模型权重和日志。
- **检查分割效果**：将预测与人工标注比较，计算 Dice、IoU 等指标。两者都衡量区域重合程度，越高越好。
- **查看改进是否有效**：仓库保留完整模型与对照实验的结果、配置和来源记录。

完整模型包含两个改进：**FSDR** 将特征中的整体语义与局部细节分开处理后融合；**RACE** 结合区域路由与辅助监督，学习图像区域和描述信息之间的对应关系。这里的 RACE 指完整模块，相关结果见[实验说明](docs/PAPER_RESULTS.md)。

## 开始之前

| 你想做的事 | 需要准备什么 |
| --- | --- |
| 了解项目和实验效果 | 直接阅读本页及[结果文档](docs/PAPER_RESULTS.md)，无需安装 |
| 训练模型 | NVIDIA GPU、Python 环境，以及图像、分割标注和文字描述 |
| 评估已有模型 | 上述环境、评估数据，以及与配置和源码版本匹配的分割模型权重 |

**本仓库不附带数据集或训练好的分割权重，目前也没有 GitHub Release 权重下载。** 文档中的服务器路径用于记录实验来源，不是公开下载地址。CXR-BERT 是模型使用的文本编码器，它的预训练权重不能替代 FReCS-Net 分割权重。

项目名称已更新为 **FReCS-Net**。下方命令中的 `BETTERLVIT_*` 环境变量、旧输出目录和权重文件名继续使用原标识，以兼容已有实验；无需重命名已有权重。详见[命名与兼容说明](docs/FRECS_NET.md)。

## 准备运行环境

以下命令使用 **Linux / Bash**，在仓库根目录运行。正式实验脚本使用 Linux 工具；Windows 用户可在具备 CUDA 支持的 WSL2 环境中按此流程操作。

### 1. 获取代码并创建独立环境

下面以 Conda 和 Python 3.12 为例：

```bash
git clone https://github.com/razaxq/FReCS-Net.git
cd FReCS-Net
conda create -n frecsnet python=3.12 -y
conda activate frecsnet
```

### 2. 安装依赖

仓库的服务器依赖采用 PyTorch / CUDA 12.8 组合，需要兼容的 NVIDIA 驱动：

```bash
python -m pip install --index-url https://download.pytorch.org/whl/cu128 \
  torch==2.9.1+cu128 torchvision==0.24.1+cu128 torchaudio==2.9.1+cu128
python -m pip install -r requirements.server-cu128.txt
```

检查 Python 能否使用 GPU：

```bash
python -c "import torch; print('PyTorch:', torch.__version__); print('CUDA available:', torch.cuda.is_available())"
```

`CUDA available` 应为 `True`。当前训练和评估入口需要 CUDA。[requirements.txt](requirements.txt) 保留的是旧版依赖，当前环境请使用 [requirements.server-cu128.txt](requirements.server-cu128.txt)。

首次运行会通过 Hugging Face 加载 `microsoft/BiomedVLP-CXR-BERT-specialized` 的分词器和模型，需要联网或提前准备完整缓存。

## 准备数据

当前默认任务为 QaTa-COV19，代码中的目录名是 **`Covid19`**。原始数据和文字标注可从[原版 LViT 的数据说明](https://github.com/HUANGLIZI/LViT#usage)查找；下载后需要整理成当前代码读取的格式。

```text
datasets/
└── Covid19/
    ├── Train_Folder/
    │   ├── img/
    │   ├── labelcol/
    │   └── Train_Val_text.xlsx
    ├── Val_Folder/
    │   ├── img/
    │   └── labelcol/
    └── Test_Folder/
        ├── img/
        ├── labelcol/
        └── Test_text.xlsx
```

- `img/` 放原始图像，`labelcol/` 放对应的分割标注。标注中的非零像素会被作为前景。
- 图像与标注按文件名配对。例如，`img/example.png` 对应 `labelcol/mask_example.png`。
- Excel 表必须包含 `Image` 和 `Description` 两列。`Image` 填写**标注文件名**，如 `mask_example.png`；`Description` 填写对应的英文描述。
- `Train_Val_text.xlsx` 需要覆盖训练集与验证集全部标注文件，放在 `Train_Folder/`。若下载的是分开的训练、验证文本表，请先按上述两列整理合并。
- `Test_text.xlsx` 只包含测试集对应描述。训练和下面的验证示例不需要读取测试集。

数据保存在其他位置时，可修改 [Config.py](Config.py) 中的 `train_dataset`、`val_dataset`、`test_dataset` 和 `task_dataset`；其中 `task_dataset` 指向存放合并文本表的训练目录。正式复现时还应保持原始数据划分，并在训练前提交配置改动。

## 训练模型

准备好环境和数据后，下面的示例会启动完整 **FSDR + RACE** 模型，训练 80 个 epoch：

```bash
export BETTERLVIT_EXPERIMENT=p8_r2_binding
export BETTERLVIT_SEED=1219
export BETTERLVIT_EPOCHS=80
export BETTERLVIT_BATCH_SIZE=16
export BETTERLVIT_GIT_COMMIT="$(git rev-parse HEAD)"
export PYTHONHASHSEED=1219
export CUBLAS_WORKSPACE_CONFIG=:4096:8

python train_model.py
```

这些环境变量需要在同一个终端中设置。**仅运行 `python train_model.py` 会使用旧的默认基线配置，不会自动选择完整模型。**

训练输出保存在：

```text
Covid19/BetterLViT/p8_r2_binding/<本次训练目录>/
├── models/
│   ├── best_model-BetterLViT.pth.tar
│   └── last_model-BetterLViT.pth.tar
├── tensorboard_logs/
└── …
```

`best_model` 是按验证集平均 IoU 选择的权重；`last_model` 是最近一次保存、可用于恢复训练的权重。日志会记录训练进度和验证指标。

需要恢复训练时，在保持原模型配置的前提下，将 `BETTERLVIT_RESUME_PATH` 设为已有的 `last_model-BetterLViT.pth.tar` 路径，再启动训练。恢复过程会创建新的输出目录。

以上是单次使用示例。论文级复现还需要每次实验独立的源码提交、完整提交编号、实验标签和运行记录，不能仅凭相同配置名认定复现完成。详细要求见[正式实验协议](docs/STAGE1_OVERALL.md)。

## 评估模型

### 评估自己刚训练的完整模型

在同一环境、同一源码提交下，将下面的占位路径替换为实际 `best_model` 路径：

```bash
python tools/export_validation_metrics.py \
  --experiment p8_r2_binding \
  --checkpoint "Covid19/BetterLViT/p8_r2_binding/<本次训练目录>/models/best_model-BetterLViT.pth.tar" \
  --output "outputs/my_validation.json" \
  --batch-size 16 \
  --threshold 0.5 \
  --split validation
```

结果写入 `outputs/my_validation.json`，包含验证集平均 Dice、IoU 和逐图指标。这里输出的是指标文件，不会生成分割图片。该命令适用于上述完整模型的验证；不要将旧的 `test_model.py` 或 `tools/evaluate_experiment.py` 当作完整模型的通用评估入口。

评估脚本会检查权重的配置、架构、训练设置和源码提交。如果使用历史权重，请按对应实验记录切换到匹配的源码与环境；当前 `main` 的提交编号不能替代权重实际训练时的编号。

### 复核论文测试集结果

先查看[各次实验结果与来源](docs/results/stage1_overall_20260915/FINAL_RESULTS.json)。测试集评估使用验证集选定的同一个 Best 权重、固定阈值 0.5，并遵循对应实验的运行记录。

[Stage 1 启动器](tools/run_stage1.py)及[评估脚本](tools/export_stage1_metrics.py)用于已登记的正式实验，依赖匹配的 manifest、种子、源码标签和环境路径。这些脚本包含历史实验限制，不能在新克隆的仓库中直接当作通用一键命令使用。完整要求见[实验协议](docs/STAGE1_OVERALL.md)。

## 当前实验效果

以下为 **QaTa-COV19-v2 测试集**结果：训练 / 验证 / 测试图像数量分别为 5,716 / 1,429 / 2,113；使用三个随机种子，报告均值 ± 样本标准差。所有组均训练 80 个 epoch，采用单周期余弦学习率、冻结的 CXR-BERT，**不使用 LoRA**。

| 配置 | IoU（%）↑ | Dice（%）↑ |
| --- | ---: | ---: |
| 匹配训练设置的 LViT-PLAM 基线 | 75.4775 ± 0.0851 | 84.0251 ± 0.0760 |
| 仅 FSDR | 75.9833 ± 0.1511 | 84.5031 ± 0.0755 |
| PLAM + RACE | 75.6962 ± 0.1068 | 84.1928 ± 0.0688 |
| **FSDR + RACE（FReCS-Net / ours）** | **76.2262 ± 0.0456** | **84.7112 ± 0.0348** |

指标先逐图计算再取平均（macro），预测阈值为概率 > 0.5。完整模型相对表中匹配基线提升 **0.7487 个 IoU 百分点**；该基线不是未经修改的原版 LViT 官方训练流程。

理解结果时还需要保留以下范围：

- 训练集和验证集存在 434 个可恢复患者标识的重叠；未发现可恢复的测试集患者标识重叠，但匿名样本使完全患者独立性无法得到确认。
- 测试集曾在研究过程中被访问过；三个种子的结果不能单独证明统计显著性或跨数据集泛化。
- Warm Restart 实验以及外部模型的不同训练设置单独报告，不与上表合并归因。

完整指标、逐种子结果、外部比较和数据审计见[结果文档](docs/PAPER_RESULTS.md)。

## 常见问题

**可以只下载项目就对自己的图片进行预测吗？** 还需要匹配的训练权重和文字输入。当前入口按数据集组织，评估还需要对应标注；暂未提供上传单张图片的一键预测界面。

**显存不足怎么办？** 可通过 `BETTERLVIT_BATCH_SIZE` 降低训练批大小。这样会改变训练条件，结果应作为自己的实验记录，不能直接当作表中的正式复现。评估批大小由命令中的 `--batch-size` 控制。

**提示找不到文字、图像或标注怎么办？** 检查工作目录是否为仓库根目录、数据目录是否为 `datasets/Covid19`、Excel 是否有 `Image` / `Description` 两列，以及表内文件名是否与 `labelcol/` 中的文件完全一致。

**提示权重或源码版本不匹配怎么办？** 检查权重对应的模型配置、种子、训练设置和 `source_git_commit`。评估必须使用匹配的版本，不要通过修改权重里的来源字段绕过检查。

**为什么源码里还有 EPPA、FAM-EPPA 或 `eppa`？** FSDR 沿用了原实现的部分名称和权重键，以保持历史权重兼容；对应关系见 [FSDR 说明](docs/FSDR.md)。

## 进一步阅读

| 内容 | 入口 |
| --- | --- |
| FReCS-Net 名称与旧权重兼容 | [FRECS_NET.md](docs/FRECS_NET.md) |
| 最终结果、比较范围与实验来源 | [PAPER_RESULTS.md](docs/PAPER_RESULTS.md) |
| FSDR 的结构与命名 | [FSDR.md](docs/FSDR.md) |
| FSDR 与 RACE 的四组对照协议 | [STAGE1_OVERALL.md](docs/STAGE1_OVERALL.md) |
| 可用模型配置 | [paper_experiments.py](paper_experiments.py) |
| 历史实验记录 | [EXPERIMENT_TRACKER.md](docs/EXPERIMENT_TRACKER.md) |

排查问题时，请记录所用提交编号、模型配置、运行命令及完整错误信息，便于复核。

## 致谢与许可证

本项目基于 [LViT](https://github.com/HUANGLIZI/LViT) 开发，遵循仓库中的 [MIT License](LICENSE)。使用上游方法或其提供的数据标注时，请保留相应引用；数据集与预训练模型的使用条件以各自来源为准。

原版 LViT 引用：

```bibtex
@article{li2023lvit,
  title={Lvit: language meets vision transformer in medical image segmentation},
  author={Li, Zihan and Li, Yunxiang and Li, Qingde and Wang, Puyang and Guo, Dazhou and Lu, Le and Jin, Dakai and Zhang, You and Hong, Qingqi},
  journal={IEEE Transactions on Medical Imaging},
  year={2023},
  publisher={IEEE}
}
```
