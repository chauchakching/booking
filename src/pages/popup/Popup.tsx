import React from "react";
import type { Dayjs } from "dayjs";
import "@pages/popup/Popup.css";
import useStorage from "@src/shared/hooks/useStorage";
import withSuspense from "@src/shared/hoc/withSuspense";
import { Input, Radio, Space, TimePicker } from "antd";
import { configStorage } from "@src/shared/storages/configStorage";
import dayjs from "dayjs";

const Popup = () => {
  const config = useStorage(configStorage);

  return (
    <div className="App">
      <Space>
        <p>Auto click in:</p>
        <Radio.Group
          value={config.autoClickCountdownType}
          onChange={(x) => {
            configStorage.setConfig("autoClickCountdownType", x.target.value);
          }}
        >
          <Space direction="vertical" align="start">
            <Radio value={"date"}>
              <TimePicker
                format="HH:mm"
                value={dayjs(config.autoClickTime)}
                onChange={(x: Dayjs) => {
                  configStorage.setConfig("autoClickTime", x.valueOf());
                }}
              />
            </Radio>
            <Radio value={"ms"}>
              <Space direction="horizontal">
                <Input
                  value={config.autoClickInSeconds}
                  onChange={(e) => {
                    configStorage.setConfig(
                      "autoClickInSeconds",
                      Number(e.target.value)
                    );
                  }}
                  style={{ width: 50 }}
                />
                seconds
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </Space>
    </div>
  );
};

export default withSuspense(Popup);
