<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { PhArrowRight, PhX } from '@phosphor-icons/vue'
import type { SectionMeta } from '@/types/site'
import BrandMark from '@/components/ui/BrandMark.vue'

/**
 * 移动端章节菜单
 * ------------------------------------------------------------------
 * 使用原生 <dialog> 的 showModal()：焦点陷阱、Esc 关闭、背景不可交互
 * 都由浏览器实现，比手写一层遮罩可靠。桌面端由右侧竖排导航代替。
 */
const props = defineProps<{
  open: boolean
  sections: SectionMeta[]
  activeIndex: number
  email: string
}>()

const emit = defineEmits<{ close: []; navigate: [id: string] }>()

const dialog = ref<HTMLDialogElement | null>(null)

function setScrollLock(locked: boolean) {
  document.documentElement.classList.toggle('menu-open', locked)
}

watch(
  () => props.open,
  (open) => {
    const el = dialog.value
    setScrollLock(open)
    if (!el) return

    if (open && !el.open) {
      el.showModal()
      // showModal 会聚焦第一个可聚焦元素，这里明确落到关闭按钮上
      el.querySelector<HTMLElement>('[data-menu-close]')?.focus()
    } else if (!open && el.open) {
      el.close()
    }
  },
)

function close() {
  emit('close')
}

function handleNativeClose() {
  setScrollLock(false)
  emit('close')
}

function handleBackdropClick(event: MouseEvent) {
  // 点击 ::backdrop 时事件目标就是 dialog 本身
  if (event.target === dialog.value) close()
}

function go(id: string) {
  emit('navigate', id)
  emit('close')
}

onBeforeUnmount(() => setScrollLock(false))
</script>

<template>
  <dialog
    id="mobile-nav"
    ref="dialog"
    class="mobile-nav m-0 h-[100dvh] max-h-none w-full max-w-none border-0 bg-[#05080c] p-0 text-white backdrop:bg-black/70"
    aria-label="章节菜单"
    @close="handleNativeClose"
    @cancel="close"
    @click="handleBackdropClick"
  >
    <div class="flex h-full flex-col">
      <div class="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <span class="flex items-center gap-3">
          <BrandMark size="md" />
          <span class="text-[19px] font-semibold tracking-[-0.02em]">JDZone</span>
        </span>

        <button
          type="button"
          data-menu-close
          class="grid h-9 w-9 cursor-pointer place-items-center border border-white/20 text-white transition-colors hover:border-accent hover:text-accent focus-clip"
          aria-label="关闭章节菜单"
          @click="close"
        >
          <PhX :size="16" aria-hidden="true" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-5 py-7" aria-label="章节导航">
        <p class="mb-4 font-mono text-[9px] uppercase tracking-[0.28em] text-white/40" aria-hidden="true">
          INDEX / {{ String(sections.length).padStart(2, '0') }} CHAPTERS
        </p>

        <ul>
          <li v-for="(section, index) in sections" :key="section.id">
            <button
              type="button"
              class="group flex w-full cursor-pointer items-center gap-4 border-b border-white/10 py-4 text-left focus-clip"
              :aria-current="index === activeIndex ? 'step' : undefined"
              :aria-label="`第 ${section.index} 章，${section.label}`"
              @click="go(section.id)"
            >
              <span
                class="w-8 font-mono text-[11px] tracking-[0.12em]"
                :class="index === activeIndex ? 'text-accent' : 'text-white/35'"
                aria-hidden="true"
              >
                {{ section.index }}
              </span>

              <span class="flex-1">
                <span
                  class="block font-display text-[26px] font-semibold uppercase leading-none tracking-[0.02em]"
                  :class="index === activeIndex ? 'text-accent' : 'text-white'"
                >
                  {{ section.labelEn }}
                </span>
                <span class="mt-1.5 block text-xs text-white/42">{{ section.label }}</span>
              </span>

              <PhArrowRight
                :size="15"
                aria-hidden="true"
                class="text-white/30 transition-transform duration-300 ease-brand group-hover:translate-x-1 group-hover:text-accent"
              />
            </button>
          </li>
        </ul>
      </nav>

      <div class="shrink-0 border-t border-white/10 px-5 py-5">
        <p class="font-mono text-[9px] uppercase tracking-[0.28em] text-white/40">OPEN CHANNEL</p>
        <a
          :href="`mailto:${email}`"
          class="mt-2 inline-block font-mono text-xs text-white/80 transition-colors hover:text-accent"
        >
          {{ email }}
        </a>
      </div>
    </div>
  </dialog>
</template>
