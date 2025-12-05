import axios from 'axios'
import { showToast } from '@nutui/nutui'

// 上传图片
export const uploadImages = async (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('images', file)
  })
  
  const token = localStorage.getItem('token')
  const config: any = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  try {
    const response = await axios.post<{ urls: string[]; message: string }>(
      '/api/upload/images',
      formData,
      config
    )
    return response.data
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response
      showToast.fail(data?.message || '上传失败')
    } else {
      showToast.fail('网络错误，请检查网络连接')
    }
    throw error
  }
}

