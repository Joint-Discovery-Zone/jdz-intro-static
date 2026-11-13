<script setup lang="ts">
/**
 * 状态标签：一个信号点 + 等宽标签
 * 点的颜色用 --c-signal（装饰），文字用 --c-signal-ink（满足对比度）。
 */
type Tone = 'signal' | 'accent' | 'muted'

const props = withDefaults(
  defineProps<{
    label: string
    tone?: Tone
    pulse?: boolean
  }>(),
  { tone: 'signal', pulse: true },
)

const textClass: Record<Tone, string> = {
  signal: 'text-signal-ink',
  accent: 'text-accent',
  muted: 'text-muted',
}

const dotClass: Record<Tone, string> = {
  signal: 'text-signal',
  accent: 'text-accent',
  muted: 'text-muted',
}
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <span
      class="relative inline-flex h-1.5 w-1.5 rounded-full bg-current"
      :class="[dotClass[props.tone], props.pulse && 'pulse-dot']"
      aria-hidden="true"
    />
    <span class="label-mono" :class="textClass[props.tone]">{{ props.label }}</span>
  </span>
</template>
