export const getNumberFromString = (str: string): number => {
  const numArray = str.match(/\d/g);
  const num = numArray?.join('');
  return +num;
};
