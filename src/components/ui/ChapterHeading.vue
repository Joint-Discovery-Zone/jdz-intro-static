<script setup lang="ts">
/**
 * 章节标题
 * 电影感版本：索引退成等宽坐标，标题放大到展示级字重。
 * 索引行对读屏隐藏，只读真正的 h2。
 */
withDefaults(
  defineProps<{
    index: string
    title?: string
    labelEn: string
    total?: string
    headingId?: string
    srTitle?: string
  }>(),
  { total: '06' },
)
</script>

<template>
  <header class="max-w-[1000px]">
    <div v-reveal="{ variant: 'fade' }" class="flex items-center gap-3" aria-hidden="true">
      <span class="h-px w-8 bg-accent" />
      <span class="font-mono text-[10px] font-semibold tracking-[0.24em] text-accent">
        {{ index }} <span class="text-ink/25">/ {{ total }}</span>
      </span>
      <span class="font-mono text-[10px] tracking-[0.24em] text-muted">
        {{ labelEn }}
      </span>
    </div>

    <h2
      v-if="title"
      v-reveal="{ delay: 60, variant: 'up' }"
      :id="headingId"
      class="mt-7 font-display text-[clamp(44px,5.6vw,78px)] font-bold uppercase leading-[0.94] tracking-[0.005em]"
    >
      {{ title }}
    </h2>
    <h2 v-else-if="srTitle" :id="headingId" class="sr-only">{{ srTitle }}</h2>
  </header>
</template>
