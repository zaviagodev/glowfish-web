import { createContext, useContext, useEffect, useState } from "react";

interface Config {
  config: any;
  isLoading: boolean;
  setConfig: (config: any) => void;
}

export const ConfigContext = createContext<Config>({
  config: {},
  isLoading: false,
  setConfig: () => {},
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    setConfig({
      default_language: localStorage.getItem("locale") || "en"
    });
    setIsLoading(false);
  }, []);

  return (
    <ConfigContext.Provider value={{ config, isLoading, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
export default useConfig;