<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type {
  Color,
  Group,
  LineBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import DotMatrixWord from '@/components/background/DotMatrixWord.vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useTheme } from '@/composables/useTheme'

/**
 * Three.js 首页字标
 * ------------------------------------------------------------------
 * 设计意图：
 * - 保留参考页“点阵字”作为品牌识别，但把它从平面升级成有厚度的点云；
 * - 用三颗极细的轨道线暗示“三个人 / 三条工作流”，只有一段是朱红色；
 * - 鼠标经过时点云被轻轻推开，指针离开后弹回；
 * - 首屏等待启动层退场后再组装，避免动画藏在启动层后面空转。
 *
 * 性能策略：
 * - three 通过动态 import 加载，不进入首屏主包；
 * - 点云用单次 BufferGeometry + 自定义 shader，15k 级点也只有一个 draw call；
 * - 离开视口 / 页面隐藏时暂停 rAF；
 * - 系统开启“减弱动效”或 WebGL 不可用时，保留原来的 2D 点阵字作为降级。
 */
const props = withDefaults(
  defineProps<{
    text?: string
  }>(),
  { text: 'JDZone' },
)

type ThreeModule = typeof import('three')

interface HeroUniforms {
  // 索引签名让它可以被 THREE.ShaderMaterial 的 uniforms 接受
  [uniform: string]: { value: number | Color | Vector2 }
  uTime: { value: number }
  uProgress: { value: number }
  uSize: { value: number }
  uDpr: { value: number }
  uMouse: { value: Vector2 }
  uInk: { value: Color }
  uAccent: { value: Color }
  uSignal: { value: Color }
}

const host = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const ready = ref(false)
const fallbackVisible = ref(true)
const pointCount = ref(0)
const reduced = useReducedMotion()
const { isDark } = useTheme()

let renderer: WebGLRenderer | null = null
let scene: Scene | null = null
let camera: PerspectiveCamera | null = null
let assembly: Group | null = null
let wordPoints: Points | null = null
let uniforms: HeroUniforms | null = null
let frameId = 0
let running = false
let visible = true
let disposed = false
let started = false
let bootDone = false
let entranceStart = 0
let lastFrame = 0
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let bootTimer = 0
let hideFallbackTimer = 0

const pointer = { x: 0, y: 0 }
const mouseTarget = { x: 0, y: 0 }
const ringDisposables: Array<{ dispose: () => void }> = []
const ringMaterials: Array<{ material: LineBasicMaterial; tone: 'ink' | 'accent' }> = []
const nodeMaterials: Array<{ material: PointsMaterial; tone: 'accent' | 'signal' }> = []
const nodeMarkerMaterials: Array<{ material: LineBasicMaterial; tone: 'accent' | 'signal' }> = []

/** 读取主题 CSS 变量，保证 3D 颜色与页面 token 同步 */
function readToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/** 把点阵字画到离屏 canvas 上，按像素采样成点云 */
function buildWordGeometry(THREE: ThreeModule, text: string) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  const fontSize = 260
  const family = 'Oswald, "Arial Narrow", Impact, sans-serif'
  ctx.font = `700 ${fontSize}px ${family}`
  const metrics = ctx.measureText(text)
  const textWidth = Math.max(1, metrics.width)

  // 画布贴着字形裁切，避免把大量空白采样成无意义的点
  canvas.width = Math.ceil(textWidth * 1.04)
  canvas.height = Math.ceil(fontSize * 1.28)

  ctx.font = `700 ${fontSize}px ${family}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + fontSize * 0.02)

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const step = window.innerWidth < 720 ? 3 : 2
  const positions: number[] = []
  const tones: number[] = []
  const scales: number[] = []
  const phases: number[] = []

  const worldWidth = 5.35
  const unit = worldWidth / canvas.width

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const alpha = data[(y * canvas.width + x) * 4 + 3]
      if (alpha < 150) continue

      // 两层轻微抖动，让字看起来不是一张贴图
      const jx = (Math.random() - 0.5) * step * 0.36
      const jy = (Math.random() - 0.5) * step * 0.36
      const px = x + jx - canvas.width / 2
      const py = canvas.height / 2 - (y + jy)

      const wx = px * unit
      const wy = py * unit
      const wz = (Math.random() - 0.5) * 0.72 + Math.sin(wx * 1.7) * 0.07

      positions.push(wx, wy, wz)

      // 绝大多数是墨色，少量朱红与信号青，像扫描出来的噪点
      const r = Math.random()
      tones.push(r > 0.99 ? 2 : r > 0.973 ? 1 : 0)
      scales.push(0.62 + Math.random() * 0.55)
      phases.push(Math.random() * Math.PI * 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  pointCount.value = positions.length / 3
  geometry.setAttribute('aTone', new THREE.Float32BufferAttribute(tones, 1))
  geometry.setAttribute('aScale', new THREE.Float32BufferAttribute(scales, 1))
  geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1))

  return geometry
}

/** 轨道节点用的柔光圆点纹理，避免 PointsMaterial 默认的方块 */
function createNodeTexture(THREE: ThreeModule) {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** 轨道圆环，半径与朝向都不同，像三份并行的工作流 */
function buildCircle(THREE: ThreeModule, radius: number, from: number, to: number, segments = 160) {
  const points: Vector3[] = []
  for (let i = 0; i <= segments; i += 1) {
    const a = from + (to - from) * (i / segments)
    points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uDpr;
  uniform vec2 uMouse;
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform vec3 uSignal;

  attribute float aTone;
  attribute float aScale;
  attribute float aPhase;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // 入场：从一圈散点收拢成字；每个点相位不同，收拢时间自然错开
    vec3 fromPos = vec3(
      cos(aPhase) * 3.2,
      sin(aPhase * 1.4) * 1.75,
      -1.4 + sin(aPhase * 2.0) * 1.1
    );
    // 注意：每个点的相位只延后入场，不能在 100% 时留下残余位移，
    // 否则字会被“散点环”拉花，看起来只是一团噪声。
    float delayed = clamp((uProgress - (aPhase / 6.2831853) * 0.12) / 0.88, 0.0, 1.0);
    float assemble = delayed * delayed * (3.0 - 2.0 * delayed);
    pos = mix(fromPos, pos, assemble);

    // 静止时非常轻的呼吸波，让点云保持“活”的质感
    pos.z += sin(uTime * 0.9 + pos.x * 2.1 + pos.y * 1.4) * 0.035 * assemble;

    // 指针排斥：在字所在的平面内推开一小块区域
    vec2 away = pos.xy - uMouse;
    float dist = length(away);
    float push = (1.0 - smoothstep(0.0, 0.85, dist)) * 0.15 * assemble;
    pos.xy += normalize(away + 0.0001) * push;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float tone = aTone;
    vColor = tone < 0.5 ? uInk : (tone < 1.5 ? uAccent : uSignal);
    vAlpha = smoothstep(0.05, 0.45, uProgress) * (0.7 + aScale * 0.3);

    // 用深度轻微改变点径与透明度，静态截图里也能读出前后层次
    float depth = smoothstep(-0.35, 0.35, pos.z);
    vAlpha *= 0.82 + depth * 0.18;
    gl_PointSize = uSize * aScale * uDpr * (0.78 + depth * 0.5) * (5.4 / -mvPosition.z);
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float soft = 1.0 - smoothstep(0.12, 0.5, d);
    gl_FragColor = vec4(vColor, soft * vAlpha);
    #include <colorspace_fragment>
  }
`

function init(THREE: ThreeModule) {
  const mount = stage.value
  if (!mount || disposed) return

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearAlpha(0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.domElement.className = 'three-hero__canvas'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  mount.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40)
  camera.position.z = 6.0

  assembly = new THREE.Group()
  scene.add(assembly)

  // --- 点云字 ---
  const geometry = buildWordGeometry(THREE, props.text)
  uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uSize: { value: 3.55 },
    uDpr: { value: Math.min(window.devicePixelRatio || 1, 2) },
    uMouse: { value: new THREE.Vector2(9, 9) },
    uInk: { value: new THREE.Color(readToken('--c-dim', '#5d646c')) },
    uAccent: { value: new THREE.Color(readToken('--c-accent', '#c84630')) },
    uSignal: { value: new THREE.Color(readToken('--c-signal-ink', '#0b6b7f')) },
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })

  wordPoints = new THREE.Points(geometry, material)
  wordPoints.renderOrder = 2
  wordPoints.frustumCulled = false
  assembly.add(wordPoints)
  ringDisposables.push(geometry, material)

  // --- 轨道：一条墨色细椭圆 + 一段朱红弧线，三个节点落在后者附近 ---
  const inkColor = new THREE.Color(readToken('--c-dim', '#5d646c'))
  const accentColor = new THREE.Color(readToken('--c-accent', '#c84630'))
  const rings: Array<{ radius: number; from: number; to: number; tone: 'ink' | 'accent'; opacity: number; rotation: [number, number, number] }> = [
    { radius: 3.12, from: 0, to: Math.PI * 2, tone: 'ink', opacity: 0.16, rotation: [1.16, 0.16, 0.12] },
    { radius: 3.02, from: 0.38, to: 4.32, tone: 'accent', opacity: 0.45, rotation: [1.02, -0.2, -0.34] },
  ]

  rings.forEach((ring) => {
    const ringGeometry = buildCircle(THREE, ring.radius, ring.from, ring.to)
    const ringMaterial = new THREE.LineBasicMaterial({
      color: ring.tone === 'accent' ? accentColor : inkColor,
      transparent: true,
      opacity: ring.opacity,
      depthTest: false,
      depthWrite: false,
    })
    const line = new THREE.Line(ringGeometry, ringMaterial)
    line.rotation.set(...ring.rotation)
    line.renderOrder = 1
    assembly?.add(line)
    ringMaterials.push({ material: ringMaterial, tone: ring.tone })
    ringDisposables.push(ringGeometry, ringMaterial)
  })

  // --- 轨道上的三个操作员节点：一颗朱红，两颗信号青 ---
  const nodeTexture = createNodeTexture(THREE)
  const nodeSpecs = [
    { angle: 0.95, tone: 'accent' as const, size: 0.12 },
    { angle: 2.35, tone: 'signal' as const, size: 0.085 },
    { angle: 3.68, tone: 'signal' as const, size: 0.085 },
  ]
  // 三个节点共享同一条轨道朝向，用一个 group 统一旋转
  const nodeGroup = new THREE.Group()
  nodeGroup.rotation.set(1.02, -0.2, -0.34)
  assembly.add(nodeGroup)

  // 细小的圆环标记，保证节点在静态截图里也能被看见
  const markerGeometry = buildCircle(THREE, 0.09, 0, Math.PI * 2, 48)
  const crossGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.055, 0, 0),
    new THREE.Vector3(0.055, 0, 0),
    new THREE.Vector3(0, -0.055, 0),
    new THREE.Vector3(0, 0.055, 0),
  ])
  ringDisposables.push(markerGeometry, crossGeometry)

  nodeSpecs.forEach((node) => {
    const color = new THREE.Color(
      readToken(node.tone === 'accent' ? '--c-accent' : '--c-signal-ink', node.tone === 'accent' ? '#c84630' : '#0b6b7f'),
    )
    const nodeGeometry = new THREE.BufferGeometry()
    nodeGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        [Math.cos(node.angle) * 3.02, Math.sin(node.angle) * 3.02, 0],
        3,
      ),
    )
    const material = new THREE.PointsMaterial({
      color,
      size: node.size,
      sizeAttenuation: true,
      map: nodeTexture,
      transparent: true,
      opacity: 1,
      depthTest: false,
      depthWrite: false,
    })
    const points = new THREE.Points(nodeGeometry, material)
    points.position.set(Math.cos(node.angle) * 3.02, Math.sin(node.angle) * 3.02, 0)
    points.renderOrder = 4
    nodeGroup.add(points)
    nodeMaterials.push({ material, tone: node.tone })

    const markerMaterial = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: node.tone === 'accent' ? 0.62 : 0.42,
      depthTest: false,
      depthWrite: false,
    })
    const marker = new THREE.LineLoop(markerGeometry, markerMaterial)
    marker.position.copy(points.position)
    marker.renderOrder = 3
    nodeGroup.add(marker)

    // 中心十字让环标记读起来像测量节点，而不是随手画的圆圈
    const crossMaterial = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      depthWrite: false,
    })
    const cross = new THREE.LineSegments(crossGeometry, crossMaterial)
    cross.position.copy(points.position)
    cross.renderOrder = 5
    nodeGroup.add(cross)

    nodeMarkerMaterials.push({ material: markerMaterial, tone: node.tone })
    nodeMarkerMaterials.push({ material: crossMaterial, tone: node.tone })
    ringDisposables.push(material, nodeGeometry, markerMaterial, crossMaterial)
  })
  if (nodeTexture) ringDisposables.push(nodeTexture)

  // --- 尺寸 ---
  const mountSize = mount.getBoundingClientRect()
  resize(mountSize.width || 1, mountSize.height || 1)

  resizeObserver = new ResizeObserver((entries) => {
    const box = entries[0]?.contentRect
    if (box) resize(box.width, box.height)
  })
  resizeObserver.observe(mount)

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true
      syncRunning()
    },
    { threshold: 0.01 },
  )
  intersectionObserver.observe(host.value ?? mount)

  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('pointermove', onWindowPointerMove, { passive: true })
  window.addEventListener('pointerup', onPointerRelease, { passive: true })

  // 首帧：先渲染一张“散点”，再用 CSS 淡入，避免闪白
  if (renderer && scene && camera) renderer.render(scene, camera)
  ready.value = true

  maybeStartEntrance()
  syncRunning()
}

function resize(width: number, height: number) {
  if (!renderer || !camera || width <= 0 || height <= 0) return
  const aspect = width / height
  renderer.setSize(width, height, false)
  camera.aspect = aspect
  camera.fov = aspect < 1.15 ? 38 : 34
  camera.position.z = aspect < 1.15 ? 7.1 : 6.0
  camera.updateProjectionMatrix()
  if (uniforms) uniforms.uDpr.value = Math.min(window.devicePixelRatio || 1, 2)
  // 窄屏把字整体收一点，给轨道留出呼吸空间
  const scale = Math.min(1, Math.max(0.8, aspect / 1.75))
  assembly?.scale.setScalar(scale)
  if (running) render(performance.now())
}

/** 主题切换后同步点云与轨道颜色 */
function syncColors() {
  if (!uniforms) return
  // 颜色对象在创建时来自 three，直接 setStyle 保持正确的色彩空间
  uniforms.uInk.value.setStyle(readToken('--c-dim', '#5d646c'))
  uniforms.uAccent.value.setStyle(readToken('--c-accent', '#c84630'))
  uniforms.uSignal.value.setStyle(readToken('--c-signal-ink', '#0b6b7f'))

  ringMaterials.forEach(({ material, tone }) => {
    material.color.setStyle(tone === 'accent' ? readToken('--c-accent', '#c84630') : readToken('--c-dim', '#5d646c'))
    material.needsUpdate = true
  })
  nodeMaterials.forEach(({ material, tone }) => {
    material.color.setStyle(
      readToken(tone === 'accent' ? '--c-accent' : '--c-signal-ink', tone === 'accent' ? '#c84630' : '#0b6b7f'),
    )
  })
  nodeMarkerMaterials.forEach(({ material, tone }) => {
    material.color.setStyle(
      readToken(tone === 'accent' ? '--c-accent' : '--c-signal-ink', tone === 'accent' ? '#c84630' : '#0b6b7f'),
    )
  })
}

function beginEntrance() {
  if (started || !ready.value) return
  started = true
  entranceStart = performance.now()
  // 点云开始显形后再收起 2D 降级层，避免中间出现空白
  hideFallbackTimer = window.setTimeout(() => {
    fallbackVisible.value = false
  }, 1100)
}

function maybeStartEntrance() {
  if (bootDone) beginEntrance()
}

function onBootDone() {
  bootDone = true
  maybeStartEntrance()
}

function onWindowPointerMove(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  const mount = host.value
  if (!mount) return
  const rect = mount.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
  pointer.x = Math.max(-1.4, Math.min(1.4, x))
  pointer.y = Math.max(-1.4, Math.min(1.4, y))
}

function onPointerRelease() {
  pointer.x = 0
  pointer.y = 0
}

function onVisibilityChange() {
  syncRunning()
}

function syncRunning() {
  const shouldRun = visible && !document.hidden && !disposed && ready.value
  if (shouldRun && !running) {
    running = true
    lastFrame = performance.now()
    frameId = requestAnimationFrame(tick)
  } else if (!shouldRun && running) {
    running = false
    cancelAnimationFrame(frameId)
    frameId = 0
  }
}

function tick(now: number) {
  if (!running) return
  render(now)
  frameId = requestAnimationFrame(tick)
}

function render(now: number) {
  if (!renderer || !scene || !camera || !assembly || !uniforms) return

  const delta = Math.min(64, now - lastFrame)
  lastFrame = now
  const elapsed = now / 1000

  mouseTarget.x += (pointer.x - mouseTarget.x) * Math.min(1, delta / 140)
  mouseTarget.y += (pointer.y - mouseTarget.y) * Math.min(1, delta / 140)

  const entrance = started ? Math.min(1, Math.max(0, (now - entranceStart) / 1900)) : 0
  const eased = 1 - Math.pow(1 - entrance, 3)

  uniforms.uTime.value = elapsed
  uniforms.uProgress.value = eased
  uniforms.uMouse.value.set(mouseTarget.x * 2.55, mouseTarget.y * 1.45)

  // 小幅摆动就够，保持文字可读；指针只改变姿态，不改变构图
  assembly.rotation.y = Math.sin(elapsed * 0.22) * 0.16 + mouseTarget.x * 0.1
  assembly.rotation.x = Math.sin(elapsed * 0.17) * 0.055 - mouseTarget.y * 0.07
  assembly.position.x = 0.1
  assembly.position.y = -0.1 + Math.sin(elapsed * 0.5) * 0.035

  renderer.render(scene, camera)
}

function dispose() {
  disposed = true
  running = false
  cancelAnimationFrame(frameId)
  window.clearTimeout(bootTimer)
  window.clearTimeout(hideFallbackTimer)
  window.removeEventListener('jdz:boot-done', onBootDone)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('pointermove', onWindowPointerMove)
  window.removeEventListener('pointerup', onPointerRelease)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  ringDisposables.forEach((item) => item.dispose())
  ringDisposables.length = 0
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement.remove()
    renderer = null
  }
  scene = null
  camera = null
  assembly = null
  wordPoints = null
  uniforms = null
  nodeMaterials.length = 0
  nodeMarkerMaterials.length = 0
}

onMounted(async () => {
  if (reduced.value) return

  window.addEventListener('jdz:boot-done', onBootDone, { once: true })
  if (!document.documentElement.classList.contains('booting')) {
    bootDone = true
  } else {
    // 启动层异常时也要能开始，避免 3D 永远停在散点状态
    bootTimer = window.setTimeout(() => {
      bootDone = true
      maybeStartEntrance()
    }, 2600)
  }

  try {
    await Promise.race([
      document.fonts.load('700 260px Oswald'),
      new Promise((resolve) => window.setTimeout(resolve, 1400)),
    ])
    if (disposed) return

    const THREE = await import('three')
    if (disposed) return
    init(THREE)
  } catch (error) {
    // 加载失败时保留 2D 点阵字，页面仍然完整可用
    console.warn('[ThreeHeroWord] 3D 字标初始化失败，已回退到点阵字。', error)
  }
})

watch(isDark, () => {
  // 等主题遮罩提交后再读 CSS 变量，颜色与页面同步
  window.requestAnimationFrame(syncColors)
})

onBeforeUnmount(dispose)
</script>

<template>
  <div ref="host" class="three-hero relative h-full w-full">
    <DotMatrixWord
      v-if="fallbackVisible"
      :text="text"
      class="absolute inset-0 h-full w-full transition-opacity duration-700"
      :class="ready ? 'opacity-0' : 'opacity-100'"
    />

    <div
      ref="stage"
      class="three-hero__stage absolute inset-0 transition-opacity duration-700"
      :class="ready ? 'opacity-100' : 'opacity-0'"
      aria-hidden="true"
    />

    <!-- 3D 场景的 HUD 说明；只做装饰，屏幕阅读器读下面的完整描述 -->
    <div
      v-if="ready"
      class="pointer-events-none absolute inset-0 hidden font-mono text-[8px] uppercase tracking-[0.2em] text-muted/75 sm:block"
      aria-hidden="true"
    >
      <span class="absolute left-1 top-1 flex items-center gap-1.5">
        <span class="h-1 w-1 bg-accent" />
        FIELD / 03 NODES
      </span>
      <span class="absolute right-1 top-1">THREE.JS / LIVE</span>
      <span class="absolute bottom-1 right-1">{{ pointCount.toLocaleString('en-US') }} PTS</span>
    </div>

    <span class="sr-only">{{ text }} 点阵字标，由三个节点的轨道环绕。</span>
  </div>
</template>

<style scoped>
.three-hero {
  contain: layout paint;
}

.three-hero__stage {
  -webkit-mask-image: radial-gradient(ellipse 74% 70% at 50% 50%, #000 52%, transparent 88%);
  mask-image: radial-gradient(ellipse 74% 70% at 50% 50%, #000 52%, transparent 88%);
}

.three-hero :deep(.three-hero__canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
