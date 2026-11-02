import React, { createContext, useContext, useState, useEffect } from 'react';
import { deliveryApi, couponsApi } from '../services/api';
import { useShop } from './ShopContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { deliverySettings } = useShop();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('hop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' or 'pickup'
  const [deliverySlot, setDeliverySlot] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('380057');
  const [deliveryCalculation, setDeliveryCalculation] = useState({
    charge: 0,
    is_free: false,
    serviceable: true,
    message: ''
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('hop_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate items subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (Number(item.price) * Number(item.quantity));
  }, 0);

  // Recalculate delivery fee whenever subtotal, deliveryType, or pincode changes
  useEffect(() => {
    let isCancelled = false;

    async function checkDelivery() {
      if (deliveryType === 'pickup') {
        setDeliveryCalculation({
          charge: 0,
          is_free: true,
          serviceable: true,
          message: 'Store Pickup selected. Free of charge!'
        });
        return;
      }

      if (!deliveryPincode || deliveryPincode.length < 6) {
        setDeliveryCalculation({
          charge: parseFloat(deliverySettings.fixed_delivery_charge || 40),
          is_free: subtotal >= parseFloat(deliverySettings.free_delivery_threshold || 500),
          serviceable: true,
          message: 'Enter 6-digit pincode to calculate accurate charges.'
        });
        return;
      }

      try {
        const res = await deliveryApi.calculateDelivery({
          subtotal,
          delivery_type: 'delivery',
          pincode: deliveryPincode
        });

        if (!isCancelled && res.data) {
          setDeliveryCalculation({
            charge: res.data.delivery_charge || 0,
            is_free: !!res.data.is_free,
            serviceable: res.data.serviceable !== false,
            message: res.data.message || ''
          });
        }
      } catch (err) {
        if (!isCancelled) {
          const errMsg = err.response?.data?.message || 'Error checking delivery area';
          setDeliveryCalculation({
            charge: parseFloat(deliverySettings.fixed_delivery_charge || 40),
            is_free: subtotal >= parseFloat(deliverySettings.free_delivery_threshold || 500),
            serviceable: false,
            message: errMsg
          });
        }
      }
    }

    if (cartItems.length > 0) {
      checkDelivery();
    } else {
      setDeliveryCalculation({
        charge: 0,
        is_free: false,
        serviceable: true,
        message: ''
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [subtotal, deliveryType, deliveryPincode, deliverySettings]);

  // Recalculate coupon if subtotal drops
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.min_order_amount) {
      setCouponError(`Coupon removed: order value fell below minimum ₹${appliedCoupon.min_order_amount}`);
      setAppliedCoupon(null);
    }
  }, [subtotal, appliedCoupon]);

  // Add product to cart with chosen variant
  const addToCart = (product, variant, qty = 1) => {
    setCartItems(prev => {
      const variantId = variant?.id || product.variants?.[0]?.id || `p-${product.id}`;
      const existingIndex = prev.findIndex(item => item.variant_id === variantId);

      const itemPrice = variant ? parseFloat(variant.price) : parseFloat(product.base_price || 0);
      const weightLabel = variant?.weight_label || '500 g';
      const maxStock = variant?.stock_quantity !== undefined ? variant.stock_quantity : 99;

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + qty, maxStock);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            variant_id: variantId,
            product_id: product.id,
            name: product.name,
            weight_label: weightLabel,
            price: itemPrice,
            image: product.image,
            category_name: product.category_name,
            max_stock: maxStock,
            quantity: Math.min(qty, maxStock)
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (variantId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.variant_id === variantId) {
          const qty = item.max_stock ? Math.min(newQty, item.max_stock) : newQty;
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (variantId) => {
    setCartItems(prev => prev.filter(item => item.variant_id !== variantId));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  // Coupon verification
  const applyCoupon = async (code) => {
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await couponsApi.verify({ code, subtotal });
      if (res.data?.success) {
        setAppliedCoupon({
          code: res.data.code,
          discount_amount: res.data.discount_amount,
          description: res.data.description
        });
        setCouponSuccess(res.data.message);
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      setCouponError(msg);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount) : 0;
  const deliveryCharge = deliveryCalculation.charge || 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

  // Free delivery threshold progress
  const freeThreshold = parseFloat(deliverySettings.free_delivery_threshold || 500);
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const amountNeededForFree = Math.max(0, freeThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
        subtotal,
        discountAmount,
        deliveryCharge,
        grandTotal,
        appliedCoupon,
        couponError,
        couponSuccess,
        applyCoupon,
        removeCoupon,
        deliveryType,
        setDeliveryType,
        deliverySlot,
        setDeliverySlot,
        deliveryPincode,
        setDeliveryPincode,
        deliveryCalculation,
        freeThreshold,
        progressPercent,
        amountNeededForFree,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
