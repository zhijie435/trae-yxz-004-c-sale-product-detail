# C端销售商品详情 - 部署文档

## 项目概述

本项目是一个C端销售商品详情页，包含完整的商品展示、规格选择、库存管理、订单创建与支付流程。

- **前端技术栈**: Vue 3 + Vite
- **后端技术栈**: Express.js + Node.js
- **测试框架**: Vitest + Supertest

## 项目结构

```
.
├── src/                    # 前端源码
│   ├── api/               # API接口封装
│   ├── components/        # Vue组件
│   ├── composables/       # 组合式函数
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── server/                # 后端服务
│   ├── server.js         # 服务器主文件（含种子数据）
│   └── package.json
├── tests/                 # 测试用例
│   ├── server.test.js    # 服务端API测试
│   ├── description.test.js # 商品详情测试
│   └── useProductSpec.test.js # 规格逻辑测试
├── DEPLOYMENT.md         # 本文档
├── package.json          # 前端依赖
└── vitest.config.js      # Vitest配置
```

## 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..
```

### 2. 启动后端服务

```bash
# 方式一：生产模式
cd server && npm start

# 方式二：开发模式（带热重载）
cd server && npm run dev
```

后端服务将在 `http://localhost:3001` 启动。

### 3. 启动前端开发服务

```bash
# 在项目根目录执行
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

### 4. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 5. 预览生产版本

```bash
npm run preview
```

## 商品素材与库存种子数据

### 商品信息

商品ID: `1001`

**商品名称**: 【全新旗舰】主动降噪无线蓝牙耳机 头戴式

**品牌**: 声域/SoundPro
**型号**: SP-NC9000
**基础价格**: ¥899
**原价**: ¥1299
**折扣**: 限时6.9折

### 商品图片

| 序号 | 图片URL | 说明 |
|------|---------|------|
| 1 | `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20wireless%20headphones%20on%20white%20background%20product%20photography&image_size=square_hd` | 主图-产品正面 |
| 2 | `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20headphones%20detail%20shot%20ear%20cups%20close%20up%20product%20photo&image_size=square_hd` | 细节图-耳罩特写 |
| 3 | `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20bluetooth%20headphones%20side%20view%20lifestyle%20product%20shot&image_size=square_hd` | 侧面图-佩戴效果 |
| 4 | `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20headphones%20packaging%20box%20unboxing%20product%20photography&image_size=square_hd` | 包装图-开箱展示 |
| 5 | `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=headphones%20charging%20case%20accessories%20flat%20lay%20product%20photo&image_size=square_hd` | 配件图-全家福 |

### 规格配置

#### 颜色规格

| 选项ID | 名称 | 价格调整 |
|--------|------|----------|
| color_black | 曜石黑 | ¥0 |
| color_white | 珍珠白 | ¥0 |
| color_silver | 星空银 | ¥+50 |
| color_gold | 玫瑰金 | ¥+50 |

#### 版本规格

| 选项ID | 名称 | 价格调整 |
|--------|------|----------|
| version_standard | 标准版 | ¥0 |
| version_pro | Pro版 | ¥+200 |
| version_ultra | Ultra版 | ¥+400 |

### SKU库存明细

| SKU Key | 规格组合 | 价格调整 | 库存 |
|---------|----------|----------|------|
| color_black-version_standard | 曜石黑 + 标准版 | ¥0 | 156 |
| color_black-version_pro | 曜石黑 + Pro版 | ¥+200 | 80 |
| color_black-version_ultra | 曜石黑 + Ultra版 | ¥+400 | 35 |
| color_white-version_standard | 珍珠白 + 标准版 | ¥0 | 89 |
| color_white-version_pro | 珍珠白 + Pro版 | ¥+200 | 45 |
| color_white-version_ultra | 珍珠白 + Ultra版 | ¥+400 | 20 |
| color_silver-version_standard | 星空银 + 标准版 | ¥+50 | 42 |
| color_silver-version_pro | 星空银 + Pro版 | ¥+250 | 28 |
| color_silver-version_ultra | 星空银 + Ultra版 | ¥+450 | 12 |
| color_gold-version_standard | 玫瑰金 + 标准版 | ¥+50 | 0 |
| color_gold-version_pro | 玫瑰金 + Pro版 | ¥+250 | 0 |
| color_gold-version_ultra | 玫瑰金 + Ultra版 | ¥+450 | 0 |

**总库存**: 507件（在售487件，缺货20件）

### 商品富文本详情

详情包含以下分区：
1. **产品参数** - 完整的技术规格表格
2. **功能介绍** - 5大核心卖点说明
3. **场景案例** - 4个使用场景展示（通勤、办公、运动、旅行）
4. **售后保障** - 6项售后服务承诺

### 服务承诺

- 配送方式：快递发货
- 质保：全国联保
- 可交付区域：全国

## API 接口文档

### 健康检查
```
GET /api/health
```

### 商品详情
```
GET /api/product/:id
```

### 商品销量
```
GET /api/product/:id/sales
```

### SKU库存查询
```
GET /api/product/:id/stock?skuKey=xxx
```

### 商品富文本详情
```
GET /api/product/:id/description
```

### 创建订单
```
POST /api/order/create
Content-Type: application/json

{
  "productId": 1001,
  "skuKey": "color_black-version_standard",
  "quantity": 1
}
```

### 支付订单
```
POST /api/order/pay
Content-Type: application/json

{
  "orderId": "ORD1234567890"
}
```

### 文件上传
```
POST /api/upload
Content-Type: multipart/form-data

file: <二进制文件>
```
支持格式：图片(jpeg/jpg/png/gif/webp)、视频(mp4/webm/mov/avi)
文件大小限制：500MB

## 验收命令

### 1. 安装依赖（首次部署）
```bash
npm run install:all
```

### 2. 运行完整测试套件
```bash
npm run test:all
```

### 3. 仅运行服务端API测试
```bash
npm run test:server
```

### 4. 仅运行商品详情测试
```bash
npm run test:description
```

### 5. 仅运行规格逻辑测试
```bash
npm run test:spec
```

### 6. 监听模式运行测试
```bash
npm run test:watch
```

### 7. 启动完整开发环境（前端+后端）
```bash
npm run dev:all
```

### 8. 代码质量检查（可选）
```bash
npm run lint
```

## 验收标准

### 测试通过率
- 所有测试用例必须 100% 通过
- 测试覆盖：服务端API、商品详情、规格逻辑三大模块

### 功能验收清单

#### 商品展示
- [ ] 商品主图轮播正常显示
- [ ] 商品价格、折扣信息正确展示
- [ ] 销量数据格式正确（>=1万显示x.x万）
- [ ] 服务承诺图标和文字正确展示

#### 规格选择
- [ ] 颜色规格4个选项正常展示
- [ ] 版本规格3个选项正常展示
- [ ] 选中规格后价格实时更新
- [ ] 库存为0的规格标记为缺货
- [ ] 价格调整正确计算（基础价+规格加价）

#### 数量控制
- [ ] 增加按钮不超过最大库存
- [ ] 减少按钮不低于1
- [ ] 切换规格后数量自动适配新库存
- [ ] 总价 = 单价 × 数量

#### 商品详情
- [ ] 富文本内容正确渲染
- [ ] 4个分区Tab可切换
- [ ] 纯文本版本正确剥离HTML标签
- [ ] 详情包含核心卖点关键词

#### 订单流程
- [ ] 未选规格时点击购买提示选择规格
- [ ] 创建订单成功返回订单信息
- [ ] 支付成功后扣减库存
- [ ] 支付成功后增加销量
- [ ] 库存不足时正确提示

#### 文件上传
- [ ] 支持图片上传
- [ ] 支持视频上传
- [ ] 文件大小限制生效
- [ ] 文件类型限制生效

## 常见问题

### Q1: 端口被占用怎么办？
A: 修改 `server/server.js` 中的 `PORT` 变量，默认是 3001。

### Q2: 如何修改商品数据？
A: 编辑 `server/server.js` 中的 `mockProduct` 对象，包含商品信息、规格、库存等所有数据。

### Q3: 如何重置库存数据？
A: 重启后端服务即可重置为初始种子数据。

### Q4: 测试失败如何排查？
A: 运行 `npm run test:all -- --reporter=verbose` 查看详细错误信息。

### Q5: 如何部署到生产环境？
A: 
1. 执行 `npm run build` 构建前端
2. 将 `dist/` 目录部署到静态文件服务器（如 Nginx）
3. 后端使用 `pm2` 或 `systemd` 守护进程运行
4. 配置反向代理将 `/api` 请求转发到后端服务

## 部署检查清单

- [ ] Node.js 版本 >= 16.0.0
- [ ] 前端依赖安装完成
- [ ] 后端依赖安装完成
- [ ] 后端服务正常启动（端口3001）
- [ ] 前端服务正常启动（端口5173）
- [ ] 所有测试用例 100% 通过
- [ ] 商品图片可正常加载
- [ ] API接口返回正常
- [ ] 规格选择和价格计算正确
- [ ] 下单和支付流程正常
