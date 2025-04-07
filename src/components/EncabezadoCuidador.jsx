import React from "react";
import { View,TouchableOpacity,Dimensions, StyleSheet,Image} from "react-native";
import useAppStore from "../stores/useAppStore";
import handleLogout from '../utils/handleLogout.js'; 

const EncabezadoCuidador=(props)=>{

    const {clearAsociadoData,fotoUrlAsociado,fotoUrl,setTomas,setMedicamentos, usuarioId,logout, clearUserData, clearCuidadorData} = useAppStore();

    const handleToHome = async () => {
        clearAsociadoData();
        props.navigation.navigate("HomeCuidador");
        setTomas([]);
        setMedicamentos([]);
    };

    return(
        <View style={[style.encabezado,{borderBottomLeftRadius: props.square ? 0 : 25,borderBottomWidth: props.square ? 2 : 0,borderBottomRightRadius: props.square ? 0 : 25,borderBottomColor:"black"}]}>
            
            <TouchableOpacity onPress={handleToHome}>
                <Image style={style.imageEncabezado} source={require("../../assets/images/CASABLANCA.png")}/>
            </TouchableOpacity>
            <View style={style.centro}>
                <Image style={style.foto} source={{uri:fotoUrl}}/>
                <Image style={style.flecha} source={require("../../assets/images/ASOCIACION.png")}/>
                <Image style={style.foto} source={{uri:fotoUrlAsociado}}/>
            </View>
            <TouchableOpacity onPress={()=>handleLogout({ usuarioId,logout, clearUserData, clearCuidadorData, clearAsociadoData })}>
                <Image style={style.imageEncabezado} source={require("../../assets/images/CERRARSESION.png")}/>
            </TouchableOpacity>
            
        </View>
    )
}

export default EncabezadoCuidador

const style=StyleSheet.create({
    encabezado:{
        widht:Dimensions.get('window').width,
        flexDirection:"row",
        paddingTop:15,
        paddingBottom:20,
        paddingHorizontal:20,
        justifyContent:"space-between",
        alignItems:"center",
        backgroundColor:"#0057CF"
    },
    centro:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"center"
    },
    foto:{
        resizeMode:"cover",
        width:60,
        height:60,
        borderRadius:50,
        borderColor:"white",
        borderWidth:2,
    },
    flecha:{
        width:30,
        height:30,
        resizeMode:"contain",
        marginHorizontal:-15,
        zIndex:2
    },
    imageEncabezado:{
        resizeMode:"contain",
        width:25,
        height:25,
    }
})