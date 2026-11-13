<template>
  <!-- 懒加载章节的占位骨架，尺寸与真实内容接近，减少加载完成后的跳动 -->
  <div
    class="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-12"
    role="status"
    aria-live="polite"
  >
    <div aria-hidden="true">
      <div class="mb-8 h-14 w-32 notch-sm skeleton-sheen" />
      <div class="h-px w-full bg-line" />
      <div class="mt-8 h-[38vh] max-h-[380px] w-full notch-lg skeleton-sheen" />
      <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div v-for="item in 4" :key="item" class="h-16 notch-sm skeleton-sheen" />
      </div>
    </div>
    <span class="sr-only">正在加载这一章的内容</span>
  </div>
</template>
