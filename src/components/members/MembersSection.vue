<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type { Member, SiteContent } from '@/types/site'
import { useSwipe } from '@/composables/useSwipe'
import ChapterHeading from '@/components/ui/ChapterHeading.vue'
import SectionShell from '@/components/layout/SectionShell.vue'
import MemberAvatar from './MemberAvatar.vue'
import MemberVisual from './MemberVisual.vue'

/**
 * 成员档案
 * ------------------------------------------------------------------
 * 布局对齐参考页：左侧人物档案、右侧档案板、底部三张缩略图。
 * 参考页用鼠标拖拽 + 不可聚焦的 div 切换，这里保留滑动/点击，
 * 同时把缩略图做成标准 tablist：方向键、Home / End 都可切换，
 * 焦点跟随当前成员，读屏能读出「第几个、谁、什么职能」。
 */
const props = defineProps<{
  content: SiteContent
}>()

const selected = ref(0)
const stageRef = ref<HTMLElement | null>(null)
const tabRefs = ref<(HTMLButtonElement | null)[]>([])

const members = computed(() => props.content.members)
const current = computed<Member>(() => members.value[selected.value] ?? members.value[0]!)

const panelId = 'member-profile-panel'

function select(index: number, focusTab = false) {
  const count = members.value.length
  if (!count) return
  selected.value = ((index % count) + count) % count
  if (focusTab) {
    nextTick(() => tabRefs.value[selected.value]?.focus())
  }
}

function tabRef(index: number) {
  return (el: Element | ComponentPublicInstance | null) => {
    tabRefs.value[index] = el instanceof HTMLButtonElement ? el : null
  }
}

function onTabKeydown(event: KeyboardEvent, index: number) {
  const count = members.value.length
  let next = -1

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index + 1
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index - 1
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = count - 1

  if (next < 0) return

  // 阻止冒泡，避免被 App 的整页方向键导航同时响应
  event.preventDefault()
  event.stopPropagation()
  select(next, true)
}

useSwipe(
  stageRef,
  {
    onSwipeLeft: () => select(selected.value + 1),
    onSwipeRight: () => select(selected.value - 1),
  },
  { ignoreSelector: 'a, button, input, textarea, select, [role="button"]' },
)
</script>

<template>
  <SectionShell heading-id="members-title">
    <ChapterHeading index="03" label-en="OPERATORS" heading-id="members-title" sr-title="成员档案" />

    <div
      ref="stageRef"
      v-reveal="{ variant: 'left' }"
      class="relative mt-6 grid touch-pan-y gap-4 min-[960px]:mb-[30px] min-[960px]:grid-cols-[320px_1fr] min-[960px]:items-center min-[960px]:gap-10"
    >
      <!--
        背景巨型字：只放在右侧档案板范围内，并用遮罩把它从文字栏里淡出。
        参考页的巨型字从最左侧起排，会和姓名、简介压在同一个阅读区；
        这里保留水印，但让它退到视觉板背后，信息层始终干净。
      -->
      <span aria-hidden="true" class="member-watermark select-none">
        {{ current.nameEn }}
      </span>

      <Transition name="member" mode="out-in">
        <article
          :id="panelId"
          :key="current.id"
          role="tabpanel"
          :aria-labelledby="`member-tab-${current.id}`"
          tabindex="0"
          class="relative z-[1] flex flex-col items-center text-center focus-clip min-[960px]:items-start min-[960px]:text-left"
        >
          <p class="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            RHODES ISLAND / PROFILE
          </p>

          <h3 class="text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.1]">
            {{ current.nameCn }}
          </h3>
          <p class="mb-4 font-display text-[13px] uppercase tracking-[0.2em] text-muted">
            {{ current.nameEn }}
          </p>

          <span
            class="mb-4 inline-flex w-fit items-center gap-2 border border-signal px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.14em] text-signal-ink notch-sm"
          >
            {{ current.role }}
          </span>

          <p class="mb-5 max-w-[300px] text-[13.5px] leading-[1.8] text-muted">
            {{ current.desc }}
          </p>

          <div class="mb-6 flex flex-wrap justify-center gap-1.5 min-[960px]:justify-start">
            <span
              v-for="tag in current.tags"
              :key="tag"
              class="border border-line px-2.5 py-1 font-mono text-[9px] tracking-[0.06em] text-muted transition-colors hover:border-signal hover:text-signal-ink"
            >
              {{ tag }}
            </span>
          </div>

          <div class="relative grid h-[60px] w-[60px] place-items-center overflow-hidden border border-line bg-panel notch">
            <MemberAvatar :member="current" variant="profile" />
            <span class="pointer-events-none absolute inset-[3px] z-10 border border-line" aria-hidden="true" />
          </div>
        </article>
      </Transition>

      <div class="relative z-[1] hidden min-h-[320px] items-center justify-center border-l border-dashed border-line min-[960px]:flex">
        <MemberVisual :member="current" />
      </div>
    </div>

    <!-- 缩略图导航：参考页的三张档案卡，补上键盘与读屏语义 -->
    <div
      v-reveal="{ delay: 140, variant: 'up' }"
      role="tablist"
      aria-label="成员档案切换"
      class="relative z-[2] -mx-1 flex justify-center gap-2.5 overflow-x-auto px-1 py-3 min-[960px]:justify-start"
    >
      <button
        v-for="(member, index) in members"
        :id="`member-tab-${member.id}`"
        :key="member.id"
        :ref="tabRef(index)"
        type="button"
        role="tab"
        :aria-selected="selected === index"
        :aria-controls="panelId"
        :aria-label="`第 ${member.serial} 位成员，${member.nameEn}，${member.role}`"
        :tabindex="selected === index ? 0 : -1"
        class="member-thumb group flex h-[110px] w-[90px] shrink-0 cursor-pointer flex-col justify-end overflow-hidden border border-line bg-panel p-2 text-left notch focus-clip min-[960px]:h-[130px] min-[960px]:w-[110px] min-[960px]:p-2.5"
        :class="{ 'member-thumb-active': selected === index }"
        @click="select(index)"
        @keydown="onTabKeydown($event, index)"
      >
        <span
          class="mb-auto block h-9 w-9 overflow-hidden border border-line/80 bg-paper/40 notch-sm"
          aria-hidden="true"
        >
          <MemberAvatar :member="member" variant="thumb" :active="selected === index" />
        </span>
        <span class="font-display text-[10px] leading-none text-signal-ink">{{ member.serial }}</span>
        <span class="mt-1 text-[12px] font-bold leading-[1.2]">{{ member.nameCn }}</span>
        <span class="mt-0.5 font-mono text-[8px] leading-none tracking-[0.12em] text-muted">
          {{ member.role }}
        </span>
      </button>
    </div>

    <!-- 提示不再脉冲闪烁，并说明键盘也可操作 -->
    <p
      v-reveal="{ delay: 200, variant: 'fade' }"
      class="mt-1 text-center font-mono text-[9px] tracking-[0.25em] text-muted opacity-60 min-[960px]:text-left"
    >
      ← 拖动或滑动切换 → &nbsp;·&nbsp; 方向键亦可
    </p>
  </SectionShell>
</template>
