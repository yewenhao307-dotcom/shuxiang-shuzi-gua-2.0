import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const source=resolve(root,'data','readings.json')
const target=resolve(root,'data','readings.bundle.js')
const readings=JSON.parse(await readFile(source,'utf8'))

if(!Array.isArray(readings)||readings.length!==64)throw new Error(`预期 64 卦，实际 ${readings?.length??0}`)

await writeFile(target,`window.__YIJING_READINGS__=${JSON.stringify(readings)};\n`,'utf8')
console.log(`已生成 ${target}（${readings.length} 卦）`)
