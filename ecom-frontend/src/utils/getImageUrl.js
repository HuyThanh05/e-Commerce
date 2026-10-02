export const getImageUrl = (image) => {
  if (!image) return "";
  // Keep previously seeded local databases compatible with the newer real-photo assets.
  if (image.includes("/sample-products/") && image.endsWith(".svg")) {
    const fileName = image.substring(image.lastIndexOf("/") + 1).replace(/\.svg$/, "-real.jpg");
    return `/sample-products/${fileName}`;
  }
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_BACK_END_URL}/images/${image}`;
};
