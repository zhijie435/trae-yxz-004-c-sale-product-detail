<template>
  <div class="product-detail">
    <header class="page-header">
      <div class="header-inner">
        <button class="back-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 class="page-title">商品详情</h1>
        <div class="header-actions">
          <button class="action-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <ProductMedia
      ref="mediaRef"
      :initial-images="productImages"
      :initial-video-url="productVideo"
      @video-uploaded="onVideoUploaded"
    />

    <section class="product-info">
      <div class="price-row">
        <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
        <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice.toFixed(2) }}</span>
        <span class="discount-tag" v-if="product.discount">{{ product.discount }}</span>
      </div>
      <h2 class="product-title">{{ product.title }}</h2>
      <p class="product-subtitle">{{ product.subtitle }}</p>
      <div class="product-meta">
        <span class="sales">已售 {{ product.sales }}</span>
        <span class="divider">·</span>
        <span class="rating">{{ product.rating }} 分</span>
      </div>
    </section>

    <footer class="buy-bar">
      <div class="bar-left">
        <button class="icon-btn">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>收藏</span>
        </button>
        <button class="icon-btn">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>客服</span>
        </button>
        <button class="icon-btn">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>购物车</span>
        </button>
      </div>
      <div class="bar-right">
        <button class="buy-btn buy-btn--cart">加入购物车</button>
        <button class="buy-btn buy-btn--now">立即购买</button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductMedia from './components/ProductMedia.vue'

const mediaRef = ref(null)

const productImages = ref([
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20wireless%20headphones%20on%20white%20background%20product%20photography&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20headphones%20detail%20shot%20ear%20cups%20close%20up%20product%20photo&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20bluetooth%20headphones%20side%20view%20lifestyle%20product%20shot&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20headphones%20packaging%20box%20unboxing%20product%20photography&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=headphones%20charging%20case%20accessories%20flat%20lay%20product%20photo&image_size=square_hd'
])

const productVideo = ref('')

const product = ref({
  price: 899,
  originalPrice: 1299,
  discount: '限时6.9折',
  title: '【全新旗舰】主动降噪无线蓝牙耳机 头戴式',
  subtitle: '40dB主动降噪 | 40小时超长续航 | Hi-Res金标认证 | 蓝牙5.3',
  sales: '12.8万',
  rating: 4.9
})

const onVideoUploaded = (data) => {
  console.log('视频上传成功:', data)
}
</script>

<style scoped>
.product-detail {
  min-height: 100vh;
  padding-bottom: 80px;
  background-color: #fff;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f0f0f0;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 12px;
}

.back-btn,
.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.back-btn:hover,
.action-btn:hover {
  background: #f5f5f5;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.product-info {
  padding: 16px;
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
}

.divider {
  color: #ddd;
}

.rating {
  color: #ff9500;
}

.buy-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 8px 12px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.bar-left {
  display: flex;
  gap: 4px;
}

.icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 56px;
  height: 48px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  font-size: 10px;
  transition: color 0.2s;
}

.icon-btn:hover {
  color: #ff2442;
}

.bar-right {
  display: flex;
  gap: 8px;
}

.buy-btn {
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
}

.buy-btn:active {
  transform: scale(0.97);
}

.buy-btn--cart {
  background: linear-gradient(135deg, #ffb347, #ff8c00);
  color: #fff;
}

.buy-btn--now {
  background: linear-gradient(135deg, #ff6b6b, #ff2442);
  color: #fff;
}

.buy-btn:hover {
  opacity: 0.9;
}
</style>
