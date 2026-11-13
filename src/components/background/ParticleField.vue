<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useTheme } from '@/composables/useTheme'

/**
 * 全站粒子场
 * ------------------------------------------------------------------
 * 固定在最底层，用稀疏的点和距离连线提示页面是「一张工作台」。
 * 数字刻意克制：粒子数随视口面积计算，最多 64 个；dpr 上限 1.5。
 * 偏好减少动态时只画一帧静态图，不启动 rAF。
 */
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
}

const canvas = ref<HTMLCanvasElement | null>(null)
const reducedMotion = useReducedMotion()
const { isDark } = useTheme()

let ctx: CanvasRenderingContext2D | null = null
let frame = 0
let particles: Particle[] = []
let width = 0
let height = 0
let ink = '#16181c'
let running = false

const pointer = { x: -9999, y: -9999 }

function readInk(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--c-fg').trim()
  return value || '#16181c'
}

function resize() {
  const el = canvas.value
  if (!el) return
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  width = window.innerWidth
  height = window.innerHeight
  el.width = Math.round(width * dpr)
  el.height = Math.round(height * dpr)
  ctx = el.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)

  const count = Math.max(28, Math.min(64, Math.round((width * height) / 26000)))
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
  }))

  draw()
}

function draw() {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = ink
  ctx.strokeStyle = ink

  for (const particle of particles) {
    ctx.globalAlpha = 0.22
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2)
    ctx.fill()
  }

  const linkDistance = 130
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i]!
      const b = particles[j]!
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      if (distance < linkDistance) {
        ctx.globalAlpha = (1 - distance / linkDistance) * 0.12
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }

  ctx.globalAlpha = 1
}

function tick() {
  if (!running) return
  for (const particle of particles) {
    // 鼠标附近轻轻让开，避免粒子穿过指针
    const dx = particle.x - pointer.x
    const dy = particle.y - pointer.y
    const distance = Math.hypot(dx, dy)
    if (distance > 0 && distance < 110) {
      const force = (1 - distance / 110) * 0.024
      particle.x += (dx / distance) * force * 10
      particle.y += (dy / distance) * force * 10
    }

    particle.x += particle.vx
    particle.y += particle.vy

    if (particle.x < -10) particle.x = width + 10
    if (particle.x > width + 10) particle.x = -10
    if (particle.y < -10) particle.y = height + 10
    if (particle.y > height + 10) particle.y = -10
  }

  draw()
  frame = requestAnimationFrame(tick)
}

function start() {
  if (running || reducedMotion.value) return
  running = true
  frame = requestAnimationFrame(tick)
}

function stop() {
  running = false
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

function onPointerMove(event: PointerEvent) {
  pointer.x = event.clientX
  pointer.y = event.clientY
}

function onVisibilityChange() {
  if (document.hidden) stop()
  else start()
}

onMounted(() => {
  ink = readInk()
  resize()
  start()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('visibilitychange', onVisibilityChange)
})

watch(isDark, () => {
  ink = readInk()
  draw()
})

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <canvas
    ref="canvas"
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-0 block h-full w-full"
  />
</template>
