<script setup lang="ts">
/**
 * 每个章节的统一骨架
 * 负责滚动吸附、页眉页脚的上下留白与内容最大宽度，并让内容垂直居中。
 * 章节自身的 id 由调用方透传到根 <section>（懒加载时挂在包裹层上）。
 */
defineProps<{
  headingId?: string
}>()
</script>

<template>
  <section
    class="snap-section relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-6 pb-[70px] pt-[90px] sm:px-10"
    :aria-labelledby="headingId"
  >
    <div class="mx-auto w-full max-w-[1200px]">
      <slot />
    </div>
  </section>
</template>
