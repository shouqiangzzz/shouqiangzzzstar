import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  CreditCard, 
  CheckCircle2, 
  Truck,
  ArrowRight
} from 'lucide-react';
import { CartItem, OrderItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckoutSuccess: (order: OrderItem) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState<OrderItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 199 || subtotal === 0 ? 0 : 10;
  const totalAmount = subtotal + shippingFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName || !receiverPhone || !receiverAddress) return;

    setIsProcessing(true);
    setTimeout(() => {
      const order: OrderItem = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        items: [...cart],
        totalAmount,
        receiverName,
        receiverAddress,
        receiverPhone,
        status: 'paid'
      };

      setPaymentSuccess(order);
      setIsProcessing(false);
      onCheckoutSuccess(order);
      onClearCart();
    }, 900);
  };

  const handleReset = () => {
    setPaymentSuccess(null);
    setIsCheckingOut(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-stone-900 text-base">
              我的购物车 ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {paymentSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">支付成功！订单已生成</h3>
              <p className="text-xs text-stone-500">
                订单编号: <span className="font-mono font-bold text-stone-800">{paymentSuccess.id}</span>
              </p>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">收货人:</span>
                  <span className="font-medium text-stone-800">{paymentSuccess.receiverName} ({paymentSuccess.receiverPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">配送地址:</span>
                  <span className="font-medium text-stone-800 truncate max-w-[200px]">{paymentSuccess.receiverAddress}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-200">
                  <span className="text-stone-500">实付总额:</span>
                  <span className="font-bold text-rose-600">¥{paymentSuccess.totalAmount.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                💡 电子书与自驾路书已同步开通实时在线查阅权限；实体商品将由博主通过顺丰速递寄出。
              </p>

              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
              >
                完成并返回
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-stone-500 text-sm">购物车空空如也</p>
              <p className="text-xs text-stone-400">去好物集市看看博主自用的电子产品、书籍、零食或自驾路书吧～</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg mt-2"
              >
                去集市逛逛
              </button>
            </div>
          ) : isCheckingOut ? (
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h3 className="font-bold text-sm text-stone-900">填写收货与联系信息</h3>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-xs text-amber-600 hover:underline"
                >
                  返回查看商品
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  收货人姓名 / 称呼 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：张先生 / Alice"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  联系手机或微信 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="例如：13800000000"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg outline-hidden focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  收货详细地址 (或电子邮箱用于接收路书) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="例如：浙江省杭州市西湖区文三路88号 / 或填写邮箱用于接收攻略PDF"
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg outline-hidden focus:border-amber-500 focus:bg-white resize-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>商品小计:</span>
                  <span>¥{subtotal.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>运费 / 交付:</span>
                  <span>{shippingFee === 0 ? '包邮' : `¥${shippingFee}`}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span>应付总计:</span>
                  <span className="text-rose-600">¥{totalAmount.toFixed(1)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isProcessing ? '处理支付中...' : `立即模拟支付 (¥${totalAmount.toFixed(1)})`}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {item.product.tag}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-rose-600">
                        ¥{item.product.price}
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-stone-300 rounded-md overflow-hidden bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs hover:bg-stone-100"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-medium">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs hover:bg-stone-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-1 text-stone-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary (if not empty and not completed) */}
        {!paymentSuccess && cart.length > 0 && !isCheckingOut && (
          <div className="p-6 border-t border-stone-200 bg-stone-50/80 space-y-3">
            <div className="space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>商品总额:</span>
                <span className="font-semibold text-stone-900">¥{subtotal.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>运费:</span>
                <span className="text-stone-900">{shippingFee === 0 ? '满199包邮 (免费)' : `¥${shippingFee}`}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-200 text-sm font-bold text-stone-900">
                <span>合计:</span>
                <span className="text-rose-600">¥{totalAmount.toFixed(1)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>去结算 ({cart.reduce((a, b) => a + b.quantity, 0)}件商品)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
