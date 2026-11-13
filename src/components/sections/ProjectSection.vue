<script setup lang="ts">
import type { PhaseState, SiteContent } from '@/types/site'
import ChapterHeading from '@/components/ui/ChapterHeading.vue'
import SectionShell from '@/components/layout/SectionShell.vue'

/**
 * 项目进展
 * 左侧状态与说明，右侧五阶段路线图；状态同时用填充、描边和文字表达，
 * 不依赖颜色单独传达，黑白模式下也能读。
 */
const props = defineProps<{
  content: SiteContent
}>()

const project = props.content.project

const stateLabel: Record<PhaseState, string> = {
  done: 'DONE',
  current: 'IN PROGRESS',
  next: 'PENDING',
}

function dotClass(state: PhaseState) {
  if (state === 'done') return 'border-accent bg-accent'
  if (state === 'current') return 'border-accent bg-paper'
  return 'border-line-strong bg-paper'
}
</script>

<template>
  <SectionShell heading-id="project-title">
    <ChapterHeading index="04" title="项目进展" label-en="PROJECT" heading-id="project-title" />

    <div class="mt-7 grid gap-10 min-[960px]:grid-cols-[1fr_0.95fr] min-[960px]:gap-14">
      <div v-reveal="{ variant: 'left' }" class="min-w-0">
        <span
          class="inline-flex w-fit items-center gap-[7px] border border-accent-line bg-accent-soft px-3 py-1 font-mono text-[10px] font-bold tracking-[0.14em] text-accent notch-sm"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          {{ project.status }}
        </span>

        <p class="mt-5 text-[16px] leading-[1.9] text-ink/90">
          {{ project.lead }}
        </p>
        <p class="mt-4 text-[14.5px] leading-[1.95] text-muted">
          {{ project.body }}
        </p>

        <ul class="mt-6 flex flex-wrap gap-2">
          <li
            v-for="tag in project.tags"
            :key="tag"
            class="border border-line px-[13px] py-1.5 font-mono text-[11.5px] tracking-[0.02em] text-muted transition-colors duration-300 hover:border-accent-line hover:bg-accent-soft hover:text-accent"
          >
            {{ tag }}
          </li>
        </ul>
      </div>

      <div v-reveal="{ delay: 120, variant: 'right' }" class="min-w-0">
        <p class="mb-4 font-mono text-[10px] tracking-[0.24em] text-muted">
          ROADMAP / 05 PHASES
        </p>

        <ol class="relative">
          <span class="absolute bottom-2 left-[5px] top-2 border-l border-dashed border-line" aria-hidden="true" />

          <li
            v-for="phase in project.phases"
            :key="phase.index"
            class="relative flex gap-4 pb-4 last:pb-0"
          >
            <span
              class="relative z-10 mt-1 flex h-[11px] w-[11px] shrink-0 items-center justify-center rounded-full border"
              :class="[dotClass(phase.state), phase.state === 'current' && 'phase-dot-current']"
              aria-hidden="true"
            >
              <span v-if="phase.state === 'current'" class="h-[3px] w-[3px] rounded-full bg-accent" />
            </span>

            <div class="min-w-0">
              <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 class="text-[15px] font-bold">{{ phase.title }}</h3>
                <span
                  class="font-mono text-[9.5px] tracking-[0.12em]"
                  :class="phase.state === 'current' ? 'text-accent' : 'text-muted'"
                >
                  PHASE {{ phase.index }} · {{ stateLabel[phase.state] }}
                </span>
              </div>
            </div>
          </li>
        </ol>

        <!-- 路线图页脚：把「已完成/总阶段」与最近同步时间做成可扫读的工程读数 -->
        <div
          class="mt-4 hidden items-center justify-between border-t border-dashed border-line pt-3 font-mono text-[9px] tracking-[0.16em] text-muted sm:flex"
        >
          <span>02 / 05 COMPLETE</span>
          <span>LAST SYNC · 2026.11.13</span>
        </div>
      </div>
    </div>
  </SectionShell>
</template>
