import { createContext,useState } from "react";

export const HostContext=createContext();

const HostContextProvider=({children})=>{

    const [host, setHost] = useState("http://192.168.100.9:8080"); 

    return(
        <HostContext.Provider value={host}>
            {children}
        </HostContext.Provider>
    )
}

export default HostContextProvider