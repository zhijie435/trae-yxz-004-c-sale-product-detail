<template>
  <Teleport to="body">
    <div class="order-confirm-mask" v-if="visible" @click="handleCancel">
      <div class="order-confirm-popup" @click.stop>
        <div class="popup-header">
          <h3 class="popup-title">确认订单</h3>
          <button class="close-btn" @click="handleCancel">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="popup-content">
          <div class="product-info">
            <div class="product-image">
              <img :src="productImage" :alt="productTitle" />
            </div>
            <div class="product-detail">
              <h4 class="product-title">{{ productTitle }}</h4>
              <div class="product-spec">
                <span class="spec-label">规格：</span>
                <span class="spec-value">{{ specText }}</span>
              </div>
              <div class="product-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ unitPrice.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="order-detail">
            <div class="detail-row">
              <span class="detail-label">购买数量</span>
              <span class="detail-value">× {{ quantity }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">商品单价</span>
              <span class="detail-value">¥{{ unitPrice.toFixed(2) }}</span>
            </div>
            <div class="detail-row total-row">
              <span class="detail-label">合计</span>
              <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="popup-footer">
          <button class="btn btn-cancel" @click="handleCancel">取消</button>
          <button class="btn btn-confirm" :disabled="loading" @click="handleConfirm">
            {{ loading ? '支付中...' : '确认支付' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  productImage: {
    type: String,
    default: ''
  },
  productTitle: {
    type: String,
    default: ''
  },
  specText: {
    type: String,
    default: ''
  },
  unitPrice: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 1
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cancel', 'confirm'])

const totalPrice = computed(() => {
  return props.unitPrice * props.quantity
})

const handleCancel = () => {
  if (!props.loading) {
    emit('cancel')
  }
}

const handleConfirm = () => {
  if (!props.loading) {
    emit('confirm')
  }
}
</script>

<style scoped>
.order-confirm-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.order-confirm-popup {
  width: 90%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.popup-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.popup-content {
  padding: 20px;
}

.product-info {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.product-title {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-spec {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.spec-label {
  color: #999;
}

.spec-value {
  color: #666;
}

.product-price {
  margin-top: auto;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-symbol {
  font-size: 14px;
  font-weight: 600;
  color: #ff2442;
}

.price-value {
  font-size: 20px;
  font-weight: 700;
  color: #ff2442;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.detail-label {
  color: #666;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.total-row {
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0;
}

.total-row .detail-label {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.total-price {
  font-size: 22px;
  font-weight: 700;
  color: #ff2442;
}

.popup-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px 20px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:active {
  transform: scale(0.97);
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #eeeeee;
}

.btn-confirm {
  background: linear-gradient(135deg, #ff6b6b, #ff2442);
  color: #fff;
}

.btn-confirm:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
