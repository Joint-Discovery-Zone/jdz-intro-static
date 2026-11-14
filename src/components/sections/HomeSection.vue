<script setup lang="ts">
import type { SiteContent } from '@/types/site'
import AppButton from '@/components/ui/AppButton.vue'
import ThreeHeroWord from '@/components/background/ThreeHeroWord.vue'
import SectionShell from '@/components/layout/SectionShell.vue'

/**
 * 首页
 * 对齐参考页：左侧主张与两个入口，右侧 Three.js 点云字标；
 * 大标题用系统无衬线 800 字重，只有点阵与微标签使用 Oswald / 等宽。
 */
const props = defineProps<{
  content: SiteContent
}>()

const meta = props.content.meta
</script>

<template>
  <SectionShell heading-id="home-title">
    <div
      class="flex flex-col justify-center gap-5 min-[960px]:grid min-[960px]:grid-cols-[0.9fr_1.3fr] min-[960px]:items-center min-[960px]:gap-[30px]"
    >
      <div class="flex min-w-0 flex-col items-center text-center min-[960px]:items-start min-[960px]:text-left">
        <p v-reveal="{ variant: 'left' }" class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted sm:tracking-[0.36em]">
          SOFTWARE ENGINEERING GROUP · EST. {{ meta.founded }}
        </p>

        <h1
          id="home-title"
          v-reveal="{ delay: 60, variant: 'left' }"
          class="mt-6 text-[clamp(36px,5vw,64px)] font-extrabold uppercase leading-[1.02] tracking-[-0.025em]"
        >
          <span class="block">Joint Discovery</span>
          <span class="block text-hollow">Zone</span>
        </h1>

        <p v-reveal="{ delay: 130, variant: 'left' }" class="mt-5 text-[clamp(15px,1.8vw,19px)] tracking-[0.34em] text-ink opacity-85">
          {{ meta.tagline }}
        </p>

        <p v-reveal="{ delay: 180, variant: 'left' }" class="mx-auto mt-4 max-w-[480px] text-[15px] leading-[1.85] text-muted min-[960px]:mx-0">
          JDZone 是一个专注软件工程实践的三人小组。我们在协作中打磨产品，在迭代中验证想法。
        </p>

        <div v-reveal="{ delay: 240, variant: 'left' }" class="mt-9 flex flex-wrap justify-center gap-3 min-[960px]:justify-start">
          <AppButton href="#about" size="lg">了解小组</AppButton>
          <AppButton href="#project" variant="ghost" size="lg">项目进展</AppButton>
        </div>

        <!-- 滚动提示：桌面端给一个可见的下一个章节入口，移动端空间紧张时隐藏 -->
        <div
          v-reveal="{ delay: 320, variant: 'fade' }"
          class="mt-10 hidden items-center gap-3 font-mono text-[9px] tracking-[0.24em] text-muted min-[960px]:flex"
          aria-hidden="true"
        >
          <span class="relative h-9 w-px overflow-hidden bg-line-strong">
            <span class="scroll-cue absolute inset-x-0 top-0 h-3 bg-accent" />
          </span>
          SCROLL / 向下
        </div>
      </div>

      <div
        v-reveal="{ delay: 160, variant: 'right' }"
        class="relative order-first mx-auto h-[30vh] min-h-[200px] w-full max-w-[500px] min-[960px]:order-none min-[960px]:h-[55vh] min-[960px]:min-h-[380px] min-[960px]:max-w-none"
      >
        <ThreeHeroWord text="JDZone" />
        <span
          class="pointer-events-none absolute bottom-[10%] left-0 w-full text-center font-mono text-[10px] tracking-[0.5em] text-muted opacity-50"
          aria-hidden="true"
        >
          JOINT DISCOVERY ZONE
        </span>
      </div>
    </div>
  </SectionShell>
</template>
