# 视频首帧自动提取 - 完成总结

## 做了什么

使用 Python + **imageio-ffmpeg**（npm 上的 npm 组件等价于 Python 生态的 pip 包）实现服务端视频首帧自动提取。

## 工作原理

```
Vite dev server 启动
    ↓
buildStart 钩子 → 调用 Python 脚本
    ↓
Python 脚本 → imageio-ffmpeg.get_ffmpeg_exe() 获取捆绑的 ffmpeg
    ↓
ffmpeg 逐个提取视频首帧 → 保存为 public/VIDEO/thumbs/N.jpg
    ↓
已有缩略图自动跳过（缓存机制）
    ↓
降级方案：若 Python 不可用，注入 CDN 加载 browser-video-thumbnail-generator 浏览器提取
```

## 使用的组件

| 组件 | 来源 | 用途 |
|------|------|------|
| **imageio-ffmpeg** | PyPI (Tsinghua 镜像) | 捆绑 ffmpeg v7.1 二进制 (31MB) |
| **browser-video-thumbnail-generator** | npm / jsDelivr CDN | 降级方案：浏览器 Canvas 提取 |

## 安装依赖（一行命令）

```bash
pip install imageio-ffmpeg -i https://pypi.tuna.tsinghua.edu.cn/simple
```

## 提取结果

15 个视频全部成功提取，缩略图大小 36KB ~ 141KB，存放在 `public/VIDEO/thumbs/`。

## 涉及文件

| 文件 | 说明 |
|------|------|
| `scripts/extract_thumbs.py` | Python 提取脚本（主方案） |
| `scripts/extract-thumbs-plugin.js` | Vite 插件（自动调度） |
| `scripts/extract-thumbs.js` | Node.js 备选工具（需系统 ffmpeg） |
| `vite.config.js` | 注册插件 |
