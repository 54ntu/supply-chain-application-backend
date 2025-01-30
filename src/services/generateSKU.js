const generateSKU = (fku, attributes) => {
  const attributePart = attributes
    ? attributes
        .map((attr) => attr.value)
        .join("-")
        .toUpperCase()
    : "";
  return `${fku}-${attributePart}`;
};

module.exports = {
  generateSKU,
};
