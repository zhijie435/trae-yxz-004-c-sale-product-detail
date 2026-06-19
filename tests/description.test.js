import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { stripHtmlTags } from '../src/api/product'
import ProductDescription from '../src/components/ProductDescription.vue'

vi.mock('../src/api/product', async () => {
  const actual = await vi.importActual('../src/api/product')
  return {
    ...actual,
    getProductDescription: vi.fn()
  }
})

import { getProductDescription } from '../src/api/product'

describe('详情富文本 - stripHtmlTags 工具函数', () => {
  it('空值处理', () => {
    expect(stripHtmlTags('')).toBe('')
    expect(stripHtmlTags(null)).toBe('')
    expect(stripHtmlTags(undefined)).toBe('')
  })

  it('剥离简单 HTML 标签', () => {
    expect(stripHtmlTags('<h1>标题</h1>')).toBe('标题')
    expect(stripHtmlTags('<p>段落内容</p>')).toBe('段落内容')
    expect(stripHtmlTags('<div>嵌套<div>深层</div></div>')).toBe('嵌套深层')
  })

  it('剥离嵌套标签', () => {
    const html = '<h2>商品详情</h2><p>这是<strong>加粗</strong>内容</p>'
    expect(stripHtmlTags(html)).toBe('商品详情这是加粗内容')
  })

  it('剥离表格标签', () => {
    const html = '<table><tr><td>单元格1</td><td>单元格2</td></tr></table>'
    expect(stripHtmlTags(html)).toBe('单元格1单元格2')
  })

  it('处理多余空白合并', () => {
    expect(stripHtmlTags('  <p>  hello   world  </p>  ')).toBe('hello world')
  })

  it('处理列表标签', () => {
    const html = '<ul><li>项目1</li><li>项目2</li></ul>'
    expect(stripHtmlTags(html)).toBe('项目1项目2')
  })

  it('处理自闭合标签', () => {
    expect(stripHtmlTags('<p>内容<br/>更多</p>')).toBe('内容更多')
    expect(stripHtmlTags('<img src="x"/>文字')).toBe('文字')
  })
})

const SAMPLE_DESCRIPTION = `<h2>商品详情</h2>
<p>这款<strong>主动降噪无线蓝牙耳机</strong>采用最新技术。</p>
<h3>核心卖点</h3>
<ul>
  <li>🎵 <strong>40dB 深度主动降噪</strong></li>
  <li>🔋 <strong>40小时超长续航</strong></li>
</ul>`

describe('详情富文本 - ProductDescription 组件渲染', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('使用 initialHtml 渲染富文本内容', () => {
    const wrapper = mount(ProductDescription, {
      props: {
        productId: 1001,
        initialHtml: SAMPLE_DESCRIPTION
      }
    })
    expect(wrapper.find('.description-content').exists()).toBe(true)
    expect(wrapper.find('.description-content').html()).toContain('<h2>商品详情</h2>')
    expect(wrapper.find('.description-content').html()).toContain('<strong>主动降噪无线蓝牙耳机</strong>')
  })

  it('通过 v-html 正确渲染 HTML 标签', () => {
    const wrapper = mount(ProductDescription, {
      props: {
        productId: 1001,
        initialHtml: '<p>Hello <strong>Bold</strong></p>'
      }
    })
    const content = wrapper.find('.description-content')
    expect(content.find('p').exists()).toBe(true)
    expect(content.find('strong').text()).toBe('Bold')
  })

  it('expose plainText 计算属性', () => {
    const wrapper = mount(ProductDescription, {
      props: {
        productId: 1001,
        initialHtml: '<h1>标题</h1><p>内容</p>'
      }
    })
    expect(wrapper.vm.plainText).toBe('标题内容')
  })

  it('expose descriptionHtml 原始HTML', () => {
    const html = '<p>测试内容</p>'
    const wrapper = mount(ProductDescription, {
      props: {
        productId: 1001,
        initialHtml: html
      }
    })
    expect(wrapper.vm.descriptionHtml).toBe(html)
  })

  it('当 initialHtml 为空时 onMounted 调用 fetchDescription', async () => {
    getProductDescription.mockResolvedValue({
      productId: 1001,
      description: '<p>远程获取的内容</p>',
      plainText: '远程获取的内容'
    })
    const wrapper = mount(ProductDescription, {
      props: { productId: 1001 }
    })
    await new Promise(r => setTimeout(r, 50))
    expect(getProductDescription).toHaveBeenCalledWith(1001)
    expect(wrapper.find('.description-content').html()).toContain('远程获取的内容')
  })

  it('已有 initialHtml 时不触发远程请求', async () => {
    getProductDescription.mockClear()
    mount(ProductDescription, {
      props: {
        productId: 1001,
        initialHtml: '<p>已有内容</p>'
      }
    })
    await new Promise(r => setTimeout(r, 50))
    expect(getProductDescription).not.toHaveBeenCalled()
  })

  it('渲染"商品详情"标题存在', () => {
    const wrapper = mount(ProductDescription, {
      props: {
        productId: 1001,
        initialHtml: '<p>内容</p>'
      }
    })
    expect(wrapper.find('.header-title').text()).toBe('商品详情')
  })
})

describe('详情富文本 - ProductSpec 组件 UI 结构', () => {
  it('渲染包含 section 和 content 容器', () => {
    const wrapper = mount(ProductDescription, {
      props: {
        productId: 1001,
        initialHtml: '<p>x</p>'
      }
    })
    expect(wrapper.find('.product-description').exists()).toBe(true)
    expect(wrapper.find('.description-header').exists()).toBe(true)
    expect(wrapper.find('.description-content').exists()).toBe(true)
  })
})

describe('详情富文本 - 分区导航 Tab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('渲染 4 个分区导航 Tab', () => {
    const wrapper = mount(ProductDescription, {
      props: { productId: 1001, initialHtml: '<p>x</p>' }
    })
    const tabs = wrapper.findAll('.detail-tab')
    expect(tabs).toHaveLength(4)
    expect(tabs[0].text()).toBe('产品参数')
    expect(tabs[1].text()).toBe('功能介绍')
    expect(tabs[2].text()).toBe('场景案例')
    expect(tabs[3].text()).toBe('售后保障')
  })

  it('expose detailSections 配置包含 4 个分区', () => {
    const wrapper = mount(ProductDescription, {
      props: { productId: 1001, initialHtml: '<p>x</p>' }
    })
    expect(wrapper.vm.detailSections).toHaveLength(4)
    expect(wrapper.vm.detailSections[0]).toEqual({ id: 'section-params', label: '产品参数' })
  })

  it('默认激活第一个分区', () => {
    const wrapper = mount(ProductDescription, {
      props: { productId: 1001, initialHtml: '<p>x</p>' }
    })
    expect(wrapper.vm.activeSection).toBe('section-params')
    expect(wrapper.findAll('.detail-tab')[0].classes()).toContain('is-active')
  })

  it('点击 Tab 切换 activeSection', async () => {
    const wrapper = mount(ProductDescription, {
      props: { productId: 1001, initialHtml: '<p>内容</p>' }
    })
    await wrapper.findAll('.detail-tab')[2].trigger('click')
    expect(wrapper.vm.activeSection).toBe('section-cases')
    expect(wrapper.findAll('.detail-tab')[2].classes()).toContain('is-active')
    expect(wrapper.findAll('.detail-tab')[0].classes()).not.toContain('is-active')
  })

  it('scrollToSection 缺失目标元素时仅更新激活态不抛错', () => {
    const wrapper = mount(ProductDescription, {
      props: { productId: 1001, initialHtml: '<p>无分区内容</p>' }
    })
    expect(() => wrapper.vm.scrollToSection('section-service')).not.toThrow()
    expect(wrapper.vm.activeSection).toBe('section-service')
  })
})
