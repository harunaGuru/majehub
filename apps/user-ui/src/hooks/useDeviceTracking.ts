
import { useState, useEffect } from 'react';
import { UAParser } from 'ua-parser-js';

interface UserDeviceInfo {
  browserName: string | undefined;
  browserVersion: string | undefined;
  osName: string | undefined;
  osVersion: string | undefined;
  deviceType: string | undefined; // mobile, tablet, console, smarttv, wearable, desktop
  deviceModel: string | undefined;
  cpuArch: string | undefined;
}

export const useUserDevice = (): UserDeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<UserDeviceInfo>({
    browserName: undefined,
    browserVersion: undefined,
    osName: undefined,
    osVersion: undefined,
    deviceType: undefined,
    deviceModel: undefined,
    cpuArch: undefined,
  });

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    console.log()

    setDeviceInfo({
      browserName: result.browser.name,
      browserVersion: result.browser.version,
      osName: result.os.name,
      osVersion: result.os.version,
      deviceType: result.device.type || 'desktop',
      deviceModel: result.device.model,
      cpuArch: result.cpu.architecture,
    });
  }, []);

  return deviceInfo;
};
