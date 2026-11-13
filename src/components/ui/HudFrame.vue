<script setup lang="ts">
/**
 * HUD 四角括号
 * 纯装饰，跟随父元素文字颜色；需要强调时给父元素加 text-accent。
 */
withDefaults(
  defineProps<{
    /** 单个角的边长，px */
    size?: number
  }>(),
  { size: 14 },
)
</script>

<template>
  <span class="pointer-events-none absolute inset-0" aria-hidden="true">
    <span
      class="absolute left-0 top-0 border-l border-t border-current"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />
    <span
      class="absolute right-0 top-0 border-r border-t border-current"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />
    <span
      class="absolute bottom-0 left-0 border-b border-l border-current"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />
    <span
      class="absolute bottom-0 right-0 border-b border-r border-current"
      :style="{ width: `${size}px`, height: `${size}px` }"
    />
  </span>
</template>
