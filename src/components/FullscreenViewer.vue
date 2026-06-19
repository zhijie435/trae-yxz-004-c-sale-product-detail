<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fullscreen-viewer" @click.self="$emit('close')">
        <button class="viewer-close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <template v-if="type === 'image'">
          <button
            v-if="images.length > 1"
            class="viewer-arrow viewer-arrow--prev"
            @click.stop="prevImage"
            :disabled="currentIndex === 0"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="viewer-content" @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag">
            <img
              :src="images[currentIndex]"
              class="viewer-image"
              :style="imageStyle"
              draggable="false"
              @wheel.prevent="onWheel"
            />
          </div>

          <button
            v-if="images.length > 1"
            class="viewer-arrow viewer-arrow--next"
            @click.stop="nextImage"
            :disabled="currentIndex === images.length - 1"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <div v-if="images.length > 1" class="viewer-counter">
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>

          <div class="viewer-zoom">
            <button class="zoom-btn" @click="zoomOut">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <span class="zoom-text">{{ Math.round(scale * 100) }}%</span>
            <button class="zoom-btn" @click="zoomIn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button class="zoom-btn" @click="resetZoom">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
            </button>
          </div>

          <div v-if="images.length > 1" class="viewer-thumbs">
            <button
              v-for="(img, index) in images"
              :key="index"
              class="viewer-thumb"
              :class="{ 'is-active': currentIndex === index }"
              @click.stop="goToImage(index)"
            >
              <img :src="img" />
            </button>
          </div>
        </template>

        <template v-else-if="type === 'video'">
          <div class="viewer-video-wrapper">
            <video
              ref="videoRef"
              :src="videoUrl"
              class="viewer-video"
              controls
              autoplay
              playsinline
              webkit-playsinline
            ></video>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'image'
  },
  images: {
    type: Array,
    default: () => []
  },
  initialIndex: {
    type: Number,
    default: 0
  },
  videoUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const currentIndex = ref(props.initialIndex)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const videoRef = ref(null)

const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const startTranslateX = ref(0)
const startTranslateY = ref(0)

const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
}))

const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 5)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.5)
}

const resetZoom = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

const onWheel = (e) => {
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

const startDrag = (e) => {
  if (scale.value <= 1) return
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  startTranslateX.value = translateX.value
  startTranslateY.value = translateY.value
}

const onDrag = (e) => {
  if (!isDragging.value) return
  translateX.value = startTranslateX.value + (e.clientX - dragStartX.value)
  translateY.value = startTranslateY.value + (e.clientY - dragStartY.value)
}

const endDrag = () => {
  isDragging.value = false
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetZoom()
  }
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
    resetZoom()
  }
}

const goToImage = (index) => {
  currentIndex.value = index
  resetZoom()
}

const handleKeydown = (e) => {
  if (!props.visible) return
  if (e.key === 'Escape') {
    emit('close')
  } else if (props.type === 'image' && props.images.length > 1) {
    if (e.key === 'ArrowLeft') prevImage()
    if (e.key === 'ArrowRight') nextImage()
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    currentIndex.value = props.initialIndex
    resetZoom()
    document.body.style.overflow = 'hidden'
    if (props.type === 'video') {
      nextTick(() => {
        videoRef.value?.play()
      })
    }
  } else {
    document.body.style.overflow = ''
    if (props.type === 'video') {
      videoRef.value?.pause()
    }
  }
})

watch(() => props.initialIndex, (val) => {
  currentIndex.value = val
})

window.addEventListener('keydown', handleKeydown)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fullscreen-viewer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.viewer-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}

.viewer-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.viewer-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}

.viewer-arrow:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
}

.viewer-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.viewer-arrow--prev {
  left: 24px;
}

.viewer-arrow--next {
  right: 24px;
}

.viewer-content {
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  cursor: grab;
}

.viewer-content:active {
  cursor: grabbing;
}

.viewer-image {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  transform-origin: center center;
  transition: transform 0.15s ease-out;
  pointer-events: none;
}

.viewer-counter {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 16px;
}

.viewer-zoom {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 24px;
}

.zoom-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.zoom-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.zoom-text {
  color: #fff;
  font-size: 13px;
  min-width: 48px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.viewer-thumbs {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  max-width: 90vw;
  overflow-x: auto;
}

.viewer-thumb {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  padding: 0;
  transition: border-color 0.2s;
}

.viewer-thumb:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

.viewer-thumb.is-active {
  border-color: #ff2442;
}

.viewer-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.viewer-video-wrapper {
  width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-video {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 8px;
}
</style>
