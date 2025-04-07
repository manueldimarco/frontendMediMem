import React,{useEffect,useState,useContext} from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions, TouchableOpacity,Image} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import AppInput from "../components/AppInput.jsx";
import QuestionContainer from "../components/QuestionContainer.jsx";
import Encabezado from "../components/Encabezado";
import BottomRegresar from "../components/BottomRegresar";
import EncabezadoCuidador from "../components/EncabezadoCuidador.jsx";

const FrecuenciaDia = ({navigation,route}) => {

    const {tipoUsuario,nameMedicamento,descripcion,laboratorio,imagenUrl,tipo,cantidadIngesta,contenidoActual,modo,medicamentoId,fechaInicio} = route.params;

    return(
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={style.screen}>
                {tipoUsuario==="CUIDADOR" ? (
                    <EncabezadoCuidador navigation={navigation}/>
                ) : (
                    <Encabezado navigation={navigation}/>
                )}
                <View style={{ flex: 1,marginTop:10,alignItems:"center",justifyContent:"center"}}>
                    <QuestionContainer text="¿DEBE CONSUMIR EL MEDICAMENTO TODOS LOS DÍAS?"/>
                    <Text style={style.text}>Seleccione una opción</Text>
                    <AppButton habilitado={true} theme="blue" text="SÍ, TODOS LOS DÍAS" onPress={()=>navigation.navigate('TodosLosDias',{tipoUsuario:tipoUsuario,nameMedicamento:nameMedicamento,descripcion:descripcion,laboratorio:laboratorio,imagenUrl:imagenUrl,tipo:tipo,cantidadIngesta:cantidadIngesta,contenidoActual:contenidoActual,modo:modo,medicamentoId:medicamentoId,fechaInicio:fechaInicio})}/>
                    <AppButton habilitado={true} theme="blue" text="NO, CADA DOS O MÁS DÍAS" onPress={()=>navigation.navigate('AlgunosDias',{tipoUsuario:tipoUsuario,nameMedicamento:nameMedicamento,descripcion:descripcion,laboratorio:laboratorio,imagenUrl:imagenUrl,tipo:tipo,cantidadIngesta:cantidadIngesta,contenidoActual:contenidoActual,modo:modo,medicamentoId:medicamentoId,fechaInicio:fechaInicio})}/>    
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
        flexGrow:1
    },
    text:{
        color:"#8696BB",
        fontSize:16,
        marginVertical:20,
        width:Dimensions.get("window").width*0.75,
        textAlign:"center"
    }
})

export default FrecuenciaDia