export function isMobileDevice(): boolean {
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return hasTouch && window.innerWidth <= 1024;
}

export function isOldIOS(): boolean {
  return (
    /iPhone\s*(X|XS|XR|[1-9]|1[0-2]|SE)/i.test(navigator.userAgent) ||
    (/iPhone/i.test(navigator.userAgent) && /OS\s*(1[0-5])_/i.test(navigator.userAgent))
  );
}
