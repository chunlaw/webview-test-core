import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

interface AppContextState {
  count: number;
}

interface AppContextValue extends AppContextState {
  addCount: () => void;
}

const AppContext = React.createContext({} as AppContextValue);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppContextState>(DEFAULT_STATE);

  const os = useMemo<string | null>(
    // @ts-ignore
    () => window?.RnOs?.toLowerCase() ?? null,
    []
  );

  const handleMsg = useCallback((msg: any) => {
    try {
      const data = JSON.parse(msg.data)
      if ( data?.type === 'count' && data?.value ) {
        setState(prev => ({
          ...prev,
          count: prev.count + data.value
        }))
      }
    } catch (e) {
      alert("From web " + JSON.stringify(e))
    }
  }, [])

  useEffect(() => {
    let obj: Window | Document | null = null
    if ( os === 'ios' ) {
      obj = window
    } else if ( os === 'android' ) {
      obj = document
    }
    if ( obj !== null ) {
      obj.addEventListener('message', handleMsg)
    }
    return () => {
      if ( obj !== null ) {
        obj.removeEventListener('message', handleMsg)
      }
    }
  }, [handleMsg, os])

  const addCount = () => {
    // @ts-ignore
    window?.ReactNativeWebView?.postMessage(JSON.stringify({
      type: 'count',
      value: 1,
    }))
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        addCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;

const DEFAULT_STATE: AppContextState = {
  count: 0,
};
