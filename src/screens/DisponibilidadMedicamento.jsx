import React,{useEffect,useState} from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions, TouchableOpacity,Image} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import NumberInput from "../components/NumberInput.jsx";
import QuestionContainer from "../components/QuestionContainer.jsx";
import Encabezado from "../components/Encabezado";
import BottomRegresar from "../components/BottomRegresar";
import EncabezadoCuidador from "../components/EncabezadoCuidador.jsx";

const DisponibilidadMedicamento = ({navigation,route}) => {

    const {tipoUsuario,nameMedicamento,descripcion,laboratorio,tipo,imagenUrl,cantidadIngesta} = route.params;
    const [habilitado,setHabilitado]=useState(false)
    const [envases,setEnvases]=useState(0)
    const [contenidoEnvase,setContenidoEnvase]=useState(0)

    useEffect(() => {
        setHabilitado(envases.length>0 && envases!==0 && contenidoEnvase.length>0 && contenidoEnvase!==0);
    }, [envases,contenidoEnvase]);

    return(
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={style.screen}>

                {tipoUsuario==="CUIDADOR" ? (
                    <EncabezadoCuidador navigation={navigation}/>
                ) : (
                    <Encabezado navigation={navigation}/>
                )}               
                <Text></Text>          

                <View style={{ flex: 1,alignItems:"center",marginVertical:10,justifyContent:"center"}}>                                  
                    <QuestionContainer text={tipoUsuario === "CUIDADOR" ? "¿CUÁNTOS ENVASES/CAJAS TIENE?" : "¿CUÁNTOS ENVASES/CAJAS TIENES?"}/>
                    <View style={{flexDirection:"row"}}>
                        <NumberInput valor={envases} actualizarCampo={setEnvases}/>
                        <Text style={style.textMedida}>
                            {tipo === "COMPRIMIDOS" || tipo === "CÁPSULAS" || tipo === "AMPOLLAS" ? (
                                "caja/s" 
                            ) : (
                                "envase/s"
                            )}
                        </Text>
                    </View>    
                    <Text></Text>          
                    <QuestionContainer text="¿CUÁNTO CONTIENE CADA UNO?"/>
                    <View style={{flexDirection:"row"}}>
                        <NumberInput valor={contenidoEnvase} actualizarCampo={setContenidoEnvase}/>
                        <Text style={style.textMedida}>
                            {tipo === "COMPRIMIDOS" || tipo === "CÁPSULAS" || tipo === "AMPOLLAS" || tipo === "GOTAS" ? (
                                tipo.toLowerCase() 
                            ) : (
                                "mililitros"
                            )}
                        </Text>
                    </View> 
                    {tipo==="GOTAS" ? (
                        <Text style={{marginTop:10,fontSize:15}}>Se estima que 1 GOTA=0,05 mL</Text>
                    ) : null} 
                    <Text></Text>          
                    <AppButton habilitado={habilitado} theme="blue" text="CONTINUAR" onPress={() => {
                        navigation.navigate('FrecuenciaDia', {tipoUsuario:tipoUsuario,nameMedicamento:nameMedicamento,descripcion:descripcion,laboratorio:laboratorio,imagenUrl:imagenUrl,tipo:tipo,cantidadIngesta:cantidadIngesta,contenidoActual:envases*contenidoEnvase,modo:"REGISTRO",medicamentoId:""});
                    }}/>
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
        fontSize:18,
        marginVertical:18,
        width:Dimensions.get("window").width*0.75,
        textAlign:"center"
    },
    textMedida:{
        color:"#0057CF",
        fontWeight:"bold",
        fontSize:26,
        textAlign:"center",
        margin:15
    }
})

export default DisponibilidadMedicamento