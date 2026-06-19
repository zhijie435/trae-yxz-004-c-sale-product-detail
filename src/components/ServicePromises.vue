<template>
  <section class="service-promises" v-if="promises && promises.length > 0">
    <div class="promise-item" v-for="item in promises" :key="item.label">
      <div class="promise-icon">
        <svg v-if="item.icon === 'delivery'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 3h15v13H1z"></path>
          <path d="M16 8h4l3 3v5h-7V8z"></path>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
        <svg v-else-if="item.icon === 'warranty'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <polyline points="9 12 11 14 15 10"></polyline>
        </svg>
        <svg v-else-if="item.icon === 'location'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <div class="promise-content">
        <span class="promise-label">{{ item.label }}</span>
        <span class="promise-value">{{ item.value }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  promises: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.service-promises {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.service-promises::-webkit-scrollbar {
  display: none;
}

.promise-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.promise-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #ff2442;
  flex-shrink: 0;
}

.promise-content {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}

.promise-label {
  font-size: 12px;
  color: #999;
}

.promise-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}
</style>
