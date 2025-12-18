import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlipaySdk, AlipaySdkSignType } from 'alipay-sdk';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

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
      signType: this.configService.get<AlipaySdkSignType>('ALIPAY_SIGN_TYPE') || 'RSA2',
      timeout: 30000, // 设置超时时间为30秒
    });
  }

  // 创建支付宝支付订单
  async createPayment(order: {
    order_number: string;
    total_price: number | string;
    product_title: string;
  }) {
    const notifyUrl = this.configService.get<string>('ALIPAY_NOTIFY_URL');
    const returnUrl = this.configService.get<string>('ALIPAY_RETURN_URL');

    // 验证必要的配置
    if (!notifyUrl || !returnUrl) {
      throw new Error('支付宝回调地址未配置，请检查环境变量 ALIPAY_NOTIFY_URL 和 ALIPAY_RETURN_URL');
    }

    // 确保 total_price 是数字类型（MySQL decimal 可能返回字符串）
    const totalPrice = typeof order.total_price === 'string' 
      ? parseFloat(order.total_price) 
      : Number(order.total_price);
    
    if (isNaN(totalPrice) || totalPrice <= 0) {
      throw new Error(`订单金额无效: ${order.total_price}`);
    }

    const params = {
      method: 'alipay.trade.page.pay',
      bizContent: {
        out_trade_no: order.order_number,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        total_amount: totalPrice.toFixed(2),
        subject: order.product_title,
        body: order.product_title,
        timeout_express: '15m', // 15分钟超时
      },
      notifyUrl,
      returnUrl,
    };

    try {
      // 确保 bizContent 是纯对象（plain object）
      // 创建新的对象，确保没有原型链问题
      const bizContent = {
        out_trade_no: params.bizContent.out_trade_no,
        product_code: params.bizContent.product_code,
        total_amount: params.bizContent.total_amount,
        subject: params.bizContent.subject,
        body: params.bizContent.body,
        timeout_express: params.bizContent.timeout_express,
      };
      
      // 使用 exec 方法生成支付表单HTML
      // alipay-sdk 的 exec 方法需要 bizContent 是普通对象，SDK会自动转换为JSON字符串
      const execParams = {
        bizContent: bizContent, // 直接传递对象，不要转换为JSON字符串
        notifyUrl: params.notifyUrl,
        returnUrl: params.returnUrl,
      };
      
      console.log('支付宝支付参数:', {
        bizContent: bizContent,
        notifyUrl: execParams.notifyUrl,
        returnUrl: execParams.returnUrl,
      });
      
      // 验证参数类型
      if (typeof execParams.bizContent !== 'object' || execParams.bizContent === null || Array.isArray(execParams.bizContent)) {
        throw new Error('bizContent 必须是普通对象');
      }
      
      // 验证配置
      const appId = this.configService.get<string>('ALIPAY_APP_ID');
      const gateway = this.configService.get<string>('ALIPAY_GATEWAY');
      if (!appId || !gateway) {
        throw new Error('支付宝配置不完整，请检查 ALIPAY_APP_ID 和 ALIPAY_GATEWAY');
      }
      
      console.log('开始生成支付宝支付表单，网关:', gateway);
      
      // 对于页面支付接口 alipay.trade.page.pay，应该手动生成表单
      // 而不是调用 exec 方法（exec 会实际请求支付宝接口，导致返回HTML错误页）
      const formHtml = this.generatePaymentForm({
        bizContent,
        notifyUrl: execParams.notifyUrl,
        returnUrl: execParams.returnUrl,
      });
      
      console.log('支付表单生成成功，长度:', formHtml.length);
      return formHtml;
    } catch (error) {
      console.error('支付宝支付订单创建失败:', error);
      console.error('错误详情:', error instanceof Error ? error.message : error);
    
      const anyError = error as any;
      // 这两行是关键：打印支付宝返回的原始内容（通常是 HTML 错误页）
      console.error('支付宝原始响应 rawResponse:', anyError?.rawResponse || anyError?.raw);
      console.error('支付宝原始响应 body:', anyError?.body);
    
      console.error('订单信息:', order);
      throw new Error(`支付宝支付订单创建失败: ${
        error instanceof Error ? error.message : '未知错误'
      }`);
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

  // 手动生成支付表单（页面支付接口应该使用这种方式）
  // 使用SDK内部方法生成签名，然后手动构建HTML表单
  private generatePaymentForm(params: { 
    bizContent: any; 
    notifyUrl: string; 
    returnUrl: string;
  }): string {
    const gateway = this.configService.get<string>('ALIPAY_GATEWAY') || 'https://openapi.alipay.com/gateway.do';
    const appId = this.configService.get<string>('ALIPAY_APP_ID');
    
    if (!appId) {
      throw new Error('ALIPAY_APP_ID 未配置');
    }

    // 构建请求参数（按照支付宝文档格式）
    const requestParams: Record<string, string> = {
      app_id: appId,
      method: 'alipay.trade.page.pay',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/T/, ' ').substring(0, 19),
      version: '1.0',
      biz_content: JSON.stringify(params.bizContent),
      notify_url: params.notifyUrl,
      return_url: params.returnUrl,
    };

    // 移除空值
    Object.keys(requestParams).forEach(key => {
      if (requestParams[key] === null || requestParams[key] === undefined || requestParams[key] === '') {
        delete requestParams[key];
      }
    });

    // 生成签名
    // 使用手动签名方式，避免调用支付宝接口
    try {
      // 先尝试使用SDK的pageExec方法（如果存在）
      const sdkAny = this.alipaySdk as any;
      if (typeof sdkAny.pageExec === 'function') {
        const result = sdkAny.pageExec('alipay.trade.page.pay', {
          bizContent: params.bizContent,
          notifyUrl: params.notifyUrl,
          returnUrl: params.returnUrl,
        });
        return String(result);
      }
      
      // 如果pageExec不存在，手动生成签名
      const privateKey = this.configService.get<string>('ALIPAY_PRIVATE_KEY');
      if (!privateKey) {
        throw new Error('ALIPAY_PRIVATE_KEY 未配置');
      }
      
      // 1. 参数排序并拼接
      const sortedKeys = Object.keys(requestParams).sort();
      const signContent = sortedKeys
        .filter(key => requestParams[key] !== '' && requestParams[key] !== null && requestParams[key] !== undefined)
        .map(key => `${key}=${requestParams[key]}`)
        .join('&');
      
      // 2. 使用RSA2签名
      // 注意：私钥需要包含头尾标记，或者SDK已经处理过了
      let keyContent = privateKey;
      if (!keyContent.includes('BEGIN')) {
        // 如果私钥没有头尾标记，需要添加
        keyContent = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
      } else {
        // 如果已经有标记，但格式不对，需要处理换行
        keyContent = privateKey.replace(/\\n/g, '\n');
      }
      
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(signContent, 'utf8');
      const signature = sign.sign(keyContent, 'base64');
      
      requestParams.sign = signature;
    } catch (signError) {
      console.error('生成签名失败:', signError);
      throw new Error(`无法生成支付表单签名: ${signError instanceof Error ? signError.message : '未知错误'}`);
    }

    // 生成HTML表单
    let formHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>跳转到支付宝</title></head><body>';
    formHtml += '<form id="alipaysubmit" name="alipaysubmit" action="' + gateway + '" method="POST">';
    Object.keys(requestParams).forEach(key => {
      const value = String(requestParams[key]).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      formHtml += '<input type="hidden" name="' + key + '" value="' + value + '"/>';
    });
    formHtml += '</form>';
    formHtml += '<script>document.forms["alipaysubmit"].submit();</script>';
    formHtml += '</body></html>';

    return formHtml;
  }

}
