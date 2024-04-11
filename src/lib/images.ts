export const carImages = [
  'https://i.postimg.cc/wxrMHZXq/car1.png',
  'https://i.postimg.cc/zGZfHh24/car2.png',
  'https://i.postimg.cc/HLTsBgg2/car3.png',
  'https://i.postimg.cc/F1thctp0/car5.png',
  'https://i.postimg.cc/J0H1G7N1/car6.png',
  'https://i.postimg.cc/xdgjZ4jS/car7.png',
  'https://i.postimg.cc/L6f1W2cK/car8.png',
  'https://i.postimg.cc/G34Ykkzp/car11.png',
  'https://i.postimg.cc/9Xs91rNY/car12.png',
  'https://i.postimg.cc/BvZPtDX4/car13.png',
  'https://i.postimg.cc/qvxCkQB1/car14.png'
];

export const selectRandomCarImage = () => {
  const length = carImages.length;
  const randomIndex = Math.floor(Math.random() * length);
  return carImages[randomIndex] as string;
};
