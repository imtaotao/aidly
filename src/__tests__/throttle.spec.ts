import { throttle, debounce } from '../index';

describe('throttle.ts', () => {
  const pause = 500;
  const delay = 100;
  function exec_many_times(each: any, complete: any) {
    let i = 0;
    let repeated: any;
    let id: any;

    const start = () => {
      id = setInterval(() => {
        each();
        if (++i === 50) {
          clearInterval(id);
          complete(
            repeated
              ? null
              : () => {
                  i = 0;
                  repeated = true;
                  setTimeout(start, pause);
                },
            start,
          );
        }
      }, 20);
    };
    setTimeout(start, pause);
  }

  it('delay, callback: throttle', () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        stop = true;
        setTimeout(resolve, 1000);
      }, 3000);
      let stop = false;
      let start_time: any;
      let i = 0;
      let arr = [] as Array<number>;
      let fn = function (this: number, now: number) {
        arr.push(now - this);
      };
      let throttled = throttle(delay, fn);

      exec_many_times(
        () => {
          const now = +new Date();
          start_time = start_time || now;
          i++;
          throttled.call(start_time, now);
        },
        (callback: any, start: any) => {
          const len = arr.length;
          setTimeout(() => {
            expect(arr.length < i).toBe(true);
            expect(arr[0] === 0).toBe(true);
            expect(arr.length - len === 1);
            start_time = null;
            arr = [];
            i = 0;
            if (!stop) {
              callback ? callback() : start();
            }
          }, delay * 2);
        },
      );
    });
  });

  test('delay, callback: debounce', () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        stop = true;
        setTimeout(resolve, 1000);
      }, 3000);
      let stop = false;
      let start_time: any;
      let i = 0;
      let arr = [] as Array<number>;
      let fn = () => {
        arr.push(+new Date());
      };
      let debounced = debounce(delay, fn);

      exec_many_times(
        () => {
          start_time = start_time || +new Date();
          i++;
          debounced();
        },
        (callback: any, start: any) => {
          setTimeout(() => {
            expect(arr.length === 1).toBe(true);
            expect(arr[0] - start_time <= 5).toBe(true);
            start_time = null;
            arr = [];
            i = 0;
            if (!stop) {
              callback ? callback() : start();
            }
          }, delay * 2);
        },
      );
    });
  });
});
