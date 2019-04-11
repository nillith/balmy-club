export const makeBackdropTransparent = function(elem: any) {
  try {
    elem
      .parentElement
      .parentElement
      .parentElement
      .previousSibling
      .style
      .background = 'transparent';
  } catch (e) {
    // swallow
  }
};
