export type ResponsiveSize = {
  key: string;
  label: string;
  width: number;
};

export const DEFAULT_RESPONSIVE_SIZES: ResponsiveSize[] = [
  { key: 'MODERN_PC', label: 'Modern PC', width: 1920 },
  { key: 'PC', label: 'PC', width: 1200 },
  { key: 'IPAD', label: 'Tablet', width: 768 },
  { key: 'MOBILE', label: 'Mobile', width: 350 },
];

export const getResponsiveSizes = (responsiveSizes?: ResponsiveSize[]) => {
  const validResponsiveSizes = responsiveSizes?.filter(
    ({ key, label, width }) => Boolean(key && label) && Number.isFinite(width) && width > 0
  );
  return validResponsiveSizes?.length ? validResponsiveSizes : DEFAULT_RESPONSIVE_SIZES;
};

export const getResponsiveSizeByViewport = (viewportWidth: number, responsiveSizes?: ResponsiveSize[]) =>
  [...getResponsiveSizes(responsiveSizes)]
    .sort((first, second) => first.width - second.width)
    .find(({ width }) => viewportWidth <= width);
