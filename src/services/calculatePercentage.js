const percentageChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0; //this will avoid division by zero
  }
  return ((current - previous) / previous) * 100;
};

module.exports = {
  percentageChange,
};
