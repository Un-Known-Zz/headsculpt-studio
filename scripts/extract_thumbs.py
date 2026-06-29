#!/usr/bin/env python3
"""
视频首帧自动提取脚本（使用 imageio-ffmpeg 捆绑的 ffmpeg 二进制）
零系统依赖，自动通过 pip 安装 imageio-ffmpeg 即可获得 ffmpeg。

用法：
  python scripts/extract_thumbs.py

也可在 Node.js 中通过 child_process 调用。
"""

import os
import sys
import subprocess
from pathlib import Path

# 项目根目录（脚本位于 scripts/）
PROJECT_ROOT = Path(__file__).resolve().parent.parent
VIDEO_DIR = PROJECT_ROOT / "public" / "VIDEO"
THUMBS_DIR = VIDEO_DIR / "thumbs"


def get_ffmpeg():
    """获取 ffmpeg 可执行文件路径（优先系统，其次 imageio-ffmpeg 捆绑）"""
    # 先尝试系统 ffmpeg
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, timeout=5)
        return "ffmpeg"
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    # 尝试 imageio-ffmpeg 捆绑的 ffmpeg
    try:
        import imageio_ffmpeg
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        print(f"[Thumbs/Python] 使用 imageio-ffmpeg 捆绑的 ffmpeg: {ffmpeg_exe}")
        return ffmpeg_exe
    except ImportError:
        pass

    return None


def extract_frame(video_path, thumb_path, ffmpeg):
    """使用 ffmpeg 提取视频首帧"""
    try:
        result = subprocess.run(
            [
                ffmpeg,
                "-y",           # 覆盖已存在文件
                "-ss", "00:00.5",  # 跳转到 0.5 秒
                "-i", str(video_path),
                "-vframes", "1",   # 只提取 1 帧
                "-q:v", "2",       # 高质量 JPEG
                "-loglevel", "error",
                str(thumb_path),
            ],
            capture_output=True,
            timeout=60,
        )
        return result.returncode == 0 and thumb_path.exists()
    except Exception as e:
        print(f"  [Thumbs/Python] 提取失败: {e}")
        return False


def main():
    print("[Thumbs/Python] ===== 视频缩略图提取 =====")

    # 获取 ffmpeg
    ffmpeg = get_ffmpeg()
    if not ffmpeg:
        print("[Thumbs/Python] ❌ 未找到 ffmpeg！")
        print("[Thumbs/Python]    请安装: pip install imageio-ffmpeg")
        sys.exit(1)

    # 确保目录存在
    if not VIDEO_DIR.exists():
        print(f"[Thumbs/Python] ❌ 视频目录不存在: {VIDEO_DIR}")
        sys.exit(1)

    THUMBS_DIR.mkdir(parents=True, exist_ok=True)

    # 扫描视频文件
    video_files = sorted(
        [f for f in VIDEO_DIR.glob("*.mp4") if f.stem.isdigit()],
        key=lambda f: int(f.stem)
    )

    if not video_files:
        print("[Thumbs/Python] ⚠ 未找到编号命名的视频文件（N.mp4）")
        return {"total": 0, "extracted": 0, "skipped": 0, "failed": 0}

    print(f"[Thumbs/Python] 找到 {len(video_files)} 个视频文件")

    extracted = 0
    skipped = 0
    failed = 0

    for vf in video_files:
        num = int(vf.stem)
        thumb_path = THUMBS_DIR / f"{num}.jpg"

        if thumb_path.exists():
            skipped += 1
            continue

        print(f"[Thumbs/Python] 提取 {vf.name} 首帧...", end=" ", flush=True)

        if extract_frame(vf, thumb_path, ffmpeg):
            size_kb = thumb_path.stat().st_size / 1024
            print(f"✅ {size_kb:.1f} KB")
            extracted += 1
        else:
            print("❌ 失败")
            failed += 1

    print(f"[Thumbs/Python] ===== 完成: 跳过 {skipped} | 提取 {extracted} | 失败 {failed} =====")
    return {"total": len(video_files), "extracted": extracted, "skipped": skipped, "failed": failed}


if __name__ == "__main__":
    sys.exit(0 if main()["failed"] == 0 else 1)
