import { createContext, useContext, useEffect, useState } from "react";

interface Config {
  config: any;
  isLoading: boolean;
}

export const ConfigContext = createContext<Config>({
  config: {},
  isLoading: false,
});

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    setIsLoading(true);
    setConfig({
        default_language: "en"
    });
    // misc.getConfig().then((res: any) => {
    //   setConfig(res.message);
    //   setIsLoading(false);
    // });
  }, []);

  return (
    <ConfigContext.Provider value={{ config, isLoading }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
export default useConfig;