import { $, $$ } from '../lib/dom';
import { createScene, gsap, headerOffset } from '../lib/motion';
import { placeStationNodes, STATION_AT } from '../sections/pipeline';

/** Scene 3: the black line draws itself while the marker rides it through four stations. */
export function animatePipeline(el: HTMLElement): void {
  placeStationNodes(el);
  const path = $<SVGPathElement>('.pipeline__path', el);
  const marker = $<SVGCircleElement>('.pipeline__marker', el);
  const nodes = $$<SVGRectElement>('.pipeline__node', el);
  const stations = $$('.station', el);
  const length = path.getTotalLength();

  const update = (progress: number): void => {
    const p = path.getPointAtLength(length * progress);
    marker.setAttribute('cx', p.x.toFixed(1));
    marker.setAttribute('cy', p.y.toFixed(1));
    STATION_AT.forEach((at, i) => {
      const reached = progress >= at - 0.005;
      nodes[i]?.classList.toggle('is-active', reached);
      stations[i]?.classList.toggle('is-active', reached);
    });
  };

  const draw = (scrollTrigger: ScrollTrigger.Vars): (() => void) => {
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: { ...scrollTrigger, scrub: true, onUpdate: (self) => update(self.progress) },
    });
    update(0);
    return () => update(1);
  };

  createScene(el, {
    full: () =>
      draw({ trigger: el, start: () => `top ${headerOffset()}px`, end: '+=150%', pin: true }),
    compact: () => draw({ trigger: el, start: 'top 65%', end: 'bottom 75%' }),
    reduced: () => update(1),
  });
}
