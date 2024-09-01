export function constrainWidth(inPixel: number, inPercent: number = 100) {
  return Math.min(inPixel, window.innerWidth * (inPercent / 100))
}
