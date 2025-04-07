import React,{useEffect,useState,useContext} from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions, TouchableOpacity,Image} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import NumberInput from "../components/NumberInput.jsx";
import QuestionContainer from "../components/QuestionContainer.jsx";
import Encabezado from "../components/Encabezado";
import BottomRegresar from "../components/BottomRegresar";
import { TimePickerModal } from 'react-native-paper-dates';
import EncabezadoCuidador from "../components/EncabezadoCuidador.jsx";

const AlgunosDias = ({navigation,route}) => {

    const {tipoUsuario,nameMedicamento,descripcion,laboratorio,imagenUrl,tipo,cantidadIngesta,contenidoActual,modo,medicamentoId,fechaInicio} = route.params;
    const [frecuenciaDia,setFrecuenciaDia]=useState(0);
    const [hora, setHora] = useState(null); 
    const [modalVisible, setModalVisible] = useState(false);
  
    const handleHoraChange = (newTime) => {
      setHora(newTime);
      setModalVisible(false);
    };
  
    const openTimePicker = () => {
      setModalVisible(true);
    };
  
    const verificarFrecuenciaYHora = hora !== null && frecuenciaDia>1 && frecuenciaDia%1===0;
  
    const convertHoraToLocalTime = (hora) => {
        if (!hora) return [];
        const horasString = String(hora.hours).padStart(2, '0');
        const minutosString = String(hora.minutes).padStart(2, '0');
        return [`${horasString}:${minutosString}`];
    };

    const handleContinuar = () => {
        const horaLocalTime = convertHoraToLocalTime(hora);
        navigation.navigate('DiaFin', {
          tipoUsuario:tipoUsuario,
          nameMedicamento: nameMedicamento,
          descripcion:descripcion,
          laboratorio:laboratorio,
          imagenUrl:imagenUrl,
          tipo: tipo,
          cantidadIngesta: cantidadIngesta,
          contenidoActual: contenidoActual,
          frecuenciaDia: frecuenciaDia,
          horas: horaLocalTime,
          modo:modo,
          medicamentoId:medicamentoId,
          fechaInicio:fechaInicio
        });
      };

    return(
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={style.screen}>
                {tipoUsuario==="CUIDADOR" ? (
                    <EncabezadoCuidador navigation={navigation}/>
                ) : (
                    <Encabezado navigation={navigation}/>
                )}                
                <View style={{ flex: 1,marginVertical:10,alignItems:"center",justifyContent:"center"}}>
                    <QuestionContainer text="¿CADA CUÁNTOS DÍAS DEBES CONSUMIR EL MEDICAMENTO?"/>
                    <View style={{flexDirection:"row",alignItems:"center",marginTop:20,marginButton:30,marginRight:14}}>
                        <Text style={style.text}>Cada  </Text>
                        <NumberInput valor={frecuenciaDia} actualizarCampo={setFrecuenciaDia}/>
                        <Text style={style.text}>días</Text>
                    </View> 

                    <Text></Text>
                    {(frecuenciaDia>1 && frecuenciaDia%1===0 && hora) ? (
                        <View style={style.containerHora}>
                            <Text style={style.textInstructivo}>Hora del recordatorio</Text>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={style.textHora}>{hora.hours.toString().padStart(2, '0')}:{hora.minutes.toString().padStart(2, '0')} hs</Text>
                                <TouchableOpacity onPress={openTimePicker}>
                                    <Image style={style.buttonEdit} source={require("../../assets/images/EDITAR.png")} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (frecuenciaDia>1 && frecuenciaDia%1===0 && !hora )  ? (
                        <View style={style.containerHora}>
                            <Text style={style.textInstructivo}>¿Hora del recordatorio?</Text>
                            <TouchableOpacity onPress={openTimePicker}>
                                <View style={style.buttonSetAlarma}>
                                <Image style={style.imageSetAlarma} source={require("../../assets/images/SETALARMA.png")} />
                                <Text style={style.textSetAlarma}>SELECCIONAR</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : null}    

                    

                    <TimePickerModal visible={modalVisible} onDismiss={() => setModalVisible(false)}
                        onConfirm={handleHoraChange} hours={hora?.hours || 12} minutes={hora?.minutes || 0}
                        label="Seleccionar hora" cancelLabel="Cancelar" confirmLabel="Confirmar" use24HourClock
                    />
                    <Text></Text>
                    <Text></Text>
                    <AppButton habilitado={verificarFrecuenciaYHora} theme="blue" text="CONTINUAR" onPress={handleContinuar}/>    
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
        color:"#0057CF",
        fontSize:22,
        marginLeft:10,
        fontWeight:"bold"
    },
    textInstructivo:{
        color:"#474B4E",
        fontSize:20,
        width:Dimensions.get("window").width*0.95,
        textAlign:"center",
        marginBottom:10
    },
    textHora:{
        color:"#0057CF",
        fontSize:22,
        fontWeight:"bold"
    },
    containerHora:{
        width:Dimensions.get("window").width*0.85,
        borderWidth:1,
        borderColor:"grey",
        borderRadius:20,
        padding:15,
        alignItems:"center",
        justifyContent:"center",
        marginTop:10
    },
    buttonEdit:{
        resizeMode:"contain",
        width:30,
        height:30,
        marginLeft:15
    },
    buttonSetAlarma:{
        paddingHorizontal:20,
        paddingVertical:10,
        backgroundColor:"#0057CF",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        borderRadius:15
    },
    textSetAlarma:{
        fontSize:17,
        color:"white"
    },
    imageSetAlarma:{
        resizeMode:"contain",
        width:25,
        height:25,
        marginRight:15
    }
})

export default AlgunosDias