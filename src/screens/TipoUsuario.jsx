import React from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions, TouchableOpacity,Image} from "react-native";
import Constants from 'expo-constants';
import BottomRegresar from "../components/BottomRegresar";

const TipoUsuario = ({navigation}) => {

    const handleContinuar = (tipoUsuario) => {
        if(tipoUsuario==="CONSUMIDOR"){
            navigation.navigate('Registro', {
                tipoUsuario:tipoUsuario
              });
        } else {
            navigation.navigate('RegistroCuidador', {
                tipoUsuario:tipoUsuario
              });
        }
        
      };

    return(
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={style.screen}>
                <Text style={style.text}>Selecciona el tipo de usuario</Text>
                <View style={style.containerBotones}>

                    <View style={style.container}>
                        <View>
                            <View style={style.tipoContainer}>
                                <Text style={style.title}>YO CONSUMO MEDICAMENTOS</Text>
                            </View>
                            <View style={style.infoContainer}>
                                <Text style={style.textInfo}>{'\u2022'} Podrás registrar tus medicamentos.{'\n'}
                                    {'\u2022'} Te notificaremos en los horarios de consumo.{'\n'}
                                    {'\u2022'} Te avisaremos cuando tengas que reponer medicación.
                                </Text>
                            </View>
                        </View>
                        <View style={style.containerSiguiente}>
                            <TouchableOpacity onPress={()=>handleContinuar("CONSUMIDOR")}>
                                <Image style={style.imageContinuar} source={require("../../assets/images/SIGUIENTE.png")}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={style.container}>
                        <View>
                            <View style={style.tipoContainer}>
                                <Text style={style.title}>YO SOY CUIDADOR/A</Text>
                            </View>
                            <View style={style.infoContainer}>
                                <Text style={style.textInfo}>{'\u2022'} Podrás monitorear a las personas que cuidás.{'\n'}
                                    {'\u2022'} Podrás registrar sus medicamentos y ver el estado de sus tomas.
                                </Text>
                            </View>
                        </View>
                        <View style={style.containerSiguiente}>
                            <TouchableOpacity onPress={()=>handleContinuar("CUIDADOR")}>
                                <Image style={style.imageContinuar} source={require("../../assets/images/SIGUIENTE.png")}/>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </ScrollView>
            <BottomRegresar/>
        </SafeAreaView>
        
        
    )
}

const style=StyleSheet.create({
    screen:{
        justifyContent:"space-evenly",
        backgroundColor: 'white',
        padding:Constants.statusBarHeight,
        flex:1
    },
    text:{
        color:"black",
        fontSize:24,
        marginBottom:8,
        fontWeight:"bold",
        textAlign:"center"
    },
    containerBotones:{
        flex:1,
        alignItems:"center",
        justifyContent:"space-around"
    },
    container:{
        borderColor:"#0057CF",
        borderWidth:3,
        borderRadius:25,
        flexDirection:"row",
        justifyContent:"space-between",
        backgroundColor:"#0057CF",
        marginHorizontal:10,
        marginVertical:10,
        width:Dimensions.get("window").width*0.93
    },
    tipoContainer:{
        borderColor:"white",
        borderBottomWidth:2,
        justifyContent:"center",
        alignItems:"center",
        padding:10,
        width:Dimensions.get("window").width*0.75
    },
    title:{
        color:"white",
        fontSize:22,
        textAlign:"center",
        fontWeight:"bold"
    },
    infoContainer:{
        padding:10,
        paddingHorizontal:12,
        width:Dimensions.get("window").width*0.75
    },
    textInfo:{
        color:"white",
        fontSize:16,
        textAlign:"left"
    },
    imageContinuar:{
        resizeMode:"contain",
        width:40,
        height:40
    },
    containerSiguiente:{
        backgroundColor:"white",
        borderTopRightRadius:25,
        borderBottomRightRadius:25,
        paddingHorizontal:5,
        justifyContent:"center",
        alignItems:"center",
        flex:1
    }
})

export default TipoUsuario