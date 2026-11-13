<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useReducedMotion } from '@/composables/useReducedMotion'

/**
 * 点阵品牌字
 * ------------------------------------------------------------------
 * 把文字画到离屏 canvas 上，再按网格采样像素，用圆点重绘。
 * 相比参考页里写死坐标的点阵，这个版本会跟随容器尺寸和文字自适应，
 * 鼠标靠近时点会被轻轻推开，离开后弹回原位。
 */
const props = withDefaults(
  defineProps<{
    text?: string
  }>(),
  { text: 'JDZONE' },
)

interface Dot {
  x: number
  y: number
  ox: number
  oy: number
  r: number
}

const canvas = ref<HTMLCanvasElement | null>(null)
const { isDark } = useTheme()
const reducedMotion = useReducedMotion()

let dots: Dot[] = []
let ink = '#5d646c'
let cssWidth = 0
let cssHeight = 0
let frame = 0
let settleFrames = 0
let resizeObserver: ResizeObserver | null = null
let pointerActive = false
let entrance = 1
let entranceStart = 0

const pointer = { x: -9999, y: -9999 }

function readInk(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--c-dim').trim()
  return value || '#5d646c'
}

/** 文字转为点阵坐标（按容器尺寸自适应） */
function build() {
  const el = canvas.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  if (rect.width < 8 || rect.height < 8) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  cssWidth = rect.width
  cssHeight = rect.height
  el.width = Math.round(cssWidth * dpr)
  el.height = Math.round(cssHeight * dpr)

  const ctx = el.getContext('2d')
  if (!ctx) return

  const offscreen = document.createElement('canvas')
  offscreen.width = Math.max(1, Math.round(cssWidth))
  offscreen.height = Math.max(1, Math.round(cssHeight))
  const off = offscreen.getContext('2d')
  if (!off) return

  let fontSize = cssHeight * 0.56
  const family = '"Oswald", "Impact", sans-serif'
  off.font = `700 ${fontSize}px ${family}`
  const measured = off.measureText(props.text).width
  const maxWidth = cssWidth * 0.84
  if (measured > maxWidth) fontSize *= maxWidth / measured
  if (measured < maxWidth * 0.55) fontSize *= Math.min(1.6, (maxWidth * 0.8) / Math.max(measured, 1))

  off.font = `700 ${fontSize}px ${family}`
  off.textAlign = 'center'
  off.textBaseline = 'middle'
  off.fillStyle = '#000'
  off.fillText(props.text, cssWidth / 2, cssHeight / 2)

  const data = off.getImageData(0, 0, offscreen.width, offscreen.height).data
  /*
   * 参考页的采样间距是 max(3, 宽度 / 180)。
   * 之前的 /68 让点阵明显变稀，这里回到参考密度，并用更细的半径
   * 保证字仍然呼吸得开；窄屏再放宽一档，避免点太密糊成一片。
   */
  const step = Math.max(3, Math.round(cssWidth / (cssWidth < 420 ? 130 : 172)))
  const radius = Math.max(1, Math.min(1.5, step * 0.34))

  const next: Dot[] = []
  for (let y = Math.floor(step / 2); y < offscreen.height; y += step) {
    for (let x = Math.floor(step / 2); x < offscreen.width; x += step) {
      const alpha = data[(y * offscreen.width + x) * 4 + 3]
      if (alpha > 90) {
        next.push({ x, y, ox: x, oy: y, r: radius })
      }
    }
  }

  dots = next
  entrance = 0
  entranceStart = performance.now()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  wake()
}

function draw() {
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx) return

  ctx.clearRect(0, 0, cssWidth, cssHeight)
  ctx.fillStyle = ink
  ctx.globalAlpha = 0.95
  ctx.beginPath()
  for (const dot of dots) {
    // 入场时从左向右依次点亮，比整块同时出现更像扫描
    if (entrance < 1 && entrance < dot.ox / Math.max(cssWidth, 1)) continue
    ctx.moveTo(dot.x + dot.r, dot.y)
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
  }
  ctx.fill()
  ctx.globalAlpha = 1
}

function tick() {
  frame = 0
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx) return

  let moving = false
  const radius = 74

  if (entrance < 1) {
    entrance = Math.min(1, (performance.now() - entranceStart) / 900)
    moving = entrance < 1
  }

  for (const dot of dots) {
    if (pointerActive) {
      const dx = dot.x - pointer.x
      const dy = dot.y - pointer.y
      const distance = Math.hypot(dx, dy)
      if (distance > 0 && distance < radius) {
        const force = (1 - distance / radius) * 4.5
        dot.x += (dx / distance) * force
        dot.y += (dy / distance) * force
      }
    }

    // 弹回原位
    dot.x += (dot.ox - dot.x) * 0.14
    dot.y += (dot.oy - dot.y) * 0.14
    if (Math.abs(dot.x - dot.ox) > 0.05 || Math.abs(dot.y - dot.oy) > 0.05) moving = true
  }

  draw()

  if (!pointerActive) settleFrames -= 1
  if (moving || pointerActive || settleFrames > 0) {
    frame = requestAnimationFrame(tick)
  }
}

function wake() {
  if (!frame) frame = requestAnimationFrame(tick)
}

function onPointerMove(event: PointerEvent) {
  if (reducedMotion.value || event.pointerType === 'touch') return
  const el = canvas.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  pointer.x = event.clientX - rect.left
  pointer.y = event.clientY - rect.top
  pointerActive = true
  wake()
}

function onPointerLeave() {
  pointerActive = false
  settleFrames = 48
  wake()
}

onMounted(() => {
  ink = readInk()
  build()

  if (typeof ResizeObserver !== 'undefined' && canvas.value) {
    resizeObserver = new ResizeObserver(() => {
      build()
    })
    resizeObserver.observe(canvas.value)
  }

  // 字体加载完成后再量一次，避免用回退字体计算点阵
  document.fonts?.ready.then(() => build())

  const el = canvas.value
  el?.addEventListener('pointermove', onPointerMove)
  el?.addEventListener('pointerleave', onPointerLeave)
})

watch(isDark, () => {
  ink = readInk()
  draw()
})

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  resizeObserver?.disconnect()
  resizeObserver = null

  const el = canvas.value
  el?.removeEventListener('pointermove', onPointerMove)
  el?.removeEventListener('pointerleave', onPointerLeave)
})
</script>

<template>
  <canvas
    ref="canvas"
    role="img"
    :aria-label="`${text} 点阵标识`"
    class="block h-full w-full"
  />
</template>
