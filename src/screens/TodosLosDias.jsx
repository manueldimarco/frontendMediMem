import React,{useEffect,useState,useContext} from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions, Image, TouchableOpacity} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import NumberInput from "../components/NumberInput.jsx";
import QuestionContainer from "../components/QuestionContainer.jsx";
import Encabezado from "../components/Encabezado";
import BottomRegresar from "../components/BottomRegresar";
import { TimePickerModal } from 'react-native-paper-dates';
import EncabezadoCuidador from "../components/EncabezadoCuidador.jsx";

const TodosLosDias = ({navigation,route}) => {

    const {tipoUsuario,nameMedicamento,descripcion,laboratorio,imagenUrl,tipo,cantidadIngesta,contenidoActual,modo,medicamentoId,fechaInicio} = route.params;
    const [horas,setHoras]=useState([])
    const [veces,setVeces]=useState(0)
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTimeIndex, setSelectedTimeIndex] = useState(null);
    const [todasHorasSeleccionadas, setTodasHorasSeleccionadas] = useState(false);

    useEffect(() => {
        setHoras(prevHoras => {
            if (prevHoras.length === veces) return prevHoras;
            return Array.from({ length: veces }, () => null);
        });
    }, [veces]);
    
    const handleHoraChange = (index, newTime) => {
        setHoras(prevHoras => {
          console.log("Antes de actualizar:", JSON.stringify(prevHoras));     
          const updatedHoras = [...prevHoras]; 
          updatedHoras[index] = { hours: newTime.hours, minutes: newTime.minutes }; 
          console.log("Después de actualizar:", JSON.stringify(updatedHoras));
          return updatedHoras;
        });
        setModalVisible(false);
        setSelectedTimeIndex(null);
      };

    const openTimePicker = (index) => {
        setSelectedTimeIndex(index);
        setModalVisible(true);
    };

    useEffect(() => {
        setTodasHorasSeleccionadas(horas.every(h => h !== null) && veces>0);
    }, [horas,veces]);
    
    const convertHorasToLocalTime = (horas) => {
        return horas.map(hora => {
          const horasString = String(hora.hours).padStart(2, '0');
          const minutosString = String(hora.minutes).padStart(2, '0');
          return `${horasString}:${minutosString}`;
        });
    };

    const handleContinuar = () => {
        const horasLocalTime = convertHorasToLocalTime(horas); 
        navigation.navigate('DiaFin', {
          tipoUsuario:tipoUsuario,
          nameMedicamento: nameMedicamento,
          descripcion:descripcion,
          laboratorio:laboratorio,
          imagenUrl:imagenUrl,
          tipo: tipo,
          cantidadIngesta: cantidadIngesta,
          contenidoActual: contenidoActual,
          frecuenciaDia: 1,
          horas: horasLocalTime,
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
                <View style={{ flex: 1,marginTop:20,alignItems:"center",justifyContent:"center"}}>
                    <QuestionContainer text="¿CUÁNTAS VECES AL DÍA?"/>
                    <Text></Text>
                    <View style={{flexDirection:"row",alignItems:"center"}}>
                        <NumberInput valor={veces} actualizarCampo={setVeces}/>
                        <Text style={style.text}> por día</Text>
                    </View> 
                    <Text></Text>
                    {veces == 1 ? (
                        <Text style={style.textInstructivo}>Elige la hora de la toma</Text>
                    ) : veces > 1 ? (
                        <Text style={style.textInstructivo}>Elige las horas de las tomas</Text>
                    ) : null}
                    <View style={style.viewTomas}>
                        {horas.map((hora, index) => (
                            <View key={index} style={style.viewToma}>
                                <Text style={style.textTomas}>Toma {index+1}</Text> 
                                {hora ? (
                                    <View style={{flexDirection:"row",alignItems:"center"}}>
                                        <Text style={style.textHora}>{hora.hours.toString().padStart(2, '0')}:{hora.minutes.toString().padStart(2, '0')} hs</Text>
                                        <TouchableOpacity onPress={() => openTimePicker(index)}>
                                            <Image style={style.buttonEdit} source={require("../../assets/images/EDITAR.png")}/>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity onPress={() => openTimePicker(index)}>
                                        <View style={style.buttonSetAlarma}>
                                            <Image style={style.imageSetAlarma} source={require("../../assets/images/SETALARMA.png")}/>
                                            <Text style={style.textSetAlarma}>SELECCIONAR</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}

                                
                            </View>
                        ))}
                    </View>
                    <TimePickerModal visible={modalVisible} onDismiss={() => setModalVisible(false)}
                        onConfirm={(params) => {
                            if (selectedTimeIndex !== null) {
                                handleHoraChange(selectedTimeIndex, params);
                            }
                        }}
                        hours={selectedTimeIndex !== null ? horas[selectedTimeIndex]?.hours || 12 : 12}
                        minutes={selectedTimeIndex !== null ? horas[selectedTimeIndex]?.minutes || 0 : 0}
                        label="Seleccionar hora" cancelLabel="Cancelar" confirmLabel="Confirmar" use24HourClock
                    />
                    <Text></Text>
                    <AppButton habilitado={todasHorasSeleccionadas} theme="blue" text="CONTINUAR" onPress={handleContinuar}/>    
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
        color:"grey",
        fontSize:17,
        marginBottom:8,
        width:Dimensions.get("window").width*0.95,
        textAlign:"center"
    },
    viewTomas:{
        width:Dimensions.get("window").width,
        alignItems:"flex-start"
    },
    viewToma:{
        borderTopColor:"grey",
        borderTopWidth:1,
        width:Dimensions.get("window").width,
        paddingHorizontal:20,
        paddingTop:12,
        paddingBottom:18,
    },
    textTomas:{
        color:"black",
        fontSize:20,
        fontWeight:"bold",
        marginBottom:7
    },
    textHora:{
        color:"#0057CF",
        fontSize:22,
        fontWeight:"bold"
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
        borderRadius:15,
        width:"68%"
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

export default TodosLosDias