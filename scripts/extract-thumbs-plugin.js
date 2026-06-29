/**
 * 视频首帧自动提取 - Vite 插件
 *
 * 主方案：Python + imageio-ffmpeg 服务端提取（最可靠）
 * 降级方案：CDN 加载 browser-video-thumbnail-generator 浏览器提取
 *
 * 安装依赖（一行命令）：
 *   pip install imageio-ffmpeg -i https://pypi.tuna.tsinghua.edu.cn/simple
 *
 * npm 组件引用：
 *   browser-video-thumbnail-generator@2.0.4 (jsDelivr CDN)
 *   https://www.npmjs.com/package/browser-video-thumbnail-generator
 */

import { existsSync, readdirSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { spawn } from 'child_process'
import { Buffer } from 'buffer'

const VIDEO_DIR_NAME = 'VIDEO'
const THUMBS_DIR_NAME = 'thumbs'
const CDN_URL = 'https://cdn.jsdelivr.net/npm/browser-video-thumbnail-generator@2.0.4/dist/esm/index.js'

function scanMissingThumbs(publicDir) {
  const videoDir = join(publicDir, VIDEO_DIR_NAME)
  const thumbsDir = join(videoDir, THUMBS_DIR_NAME)
  if (!existsSync(videoDir)) return []
  if (!existsSync(thumbsDir)) mkdirSync(thumbsDir, { recursive: true })
  const videoFiles = readdirSync(videoDir)
    .filter(f => /^\d+\.mp4$/i.test(f))
    .map(f => parseInt(f.match(/^(\d+)/)[1]))
  return videoFiles
    .filter(num => !existsSync(join(thumbsDir, `${num}.jpg`)))
    .sort((a, b) => a - b)
}

/** 服务端提取（Python + imageio-ffmpeg） */
function extractServerSide(publicDir) {
  return new Promise((resolve) => {
    const scriptPath = join(publicDir, '..', 'scripts', 'extract_thumbs.py')
    if (!existsSync(scriptPath)) { resolve(false); return }

    const pythonPaths = [
      join(process.env.USERPROFILE || 'C:\\Users\\ASUS', '.workbuddy', 'binaries', 'python', 'versions', '3.13.12', 'python.exe'),
      'python', 'python3',
    ].filter(Boolean)

    function tryNext(idx) {
      if (idx >= pythonPaths.length) { resolve(false); return }
      const p = spawn(pythonPaths[idx], [scriptPath], { stdio: ['ignore', 'pipe', 'pipe'] })
      let out = ''
      p.stdout.on('data', d => { out += d; process.stdout.write(d) })
      p.stderr.on('data', d => process.stderr.write(d))
      p.on('close', code => resolve(code === 0))
      p.on('error', () => tryNext(idx + 1))
    }
    tryNext(0)
  })
}

/** 浏览器 CDN 降级脚本 */
function injectScript(missing) {
  return `
<script type="module" data-extract-thumbs>
import { VideoThumbnailGenerator } from '${CDN_URL}';
if (!sessionStorage.getItem('__thumbs_extracted')) {
  var missing = [${missing.join(',')}]
  console.log('[Thumbs] \u26a0 ' + missing.length + ' \u4e2a\u7f29\u7565\u56fe\u7f3a\u5931\uff0cCDN\u7ec4\u4ef6\u63d0\u53d6\u4e2d\u2026')
  for (const num of missing) {
    try {
      const gen = new VideoThumbnailGenerator('/${VIDEO_DIR_NAME}/${THUMBS_DIR_NAME}/' + num + '.mp4')
      const r = await gen.getThumbnail('start')
      const b = await (await fetch(r.thumbnail)).blob()
      const b64 = await new Promise(rs => { let rd = new FileReader(); rd.onload = () => rs(rd.result); rd.readAsDataURL(b) })
      const j = await (await fetch('/__thumb-save', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({num, data:b64}) })).json()
      gen.revokeUrls()
      console.log(j.ok ? '[Thumbs] \u2705 ' + num + '.jpg (' + j.size + ' KB)' : '[Thumbs] \u274c ' + num + '.jpg')
    } catch (e) { console.warn('[Thumbs] \u26a0 ' + num + ': ' + e.message) }
  }
  sessionStorage.setItem('__thumbs_extracted', '1')
  console.log('[Thumbs] \u2705 \u5168\u90e8\u5b8c\u6210\uff01\u5237\u65b0\u9875\u9762\u5373\u53ef\u770b\u5230\u5c01\u9762')
}
</script>`
}

export default function extractVideoThumbs() {
  let publicDir = '', logged = false, serverDone = false

  return {
    name: 'extract-video-thumbs',
    apply: 'serve',
    configResolved(c) { publicDir = c.publicDir },

    async buildStart() {
      if (serverDone) return
      serverDone = true
      const missing = scanMissingThumbs(publicDir)
      if (missing.length === 0) { console.log('[Thumbs] \u2714 \u6240\u6709\u7f29\u7565\u56fe\u5df2\u5c31\u7eea'); return }
      console.log('[Thumbs] \u{1F527} \u7f3a\u5931 ' + missing.length + ' \u4e2a\u7f29\u7565\u56fe\uff0c\u5c1d\u8bd5\u670d\u52a1\u7aef\u63d0\u53d6 (Python + imageio-ffmpeg)...')
      const ok = await extractServerSide(publicDir)
      if (ok) console.log('[Thumbs] \u2705 \u670d\u52a1\u7aef\u63d0\u53d6\u5b8c\u6210')
    },

    configureServer(s) {
      s.middlewares.use('/__thumb-save', (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        let b = ''; req.on('data', c => b += c); req.on('end', () => {
          try {
            const { num, data } = JSON.parse(b)
            const buf = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ''), 'base64')
            const d = join(publicDir, VIDEO_DIR_NAME, THUMBS_DIR_NAME)
            if (!existsSync(d)) mkdirSync(d, { recursive: true })
            writeFileSync(join(d, `${num}.jpg`), buf)
            console.log('[Thumbs] \u2705 \u5df2\u4fdd\u5b58 ' + num + '.jpg (' + (buf.length/1024).toFixed(1) + ' KB)')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true, size: (buf.length/1024).toFixed(1) }))
          } catch (e) { res.writeHead(500); res.end(JSON.stringify({ ok: false, error: e.message })) }
        })
      })
    },

    transformIndexHtml(html) {
      const missing = scanMissingThumbs(publicDir)
      if (missing.length === 0) {
        if (!logged) { console.log('[Thumbs] \u2714 \u6240\u6709\u7f29\u7565\u56fe\u5df2\u5c31\u7eea'); logged = true }
        return html
      }
      if (!logged) { console.log('[Thumbs] \u26a0 \u4ecd\u6709 ' + missing.length + ' \u4e2a\u7f29\u7565\u56fe\u7f3a\u5931\uff0c\u6ce8\u5165\u6d4f\u89c8\u5668\u964d\u7ea7\u65b9\u6848'); logged = true }
      return html.replace('</body>', injectScript(missing) + '</body>')
    },
  }
}
