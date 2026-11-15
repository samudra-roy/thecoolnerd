// generates public/world.svg: one tall tile holding N chapters that repeats forever (top edge meets bottom edge).
// run: node scripts/gen-scenes.mjs public
import { writeFileSync } from 'node:fs'
const OUT = process.argv[2]
const W = 520, H = 760, N = 3 // H = one chapter section (.scene height in index.css)

// node centres per chapter: x = 260 + OFFSETS/2 (App.tsx), y from the bottom-aligned .path; first point sits behind the banner
const LOCAL = [[258, 72], [245, 208], [270, 330], [285, 452], [265, 574], [240, 696]]
const PTS = []
for (let k = -1; k <= N; k++) for (const [x, y] of LOCAL) PTS.push([x, y + H * k])
const ROAD = smooth(PTS) // one smooth curve, periodic every H, so no kinks at chapter or tile seams
const SAMPLES = crSegs(PTS).flatMap(s => Array.from({ length: 40 }, (_, i) => pt(s, i / 40)))
function roadX(y) { // y is chapter-local; the curve is identical in every chapter
  const g = y + H
  let best = SAMPLES[0]
  for (const p of SAMPLES) if (Math.abs(p[1] - g) < Math.abs(best[1] - g)) best = p
  return best[0]
}
function crSegs(p) { // catmull-rom -> cubic bezier control points
  return p.slice(0, -1).map((b, i) => { const a = p[i - 1] || b, c = p[i + 1], e = p[i + 2] || c
    return [b, [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6], [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6], c] })
}
function pt(s, t) { const u = 1 - t; return [0, 1].map(i => u*u*u*s[0][i] + 3*u*u*t*s[1][i] + 3*u*t*t*s[2][i] + t*t*t*s[3][i]) }
// keep scenery off the road and nodes
const clear = (x, y, r = 0) => Math.abs(x - roadX(y)) > 52 + r

function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647) }

const DEFS = `<defs>
<g id="tree"><ellipse cx="0" cy="48" rx="30" ry="7" fill="#000" opacity=".12"/><rect x="-6" y="14" width="12" height="36" rx="5" fill="#a8754a"/><rect x="0" y="14" width="6" height="36" rx="3" fill="#8c5e38"/><circle cx="0" cy="-14" r="26" fill="#62bb44"/><circle cx="-20" cy="6" r="21" fill="#62bb44"/><circle cx="20" cy="6" r="21" fill="#4fa63a"/><circle cx="8" cy="0" r="22" fill="#4fa63a"/><circle cx="-9" cy="-22" r="10" fill="#86d466"/></g>
<g id="apple"><use href="#tree"/><circle cx="-14" cy="-4" r="4" fill="#ff5a5a"/><circle cx="12" cy="-16" r="4" fill="#ff5a5a"/><circle cx="16" cy="10" r="4" fill="#ff5a5a"/></g>
<g id="pine"><ellipse cx="0" cy="48" rx="24" ry="6" fill="#000" opacity=".12"/><rect x="-5" y="30" width="10" height="18" rx="3" fill="#a8754a"/><path d="M0 -40 L-22 0 L22 0Z M0 -20 L-28 34 L28 34Z" fill="#3fa34d"/><path d="M0 -40 L0 0 L22 0Z M0 -20 L0 34 L28 34Z" fill="#2f8a3e"/></g>
<g id="bush"><ellipse cx="0" cy="12" rx="30" ry="5" fill="#000" opacity=".1"/><circle cx="-14" cy="2" r="13" fill="#5fb845"/><circle cx="12" cy="0" r="15" fill="#4fa63a"/><circle cx="-1" cy="-8" r="12" fill="#78cc5a"/></g>
<g id="rock"><path d="M-16 8 Q-18 -6 -6 -10 Q8 -14 16 -2 Q20 8 12 10 Z" fill="#b7bfcc"/><path d="M-6 -10 Q8 -14 16 -2 Q20 8 12 10 L2 10 Q6 -2 -6 -10Z" fill="#98a2b3"/></g>
<g id="flw"><circle r="3.5" fill="#ff8fb8"/><circle r="1.5" fill="#ffd34d"/></g>
<g id="flw2"><circle r="3.5" fill="#fff"/><circle r="1.5" fill="#ffc800"/></g>
<g id="flw3"><circle r="3.5" fill="#b48cff"/><circle r="1.5" fill="#fff"/></g>
<g id="tuft"><path d="M-5 0 L-3 -7 L0 0 L2 -8 L4 0Z" fill="#6fc24f"/></g>
<g id="mush"><rect x="-3" y="-2" width="6" height="8" rx="2" fill="#fff2dc"/><path d="M-9 0 a9 8 0 0 1 18 0z" fill="#ff5a5a"/><circle cx="-3" cy="-4" r="1.6" fill="#fff"/><circle cx="3" cy="-2" r="1.3" fill="#fff"/></g>
<g id="mtn"><path d="M-70 0 L0 -110 L70 0Z" fill="#a9b6d8"/><path d="M0 -110 L70 0 L14 0Z" fill="#8c9cc6"/><path d="M0 -110 L-20 -78 L-8 -84 L2 -74 L14 -86Z" fill="#fff"/></g>
<g id="sheep"><ellipse cx="0" cy="10" rx="14" ry="3" fill="#000" opacity=".1"/><rect x="-8" y="2" width="3" height="8" fill="#555"/><rect x="5" y="2" width="3" height="8" fill="#555"/><circle cx="-6" cy="-2" r="7" fill="#fff"/><circle cx="4" cy="-3" r="8" fill="#fff"/><circle cx="-1" cy="-7" r="6" fill="#fff"/><ellipse cx="13" cy="-4" rx="5" ry="4" fill="#4b4b4b"/></g>
<g id="house"><ellipse cx="0" cy="22" rx="34" ry="6" fill="#000" opacity=".1"/><rect x="-24" y="-8" width="48" height="30" fill="#fff4d9"/><rect x="0" y="-8" width="24" height="30" fill="#f1e2bd"/><path d="M-30 -6 L0 -34 L30 -6Z" fill="#ff6f5b"/><path d="M0 -34 L30 -6 L12 -6Z" fill="#e2533f"/><rect x="-6" y="6" width="12" height="16" rx="2" fill="#a8754a"/><rect x="-19" y="0" width="9" height="9" fill="#8fd3ff"/><rect x="11" y="0" width="9" height="9" fill="#8fd3ff"/></g>
<g id="bird"><path d="M-6 0 Q-3 -4 0 0 Q3 -4 6 0" fill="none" stroke="#4b5a6b" stroke-width="1.6" stroke-linecap="round"/></g>
</defs>`

const use = (id, x, y, s = 1) => `<use href="#${id}" transform="translate(${x} ${y})${s !== 1 ? ` scale(${s})` : ''}"/>`

// curvy water band from a list of points (catmull-rom -> bezier)
function smooth(p) { return `M${p[0][0]} ${p[0][1]}` + crSegs(p).map(([, c1, c2, e]) => ` C${c1} ${c2} ${e}`.replaceAll(',', ' ')).join('') }
const river = (pts, w = 34) => { const d = smooth(pts); return `<g fill="none" stroke-linecap="round"><path d="${d}" stroke="#7fcf5c" stroke-width="${w + 12}"/><path d="${d}" stroke="#4fb3e8" stroke-width="${w}"/><path d="${d}" stroke="#7fd0f7" stroke-width="${w - 14}"/><path d="${d}" stroke="#fff" stroke-width="2.5" stroke-dasharray="10 26" opacity=".7"/></g>` }
const pond = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y + 4}" rx="${rx + 8}" ry="${ry + 7}" fill="#7fcf5c"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#4fb3e8"/><ellipse cx="${x - rx * .1}" cy="${y - ry * .12}" rx="${rx * .82}" ry="${ry * .72}" fill="#7fd0f7"/><path d="M${x - rx * .5} ${y - ry * .3} h${rx * .3} M${x + rx * .1} ${y + ry * .25} h${rx * .35}" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`
const lily = (x, y) => `<path d="M${x} ${y} m-7 0 a7 5 0 1 0 7 -5 L${x} ${y}Z" fill="#4fa63a"/>`
function bridge(y) {
  const x = roadX(y)
  const planks = Array.from({ length: 7 }, (_, i) => `<rect x="${x - 26}" y="${y - 24 + i * 7}" width="52" height="5" rx="1.5" fill="${i % 2 ? '#c48a52' : '#b07a45'}"/>`).join('')
  return `<g><rect x="${x - 28}" y="${y - 26}" width="56" height="52" rx="4" fill="#8c5e38"/>${planks}<rect x="${x - 32}" y="${y - 30}" width="6" height="60" rx="3" fill="#7a4f2c"/><rect x="${x + 26}" y="${y - 30}" width="6" height="60" rx="3" fill="#7a4f2c"/>${[-30, 30].map(dx => [-30, 24].map(dy => `<rect x="${x + dx - 5}" y="${y + dy - 3}" width="10" height="10" rx="2" fill="#5d3b1a"/>`).join('')).join('')}</g>`
}
const roadSvg = `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${ROAD}" stroke="#d9b877" stroke-width="40"/><path d="${ROAD}" stroke="#f3dca6" stroke-width="32"/><path d="${ROAD}" stroke="#e6c98a" stroke-width="3" stroke-dasharray="2 19" transform="translate(-7 0)"/><path d="${ROAD}" stroke="#e6c98a" stroke-width="3" stroke-dasharray="2 23" transform="translate(8 0)"/></g>`

// grass texture, flowers, tufts scattered where there is room
function scatter(seed, avoid = []) {
  const r = rng(seed), out = []
  const ok = (x, y) => clear(x, y, 4) && !avoid.some(([ax, ay, ar]) => Math.hypot(x - ax, y - ay) < ar)
  for (let i = 0; i < 26; i++) { const x = r() * W, y = r() * H; if (clear(x, y, 30)) out.push(`<ellipse cx="${x|0}" cy="${y|0}" rx="${40 + r() * 40|0}" ry="${14 + r() * 12|0}" fill="#b4e88e" opacity=".55"/>`) }
  const top = []
  for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H; if (ok(x, y)) top.push(use(['tuft', 'tuft', 'flw', 'flw2', 'flw3'][i % 5], x | 0, y | 0)) }
  return [out.join(''), top.join('')]
}

function svg(seed, below, above, avoid) { // a chapter's two layers (under / over the road), chapter-local coords
  const [patches, bits] = scatter(seed, avoid)
  return [patches + below, bits + above]
}

// --- scene 0: meadow, river with a bridge, pond with ducks, camp
const s0 = svg(11,
  river([[-20, 236], [80, 250], [170, 262], [260, 272], [360, 286], [440, 300], [540, 290]]) +
  pond(120, 540, 70, 42) + lily(95, 545) + lily(150, 530) + lily(130, 565),
  bridge(272) +
  // duck
  `<g transform="translate(108 528)"><ellipse cx="0" cy="0" rx="10" ry="6" fill="#fff"/><circle cx="7" cy="-6" r="5" fill="#fff"/><path d="M11 -6 l6 1 l-6 2z" fill="#ffa53d"/><circle cx="8" cy="-7" r="1.2" fill="#333"/></g>` +
  // camp: tent + fire
  `<g transform="translate(110 140)"><ellipse cx="0" cy="30" rx="44" ry="8" fill="#000" opacity=".12"/><path d="M-36 30 L0 -26 L36 30Z" fill="#ff9a3d"/><path d="M0 -26 L36 30 L8 30Z" fill="#e77d22"/><path d="M-8 30 L0 4 L8 30Z" fill="#7a4f2c"/><g transform="translate(58 26)"><rect x="-10" y="-2" width="20" height="5" rx="2" fill="#8c5e38" transform="rotate(20)"/><rect x="-10" y="-2" width="20" height="5" rx="2" fill="#7a4f2c" transform="rotate(-20)"/><path d="M0 -20 Q10 -6 0 0 Q-10 -6 0 -20Z" fill="#ff6b3d"/><path d="M0 -11 Q5 -4 0 0 Q-5 -4 0 -11Z" fill="#ffd34d"/></g></g>` +
  use('tree', 420, 130) + use('tree', 470, 175, .8) + use('bush', 360, 190) + use('mush', 385, 225) +
  use('tree', 70, 360, .9) + use('pine', 150, 380, .8) + use('rock', 190, 440) +
  // signpost
  `<g transform="translate(345 410)"><rect x="-3" y="-30" width="6" height="40" fill="#8c5e38"/><path d="M-4 -30 h34 l8 7 l-8 7 h-34z" fill="#c48a52"/><path d="M4 -10 h-30 l-8 7 l8 7 h30z" fill="#b07a45"/></g>` +
  use('tree', 430, 520) + use('apple', 470, 590, .9) + use('pine', 380, 600) + use('bush', 410, 660) + use('sheep', 470, 700) +
  use('bush', 60, 650) + use('rock', 140, 680) + use('mush', 175, 640) + use('bird', 300, 60) + use('bird', 318, 52),
  [[120, 540, 90], [110, 140, 70], [420, 140, 60], [450, 580, 80], [80, 380, 50], [345, 410, 40]])

// --- scene 1: mountains, waterfall, lake with boat, pine forest, stream + bridge
const s1 = svg(23,
  `<g transform="translate(420 230)">${use('mtn', 50, 0, 1.25)}${use('mtn', -40, 6, 1)}</g>` +
  `<path d="M432 150 q-6 40 4 96" stroke="#7fd0f7" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M432 160 q-4 30 3 84" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="8 10" opacity=".8"/>` +
  river([[440, 360], [380, 470], [320, 560], [250, 636], [150, 690], [-20, 720]], 26) +
  pond(430, 330, 82, 50),
  bridge(636) +
  `<g transform="translate(410 330)"><path d="M-18 0 h36 l-6 9 h-24z" fill="#c4553e"/><rect x="-1" y="-24" width="3" height="24" fill="#7a4f2c"/><path d="M2 -24 l14 18 h-14z" fill="#fff"/></g>` +
  use('pine', 60, 170) + use('pine', 110, 200, .9) + use('pine', 160, 160, .8) + use('pine', 80, 250) + use('pine', 140, 270, .9) + use('pine', 40, 300, .8) +
  use('rock', 190, 320) + use('rock', 175, 340, .7) + use('bush', 100, 340) +
  `<g transform="translate(110 470)">${use('mtn', 0, 40, .8)}${use('mtn', -60, 50, .6)}</g>` +
  use('tree', 400, 480, .9) + use('rock', 460, 450) + use('pine', 470, 540) + use('bush', 120, 560) + use('mush', 70, 580) +
  use('tree', 420, 680) + use('pine', 480, 720, .8) + use('rock', 360, 710) + use('bush', 80, 740) + use('bird', 220, 50) + use('bird', 236, 58),
  [[440, 160, 100], [430, 330, 100], [110, 230, 110], [110, 440, 80], [430, 690, 60]])

// --- scene 2: village, windmill, field, sheep, castle destination
const field = `<g transform="translate(110 380)"><rect x="-80" y="-50" width="160" height="100" rx="10" fill="#c99a5b"/>${Array.from({ length: 6 }, (_, i) => `<rect x="-74" y="${-44 + i * 16}" width="148" height="8" rx="4" fill="#8fd16a"/>`).join('')}</g>`
const fence = (x, y, n) => `<g fill="#c48a52">${Array.from({ length: n }, (_, i) => `<rect x="${x + i * 16}" y="${y - 14}" width="5" height="18" rx="2"/>`).join('')}<rect x="${x - 2}" y="${y - 10}" width="${n * 16}" height="4" rx="2"/><rect x="${x - 2}" y="${y - 2}" width="${n * 16}" height="4" rx="2"/></g>`
const windmill = `<g transform="translate(430 190)"><ellipse cx="0" cy="44" rx="30" ry="6" fill="#000" opacity=".12"/><path d="M-18 44 L-10 -20 L10 -20 L18 44Z" fill="#fff4d9"/><path d="M0 -20 L10 -20 L18 44 L4 44Z" fill="#f1e2bd"/><path d="M-14 -20 L0 -38 L14 -20Z" fill="#ff6f5b"/><rect x="-5" y="28" width="10" height="16" rx="2" fill="#a8754a"/><g transform="translate(0 -24)" fill="#fff" stroke="#c48a52" stroke-width="2">${[20, 110, 200, 290].map(a => `<rect x="2" y="-5" width="40" height="10" transform="rotate(${a})"/>`).join('')}<circle r="4" fill="#7a4f2c"/></g></g>`
const castle = `<g transform="translate(410 640)"><ellipse cx="0" cy="62" rx="90" ry="12" fill="#000" opacity=".12"/><rect x="-60" y="0" width="120" height="60" fill="#c9d1e3"/><rect x="0" y="0" width="60" height="60" fill="#b3bdd4"/>${[-60, -36, -12, 12, 36].map(x => `<rect x="${x}" y="-10" width="14" height="12" fill="#c9d1e3"/>`).join('')}${[-76, 52].map(x => `<rect x="${x}" y="-36" width="24" height="96" fill="#d6dcea"/><path d="M${x - 4} -36 L${x + 12} -64 L${x + 28} -36Z" fill="#7b6cf6"/><rect x="${x + 11}" y="-84" width="2" height="22" fill="#7a4f2c"/><path d="M${x + 13} -84 l14 5 l-14 5z" fill="#ffb020"/><rect x="${x + 8}" y="-14" width="8" height="12" rx="4" fill="#4b5a6b"/>`).join('')}<path d="M-14 60 v-24 a14 14 0 0 1 28 0 v24z" fill="#8c5e38"/></g>`
const s2 = svg(37,
  pond(140, 640, 50, 30),
  use('house', 80, 140) + use('house', 150, 190, .85) + use('house', 60, 220, .75) + use('apple', 185, 120, .8) +
  `<g transform="translate(130 260)"><rect x="-10" y="-10" width="20" height="16" rx="3" fill="#b7bfcc"/><rect x="-14" y="-28" width="3" height="20" fill="#8c5e38"/><rect x="11" y="-28" width="3" height="20" fill="#8c5e38"/><path d="M-18 -26 L0 -38 L18 -26Z" fill="#e2533f"/></g>` +
  windmill + use('bush', 370, 250) + use('tree', 470, 300, .8) +
  field + fence(36, 455, 10) + use('sheep', 60, 500) + use('sheep', 110, 520) + use('sheep', 170, 495) +
  `<g transform="translate(420 450)"><path d="M-22 18 Q-24 -16 0 -20 Q24 -16 22 18Z" fill="#ffd36b"/><path d="M-16 -4 h32 M-18 8 h36" stroke="#e8b84a" stroke-width="2.5"/></g>` +
  use('tree', 470, 420, .9) + use('pine', 360, 520, .8) + castle + use('bush', 60, 720) + use('tree', 40, 600, .8) + use('rock', 200, 700) + use('bird', 330, 70) + use('bird', 346, 62),
  [[110, 180, 100], [430, 200, 70], [110, 400, 100], [410, 620, 110], [140, 640, 70], [420, 450, 40]])

;{
  const scenes = [s0, s1, s2]
  // each scene at its chapter offset, plus a copy above and below so anything crossing the tile edge wraps round
  const layer = l => Array.from({ length: N + 2 }, (_, j) => j - 1).map(k => `<g transform="translate(0 ${k * H})">${scenes[(k + N) % N][l]}</g>`).join('')
  writeFileSync(`${OUT}/world.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H * N}">${DEFS}<rect width="${W}" height="${H * N}" fill="#9fdc78"/>${layer(0)}${roadSvg}${layer(1)}</svg>`)
}
console.log('ok', roadX(272) | 0, roadX(636) | 0, roadX(208) | 0, roadX(696) | 0)
