<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { PhArrowRight, PhX } from '@phosphor-icons/vue'
import type { SectionMeta } from '@/types/site'
import BrandSeal from '@/components/ui/BrandSeal.vue'

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
    class="mobile-nav m-0 h-[100dvh] max-h-none w-full max-w-none border-0 bg-paper p-0 text-ink backdrop:bg-black/55"
    aria-label="章节菜单"
    @close="handleNativeClose"
    @cancel="close"
    @click="handleBackdropClick"
  >
    <div class="flex h-full flex-col">
      <div class="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
        <span class="flex items-center gap-3">
          <BrandSeal />
          <span class="text-[17px] font-bold tracking-[0.02em]">JDZone</span>
        </span>

        <button
          type="button"
          data-menu-close
          class="grid h-9 w-9 cursor-pointer place-items-center notch-sm border border-line text-ink transition-colors hover:border-accent-line hover:text-accent focus-clip"
          aria-label="关闭章节菜单"
          @click="close"
        >
          <PhX :size="17" aria-hidden="true" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 py-6" aria-label="章节导航">
        <p class="label-mono mb-3 text-muted" aria-hidden="true">INDEX / {{ String(sections.length).padStart(2, '0') }} CHAPTERS</p>

        <ul>
          <li v-for="(section, index) in sections" :key="section.id">
            <button
              type="button"
              class="group flex w-full cursor-pointer items-center gap-4 border-b border-line py-4 text-left focus-clip"
              :aria-current="index === activeIndex ? 'step' : undefined"
              :aria-label="`第 ${section.index} 章，${section.label}`"
              @click="go(section.id)"
            >
              <span
                class="display-num w-9 text-2xl"
                :class="index === activeIndex ? 'text-accent' : 'text-muted'"
                aria-hidden="true"
              >
                {{ section.index }}
              </span>

              <span class="flex-1">
                <span
                  class="block font-display text-[22px] font-semibold uppercase leading-none tracking-[0.04em]"
                  :class="index === activeIndex ? 'text-accent' : 'text-ink'"
                >
                  {{ section.labelEn }}
                </span>
                <span class="mt-1.5 block text-xs text-muted">{{ section.label }}</span>
              </span>

              <PhArrowRight
                :size="15"
                aria-hidden="true"
                class="text-muted transition-transform duration-300 ease-brand group-hover:translate-x-1 group-hover:text-accent"
              />
            </button>
          </li>
        </ul>
      </nav>

      <div class="shrink-0 border-t border-line px-4 py-5">
        <p class="label-mono text-muted">OPEN CHANNEL</p>
        <a
          :href="`mailto:${email}`"
          class="link-line mt-2 inline-block text-sm text-ink"
        >
          {{ email }}
        </a>
      </div>
    </div>
  </dialog>
</template>
