const generateSKU = (fku, attributes) => {
  let attributePart = Object.values(attributes).join("-").toUpperCase();

  return `${fku}-${attributePart}`;
};

module.exports = {
  generateSKU,
};
