<template>
  <div class="product-spec">
    <div class="spec-header">
      <span class="spec-label">已选</span>
      <span class="spec-selected">{{ selectedSpecText }}</span>
    </div>

    <div class="spec-groups">
      <div class="spec-group" v-for="group in specGroups" :key="group.key">
        <div class="group-title">{{ group.name }}</div>
        <div class="spec-options">
          <button
            v-for="option in group.options"
            :key="option.id"
            class="spec-option"
            :class="{
              'is-active': isSelected(group.key, option.id),
              'is-disabled': option.stock === 0
            }"
            :disabled="option.stock === 0"
            @click="selectSpec(group.key, option)"
          >
            <span class="option-name">{{ option.name }}</span>
            <span class="option-price" v-if="option.priceAdjust !== 0">
              {{ option.priceAdjust > 0 ? '+' : '' }}{{ option.priceAdjust.toFixed(2) }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="quantity-row">
      <span class="quantity-label">购买数量</span>
      <div class="quantity-control">
        <button class="qty-btn" :disabled="quantity <= 1" @click="decreaseQty">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <input type="number" class="qty-input" v-model.number="quantity" min="1" :max="maxQuantity" @change="onQuantityChange" />
        <button class="qty-btn" :disabled="quantity >= maxQuantity" @click="increaseQty">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      <span class="stock-info">库存 {{ currentStock }} 件</span>
    </div>

    <div class="price-summary">
      <div class="summary-row">
        <span class="summary-label">商品单价</span>
        <span class="summary-value">¥{{ unitPrice.toFixed(2) }}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">购买数量</span>
        <span class="summary-value">× {{ quantity }}</span>
      </div>
      <div class="summary-row total-row">
        <span class="summary-label">合计</span>
        <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  basePrice: {
    type: Number,
    required: true
  },
  specGroups: {
    type: Array,
    required: true
  },
  skuList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['spec-change', 'quantity-change', 'price-change'])

const selectedSpecs = ref({})
const quantity = ref(1)

const initDefaultSpecs = () => {
  const newSpecs = { ...selectedSpecs.value }
  props.specGroups.forEach(group => {
    const availableOption = group.options.find(opt => opt.stock > 0)
    if (availableOption) {
      newSpecs[group.key] = availableOption.id
    }
  })
  selectedSpecs.value = newSpecs
}

const isSelected = (groupKey, optionId) => {
  return selectedSpecs.value[groupKey] === optionId
}

const selectSpec = (groupKey, option) => {
  if (option.stock === 0) return
  selectedSpecs.value = {
    ...selectedSpecs.value,
    [groupKey]: option.id
  }
}

const selectedSpecText = computed(() => {
  const texts = []
  props.specGroups.forEach(group => {
    const selectedId = selectedSpecs.value[group.key]
    const option = group.options.find(opt => opt.id === selectedId)
    if (option) {
      texts.push(option.name)
    }
  })
  return texts.length > 0 ? texts.join('，') : '请选择规格'
})

const specPriceAdjust = computed(() => {
  let adjust = 0
  props.specGroups.forEach(group => {
    const selectedId = selectedSpecs.value[group.key]
    const option = group.options.find(opt => opt.id === selectedId)
    if (option) {
      adjust += option.priceAdjust || 0
    }
  })
  
  if (props.skuList.length > 0) {
    const skuKey = Object.values(selectedSpecs.value).join('-')
    const matchedSku = props.skuList.find(sku => sku.key === skuKey)
    if (matchedSku && matchedSku.priceAdjust !== undefined) {
      adjust = matchedSku.priceAdjust
    }
  }
  
  return adjust
})

const unitPrice = computed(() => {
  return props.basePrice + specPriceAdjust.value
})

const currentStock = computed(() => {
  if (props.skuList.length > 0) {
    const skuKey = Object.values(selectedSpecs.value).join('-')
    const matchedSku = props.skuList.find(sku => sku.key === skuKey)
    if (matchedSku) {
      return matchedSku.stock
    }
  }
  
  let minStock = Infinity
  props.specGroups.forEach(group => {
    const selectedId = selectedSpecs.value[group.key]
    const option = group.options.find(opt => opt.id === selectedId)
    if (option && option.stock !== undefined) {
      minStock = Math.min(minStock, option.stock)
    }
  })
  
  return minStock === Infinity ? 999 : minStock
})

const maxQuantity = computed(() => {
  return Math.max(1, currentStock.value)
})

const totalPrice = computed(() => {
  return unitPrice.value * quantity.value
})

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const increaseQty = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value++
  }
}

const onQuantityChange = () => {
  if (quantity.value < 1) {
    quantity.value = 1
  } else if (quantity.value > maxQuantity.value) {
    quantity.value = maxQuantity.value
  }
}

watch(selectedSpecs, () => {
  if (quantity.value > currentStock.value) {
    quantity.value = currentStock.value
  }
  emit('spec-change', {
    specs: { ...selectedSpecs.value },
    specText: selectedSpecText.value
  })
  emit('price-change', {
    unitPrice: unitPrice.value,
    totalPrice: totalPrice.value,
    specPriceAdjust: specPriceAdjust.value
  })
}, { deep: true })

watch(quantity, () => {
  emit('quantity-change', quantity.value)
  emit('price-change', {
    unitPrice: unitPrice.value,
    totalPrice: totalPrice.value,
    specPriceAdjust: specPriceAdjust.value
  })
})

initDefaultSpecs()

defineExpose({
  selectedSpecs,
  quantity,
  unitPrice,
  totalPrice,
  currentStock
})
</script>

<style scoped>
.product-spec {
  padding: 16px;
  background: #fff;
}

.spec-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff5f5, #fff0f0);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #ffe0e0;
}

.spec-label {
  font-size: 14px;
  font-weight: 600;
  color: #ff2442;
  flex-shrink: 0;
}

.spec-selected {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.spec-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.spec-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 18px;
  background: #f8f8f8;
  border: 1.5px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.spec-option:hover:not(.is-disabled) {
  background: #fff0f0;
  border-color: #ffb3b3;
}

.spec-option.is-active {
  background: linear-gradient(135deg, #fff5f5, #ffe8e8);
  border-color: #ff2442;
  color: #ff2442;
  font-weight: 500;
}

.spec-option.is-disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
  text-decoration: line-through;
}

.option-price {
  font-size: 12px;
  font-weight: 500;
}

.quantity-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-top: 20px;
}

.quantity-label {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  flex-shrink: 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: none;
  cursor: pointer;
  color: #333;
  transition: background 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.qty-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.qty-input {
  width: 60px;
  height: 36px;
  border: none;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  outline: none;
  background: #fff;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.stock-info {
  font-size: 13px;
  color: #999;
  margin-left: auto;
}

.price-summary {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #fafafa, #f5f5f5);
  border-radius: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.summary-label {
  font-size: 14px;
  color: #666;
}

.summary-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.total-row {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0;
}

.total-row .summary-label {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.total-price {
  font-size: 24px;
  font-weight: 700;
  color: #ff2442;
}
</style>
