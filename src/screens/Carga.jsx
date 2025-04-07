import React, { useEffect,useState } from "react";
import {SafeAreaView,Dimensions,Image, TouchableOpacity} from "react-native";
import useAppStore from "../stores/useAppStore";
import LoadingOverlay from '../LoadingOverlay';

const Carga = ({ navigation }) => {
  
  const {tipoUsuario} = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    verificarTipo();
  }, []);

  const verificarTipo=()=>{
    if(tipoUsuario==="CONSUMIDOR"){
        setIsLoading(false);
        navigation.navigate("Home");
    } else {
        setIsLoading(false);
        navigation.navigate("HomeCuidador");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1,justifyContent:"center" }}>
        <LoadingOverlay isLoading={isLoading} />
        <TouchableOpacity onPress={verificarTipo}>
        <Image style={{width:Dimensions.get("screen").width,resizeMode:"contain"}} source={require("../../assets/images/PORTADA.png")}/>
        </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Carga;