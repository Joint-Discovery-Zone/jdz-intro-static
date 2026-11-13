<script setup lang="ts">
import { computed, ref } from 'vue'
import { PhMoon, PhSun } from '@phosphor-icons/vue'
import { useTheme } from '@/composables/useTheme'

/**
 * 主题切换按钮
 * 圆形揭示的圆心取按钮中心；点击时按钮自身翻转一圈，
 * 与参考页的 .theme-btn.flip 保持一致。
 */
const { isDark, toggle } = useTheme()

const icon = computed(() => (isDark.value ? PhSun : PhMoon))
const label = computed(() => (isDark.value ? '切换到浅色主题' : '切换到深色主题'))
const flipping = ref(false)

function handleClick(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()

  flipping.value = true
  window.setTimeout(() => (flipping.value = false), 660)

  toggle({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  })
}
</script>

<template>
  <button
    type="button"
    class="theme-btn grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-line bg-panel text-ink transition-[color,border-color,transform] duration-300 hover:rotate-[14deg] hover:border-accent hover:text-accent active:scale-90 focus-clip"
    :class="{ 'theme-btn-flip': flipping }"
    :aria-label="`${label}（快捷键 Ctrl + J）`"
    :aria-pressed="isDark"
    :title="`${label}（Ctrl + J）`"
    @click="handleClick"
  >
    <Transition name="theme-icon" mode="out-in">
      <component
        :is="icon"
        :key="String(isDark)"
        :size="14"
        weight="regular"
        aria-hidden="true"
        class="theme-icon"
      />
    </Transition>
  </button>
</template>
