<script setup lang="ts">
/**
 * 品牌印章
 * 参考样式里的「JD」小方块，用在页眉、页脚与移动端菜单。
 */
withDefaults(
  defineProps<{
    size?: 'sm' | 'md'
  }>(),
  { size: 'sm' },
)
</script>

<template>
  <span
    class="inline-grid shrink-0 place-items-center notch-sm bg-accent font-display font-bold uppercase text-on-accent"
    :class="size === 'md' ? 'h-12 w-12 text-lg' : 'h-8 w-8 text-[13px]'"
    aria-hidden="true"
  >
    JD
  </span>
</template>
