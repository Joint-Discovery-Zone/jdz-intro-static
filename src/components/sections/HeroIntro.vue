<script setup lang="ts">
import { PhX } from '@phosphor-icons/vue'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import ThreeHeroWord from '@/components/background/ThreeHeroWord.vue'

/**
 * 首页「WATCH INTRO」弹层
 * 把之前的 Three.js 点云字标保留为一个可点开的短预告：照片首页负责 1:1
 * 视觉，WebGL 负责动态叙事。关闭即销毁，避免后台持续跑 rAF。
 */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)
const closing = ref(false)

function lockScroll(locked: boolean) {
  document.documentElement.classList.toggle('intro-open', locked)
}

function close() {
  if (closing.value) return
  closing.value = true
  dialog.value?.close()
}

function onNativeClose() {
  closing.value = false
  lockScroll(false)
  if (props.open) emit('close')
}

function onBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) close()
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      await nextTick()
      if (!dialog.value?.open) dialog.value?.showModal()
      lockScroll(true)
    } else if (dialog.value?.open) {
      dialog.value.close()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => lockScroll(false))
</script>

<template>
  <dialog ref="dialog" class="intro-dialog" aria-label="JDZone 开场预告" @close="onNativeClose" @click="onBackdrop">
    <div class="grid min-h-[520px] grid-rows-[auto_1fr_auto]">
      <div class="flex items-center justify-between border-b border-line px-6 py-4">
        <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-muted sm:text-[10px] sm:tracking-[0.26em]">
          JDZONE / TRANSMISSION 001
        </span>
        <button
          type="button"
          class="grid h-9 w-9 place-items-center border border-line text-ink transition-colors hover:border-accent hover:text-accent focus-clip"
          aria-label="关闭预告"
          @click="close"
        >
          <PhX :size="15" aria-hidden="true" />
        </button>
      </div>

      <div class="intro-stage relative min-h-[340px] overflow-hidden">
        <ThreeHeroWord text="JDZone" />
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05080c] to-transparent" />
      </div>

      <div class="flex flex-wrap items-end justify-between gap-4 border-t border-line px-6 py-6">
        <div>
          <p class="font-mono text-[9px] uppercase tracking-[0.28em] text-accent">A field note on three people</p>
          <p class="mt-2 max-w-[46ch] text-sm leading-7 text-muted">
            点云字标由代码碎片汇入，随后收束成一个整体。协作也是这样发生的。
          </p>
        </div>
        <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">00:12 / LOOP</span>
      </div>
    </div>
  </dialog>
</template>
