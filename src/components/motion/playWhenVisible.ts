// Plays a paused tween the first time any part of `el` enters the viewport
// (ignoring the bottom 10%). Unlike a ScrollTrigger start position, this can't
// get stuck: elements at the very end of a page, or on pages too short to
// scroll, still reveal. Returns a cleanup function.
export function playWhenVisible(el: Element, tween: gsap.core.Animation) {
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      tween.play();
      io.disconnect();
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  io.observe(el);
  return () => io.disconnect();
}
