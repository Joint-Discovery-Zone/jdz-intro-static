<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Member } from '@/types/site'
import HudFrame from '@/components/ui/HudFrame.vue'

/**
 * 成员视觉板
 * 参考页在右侧预留了人物立绘位，但交付时是空占位框。
 * 没有图片时是一块有内容的「档案板」；有 visual 时照片成为底图，
 * 空心首字母、扫描线和 HUD 标签留在上层，保证两种状态都是同一套视觉。
 */
const props = defineProps<{
  member: Member
}>()

const imageFailed = ref(false)
const hasVisual = computed(() => Boolean(props.member.visual) && !imageFailed.value)

// 切换成员时重新尝试新图，避免上一张失败后一直显示降级
watch(
  () => props.member.visual?.src,
  () => {
    imageFailed.value = false
  },
)
</script>

<template>
  <div
    class="member-visual group relative flex h-full min-h-[320px] w-full items-center justify-center overflow-hidden"
    :class="{ 'member-visual--photo': hasVisual }"
  >
    <!-- 大图只做底图：灰度、压暗、上下渐隐，避免照片抢走档案文字 -->
    <img
      v-if="hasVisual"
      :src="member.visual!.src"
      :alt="member.visual!.alt"
      :style="{ objectPosition: member.visual!.focus ?? '50% 50%' }"
      loading="lazy"
      decoding="async"
      class="member-visual__photo"
      @error="imageFailed = true"
    />
    <div v-if="hasVisual" class="member-visual__scrim" aria-hidden="true" />

    <div class="hud-grid absolute inset-0 opacity-70" aria-hidden="true" />

    <!-- 缓慢下移的扫描线，给静态档案板一点“在线”的感觉 -->
    <span class="visual-scan" aria-hidden="true" />

    <!-- 四条定位线，让空画面有工程制图的感觉 -->
    <span class="absolute left-0 top-1/2 h-px w-8 bg-line-strong" aria-hidden="true" />
    <span class="absolute right-0 top-1/2 h-px w-8 bg-line-strong" aria-hidden="true" />
    <span class="absolute left-1/2 top-0 h-8 w-px bg-line-strong" aria-hidden="true" />
    <span class="absolute bottom-0 left-1/2 h-8 w-px bg-line-strong" aria-hidden="true" />

    <span
      aria-hidden="true"
      class="visual-letter text-hollow select-none font-display text-[clamp(8rem,15vw,12rem)] font-bold leading-none tracking-[-0.04em]"
    >
      {{ member.letter }}
    </span>

    <HudFrame :size="16" class="absolute inset-4 text-line-strong" />

    <!-- 右上角信号强度，纯装饰，与左侧 SYS.ONLINE 呼应 -->
    <span class="absolute right-4 top-4 flex items-end gap-[3px]" aria-hidden="true">
      <i class="h-1 w-[3px] bg-accent/40" />
      <i class="h-[6px] w-[3px] bg-accent/55" />
      <i class="h-[9px] w-[3px] bg-accent/75" />
      <i class="h-3 w-[3px] bg-accent" />
    </span>

    <span class="absolute left-4 top-4 font-mono text-[9px] tracking-[0.2em] text-accent">
      {{ member.serial }} / OPERATOR
    </span>
    <span class="absolute bottom-4 left-4 font-mono text-[9px] tracking-[0.2em] text-muted">
      PROFILE VISUAL
    </span>
    <span
      class="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[0.18em] text-muted/70"
    >
      X 042 / Y 118
    </span>
    <span
      class="absolute bottom-4 right-4 font-mono text-[9px] tracking-[0.2em] text-muted [writing-mode:vertical-rl]"
    >
      {{ member.role }}
    </span>
  </div>
</template>
