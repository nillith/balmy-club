export const makeBackdropTransparent = function(elem: any) {
  elem
    .parentElement
    .parentElement
    .parentElement
    .previousSibling
    .style
    .background = 'transparent';
};
