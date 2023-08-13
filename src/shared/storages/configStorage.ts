import {
  BaseStorage,
  createStorage,
  StorageType,
} from "@src/shared/storages/base";
import dayjs from "dayjs";

type CountdownType = "date" | "ms";

type Config = {
  autoClickCountdownType: CountdownType;
  // unix timestamp in ms
  autoClickTime: number;
  autoClickInSeconds: number;
};

type ConfigStorage = BaseStorage<Config> & {
  setConfig: <T extends keyof Config>(
    key: T,
    value: Config[T]
  ) => Promise<void>;
};

const storage = createStorage<Config>(
  "config",
  {
    autoClickCountdownType: "date",
    // 8am
    autoClickTime: dayjs()
      .set("hour", 8)
      .set("minute", 0)
      .set("second", 0)
      .valueOf(),
    autoClickInSeconds: 3,
  },
  {
    storageType: StorageType.Local,
  }
);

export const configStorage: ConfigStorage = {
  ...storage,
  setConfig: (key, value) => {
    return storage.set({ ...storage.getSnapshot(), [key]: value });
  },
};
