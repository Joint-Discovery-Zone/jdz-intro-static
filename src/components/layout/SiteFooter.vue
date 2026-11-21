<script setup lang="ts">
import { PhArrowUp } from '@phosphor-icons/vue'
import type { SiteContent } from '@/types/site'
import BrandMark from '@/components/ui/BrandMark.vue'

/**
 * 页脚
 * 参考图没有固定底栏；这里把页脚放回文档流，作为长页的收束，
 * 避免固定条遮挡主视觉底部的计数与滚动提示。
 */
defineProps<{ content: SiteContent }>()
</script>

<template>
  <footer class="site-footer relative border-t border-white/10 bg-[#04070a] px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
    <div class="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <BrandMark size="sm" />
        <div>
          <p class="text-sm font-semibold text-white">JDZone</p>
          <p class="mt-1 font-mono text-[8px] uppercase tracking-[0.24em] text-white/38">
            Joint Discovery Zone
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
        <a href="#members" class="transition-colors hover:text-accent">The Three</a>
        <a href="#project" class="transition-colors hover:text-accent">Projects</a>
        <a href="#log" class="transition-colors hover:text-accent">Journal</a>
        <a href="#about" class="transition-colors hover:text-accent">About</a>
        <a :href="`mailto:${content.meta.email}`" class="transition-colors hover:text-accent">
          {{ content.meta.email }}
        </a>
      </div>

      <div class="flex items-center gap-5">
        <span class="font-mono text-[8px] uppercase tracking-[0.2em] text-white/28">
          © {{ content.meta.founded }} JDZone
        </span>
        <a
          href="#home"
          class="group grid h-9 w-9 place-items-center border border-white/15 text-white/50 transition-colors hover:border-accent hover:text-accent"
          aria-label="回到首页"
        >
          <PhArrowUp
            :size="13"
            class="transition-transform duration-300 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
    <div class="pointer-events-none absolute bottom-0 right-0 h-8 w-40 overflow-hidden" aria-hidden="true">
      <span class="absolute -right-4 bottom-3 h-3 w-24 skew-x-[-38deg] bg-accent/80" />
    </div>
  </footer>
</template>
