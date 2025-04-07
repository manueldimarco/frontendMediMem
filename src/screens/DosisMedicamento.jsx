import React,{useEffect,useState} from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions, TouchableOpacity,Image} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import NumberInput from "../components/NumberInput.jsx";
import QuestionContainer from "../components/QuestionContainer.jsx";
import Encabezado from "../components/Encabezado";
import BottomRegresar from "../components/BottomRegresar";
import EncabezadoCuidador from "../components/EncabezadoCuidador.jsx";

const DosisMedicamento = ({navigation,route}) => {

    const {tipoUsuario,nameMedicamento,descripcion,laboratorio,imagenUrl,tipo} = route.params;
    const [habilitado,setHabilitado]=useState(false)
    const [cantidadIngesta,setCantidadIngesta]=useState(0)

    useEffect(() => {
        setHabilitado(cantidadIngesta.length>0 && cantidadIngesta!==0);
    }, [cantidadIngesta]);

    const tipos=["COMPRIMIDOS","GOTAS","CÁPSULAS","JARABE","AMPOLLAS"]

    return(
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={style.screen}>
                {tipoUsuario==="CUIDADOR" ? (
                    <EncabezadoCuidador navigation={navigation}/>
                ) : (
                    <Encabezado navigation={navigation}/>
                )}
                <View style={{ flex: 1,alignItems:"center",marginVertical:20,justifyContent:"center"}}>                
                    {tipoUsuario === "CUIDADOR" ? (
                        tipo === "COMPRIMIDOS" || tipo === "CÁPSULAS" || tipo === "AMPOLLAS" ? (
                            <QuestionContainer text="¿CUÁNTOS/AS DEBE CONSUMIR POR TOMA?" />
                        ) : tipo === "JARABE" ? (
                            <QuestionContainer text="¿CUÁNTO DEBE CONSUMIR POR TOMA?" />
                        ) : (
                            <QuestionContainer text="CUANDO DEBA PONERSE GOTAS, ¿CUÁNTAS DEBE COLOCARSE?" />
                        )
                    ) : (
                        tipo === "COMPRIMIDOS" || tipo === "CÁPSULAS" || tipo === "AMPOLLAS" ? (
                            <QuestionContainer text="¿CUÁNTOS/AS DEBES CONSUMIR POR TOMA?" />
                        ) : tipo === "JARABE" ? (
                            <QuestionContainer text="¿CUÁNTO DEBES CONSUMIR POR TOMA?" />
                        ) : (
                            <QuestionContainer text="CUANDO TENGAS QUE PONERTE GOTAS, ¿CUÁNTAS DEBES COLOCARTE?" />
                        )
                    )}

                    <Text style={style.text}>
                        {tipoUsuario === "CUIDADOR"
                            ? `Ingrese la cantidad de ${tipo.toLowerCase()} que debe consumir cada vez`
                            : `Ingrese la cantidad de ${tipo.toLowerCase()} que debes consumir cada vez`}
                    </Text>

                    <View style={{flexDirection:"row"}}>
                        <NumberInput valor={cantidadIngesta} actualizarCampo={setCantidadIngesta}/>
                        <Text style={style.textMedida}>
                            {tipo === "COMPRIMIDOS" || tipo === "CÁPSULAS" || tipo === "AMPOLLAS" || tipo === "GOTAS" ? (
                                tipo.toLowerCase() 
                            ) : (
                                "mililitros (mL)"
                            )}
                        </Text>
                    </View> 
                    <Text></Text> 

                    <AppButton habilitado={habilitado} theme="blue" text="CONTINUAR" onPress={() => {
                        navigation.navigate('DisponibilidadMedicamento', {tipoUsuario:tipoUsuario,nameMedicamento:nameMedicamento,descripcion:descripcion,laboratorio:laboratorio,imagenUrl:imagenUrl,tipo:tipo,cantidadIngesta:cantidadIngesta});
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

export default DosisMedicamento