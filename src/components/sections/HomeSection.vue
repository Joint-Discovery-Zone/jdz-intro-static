<script setup lang="ts">
import { PhArrowRight, PhArrowDown, PhPlay } from '@phosphor-icons/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import HeroIntro from './HeroIntro.vue'

/**
 * 电影感首页
 * ------------------------------------------------------------------
 * 视觉基准：用户提供的科幻城市主视觉。全幅照片 + 左侧三段式巨型标题 +
 * 酸性黄斜切按钮。照片来自用户素材，已预处理掉原图里烘焙的旧 UI 文字，
 * 因此这里的标题、导航与按钮都是真正的可交互 DOM。
 */
defineProps<{
  content: unknown
}>()

const hero = ref<HTMLElement | null>(null)
const introOpen = ref(false)
const reduced = useReducedMotion()

let frame = 0

/** 指针视差：照片轻微反向移动，文字保持稳定。 */
function onPointerMove(event: PointerEvent) {
  if (reduced.value || !hero.value || event.pointerType === 'touch') return
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const x = (event.clientX / window.innerWidth - 0.5) * -14
    const y = (event.clientY / window.innerHeight - 0.5) * -10
    hero.value?.style.setProperty('--mx', `${x.toFixed(2)}px`)
    hero.value?.style.setProperty('--my', `${y.toFixed(2)}px`)
  })
}

function resetParallax() {
  hero.value?.style.setProperty('--mx', '0px')
  hero.value?.style.setProperty('--my', '0px')
}

onMounted(() => {
  window.addEventListener('pointermove', onPointerMove, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <section
    id="home"
    ref="hero"
    class="cinema-hero flex min-h-[100dvh] flex-col justify-center scroll-mt-0"
    aria-labelledby="home-title"
    @pointerleave="resetParallax"
  >
    <div class="cinema-hero__media" aria-hidden="true">
      <img
        src="/images/hero-cinematic.jpg"
        alt=""
        width="1672"
        height="941"
        fetchpriority="high"
        decoding="async"
      />
    </div>
    <div class="cinema-hero__grade" aria-hidden="true" />
    <div class="cinema-hero__grain" aria-hidden="true" />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute right-6 top-[22%] hidden h-[26%] w-px bg-accent/70 lg:block"
    />

    <div class="relative mx-auto w-full max-w-[1600px] px-6 pb-28 pt-32 sm:px-10 lg:px-14 xl:px-20">
      <div class="max-w-[760px]">
        <p
          v-reveal="{ variant: 'fade' }"
          class="mb-7 font-mono text-[10px] font-medium uppercase tracking-[0.34em] text-white/70 [text-shadow:0_2px_18px_rgba(3,6,10,.75)]"
        >
          Joint Discovery Zone / Software Engineering Group
        </p>

        <h1
          id="home-title"
          class="hero-headline [text-shadow:0_6px_38px_rgba(3,6,10,.4)]"
          aria-label="Joint Discovery Zone"
        >
          <span v-reveal="{ delay: 40, variant: 'left' }" class="block">JOINT</span>
          <span v-reveal="{ delay: 110, variant: 'left' }" class="block">DISCOVERY</span>
          <span v-reveal="{ delay: 180, variant: 'left' }" class="block">
            ZONE<span class="hero-slash" aria-hidden="true" />
          </span>
        </h1>

        <p
          v-reveal="{ delay: 260, variant: 'fade' }"
          class="mt-7 font-mono text-[11px] tracking-[0.32em] text-white/78 [text-shadow:0_2px_18px_rgba(3,6,10,.75)]"
        >
          EXPLORE. CREATE. BEYOND.
        </p>

        <p class="sr-only">
          JDZone 是一个由三名成员组成的软件工程小组。我们在协作中打磨产品，在迭代中验证想法。
        </p>

        <div
          v-reveal="{ delay: 330, variant: 'up' }"
          class="mt-10 flex flex-wrap items-center gap-6"
        >
          <a href="#members" class="hero-cta focus-clip">
            <span class="flex items-center gap-3">
              DISCOVER MORE
              <PhArrowRight :size="14" weight="bold" aria-hidden="true" />
            </span>
          </a>

          <button type="button" class="hero-play" @click="introOpen = true">
            <span class="hero-play__ring">
              <PhPlay :size="12" weight="fill" aria-hidden="true" />
            </span>
            WATCH INTRO
          </button>
        </div>
      </div>
    </div>

    <div class="absolute inset-x-0 bottom-9 z-10">
      <div class="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 sm:px-10 lg:px-14 xl:px-20">
        <div class="flex items-center gap-5">
          <span class="hero-index">01 <span class="text-white/32">/</span> 05</span>
          <span class="hidden h-px w-16 bg-white/20 sm:block" aria-hidden="true" />
          <a
            href="#members"
            class="group flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-white/48 transition-colors hover:text-white"
          >
            SCROLL DOWN
            <PhArrowDown
              :size="12"
              class="transition-transform duration-300 group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </div>

    <div class="hero-corner-bar" aria-hidden="true" />
    <div class="absolute inset-x-0 bottom-0 h-px bg-accent/70" aria-hidden="true" />

    <HeroIntro :open="introOpen" @close="introOpen = false" />
  </section>
</template>
