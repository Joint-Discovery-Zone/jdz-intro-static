<script setup lang="ts">
import { ref } from 'vue'

/**
 * 通用按钮
 * ------------------------------------------------------------------
 * - 默认渲染 <button>，传入 href 时渲染 <a>，外观与交互保持一致
 * - 点击时在指针位置生成水波；键盘触发（detail 为 0）则在中心生成
 * - 外观沿用参考页：切角、内描边、悬停上浮 + 偏移硬阴影
 */
type Variant = 'solid' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    href?: string
    variant?: Variant
    size?: Size
    block?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'solid',
    size: 'md',
    block: false,
    type: 'button',
  },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const root = ref<HTMLElement | null>(null)

const base =
  'btn-inner group relative inline-flex cursor-pointer select-none items-center justify-center gap-2 overflow-hidden border font-sans font-semibold tracking-[0.06em] notch transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 focus-clip'

const variantClass: Record<Variant, string> = {
  solid:
    'border-accent bg-accent text-on-accent hover:shadow-[4px_4px_0_rgba(0,0,0,0.15)]',
  outline:
    'border-line-strong text-ink hover:border-accent hover:text-accent hover:shadow-[4px_4px_0_var(--c-line)]',
  ghost:
    'border-line bg-transparent text-ink hover:border-ink hover:shadow-[4px_4px_0_var(--c-line)]',
}

const sizeClass: Record<Size, string> = {
  sm: 'px-4 py-2 text-[11px]',
  md: 'px-5 py-2.5 text-xs',
  lg: 'px-7 py-[13px] text-[13.5px]',
}

/** 在按钮内部的指定坐标生成一圈扩散的水波 */
function spawnRipple(clientX: number, clientY: number) {
  const el = root.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2

  const ripple = document.createElement('span')
  ripple.className = 'click-ripple'
  ripple.style.width = `${size}px`
  ripple.style.height = `${size}px`
  ripple.style.left = `${clientX - rect.left - size / 2}px`
  ripple.style.top = `${clientY - rect.top - size / 2}px`

  el.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
}

function handlePointerDown(event: PointerEvent) {
  spawnRipple(event.clientX, event.clientY)
}

function handleClick(event: MouseEvent) {
  // 键盘触发的 click 没有指针坐标，从按钮中心补一次反馈
  if (event.detail === 0) {
    const rect = root.value?.getBoundingClientRect()
    if (rect) spawnRipple(rect.left + rect.width / 2, rect.top + rect.height / 2)
  }

  emit('click', event)
}
</script>

<template>
  <component
    :is="props.href ? 'a' : 'button'"
    ref="root"
    :href="props.href"
    :type="props.href ? undefined : props.type"
    :class="[base, variantClass[props.variant], sizeClass[props.size], props.block && 'w-full']"
    @pointerdown="handlePointerDown"
    @click="handleClick"
  >
    <slot />

    <span
      v-if="$slots.icon"
      class="inline-flex transition-transform duration-300 ease-brand group-hover:translate-x-1 group-active:translate-x-0.5"
    >
      <slot name="icon" />
    </span>
  </component>
</template>
