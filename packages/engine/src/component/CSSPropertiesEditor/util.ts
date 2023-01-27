export const getTextWidth = async (text: string, fontSize = 14) => {
  return new Promise<string>((resolve, reject) => {
    const span = document.createElement('span');
    span.innerHTML = text;
    span.style.fontSize = `${fontSize}px`;
    span.style.position = 'fixed';
    span.style.left = '-1000px';
    span.style.bottom = '-1000px';
    span.style.display = 'inline-block';
    document.body.appendChild(span);
    setTimeout(() => {
      const style = window.getComputedStyle(span);
      resolve(style.width);
      setTimeout(() => {
        document.body.removeChild(span);
      });
    });
  });
};
