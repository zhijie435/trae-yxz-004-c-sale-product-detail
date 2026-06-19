<template>
  <div class="video-player">
    <div v-if="!videoUrl" class="video-uploader" @dragover.prevent @drop.prevent="handleDrop">
      <div class="uploader-inner">
        <div class="uploader-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="6" width="14" height="12" rx="2"></rect>
            <path d="M22 8l-6 4 6 4V8z"></path>
          </svg>
        </div>
        <p class="uploader-text">点击或拖拽视频到此上传</p>
        <p class="uploader-hint">支持 MP4、WebM、MOV 格式，最大 500MB</p>
        <button class="uploader-btn" @click="triggerUpload">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          选择视频
        </button>
        <input ref="fileInput" type="file" accept="video/*" @change="handleFileChange" hidden />
      </div>
      <div v-if="uploading" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="progress-text">上传中 {{ uploadProgress }}%</p>
      </div>
      <div v-if="errorMsg" class="upload-error">{{ errorMsg }}</div>
    </div>

    <div v-else class="video-container" @click="$emit('fullscreen')">
      <video
        ref="videoRef"
        :src="videoUrl"
        class="video-element"
        :poster="poster"
        playsinline
        webkit-playsinline
        @loadedmetadata="onLoaded"
      ></video>
      <div class="video-overlay">
        <button v-if="!isPlaying" class="play-btn" @click.stop="togglePlay">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <polygon points="6 4 20 12 6 20 6 4"></polygon>
          </svg>
        </button>
      </div>
      <div class="video-controls">
        <button class="control-btn" @click.stop="togglePlay">
          <svg v-if="!isPlaying" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <polygon points="6 4 20 12 6 20 6 4"></polygon>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
        <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
        <div class="progress-track" @click.stop="seek">
          <div class="progress-filled" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <button class="control-btn" @click.stop="toggleMute">
          <svg v-if="!isMuted" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        </button>
        <button class="control-btn" @click.stop="$emit('fullscreen')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>
        <button v-if="removable" class="control-btn control-btn--danger" @click.stop="handleRemove">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
      <div class="video-tag">视频</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  videoUrl: {
    type: String,
    default: ''
  },
  poster: {
    type: String,
    default: ''
  },
  removable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['fullscreen', 'update:videoUrl', 'uploaded'])

const fileInput = ref(null)
const videoRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isMuted = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const errorMsg = ref('')

const progressPercent = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

let updateTimer = null

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    uploadFile(file)
  }
}

const handleDrop = (e) => {
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('video/')) {
    uploadFile(file)
  }
}

const uploadFile = async (file) => {
  errorMsg.value = ''
  uploading.value = true
  uploadProgress.value = 0

  const formData = new FormData()
  formData.append('file', file)

  try {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        uploadProgress.value = Math.round((e.loaded / e.total) * 100)
      }
    })

    const result = await new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error('上传失败'))
        }
      }
      xhr.onerror = () => reject(new Error('网络错误'))
      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })

    if (result.code === 0) {
      emit('update:videoUrl', result.data.url)
      emit('uploaded', result.data)
    } else {
      errorMsg.value = result.message || '上传失败'
    }
  } catch (err) {
    errorMsg.value = err.message || '上传失败'
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    if (fileInput.value) fileInput.value.value = ''
  }
}

const onLoaded = () => {
  duration.value = videoRef.value?.duration || 0
}

const togglePlay = () => {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
    isPlaying.value = false
    stopUpdate()
  } else {
    videoRef.value.play()
    isPlaying.value = true
    startUpdate()
  }
}

const toggleMute = () => {
  if (!videoRef.value) return
  isMuted.value = !isMuted.value
  videoRef.value.muted = isMuted.value
}

const seek = (e) => {
  if (!videoRef.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * duration.value
  currentTime.value = videoRef.value.currentTime
}

const startUpdate = () => {
  stopUpdate()
  updateTimer = setInterval(() => {
    if (videoRef.value) {
      currentTime.value = videoRef.value.currentTime
      if (videoRef.value.ended) {
        isPlaying.value = false
        stopUpdate()
      }
    }
  }, 200)
}

const stopUpdate = () => {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
}

const handleRemove = () => {
  emit('update:videoUrl', '')
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  stopUpdate()
}

watch(() => props.videoUrl, (url) => {
  if (!url) {
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
    stopUpdate()
  }
})

onBeforeUnmount(() => {
  stopUpdate()
  if (videoRef.value) {
    videoRef.value.pause()
  }
})

defineExpose({ play: togglePlay, videoRef })
</script>

<style scoped>
.video-player {
  width: 100%;
  height: 100%;
  background-color: #000;
  position: relative;
}

.video-uploader {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  position: relative;
}

.uploader-inner {
  text-align: center;
  padding: 40px;
}

.uploader-icon {
  color: #999;
  margin-bottom: 16px;
}

.uploader-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.uploader-hint {
  font-size: 12px;
  color: #999;
  margin-bottom: 20px;
}

.uploader-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  background-color: #ff2442;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.uploader-btn:hover {
  background-color: #e61e3a;
}

.upload-progress {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #ff2442;
  border-radius: 3px;
  transition: width 0.2s;
}

.progress-text {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.upload-error {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  color: #ff2442;
  font-size: 13px;
}

.video-container {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: zoom-in;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000;
}

.video-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.play-btn {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 36, 66, 0.9);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 6px;
  pointer-events: auto;
  transition: transform 0.2s, background 0.2s;
}

.play-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 36, 66, 1);
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  opacity: 0;
  transition: opacity 0.2s;
}

.video-container:hover .video-controls {
  opacity: 1;
}

.control-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.control-btn--danger:hover {
  background: rgba(255, 36, 66, 0.5);
}

.time-display {
  font-size: 12px;
  color: #fff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.progress-filled {
  height: 100%;
  background: #ff2442;
  border-radius: 2px;
}

.video-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
}
</style>
