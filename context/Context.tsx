import { createContext, useState } from "react";

export const AppContext = createContext<any>(null);

export const Context = ({ children }:any) => {
  const [image, setImage] = useState<File>();
  const value = {
    image,
    setImage,
  };
  return(
      <AppContext.Provider value={value}>
          {children}
      </AppContext.Provider>
  )
};
