<template>
  <div class="image-carousel">
    <div class="carousel-main">
      <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div
          v-for="(img, index) in images"
          :key="index"
          class="carousel-slide"
          @click="$emit('fullscreen', index)"
        >
          <img :src="img" :alt="`商品图${index + 1}`" draggable="false" />
        </div>
      </div>

      <button
        v-if="images.length > 1"
        class="carousel-arrow carousel-arrow--prev"
        @click="prev"
        :disabled="currentIndex === 0"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button
        v-if="images.length > 1"
        class="carousel-arrow carousel-arrow--next"
        @click="next"
        :disabled="currentIndex === images.length - 1"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div v-if="images.length > 1" class="carousel-counter">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>

    <div v-if="images.length > 1" class="carousel-thumbs">
      <button
        v-for="(img, index) in images"
        :key="index"
        class="carousel-thumb"
        :class="{ 'is-active': currentIndex === index }"
        @click="goTo(index)"
      >
        <img :src="img" :alt="`缩略图${index + 1}`" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  initialIndex: {
    type: Number,
    default: 0
  },
  autoPlay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 4000
  }
})

const emit = defineEmits(['fullscreen', 'change'])

const currentIndex = ref(props.initialIndex)
let timer = null

const startAutoPlay = () => {
  if (!props.autoPlay || props.images.length <= 1) return
  stopAutoPlay()
  timer = setInterval(() => {
    if (currentIndex.value < props.images.length - 1) {
      currentIndex.value++
    } else {
      currentIndex.value = 0
    }
    emit('change', currentIndex.value)
  }, props.interval)
}

const stopAutoPlay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    emit('change', currentIndex.value)
  }
}

const next = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
    emit('change', currentIndex.value)
  }
}

const goTo = (index) => {
  currentIndex.value = index
  emit('change', currentIndex.value)
}

watch(() => props.initialIndex, (val) => {
  currentIndex.value = val
})

watch(() => props.images, () => {
  if (currentIndex.value >= props.images.length) {
    currentIndex.value = Math.max(0, props.images.length - 1)
  }
  startAutoPlay()
})

onMounted(startAutoPlay)
onBeforeUnmount(stopAutoPlay)

defineExpose({ currentIndex, goTo, prev, next })
</script>

<style scoped>
.image-carousel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.carousel-main {
  position: relative;
  flex: 1;
  overflow: hidden;
  background-color: #f5f5f5;
  cursor: zoom-in;
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease;
}

.carousel-slide {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  opacity: 0;
}

.carousel-main:hover .carousel-arrow {
  opacity: 1;
}

.carousel-arrow:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.6);
}

.carousel-arrow:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.carousel-arrow--prev {
  left: 12px;
}

.carousel-arrow--next {
  right: 12px;
}

.carousel-counter {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 12px;
}

.carousel-thumbs {
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: #fafafa;
  overflow-x: auto;
}

.carousel-thumb {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  padding: 0;
  transition: border-color 0.2s;
}

.carousel-thumb:hover {
  border-color: #ccc;
}

.carousel-thumb.is-active {
  border-color: #ff2442;
}

.carousel-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
