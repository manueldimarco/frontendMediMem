import React,{useEffect,useState,useContext} from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions, TouchableOpacity,Image} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import NumberInput from "../components/NumberInput.jsx";
import QuestionContainer from "../components/QuestionContainer.jsx";
import Encabezado from "../components/Encabezado";
import BottomRegresar from "../components/BottomRegresar";
import { DatePickerModal } from 'react-native-paper-dates';
import EncabezadoCuidador from "../components/EncabezadoCuidador.jsx";

const DiaFin = ({navigation,route}) => {

    const {tipoUsuario,nameMedicamento,descripcion,laboratorio,imagenUrl,tipo,cantidadIngesta,contenidoActual,frecuenciaDia,horas,modo,medicamentoId,fechaInicio} = route.params;
    const [modalVisible, setModalVisible] = useState(false);
    const [fechaFin,setFechaFin]=useState(null);

    const openTimePicker = () => {
      setModalVisible(true);
    };

    const handleContinuar = () => {
        const fechaFinISO = fechaFin.toISOString().substring(0, 10); 
        const fechaFinLocalDateTime = `${fechaFinISO}T23:59:00`; 
        console.log("Fecha a enviar"+fechaFinLocalDateTime)
        navigation.navigate('Resumen', {
          tipoUsuario:tipoUsuario,
          nameMedicamento: nameMedicamento,
          descripcion:descripcion,
          laboratorio:laboratorio,
          imagenUrl:imagenUrl,
          tipo: tipo,
          cantidadIngesta: cantidadIngesta,
          contenidoActual: contenidoActual,
          frecuenciaDia: frecuenciaDia,
          horas: horas,
          fechaFin: fechaFinLocalDateTime, 
          modo:modo,
          medicamentoId:medicamentoId,
          fechaInicio:fechaInicio
        });
      };

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); 
  
      const fechaValida = fechaFin && fechaFin > tomorrow;


    return(
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={style.screen}>
                {tipoUsuario==="CUIDADOR" ? (
                    <EncabezadoCuidador navigation={navigation}/>
                ) : (
                    <Encabezado navigation={navigation}/>
                )}                   
                <View style={{ flex: 1,marginVertical:10,alignItems:"center",justifyContent:"center"}}>
                    <QuestionContainer text="¿HASTA QUE DÍA QUIERE MANTENER ESTE RECORDATORIO?"/>
                    
                    {fechaFin ? (
                        <View style={style.containerFecha}>
                            <Text style={style.textInstructivo}>Este tratamiento finalizará el día:</Text>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={style.textFecha}>{fechaFin.toLocaleDateString()}</Text>
                                <TouchableOpacity onPress={openTimePicker}>
                                    <Image style={style.buttonEdit} source={require("../../assets/images/EDITAR.png")} />
                                </TouchableOpacity>
                            </View>
                            {!fechaValida && (
                                <Text style={{marginTop:20,textAlign:"justify"}}>¡FECHA INVÁLIDA! La fecha de finalización debe ser posterior al día actual.</Text>
                            )}
                        </View>
                    ) : (
                        <View style={style.containerFecha}>
                            <Text style={style.textInstructivo}>Selecciona la fecha de finalización del tratamiento</Text>
                            <TouchableOpacity onPress={openTimePicker}>
                                <View style={style.buttonSetFecha}>
                                    <Image style={style.imageSetFecha} source={require("../../assets/images/SETFIN.png")} />
                                    <Text style={style.textSetFecha}>SELECCIONAR</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}    

                    <DatePickerModal saveLabel="CONFIRMAR" label="Seleccionar fecha" mode="single" visible={modalVisible} onDismiss={() => setModalVisible(false)}
                    date={fechaFin} onConfirm={({ date }) => {
                        setModalVisible(false);
                        setFechaFin(date);
                    }}/>
                    
                    <AppButton habilitado={fechaValida} theme="blue" text="CONTINUAR" onPress={handleContinuar}/>    
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
    textInstructivo:{
        color:"#474B4E",
        fontSize:19,
        width:Dimensions.get("window").width*0.80,
        textAlign:"center",
        marginBottom:12
    },
    textFecha:{
        color:"#0057CF",
        fontSize:22,
        fontWeight:"bold"
    },
    containerFecha:{
        width:Dimensions.get("window").width*0.85,
        padding:15,
        alignItems:"center",
        justifyContent:"center",
        marginTop:25,
        marginBottom:55
    },
    buttonEdit:{
        resizeMode:"contain",
        width:30,
        height:30,
        marginLeft:15
    },
    buttonSetFecha:{
        paddingHorizontal:20,
        paddingVertical:15,
        backgroundColor:"#0057CF",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        borderRadius:15
    },
    textSetFecha:{
        fontSize:17,
        color:"white"
    },
    imageSetFecha:{
        resizeMode:"contain",
        width:25,
        height:25,
        marginRight:15
    }
})

export default DiaFin