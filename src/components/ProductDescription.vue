<template>
  <section class="product-description">
    <div class="description-header">
      <span class="header-title">商品详情</span>
      <span class="header-line"></span>
    </div>
    <div v-if="loading" class="description-loading">加载中...</div>
    <div v-else class="description-content" v-html="descriptionHtml"></div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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

const loading = ref(false)
const descriptionHtml = ref(props.initialHtml || '')

const plainText = computed(() => stripHtmlTags(descriptionHtml.value))

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

onMounted(() => {
  fetchDescription()
})

defineExpose({
  descriptionHtml,
  plainText,
  loading,
  fetchDescription
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
  margin-bottom: 20px;
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
</style>
