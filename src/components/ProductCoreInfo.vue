<template>
  <section class="product-core-info">
    <div class="price-row">
      <span class="current-price">¥{{ displayPrice.toFixed(2) }}</span>
      <span class="original-price" v-if="originalPrice">¥{{ originalPrice.toFixed(2) }}</span>
      <span class="discount-tag" v-if="discount">{{ discount }}</span>
    </div>

    <h2 class="product-title">{{ title }}</h2>
    <p class="product-subtitle">{{ subtitle }}</p>

    <div class="product-meta">
      <span class="sales">已售 {{ salesText }}</span>
      <span class="divider">·</span>
      <span class="rating">{{ rating }} 分</span>
    </div>

    <div class="product-brand-row" v-if="brand || model">
      <div class="brand-item" v-if="brand">
        <span class="brand-label">品牌</span>
        <span class="brand-value">{{ brand }}</span>
      </div>
      <div class="brand-item" v-if="model">
        <span class="brand-label">型号</span>
        <span class="brand-value">{{ model }}</span>
      </div>
    </div>

    <div class="product-params" v-if="parameters && parameters.length > 0">
      <div
        class="param-item"
        v-for="param in displayedParams"
        :key="param.key"
      >
        <span class="param-key">{{ param.key }}</span>
        <span class="param-value">{{ param.value }}</span>
      </div>
      <button
        v-if="parameters.length > maxDisplayParams"
        class="expand-btn"
        @click="toggleExpand"
      >
        {{ isExpanded ? '收起参数' : `查看全部 ${parameters.length} 个参数` }}
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          :class="{ 'is-expanded': isExpanded }"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    default: ''
  },
  model: {
    type: String,
    default: ''
  },
  parameters: {
    type: Array,
    default: () => []
  },
  displayPrice: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  discount: {
    type: String,
    default: ''
  },
  salesText: {
    type: String,
    default: '0'
  },
  rating: {
    type: Number,
    default: 0
  },
  maxDisplayParams: {
    type: Number,
    default: 4
  }
})

const isExpanded = ref(false)

const displayedParams = computed(() => {
  if (isExpanded.value) {
    return props.parameters
  }
  return props.parameters.slice(0, props.maxDisplayParams)
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.product-core-info {
  padding: 16px;
  background: #fff;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
}

.current-price {
  font-size: 28px;
  font-weight: 700;
  color: #ff2442;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.discount-tag {
  display: inline-block;
  padding: 2px 8px;
  background: linear-gradient(135deg, #ff6b6b, #ff2442);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.product-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  margin-bottom: 6px;
}

.product-subtitle {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
}

.divider {
  color: #ddd;
}

.rating {
  color: #ff9500;
}

.product-brand-row {
  display: flex;
  gap: 24px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.brand-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-label {
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
}

.brand-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.product-params {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.param-key {
  font-size: 13px;
  color: #999;
  min-width: 70px;
  flex-shrink: 0;
}

.param-value {
  font-size: 13px;
  color: #333;
  flex: 1;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  margin-top: 4px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
  color: #333;
}

.expand-btn svg {
  transition: transform 0.2s;
}

.expand-btn svg.is-expanded {
  transform: rotate(180deg);
}
</style>
