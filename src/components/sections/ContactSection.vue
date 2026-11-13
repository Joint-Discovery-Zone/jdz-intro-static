<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ContactChannel, SiteContent } from '@/types/site'
import { useClipboard } from '@/composables/useClipboard'
import { useInView } from '@/composables/useInView'
import { useToast } from '@/composables/useToast'
import { useTypewriter } from '@/composables/useTypewriter'
import ChapterHeading from '@/components/ui/ChapterHeading.vue'
import SectionShell from '@/components/layout/SectionShell.vue'

/**
 * 联系
 * 参考页的打字机标题 + 四格信息板。标题只在进入视口时打一次；
 * 第一行结束才启动第二行。复制成功/失败都用统一 toast 反馈，
 * 每个格子都是原生 button，键盘与读屏可直接操作。
 */
defineProps<{
  content: SiteContent
}>()

const trigger = ref<HTMLElement | null>(null)
const { inView } = useInView(trigger, { threshold: 0.3 })

const line1 = useTypewriter("Let's build", inView, { charDelay: 70, startDelay: 260 })
const line2Active = computed(() => line1.done.value)
const line2 = useTypewriter('everything.', line2Active, { charDelay: 90, startDelay: 320 })

const { copy } = useClipboard()
const { showToast } = useToast()

async function onChannelClick(channel: ContactChannel) {
  if (channel.action !== 'copy') return

  const ok = await copy(channel.value)
  showToast(ok ? 'COPIED TO CLIPBOARD' : '复制失败，请手动选择', ok ? 'success' : 'info')
}

function cellTag(channel: ContactChannel) {
  if (channel.action === 'copy') return 'button'
  if (channel.action === 'link') return 'a'
  return 'div'
}
</script>

<template>
  <SectionShell heading-id="contact-title">
    <div ref="trigger">
      <ChapterHeading index="06" label-en="CONTACT" heading-id="contact-title" sr-title="联系" />

      <h2
        v-reveal="{ delay: 60, variant: 'up' }"
        aria-label="Let's build everything."
        class="mt-6 text-[clamp(40px,6vw,80px)] font-extrabold leading-[1.1] tracking-[-0.03em]"
      >
        <span class="block whitespace-nowrap" aria-hidden="true">
          {{ line1.output.value }}
          <span v-if="!line1.done.value" class="type-caret" />
        </span>
        <span
          class="block whitespace-nowrap text-accent [text-shadow:0_4px_30px_var(--c-accent-soft)]"
          aria-hidden="true"
        >
          {{ line2.output.value }}
          <span v-if="line2Active" class="type-caret" />
        </span>
      </h2>

      <div
        v-reveal="{ delay: 150, variant: 'fade' }"
        class="mt-10 grid grid-cols-2 gap-px border border-line bg-line min-[961px]:grid-cols-4"
      >
        <component
          :is="cellTag(channel)"
          v-for="channel in content.contact"
          :key="channel.id"
          :type="channel.action === 'copy' ? 'button' : undefined"
          :href="channel.action === 'link' ? channel.href : undefined"
          :aria-label="channel.action === 'copy' ? `复制${channel.label}：${channel.value}` : undefined"
          class="group bg-paper p-4 text-left transition-[background-color,box-shadow] duration-200 sm:p-5"
          :class="
            channel.action === 'copy'
              ? 'cursor-pointer hover:bg-panel hover:shadow-[inset_0_0_0_1px_var(--c-accent)] focus-visible:shadow-[inset_0_0_0_1px_var(--c-accent)]'
              : ''
          "
          @click="onChannelClick(channel)"
        >
          <span class="mb-2 block font-mono text-[10px] font-bold tracking-[0.24em] text-muted">
            {{ channel.labelEn }}
          </span>
          <span
            class="block break-words font-mono text-[13px] font-semibold leading-snug text-ink transition-colors sm:text-[14.5px]"
            :class="channel.action === 'copy' ? 'group-hover:text-accent' : ''"
          >
            {{ channel.value }}
          </span>
        </component>
      </div>
    </div>
  </SectionShell>
</template>
