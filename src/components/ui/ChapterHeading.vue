<script setup lang="ts">
/**
 * 章节标题
 * 保留参考页的章节索引排版：大号等宽编号 + 「/ 06」+ 英文标签，
 * 下面接中文标题。索引行对读屏隐藏，只读真正的标题。
 * 成员页与联系页没有常规标题，用 srTitle 提供一个可访问名称。
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
  <header>
    <div v-reveal="{ variant: 'up' }" class="flex items-baseline gap-1.5" aria-hidden="true">
      <span
        class="font-mono text-[clamp(48px,6vw,72px)] font-extrabold leading-none tracking-[-0.05em] text-accent"
      >
        {{ index }}
      </span>
      <span class="font-mono text-[clamp(18px,2.5vw,28px)] font-light leading-none text-muted">
        /
      </span>
      <span class="font-mono text-[clamp(18px,2.5vw,28px)] font-light leading-none text-muted">
        {{ total }}
      </span>
      <span class="ml-3 self-end pb-1.5 font-mono text-[10px] tracking-[0.3em] text-muted">
        {{ labelEn }}
      </span>
    </div>

    <h2
      v-if="title"
      v-reveal="{ delay: 80, variant: 'up' }"
      :id="headingId"
      class="mt-4 text-[clamp(28px,4.2vw,50px)] font-extrabold leading-[1.12] tracking-[-0.01em]"
    >
      {{ title }}
    </h2>
    <h2 v-else-if="srTitle" :id="headingId" class="sr-only">{{ srTitle }}</h2>
  </header>
</template>
