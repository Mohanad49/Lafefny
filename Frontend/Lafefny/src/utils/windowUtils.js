/* eslint-disable no-unused-labels */
export const calculateGridDimensions = (containerWidth, containerHeight, itemCount) => {
    const CARD_WIDTH = 300;
    const CARD_HEIGHT = 400;
    const GAP = 20;
  
    const columns = Math.floor((containerWidth - GAP) / (CARD_WIDTH + GAP));
    const rows = Math.ceil(itemCount / columns);
    const visibleRows = Math.ceil(containerHeight / (CARD_HEIGHT + GAP));
  
    return {
      columns,
      rows,
      visibleRows,
      cardWidth: CARD_WIDTH,
      cardHeight: CARD_HEIGHT,
      totalWidth: columns * (CARD_WIDTH + GAP) - GAP,
      totalHeight: rows * (CARD_HEIGHT + GAP) - GAP
    };
  };
  
    getVisibleRange: (scrollTop, dimensions) => {
      const startRow = Math.floor(scrollTop / dimensions.itemHeight);
      const endRow = Math.min(
        startRow + dimensions.visibleRows + 1,
        dimensions.rows
      );
      return { startRow, endRow };
    };