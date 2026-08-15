import { cp, mkdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root=join(dirname(fileURLToPath(import.meta.url)),'..')
const output=join(root,'dist')

const files=[
  '_headers',
  'index.html',
  'app.js',
  'styles.css',
  'deep-reading.html',
  'deep-reading.js',
  'deep-reading.css',
  'assets/fonts',
  'assets/qianlong-tongbao-512.webp',
  'assets/qianlong-tongbao.webp',
  'assets/talismans',
  'assets/vendor',
  'components/LiquidEther/LiquidEther.css',
  'data/readings.bundle.js',
  'data/readings.json'
]

await rm(output,{recursive:true,force:true})
for(const relativePath of files){
  const source=join(root,relativePath),target=join(output,relativePath)
  await mkdir(dirname(target),{recursive:true})
  await cp(source,target,{recursive:true})
}

console.log(`Cloudflare Pages 静态发布目录已生成：${output}`)
