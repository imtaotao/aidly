import { raf } from './index';

/**
 * Give the current task one frame of time (default is 17ms).
 * If it exceeds one frame, the remaining tasks will be put into the next frame.
 */
export const sliceEach = (
  l: number,
  fn: (i: number) => void | boolean,
  taskTime = 17,
) => {
  return new Promise<void>((resolve) => {
    if (l === 0) {
      resolve();
      return;
    }
    let i = -1;
    let start = Date.now();
    const run = () => {
      while (++i < l) {
        if (fn(i) === false) {
          resolve();
          break;
        }
        if (i === l - 1) {
          resolve();
        } else {
          const t = Date.now();
          if (t - start > taskTime) {
            start = t;
            raf(run);
            break;
          }
        }
      }
    };
    run();
  });
};
