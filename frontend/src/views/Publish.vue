<template>
  <div class="publish-container">
    <nut-navbar :title="isEditMode ? '编辑商品' : '发布商品'" left-show @click-back="handleBack">
      <template #title>
        <span class="navbar-brand">闲余</span>
      </template>
    </nut-navbar>

    <nut-form ref="formRef" :model-value="formData" :rules="rules">
      <nut-form-item prop="title" label="商品标题">
        <nut-input
          v-model="formData.title"
          placeholder="请输入商品标题"
          type="text"
          clearable
        />
      </nut-form-item>

      <nut-form-item prop="description" label="商品描述">
        <nut-textarea
          v-model="formData.description"
          placeholder="请输入商品描述"
          :rows="5"
          :limit="500"
        />
      </nut-form-item>

      <nut-form-item prop="price" label="价格">
        <nut-input
          v-model.number="formData.price"
          placeholder="请输入价格"
          type="number"
          clearable
        />
      </nut-form-item>

      <nut-form-item prop="original_price" label="原价（可选）">
        <nut-input
          v-model.number="formData.original_price"
          placeholder="请输入原价"
          type="number"
          clearable
        />
      </nut-form-item>

      <nut-form-item prop="category" label="分类">
        <nut-input
          v-model="formData.category"
          placeholder="请输入分类，如：电子产品"
          type="text"
          clearable
        />
      </nut-form-item>

      <nut-form-item prop="location" label="所在地">
        <nut-input
          v-model="formData.location"
          placeholder="请输入所在地"
          type="text"
          clearable
        />
      </nut-form-item>

      <nut-form-item prop="stock" label="库存数量">
        <nut-input-number
          v-model.number="formData.stock"
          placeholder="请输入"
          clearable
        />
      </nut-form-item>

      <nut-form-item prop="images" label="商品图片（可选，最多10张）">
        <nut-uploader
          v-model:file-list="imageList"
          url="/api/upload/images"
          :max-count="10"
          :max-size="5 * 1024 * 1024"
          accept="image/*"
          name="images"
          multiple
          :xhr-state="201"
          :auto-upload="true"
          @success="handleImageSuccess"
          @change="handleImageChange"
          @delete="handleImageDelete"
        >
          <nut-button type="primary" size="small">选择图片</nut-button>
        </nut-uploader>
        <div v-if="imageList.length > 0" class="image-preview">
          <div
            v-for="(item, index) in imageList"
            :key="index"
            class="preview-item"
          >
            <img :src="item.url || item.path" :alt="item.name" />
            <nut-icon name="close" @click="removeImage(index)" />
          </div>
        </div>
      </nut-form-item>

      <nut-form-item>
        <nut-button
          type="primary"
          block
          :loading="loading"
          @click="handleSubmit"
        >
          {{ isEditMode ? '保存修改' : '发布商品' }}
        </nut-button>
      </nut-form-item>
    </nut-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createProduct, getProductById, updateProduct } from '@/api/products'
import { uploadImages } from '@/api/upload'
import { getUser } from '@/utils/auth'
import { showToast } from '@nutui/nutui'
import type { FormInstance } from '@nutui/nutui'
import type { Product, ProductStatus } from '@/types'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()

const loading = ref(false)
const uploading = ref(false)
const imageList = ref<any[]>([])
const uploadedImages = ref<any[]>([])
const isEditMode = ref(false)
const productId = ref<number | null>(null)

const formData = reactive({
  title: '',
  description: '',
  price: 0,
  original_price: undefined as number | undefined,
  category: '',
  location: '',
  stock: 1,
  status: 'on_sale' as ProductStatus
})

const rules = {
  title: [
    { required: true, message: '请输入商品标题' }
  ],
  price: [
    { required: true, message: '请输入价格' },
    { type: 'number', min: 0.01, message: '价格必须大于0' }
  ],
  stock: [
    { required: true, message: '请输入库存数量' },
    { type: 'number', min: 1, message: '库存数量必须大于0' }
  ]
}

// 监听 imageList 的变化，自动上传新文件
watch(imageList.value, async (newList) => {
  // 如果正在上传中，跳过处理（避免循环触发）
  if (uploading.value) return
  
  // 过滤出需要上传的新文件（状态为 ready 且有 file 对象）
  const newFiles = newList.filter(file => {
    return file.status === 'ready' && file.url
  })
  
  if (newFiles.length > 0) {
    uploading.value = true
    try {
      const fileObjects = newFiles.map(file => file.file).filter(Boolean) as File[]
      
      if (fileObjects.length > 0) {
        const res = await uploadImages(fileObjects)
        
        // 更新文件列表，将上传成功的文件URL设置到对应的文件对象
        const updatedFiles = newList.map((file) => {
          if (file.status === 'ready' && file.file) {
            const fileIndex = newFiles.findIndex(f => f.file === file.file)
            if (fileIndex !== -1 && res.urls && res.urls[fileIndex]) {
              return {
                ...file,
                url: res.urls[fileIndex],
                path: res.urls[fileIndex],
                status: 'success'
              }
            }
          }
          return file
        })
        
        // 更新列表（由于状态从 ready 变为 success，不会再次触发上传）
        imageList.value = updatedFiles
        showToast.success('图片上传成功')
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      showToast.fail('图片上传失败，请重试')
      // 移除上传失败的文件
      imageList.value = newList.filter(file => file.status !== 'ready' || !file.file)
    } finally {
      uploading.value = false
    }
  }
}, { deep: true })

const handleImageSuccess = (res: any) => {
  console.log('图片上传成功:', res)
  const resUrls = JSON.parse(res.responseText).urls;
  uploadedImages.value = resUrls;
}
const handleImageChange = (files: any) => {
  // nut-uploader 的 change 事件可能传递文件列表
  // 但由于使用了 v-model，这里主要用于同步数据
  console.log('图片上传变化:', files)
  // if (Array.isArray(files)) {
  //   imageList.value = files
  // }
}

const handleImageDelete = (_file: any, fileList: any[]) => {
  imageList.value = fileList || []
}

const removeImage = (index: number) => {
  imageList.value.splice(index, 1)
}

const loadProductData = async (id: number) => {
  try {
    loading.value = true
    const product = (await getProductById(id)) as unknown as Product
    
    formData.title = product.title
    formData.description = product.description || ''
    formData.price = Number(product.price)
    formData.original_price = Number(product.original_price)
    formData.category = product.category || ''
    formData.location = product.location || ''
    formData.stock = product.stock || 1
    formData.status = product.status
    
    // 加载图片
    if (product.images && product.images.length > 0) {
      imageList.value = product.images.map((url, index) => ({
        uid: `existing-${index}`,
        name: `image-${index}`,
        url: url,
        path: url,
        status: 'success'
      }))
      // uploadedImages.value = product.images
    }
  } catch (error) {
    console.error('加载商品信息失败:', error)
    showToast.fail('加载商品信息失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  const user = getUser()
  if (!user) {
    showToast.fail('请先登录')
    router.push('/login')
    return
  }

  // 如果有未上传完成的图片，先上传
  const pendingFiles = imageList.value.filter(file => file.status === 'ready')
  if (pendingFiles.length > 0) {
    uploading.value = true
    try {
      const fileObjects = pendingFiles.map(file => file.file).filter(Boolean) as File[]
      if (fileObjects.length > 0) {
        const res = await uploadImages(fileObjects)
        // 更新待上传文件的URL
        pendingFiles.forEach((file, index) => {
          if (res.urls && res.urls[index]) {
            file.url = res.urls[index]
            file.path = res.urls[index]
            file.status = 'success'
          }
        })
        // 更新imageList以确保URL被保存
        imageList.value = [...imageList.value]
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      showToast.fail('图片上传失败，请重试')
      return
    } finally {
      uploading.value = false
    }
  }

  loading.value = true
  try {
    // 提取所有已上传成功的图片URL，确保从url或path字段获取
    const images = imageList.value
      .filter(file => {
        // 只选择上传成功的文件，并且有有效的URL
        return file.status === 'success' && (file.url || file.path)
      })
      .map(file => {
        // 优先使用url，如果没有则使用path
        return file.url || file.path
      })
      .filter(Boolean) as string[]

    // // 更新 uploadedImages
    // if (images.length > 0) {
    //   uploadedImages.value = images
    // }
    // debugger
    if (isEditMode.value && productId.value) {
      // 编辑模式
      await updateProduct(productId.value, {
        title: formData.title,
        description: formData.description || undefined,
        price: Number(formData.price),
        original_price: Number(formData.original_price),
        category: formData.category || undefined,
        location: formData.location || undefined,
        stock: formData.stock,
        images: uploadedImages.value.length > 0 ? uploadedImages.value : undefined,
        status: formData.status
      })
      showToast.success('更新成功')
      router.push('/my-products')
    } else {
      // 创建模式
      await createProduct({
        user_id: user.id,
        title: formData.title,
        description: formData.description || undefined,
        price: Number(formData.price),
        original_price: Number(formData.original_price),
        category: formData.category || undefined,
        location: formData.location || undefined,
        stock: formData.stock,
        images: uploadedImages.value.length > 0 ? uploadedImages.value : undefined,
        status: formData.status
      })
      showToast.success('发布成功')
      router.push('/products')
    }
  } catch (error) {
    console.error(isEditMode.value ? '更新失败' : '发布失败:', error)
    showToast.fail(isEditMode.value ? '更新失败，请重试' : '发布失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.back()
}

// 初始化：检查是否是编辑模式
onMounted(() => {
  const id = route.query.id
  const edit = route.query.edit
  
  if (id && edit === 'true') {
    isEditMode.value = true
    productId.value = Number(id)
    loadProductData(Number(id))
  }
})
</script>

<style scoped>
.publish-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;
}

.navbar-brand {
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 1px;
}

.nut-form {
  background: white;
  margin-top: 10px;
  padding: 20px;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-item .nut-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  padding: 4px;
  cursor: pointer;
  font-size: 14px;
}
</style>

