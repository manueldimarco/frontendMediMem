import { createContext,useState } from "react";

export const HostContext=createContext();

const HostContextProvider=({children})=>{

    const [host, setHost] = useState("https://backendmedimem.onrender.com"); 

    return(
        <HostContext.Provider value={host}>
            {children}
        </HostContext.Provider>
    )
}

export default HostContextProvider