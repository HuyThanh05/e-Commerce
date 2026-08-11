export const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http")) return image; 
  return `${import.meta.env.VITE_BACK_END_URL}/images/${image}`;
};