/**
 * Generates a MongoDB projection string
 *
 * @param selectedProps Props are selected
 * @param unSelectedProps Props are not selected
 * @returns A projection string
 */
export const select = (
  selectedProps: string[] = [],
  unSelectedProps: string[] = [],
): string => {
  if (selectedProps.length) {
    return selectedProps.join(' ');
  }

  if (unSelectedProps.length) {
    return unSelectedProps
      .reduce((prev, cur) => {
        return [...prev, `-${cur}`];
      }, [])
      .join(' ');
  }
};
