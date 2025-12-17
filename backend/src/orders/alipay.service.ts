import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AlipaySdk from 'alipay-sdk';

@Injectable()
export class AlipayService {
  private alipaySdk: AlipaySdk;

  constructor(private configService: ConfigService) {
    // 初始化支付宝SDK
    this.alipaySdk = new AlipaySdk({
      appId: this.configService.get<string>('ALIPAY_APP_ID'),
      gateway: this.configService.get<string>('ALIPAY_GATEWAY'),
      privateKey: this.configService.get<string>('ALIPAY_PRIVATE_KEY'),
      alipayPublicKey: this.configService.get<string>('ALIPAY_PUBLIC_KEY'),
      signType: this.configService.get<string>('ALIPAY_SIGN_TYPE') || 'RSA2',
    });
  }

  // 创建支付宝支付订单
  async createPayment(order: {
    order_number: string;
    total_price: number;
    product_title: string;
  }) {
    const notifyUrl = this.configService.get<string>('ALIPAY_NOTIFY_URL');
    const returnUrl = this.configService.get<string>('ALIPAY_RETURN_URL');

    const params = {
      method: 'alipay.trade.page.pay',
      bizContent: {
        outTradeNo: order.order_number,
        productCode: 'FAST_INSTANT_TRADE_PAY',
        totalAmount: order.total_price.toFixed(2),
        subject: order.product_title,
        body: order.product_title,
        timeoutExpress: '15m', // 15分钟超时
      },
      notifyUrl,
      returnUrl,
    };

    try {
      // 生成支付表单
      const result = await this.alipaySdk.exec(params);
      return result;
    } catch (error) {
      console.error('支付宝支付订单创建失败:', error);
      throw error;
    }
  }

  // 验证支付宝回调通知
  async verifyNotify(params: any) {
    try {
      const result = this.alipaySdk.checkNotifySign(params);
      return result;
    } catch (error) {
      console.error('支付宝回调验证失败:', error);
      return false;
    }
  }

  // 验证支付宝同步返回
  async verifyReturn(params: any) {
    try {
      const result = this.alipaySdk.checkNotifySign(params);
      return result;
    } catch (error) {
      console.error('支付宝同步返回验证失败:', error);
      return false;
    }
  }
}
