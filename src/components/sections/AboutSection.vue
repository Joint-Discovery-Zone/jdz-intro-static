<script setup lang="ts">
import type { SiteContent } from '@/types/site'
import ChapterHeading from '@/components/ui/ChapterHeading.vue'
import SectionShell from '@/components/layout/SectionShell.vue'

/**
 * 关于
 * 左侧两段介绍，右侧三条工作方式；保留参考页的「+」列表，
 * 不改成卡片，也不额外添加与本页无关的宣言。
 */
defineProps<{
  content: SiteContent
}>()
</script>

<template>
  <SectionShell heading-id="about-title">
    <ChapterHeading index="05" title="关于 JDZone" label-en="ABOUT" heading-id="about-title" />

    <div class="mt-7 grid gap-[38px] min-[960px]:grid-cols-[1.05fr_0.95fr] min-[960px]:gap-[60px]">
      <div v-reveal="{ variant: 'left' }">
        <p class="text-[16px] leading-[1.9] text-ink/90">
          Joint Discovery Zone（简称 JDZone）是一个由三名成员组成的软件工程小组。“Joint” 代表协作，“Discovery” 代表探索。
        </p>
        <p class="mt-4 text-[14.5px] leading-[1.95] text-muted">
          我们相信好的软件来自持续的发现与共同的构建：先跑通最小闭环，再逐步完善细节。项目仍处于开发阶段，站点内容也会随迭代持续更新。
        </p>
      </div>

      <ul v-reveal="{ delay: 120, variant: 'right' }" class="list-none">
        <li
          v-for="(principle, index) in content.principles"
          :key="principle.index"
          class="group relative grid gap-1 border-t border-line py-4 transition-colors duration-300 hover:border-accent-line"
          :class="{ 'border-b': index === content.principles.length - 1 }"
        >
          <span
            class="absolute -left-4 top-4 font-mono text-xs text-muted transition-all duration-300 group-hover:rotate-90 group-hover:scale-125 group-hover:text-accent"
            aria-hidden="true"
            >+</span
          >
          <b class="text-[15px] font-bold tracking-[0.01em] transition-colors duration-300 group-hover:text-accent">
            {{ principle.title }}
          </b>
          <span class="text-[13.5px] leading-[1.7] text-muted transition-colors duration-300 group-hover:text-ink/80">
            {{ principle.body }}
          </span>
        </li>
      </ul>
    </div>
  </SectionShell>
</template>
