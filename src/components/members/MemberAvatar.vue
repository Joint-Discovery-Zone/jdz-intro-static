<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Member } from '@/types/site'

/**
 * 成员小头像
 * ------------------------------------------------------------------
 * 有 avatar 时显示图片，没有图片或加载失败时退回首字母，不会出现裂图。
 * 缩略图里默认灰度，当前选中的成员恢复彩色，作为非常轻的“被点亮”反馈。
 */
const props = withDefaults(
  defineProps<{
    member: Member
    variant?: 'profile' | 'thumb'
    active?: boolean
  }>(),
  { variant: 'profile', active: false },
)

const failed = ref(false)

// 切换成员时 src 会变，重置失败状态，允许新图片重新尝试
watch(
  () => props.member.avatar?.src,
  () => {
    failed.value = false
  },
)
</script>

<template>
  <span class="member-avatar grid h-full w-full place-items-center overflow-hidden">
    <img
      v-if="member.avatar && !failed"
      :src="member.avatar.src"
      :alt="member.avatar.alt"
      :style="{ objectPosition: member.avatar.focus ?? '50% 50%' }"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-cover"
      :class="
        variant === 'thumb'
          ? active
            ? 'grayscale-0'
            : 'grayscale transition-[filter] duration-500 group-hover:grayscale-0'
          : ''
      "
      @error="failed = true"
    />
    <span
      v-else
      class="font-display font-bold leading-none text-muted"
      :class="variant === 'thumb' ? 'text-[17px]' : 'text-2xl'"
      aria-hidden="true"
    >
      {{ member.letter }}
    </span>
  </span>
</template>
