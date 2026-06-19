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
      :initial-images="product.images"
      :initial-video-url="product.video"
      @video-uploaded="onVideoUploaded"
    />

    <ProductCoreInfo
      :title="product.title"
      :subtitle="product.subtitle"
      :brand="product.brand"
      :model="product.model"
      :parameters="product.parameters"
      :display-price="displayPrice"
      :original-price="product.originalPrice"
      :discount="product.discount"
      :sales-text="salesInfo.salesText"
      :rating="product.rating"
    />

    <ProductSpec
      v-if="dataLoaded"
      ref="specRef"
      :product-id="product.id"
      :base-price="product.price"
      :spec-groups="specGroups"
      :sku-list="skuList"
      @spec-change="onSpecChange"
      @quantity-change="onQuantityChange"
      @price-change="onPriceChange"
    />

    <ProductDescription
      v-if="dataLoaded"
      :product-id="product.id"
      :initial-html="product.description"
    />

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
        <div class="cart-total">
          <span class="total-label">合计</span>
          <span class="total-amount">¥{{ currentTotalPrice.toFixed(2) }}</span>
        </div>
        <button class="buy-btn buy-btn--cart" @click="handleAddToCart">加入购物车</button>
        <button class="buy-btn buy-btn--now" :disabled="ordering" @click="handleBuyNow">{{ ordering ? '下单中...' : '立即购买' }}</button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductMedia from './components/ProductMedia.vue'
import ProductCoreInfo from './components/ProductCoreInfo.vue'
import ProductSpec from './components/ProductSpec.vue'
import ProductDescription from './components/ProductDescription.vue'
import { getProductDetail, getProductSales, createOrder, stripHtmlTags } from './api'

const PRODUCT_ID = 1001

const mediaRef = ref(null)
const specRef = ref(null)

const loading = ref(false)
const ordering = ref(false)
const dataLoaded = ref(false)

const product = ref({
  id: PRODUCT_ID,
  price: 0,
  originalPrice: 0,
  discount: '',
  title: '',
  subtitle: '',
  brand: '',
  model: '',
  parameters: [],
  rating: 0,
  images: [],
  video: '',
  description: ''
})

const salesInfo = ref({
  sales: 0,
  salesText: ''
})

const specGroups = ref([])
const skuList = ref([])

const currentUnitPrice = ref(0)
const currentTotalPrice = ref(0)
const currentSkuKey = ref('')
const currentQuantity = ref(1)

const displayPrice = computed(() => {
  return currentUnitPrice.value || product.value.price
})

const fetchProductDetail = async () => {
  loading.value = true
  try {
    const data = await getProductDetail(PRODUCT_ID)
    product.value = {
      id: data.id,
      price: data.price,
      originalPrice: data.originalPrice,
      discount: data.discount,
      title: data.title,
      subtitle: data.subtitle,
      brand: data.brand,
      model: data.model,
      parameters: data.parameters || [],
      rating: data.rating,
      images: data.images,
      video: data.video,
      description: data.description
    }
    specGroups.value = data.specGroups
    currentUnitPrice.value = data.price
    currentTotalPrice.value = data.price
  } catch (error) {
    console.error('获取商品详情失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchSalesInfo = async () => {
  try {
    const data = await getProductSales(PRODUCT_ID)
    salesInfo.value = data
  } catch (error) {
    console.error('获取销量信息失败:', error)
  }
}

const fetchSkuList = async () => {
  const mockSkuList = [
    { key: 'color_black-version_standard', priceAdjust: 0, stock: 156 },
    { key: 'color_black-version_pro', priceAdjust: 200, stock: 80 },
    { key: 'color_black-version_ultra', priceAdjust: 400, stock: 35 },
    { key: 'color_white-version_standard', priceAdjust: 0, stock: 89 },
    { key: 'color_white-version_pro', priceAdjust: 200, stock: 45 },
    { key: 'color_white-version_ultra', priceAdjust: 400, stock: 20 },
    { key: 'color_silver-version_standard', priceAdjust: 50, stock: 42 },
    { key: 'color_silver-version_pro', priceAdjust: 250, stock: 28 },
    { key: 'color_silver-version_ultra', priceAdjust: 450, stock: 12 },
    { key: 'color_gold-version_standard', priceAdjust: 50, stock: 0 },
    { key: 'color_gold-version_pro', priceAdjust: 250, stock: 0 },
    { key: 'color_gold-version_ultra', priceAdjust: 450, stock: 0 }
  ]
  skuList.value = mockSkuList
}

const handleBuyNow = async () => {
  if (ordering.value) return
  ordering.value = true
  try {
    const result = await createOrder({
      productId: PRODUCT_ID,
      skuKey: currentSkuKey.value,
      quantity: currentQuantity.value
    })
    console.log('下单成功:', result)
    alert(`下单成功！订单号：${result.orderId}\n合计：¥${result.totalPrice.toFixed(2)}`)
    await fetchSalesInfo()
    if (specRef.value) {
      // 刷新库存
    }
  } catch (error) {
    console.error('下单失败:', error)
    alert('下单失败：' + error.message)
  } finally {
    ordering.value = false
  }
}

const handleAddToCart = () => {
  console.log('加入购物车:', {
    skuKey: currentSkuKey.value,
    quantity: currentQuantity.value
  })
  alert('已加入购物车')
}

const onSpecChange = (data) => {
  currentSkuKey.value = data.skuKey
  console.log('规格变化:', data)
}

const onQuantityChange = (quantity) => {
  currentQuantity.value = quantity
  console.log('数量变化:', quantity)
}

const onPriceChange = (data) => {
  currentUnitPrice.value = data.unitPrice
  currentTotalPrice.value = data.totalPrice
  console.log('价格变化:', data)
}

const onVideoUploaded = (data) => {
  console.log('视频上传成功:', data)
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchProductDetail(),
      fetchSalesInfo(),
      fetchSkuList()
    ])
    dataLoaded.value = true
  } finally {
    loading.value = false
  }
})
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
  align-items: center;
  gap: 8px;
}

.cart-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 4px;
}

.total-label {
  font-size: 11px;
  color: #999;
}

.total-amount {
  font-size: 16px;
  font-weight: 700;
  color: #ff2442;
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
