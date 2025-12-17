const axios = require('axios');

// 测试后端订单API是否返回商品信息
async function testOrderAPI() {
  try {
    // 假设用户ID为1，根据实际情况修改
    const userId = 1;
    const response = await axios.get(`http://localhost:3000/orders/user/${userId}`);
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    
    // 检查返回的数据结构
    if (response.data && Array.isArray(response.data)) {
      console.log('\nOrders found:', response.data.length);
      
      if (response.data.length > 0) {
        const firstOrder = response.data[0];
        console.log('\nFirst order:');
        console.log('Order Number:', firstOrder.order_number);
        console.log('Has product:', !!firstOrder.product);
        
        if (firstOrder.product) {
          console.log('Product Name:', firstOrder.product.title);
          console.log('Product Images:', firstOrder.product.images);
        } else {
          console.log('ERROR: No product information in order!');
        }
      }
    }
  } catch (error) {
    console.error('Error calling API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testOrderAPI();