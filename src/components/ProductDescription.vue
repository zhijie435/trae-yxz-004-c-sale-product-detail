<template>
  <section class="product-description">
    <div class="description-header">
      <span class="header-title">商品详情</span>
      <span class="header-line"></span>
    </div>
    <nav class="detail-tabs">
      <button
        v-for="sec in detailSections"
        :key="sec.id"
        class="detail-tab"
        :class="{ 'is-active': activeSection === sec.id }"
        @click="scrollToSection(sec.id)"
      >
        {{ sec.label }}
      </button>
    </nav>
    <div v-if="loading" class="description-loading">加载中...</div>
    <div v-else ref="contentRef" class="description-content" v-html="descriptionHtml"></div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { getProductDescription, stripHtmlTags } from '../api/product'

const props = defineProps({
  productId: {
    type: [Number, String],
    required: true
  },
  initialHtml: {
    type: String,
    default: ''
  }
})

const detailSections = [
  { id: 'section-params', label: '产品参数' },
  { id: 'section-features', label: '功能介绍' },
  { id: 'section-cases', label: '场景案例' },
  { id: 'section-service', label: '售后保障' }
]

const loading = ref(false)
const descriptionHtml = ref(props.initialHtml || '')
const contentRef = ref(null)
const activeSection = ref(detailSections[0].id)
let observer = null

const plainText = computed(() => stripHtmlTags(descriptionHtml.value))

const scrollToSection = (id) => {
  activeSection.value = id
  const root = contentRef.value
  if (!root) return
  const el = root.querySelector('#' + id)
  if (el && typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const setupObserver = () => {
  if (typeof IntersectionObserver === 'undefined') return
  const root = contentRef.value
  if (!root) return
  if (observer) {
    observer.disconnect()
  }
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id
      }
    })
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 })
  detailSections.forEach((sec) => {
    const el = root.querySelector('#' + sec.id)
    if (el) observer.observe(el)
  })
}

const fetchDescription = async () => {
  if (descriptionHtml.value) return
  loading.value = true
  try {
    const data = await getProductDescription(props.productId)
    descriptionHtml.value = data.description
  } catch (error) {
    console.error('获取商品详情失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!descriptionHtml.value) {
    await fetchDescription()
  }
  await nextTick()
  setupObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

defineExpose({
  descriptionHtml,
  plainText,
  loading,
  fetchDescription,
  detailSections,
  activeSection,
  scrollToSection
})
</script>

<style scoped>
.product-description {
  padding: 16px;
  background: #fff;
  margin-top: 12px;
}

.description-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  flex-shrink: 0;
}

.header-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #f0f0f0, transparent);
}

.detail-tabs {
  position: sticky;
  top: 48px;
  z-index: 10;
  display: flex;
  gap: 8px;
  padding: 8px 0 16px;
  margin-bottom: 4px;
  overflow-x: auto;
  background: #fff;
  -webkit-overflow-scrolling: touch;
}

.detail-tabs::-webkit-scrollbar {
  display: none;
}

.detail-tab {
  flex-shrink: 0;
  padding: 7px 16px;
  border: 1px solid #eee;
  border-radius: 999px;
  background: #f7f7f7;
  color: #666;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-tab:hover {
  color: #ff2442;
  border-color: #ffb3b3;
}

.detail-tab.is-active {
  background: linear-gradient(135deg, #ff6b6b, #ff2442);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
}

.description-loading {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

.description-content {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

.description-content :deep(h2) {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 24px 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ff2442;
  scroll-margin-top: 96px;
}

.description-content :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 20px 0 10px;
}

.description-content :deep(p) {
  margin: 12px 0;
}

.description-content :deep(ul),
.description-content :deep(ol) {
  margin: 12px 0;
  padding-left: 20px;
}

.description-content :deep(li) {
  margin: 8px 0;
}

.description-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 13px;
}

.description-content :deep(td) {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
}

.description-content :deep(td:first-child) {
  background: #fafafa;
  color: #666;
  width: 40%;
}

.description-content :deep(strong) {
  color: #ff2442;
  font-weight: 600;
}

.description-content :deep(em) {
  color: #999;
  font-style: italic;
  font-size: 13px;
}

.description-content :deep(img) {
  max-width: 100%;
  display: block;
}

.description-content :deep(.case-card) {
  margin: 16px 0;
  border-radius: 12px;
  overflow: hidden;
  background: #fafafa;
  border: 1px solid #f0f0f0;
}

.description-content :deep(.case-card img) {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
}

.description-content :deep(.case-body) {
  padding: 12px 14px 16px;
}

.description-content :deep(.case-body h3) {
  margin: 0 0 6px;
  font-size: 15px;
}

.description-content :deep(.case-body p) {
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
}
</style>
