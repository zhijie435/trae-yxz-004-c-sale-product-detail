<template>
  <div class="product-media">
    <div class="media-main">
      <div class="media-tabs">
        <button
          class="tab-btn"
          :class="{ 'is-active': activeTab === 'images' }"
          @click="activeTab = 'images'"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          商品图片
          <span v-if="images.length" class="tab-count">{{ images.length }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'is-active': activeTab === 'video' }"
          @click="activeTab = 'video'"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="6" width="14" height="12" rx="2"></rect>
            <path d="M22 8l-6 4 6 4V8z"></path>
          </svg>
          商品视频
        </button>
      </div>

      <div class="media-content">
        <Transition name="tab-fade" mode="out-in">
          <ImageCarousel
            v-if="activeTab === 'images'"
            ref="carouselRef"
            :images="images"
            @fullscreen="openImageFullscreen"
          />
          <VideoPlayer
            v-else
            v-model:video-url="videoUrl"
            :poster="images[0]"
            @fullscreen="openVideoFullscreen"
            @uploaded="onVideoUploaded"
          />
        </Transition>
      </div>
    </div>

    <FullscreenViewer
      :visible="fullscreenVisible"
      :type="fullscreenType"
      :images="images"
      :initial-index="fullscreenIndex"
      :video-url="videoUrl"
      @close="closeFullscreen"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ImageCarousel from './ImageCarousel.vue'
import VideoPlayer from './VideoPlayer.vue'
import FullscreenViewer from './FullscreenViewer.vue'

const props = defineProps({
  initialImages: {
    type: Array,
    default: () => []
  },
  initialVideoUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['change', 'video-uploaded'])

const activeTab = ref('images')
const images = ref([...props.initialImages])
const videoUrl = ref(props.initialVideoUrl)

const carouselRef = ref(null)

const fullscreenVisible = ref(false)
const fullscreenType = ref('image')
const fullscreenIndex = ref(0)

watch(() => props.initialImages, (val) => {
  images.value = [...val]
}, { deep: true })

watch(() => props.initialVideoUrl, (val) => {
  videoUrl.value = val
})

const openImageFullscreen = (index = 0) => {
  fullscreenType.value = 'image'
  fullscreenIndex.value = index
  fullscreenVisible.value = true
}

const openVideoFullscreen = () => {
  if (!videoUrl.value) return
  fullscreenType.value = 'video'
  fullscreenVisible.value = true
}

const closeFullscreen = () => {
  fullscreenVisible.value = false
}

const onVideoUploaded = (data) => {
  emit('video-uploaded', data)
}

defineExpose({
  images,
  videoUrl,
  activeTab,
  openImageFullscreen,
  openVideoFullscreen
})
</script>

<style scoped>
.product-media {
  width: 100%;
  background-color: #fff;
}

.media-main {
  display: flex;
  flex-direction: column;
  height: 480px;
}

.media-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: transparent;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.tab-btn.is-active {
  background-color: #ff2442;
  color: #fff;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 9px;
  font-size: 12px;
}

.media-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}
</style>
