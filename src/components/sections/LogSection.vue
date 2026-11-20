<script setup lang="ts">
import type { SiteContent } from '@/types/site'
import ChapterHeading from '@/components/ui/ChapterHeading.vue'
import SectionShell from '@/components/layout/SectionShell.vue'

/**
 * 开发日志
 * 参考页的虚线分隔列表：左列是状态词（CURRENT / PLANNING / ARCHIVED），
 * 右列是标题与一句摘要。桌面双列，窄屏上下堆叠。
 */
defineProps<{
  content: SiteContent
}>()
</script>

<template>
  <SectionShell heading-id="log-title">
    <ChapterHeading index="04" title="开发日志" label-en="JOURNAL" heading-id="log-title" />

    <ul class="mt-8 max-w-[820px]">
      <li
        v-for="(entry, index) in content.log"
        :key="entry.id"
        v-reveal="{ delay: 100 + index * 70, variant: 'fade' }"
        class="group relative grid gap-1.5 border-t border-dashed border-line py-4 last:border-b sm:grid-cols-[118px_1fr] sm:gap-7"
      >
        <span
          class="pointer-events-none absolute right-1 top-5 hidden -translate-x-1 font-mono text-[14px] text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block"
          aria-hidden="true"
        >
          ↗
        </span>
        <span class="pt-0.5 font-mono text-[11.5px] font-bold tracking-[0.14em] text-accent">
          {{ entry.date }}
        </span>
        <div class="min-w-0">
          <h3 class="text-[15px] font-bold leading-snug">{{ entry.title }}</h3>
          <p class="mt-1 text-[13.5px] leading-[1.75] text-muted">{{ entry.body }}</p>
        </div>
      </li>
    </ul>
  </SectionShell>
</template>
