<script setup lang="ts">
/**
 * 章节骨架
 * 电影感长页不再强制整屏吸附，只保留整屏的最小高度与统一的深色表面。
 * id 由调用方透传到根 <section>（懒加载时挂在包裹层上）。
 */
defineProps<{
  headingId?: string
}>()
</script>

<template>
  <section
    class="cinema-section relative flex min-h-[100dvh] scroll-mt-20 flex-col justify-center overflow-hidden px-6 pb-24 pt-32 sm:px-10 lg:px-14 xl:px-20"
    :aria-labelledby="headingId"
  >
    <div class="relative z-10 mx-auto w-full max-w-[1480px]">
      <slot />
    </div>
  </section>
</template>
