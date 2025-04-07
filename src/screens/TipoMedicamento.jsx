import React,{useEffect,useState,useContext} from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions, TouchableOpacity,Image} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import QuestionContainer from "../components/QuestionContainer.jsx";
import Encabezado from "../components/Encabezado";
import BottomRegresar from "../components/BottomRegresar";
import EncabezadoCuidador from "../components/EncabezadoCuidador.jsx";

const TipoMedicamento = ({navigation,route}) => {

    const {tipoUsuario,nameMedicamento,descripcion,laboratorio,imagenUrl} = route.params;
    console.log("IMAGEN URL: "+imagenUrl)
    const tipos=["COMPRIMIDOS","GOTAS","CÁPSULAS","JARABE","AMPOLLAS"]
    console.log("MEDICAMENTOOO: "+nameMedicamento)
    
    return(
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={style.screen}>
                {tipoUsuario==="CUIDADOR" ? (
                    <EncabezadoCuidador navigation={navigation}/>
                ) : (
                    <Encabezado navigation={navigation}/>
                )}
                <View style={{ flex: 1,marginTop:10,alignItems:"center" }}>
                    <QuestionContainer text="¿QUÉ TIPO DE MEDICAMENTO ES?"/>
                    <Text style={style.text}>Seleccione una opción</Text>
                    {tipos.map((tipo, index) => (
                        <View key={index}>
                            <AppButton habilitado={true} theme="blue" text={tipo} onPress={
                                ()=>navigation.navigate('DosisMedicamento',{tipoUsuario:tipoUsuario,nameMedicamento:nameMedicamento,descripcion:descripcion,laboratorio:laboratorio,imagenUrl:imagenUrl,tipo:tipo})
                            }/>
                        </View>
                    ))}   
                </View>
                            
                <BottomRegresar/>
            </ScrollView>
        </SafeAreaView>
    )
}

const style=StyleSheet.create({
    screen:{
        justifyContent:"space-between",
        backgroundColor: 'white',
    },
    text:{
        color:"#8696BB",
        fontSize:16,
        marginBottom:8,
        width:Dimensions.get("window").width*0.75,
        textAlign:"center"
    }
})

export default TipoMedicamento