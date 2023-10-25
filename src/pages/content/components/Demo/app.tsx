import { usePreciseTimeout } from "@src/shared/hooks/usePreciseTimeout";
import useStorage from "@src/shared/hooks/useStorage";
import { configStorage } from "@src/shared/storages/configStorage";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";

const dateFormat = "YYYY-MM-DD HH:mm:ss.SSS Z[Z]";

const checkAllAncestors = (event, check, cb) => {
  let target = event.target;
  while (target !== this) {
    if (check(target)) {
      return cb(target);
    }
    if (!target.parentNode) return;
    target = target.parentNode;
  }
};

let selectedDom = null;

/**
 * Watch config changes in `chrome.storage.local` by popup.js
 */
const WatchConfig = ({ children }: { children: React.ReactNode }) => {
  const [key, setKey] = useState(Math.random());
  useEffect(() => {
    chrome.storage.local.onChanged.addListener(async () => {
      await configStorage.set(await configStorage.get());
      setKey(Math.random());
    });
  }, []);
  return <React.Fragment key={key}>{children}</React.Fragment>;
};

function App() {
  // useEffect(() => {
  //   console.log("content view loaded");
  //   console.log("autoClickCountdownType", autoClickCountdownType);
  // }, []);

  const enableClickInterceptorRef = useRef(true);
  const { autoClickCountdownType, autoClickTime, autoClickInSeconds } =
    useStorage(configStorage);

  const setPreciseTimeout = usePreciseTimeout();

  useEffect(() => {
    const cb = function (event) {
      if (!enableClickInterceptorRef.current) {
        return;
      }

      checkAllAncestors(
        event,
        (target) => target?.classList?.contains("bookingBlock"),
        async (target) => {
          try {
            // console.log("is .bookingBlock DOM !");
            event.preventDefault();
            event.stopImmediatePropagation();

            console.log("intercepted click");

            const isClickingSameSlot = selectedDom === event.target;

            const autoClickDelayTime = (() => {
              if (isClickingSameSlot) return 0;
              if (!autoClickCountdownType) {
                console.error("invalid autoClickCountdownType value");
                return 0;
              }
              if (autoClickCountdownType === "date") {
                const todayTime = dayjs()
                  .set("hour", dayjs(autoClickTime).hour())
                  .set("minute", dayjs(autoClickTime).minute())
                  .set("second", 0)
                  .set("millisecond", 0);
                const nextTime =
                  dayjs().valueOf() > todayTime.valueOf()
                    ? todayTime.set("day", todayTime.day() + 1).valueOf()
                    : todayTime.valueOf();
                return nextTime - dayjs().valueOf();
              }
              if (autoClickCountdownType === "ms") {
                return autoClickInSeconds * 1000;
              }
              console.warn("cannot determine correct auto click time");
              return 0;
            })();

            console.log(`auto click after ${autoClickDelayTime / 1000}s...`);
            console.log("current time:   ", dayjs().format(dateFormat));
            console.log(
              "auto click time:",
              dayjs().add(autoClickDelayTime, "ms").format(dateFormat)
            );

            setPreciseTimeout({
              callback: () => {
                console.log(
                  "setTimeout trigger click!",
                  dayjs().format(dateFormat)
                );
                enableClickInterceptorRef.current = false;
                event.target.click();
                setTimeout(() => {
                  enableClickInterceptorRef.current = true;
                }, 0);
              },
              delay: autoClickDelayTime,
              refreshInterval: 1 * 1000,
            });

            /**
             * update selected DOM
             */
            try {
              if (selectedDom) {
                selectedDom.style.color = "black";
              }
            } catch (e) {}
            selectedDom = event.target;
            selectedDom.style.color = "orange";
          } catch (e) {
            console.log("got error in click event listener", e);
          }
        }
      );
    };
    document.body.addEventListener("click", cb, true);
    return () => {
      document.body.removeEventListener("click", cb, true);
    };
  }, [autoClickCountdownType, autoClickTime, autoClickInSeconds]);

  return null;
  // return <div className="content-view text-lime-400">content view</div>;
}

const ExportedApp = () => (
  <WatchConfig>
    <App />
  </WatchConfig>
);

export default ExportedApp;
