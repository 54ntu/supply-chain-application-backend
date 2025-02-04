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
  SHIPPED: "SHIPPED",
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

module.exports = {
  UserRole,
  shippingMethod,
  Province,
  orderStatus,
  paymentStatus,
  refundRequest,
};
