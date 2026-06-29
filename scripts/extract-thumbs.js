/**
 * 视频首帧手动提取工具（备选方案，需要 ffmpeg）
 *
 * 主方案：extract-thumbs-plugin.js（Vite 插件，零依赖，浏览器 Canvas API）
 * 备选方案：此脚本（命令行，需要安装 ffmpeg）
 *
 * 用法：node scripts/extract-thumbs.js
 *
 * 前置条件：系统已安装 ffmpeg 或在 node_modules 中安装了 ffmpeg-static
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const VIDEO_DIR = path.resolve(__dirname, '..', 'public', 'VIDEO');
const THUMBS_DIR = path.join(VIDEO_DIR, 'thumbs');

function log(msg) {
  console.log(`[Thumbs/manual] ${msg}`);
}

function getFfmpegPath() {
  try { return require('ffmpeg-static'); } catch {}
  try { execSync('ffmpeg -version', { stdio: 'pipe' }); return 'ffmpeg'; } catch {}
  return null;
}

function extractThumb(videoPath, thumbPath, ffmpeg) {
  return new Promise((resolve) => {
    const proc = spawn(ffmpeg, [
      '-y', '-ss', '00:00.5', '-i', videoPath,
      '-vframes', '1', '-q:v', '2', '-loglevel', 'error',
      thumbPath,
    ]);
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => resolve(code === 0 && fs.existsSync(thumbPath)));
    proc.on('error', () => resolve(false));
  });
}

async function main() {
  log('===== 视频缩略图手动提取（ffmpeg）=====');

  const ffmpeg = getFfmpegPath();
  if (!ffmpeg) {
    log('❌ 未找到 ffmpeg。请使用 Vite 插件的浏览器自动提取方案。');
    log('   启动 dev server: npm run dev');
    process.exit(1);
  }

  log(`ffmpeg: ${ffmpeg}`);

  if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR, { recursive: true });

  const files = fs.readdirSync(VIDEO_DIR)
    .filter(f => /^\d+\.mp4$/i.test(f))
    .map(f => parseInt(f.match(/^(\d+)/)[1]))
    .sort((a, b) => a - b);

  let extracted = 0, skipped = 0;
  for (const num of files) {
    const thumbPath = path.join(THUMBS_DIR, `${num}.jpg`);
    if (fs.existsSync(thumbPath)) { skipped++; continue; }

    const videoPath = path.join(VIDEO_DIR, `${num}.mp4`);
    log(`提取 ${num}.mp4...`);
    const ok = await extractThumb(videoPath, thumbPath, ffmpeg);
    if (ok) { extracted++; log(`  ✅ ${num}.jpg`); }
    else { log(`  ❌ 失败`); }
  }

  log(`===== 完成: 跳过 ${skipped} | 提取 ${extracted} =====`);
  process.exit(extracted === files.length - skipped ? 0 : 1);
}

main().catch(e => { log(`错误: ${e.message}`); process.exit(1); });
