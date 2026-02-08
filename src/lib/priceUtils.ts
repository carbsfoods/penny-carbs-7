// Utility functions for price calculations with platform margin

export interface ItemPricing {
  basePrice: number;
  platformMarginType: 'percent' | 'fixed';
  platformMarginValue: number;
  discountPercent?: number;
  discountAmount?: number;
}

/**
 * Calculate platform margin amount
 */
export function calculatePlatformMargin(basePrice: number, marginType: 'percent' | 'fixed', marginValue: number): number {
  if (marginType === 'percent') {
    return basePrice * (marginValue / 100);
  }
  return marginValue;
}

/**
 * Calculate the total price customer pays (base price + platform margin)
 */
export function calculateCustomerPrice(item: ItemPricing): number {
  const margin = calculatePlatformMargin(item.basePrice, item.platformMarginType, item.platformMarginValue);
  let totalPrice = item.basePrice + margin;
  
  // Apply discounts on total price
  if (item.discountPercent && item.discountPercent > 0) {
    totalPrice = totalPrice * (1 - item.discountPercent / 100);
  } else if (item.discountAmount && item.discountAmount > 0) {
    totalPrice = totalPrice - item.discountAmount;
  }
  
  return Math.max(0, totalPrice);
}

/**
 * Calculate the cook's share (base price only, no platform margin)
 */
export function calculateCookShare(item: ItemPricing): number {
  let cookPrice = item.basePrice;
  
  // Apply proportional discounts to cook share
  if (item.discountPercent && item.discountPercent > 0) {
    cookPrice = cookPrice * (1 - item.discountPercent / 100);
  } else if (item.discountAmount && item.discountAmount > 0) {
    const margin = calculatePlatformMargin(item.basePrice, item.platformMarginType, item.platformMarginValue);
    const totalBeforeDiscount = item.basePrice + margin;
    const cookRatio = item.basePrice / totalBeforeDiscount;
    cookPrice = cookPrice - (item.discountAmount * cookRatio);
  }
  
  return Math.max(0, cookPrice);
}

/**
 * Calculate platform revenue from an order item
 */
export function calculatePlatformRevenue(
  basePrice: number, 
  quantity: number,
  marginType: 'percent' | 'fixed', 
  marginValue: number
): number {
  const marginPerItem = calculatePlatformMargin(basePrice, marginType, marginValue);
  return marginPerItem * quantity;
}
