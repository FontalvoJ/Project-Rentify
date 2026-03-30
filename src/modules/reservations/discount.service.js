export default class DiscountService {
  constructor() {
    this.rules = [
      { minDays: 14, discount: 20 },
      { minDays: 7, discount: 10 },
    ];
  }

  calculate(totalDays, totalCost) {
    const rule = this.rules.find((r) => totalDays >= r.minDays);

    const discountPercentage = rule ? rule.discount : 0;

    const discountAmount = totalCost * (discountPercentage / 100);
    const finalCost = totalCost - discountAmount;

    return {
      discountApplied: discountPercentage > 0,
      discountPercentage,
      finalCost,
    };
  }
}
