import React from "react";
import { View,TouchableOpacity,Dimensions, StyleSheet,Image,Linking} from "react-native";
import useAppStore from "../stores/useAppStore";
import handleLogout from '../utils/handleLogout.js'; 

const Encabezado=(props)=>{

    const {telefonoCuidador,usuarioId,logout, clearUserData, clearCuidadorData, clearAsociadoData} = useAppStore();

    const backgroundColorContainer=props.blue ? "#0057CF" : "white";

    return(        
        <View style={[style.encabezado,{backgroundColor:backgroundColorContainer}]}>
            <TouchableOpacity onPress={() => props.navigation.navigate('Home')}>
                <Image style={style.image} source={props.blue ? require("../../assets/images/CASABLANCA.png") : require("../../assets/images/INICIO.png")}/>
            </TouchableOpacity>
            <Image style={style.logo} source={require("../../assets/images/LOGOBORDEADO.png")}/>
            {telefonoCuidador!=="" ? (
                <TouchableOpacity onPress={()=>Linking.openURL("tel:"+telefonoCuidador)}>
                    <Image style={style.image} source={props.blue ? require("../../assets/images/TELBLANCO.png") : require("../../assets/images/LLAMADA.png")}/>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={()=>handleLogout({ usuarioId,logout, clearUserData, clearCuidadorData, clearAsociadoData })}>
                    <Image style={style.image} source={props.blue ? require("../../assets/images/CERRARSESION.png") : require("../../assets/images/LOGOUTROJO.png")}/>
                </TouchableOpacity>
            )}
        </View>
    )
}

export default Encabezado

const style=StyleSheet.create({
    encabezado:{
        widht:Dimensions.get('window').width,
        flexDirection:"row",
        paddingTop:15,
        paddingBottom:10,
        paddingHorizontal:20,
        justifyContent:"space-between",
        alignItems:"center",
    },
    logo:{
        resizeMode:"contain",
        width:65,
        height:65
    },
    image:{
        resizeMode:"contain",
        width:30,
        height:30,
    }
})