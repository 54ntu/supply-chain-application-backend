const UserRole = {
  Distributor: "distributor",
  SalesPerson: "salesperson",
};

const shippingMethod = {
  FREESHIPPING: "free shipping",
  EXPRESSSHIPPING: "express shipping",
};

const Province = {
  BAGMATI: "BAGMATI",
  GANDAKI: "GANDAKI",
  KARNALI: "KARNALI",
  KOSHI: "KOSHI",
  LUMBINI: "LUMBINI",
  MADHESH: "MADHESH",
  SUDURPASHCHIM: "SUDURPASHCHIM",
};

const orderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  INTRANSIT: "INTRANSIT",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const paymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  REFUNDED: "REFUNDED",
  CANCELLED: "CANCELLED",
};

const refundRequest = {
  APPROVED: "APPROVED",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
};

const shipmentMethods = {
  STANDARD: "STANDARD",
  EXPRESS: "EXPRESS",
  SAMEDAY: "SAME DAY",
};

const subscriptionType = {
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  ANNUAL: "ANNUAL",
};

const paymentMethod = {
  KHALTI: "KHALTI",
  CARD: "CARD",
};

module.exports = {
  UserRole,
  shippingMethod,
  Province,
  orderStatus,
  paymentStatus,
  refundRequest,
  shipmentMethods,
  subscriptionType,
  paymentMethod,
};
