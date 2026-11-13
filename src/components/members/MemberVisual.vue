<script setup lang="ts">
import type { Member } from '@/types/site'
import HudFrame from '@/components/ui/HudFrame.vue'

/**
 * 成员视觉板
 * 参考页在右侧预留了人物立绘位，但交付时是空占位框。
 * 这里不伪造照片，改成一块有内容的「档案板」：
 * 空心首字母、对角定位线、编号与职能，既有信息也不冒充人像。
 */
defineProps<{
  member: Member
}>()
</script>

<template>
  <div class="relative flex h-full min-h-[320px] w-full items-center justify-center overflow-hidden">
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
