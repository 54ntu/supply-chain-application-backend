const generateFKU = (category, product_name) => {
  const categoryPart = category.slice(0, 3).toUpperCase();
  const namePart = product_name.slice(0, 3).toUpperCase();
  return `${categoryPart}--${namePart}`;
};

module.exports = {
  generateFKU,
};
