<script setup lang="ts">
/**
 * 参考图左上角的 JDZ 斜切字标。
 * 轮廓由参考图的黄色像素矢量化而来，SVG 用 fill-rule=evenodd 保留 D 的字腔；
 * 作为装饰图形出现，文字品牌名由旁边的内容负责朗读。
 */
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)
</script>

<template>
  <img
    src="/brand/jdz-mark.svg"
    alt=""
    aria-hidden="true"
    draggable="false"
    class="brand-mark select-none"
    :class="`brand-mark--${size}`"
  />
</template>

<style scoped>
.brand-mark {
  display: block;
  width: auto;
  flex: none;
}

.brand-mark--sm {
  height: 24px;
}

.brand-mark--md {
  height: 30px;
}

.brand-mark--lg {
  height: 38px;
}
</style>
