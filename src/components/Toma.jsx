import React,{useContext,useState} from "react";
import {View,StyleSheet,Text,Image, TouchableOpacity,Alert,Dimensions} from "react-native";
import { format } from 'date-fns';
import { HostContext } from "../context/HostContext";
import useAppStore from "../stores/useAppStore";
import Modal from "react-native-modal";
import AppButton from "../components/AppButton.jsx";

const Toma=(props)=>{
    
    const host = useContext(HostContext)
    const setTomas = useAppStore((state) => state.setTomas);
    const setMedicamentos = useAppStore((state) => state.setMedicamentos);
    const usuarioId = useAppStore((state) => state.usuarioId);
    const jwt = useAppStore((state) => state.jwt);
    const tipoUsuario = useAppStore((state) => state.tipoUsuario);
    const usuarioCuidadoId = useAppStore((state) => state.usuarioCuidadoId);
    const [modalVisible, setModalVisible] = useState(false);

    const getFormattedTime = (date) => {
      return format(date, 'HH:mm');
    };

    const registrarToma = async () => {
      try {
          props.setIsLoading(true);
          const response = await fetch(host+"/tomas/"+props.toma.idToma+"/completar", {
              method: "PUT",
              headers: { 
                'Authorization': 'Bearer ' + jwt,
                "Content-Type": "application/json",
              },
          });
          if (response.ok) {
            const data = await response.json(); 
            setTomas(data.tomas); 
            setMedicamentos(data.medicamentos);
            Alert.alert("Éxito", "Toma registrada y medicamento actualizado.");
          } else {
            const errorData = await response.json();
            if (response.status === 400) {
                alert("¡CONTENIDO INSUFICIENTE! Repone medicamento y registra la compra en la app."); 
                fetchTomas();
            } else if (response.status === 404) {
                alert('Toma no encontrada.'); 
            } else if (response.status === 401) {
                Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
            } else if (response.status === 500) {
                Alert.alert("Error del servidor", data.mensaje || "Error interno del servidor");
            }  else {
                alert('Error desconocido: ' + response.status); 
            }
          }
      } catch (error) {
          console.error("Error:", error);
          Alert.alert("Error", "No se pudo registrar la toma.");
      } finally{
        props.setIsLoading(false);
      }
  };

  const fetchTomas = async () => {
    console.log("OBTENIENDO TOMAS")
    const idUsuarioEnCuestion=tipoUsuario==="CUIDADOR" ? usuarioCuidadoId : usuarioId
    try {
      props.setIsLoading(true);
      const response = await fetch(host+'/tomas/'+idUsuarioEnCuestion); 
      const data = await response.json();
      setTomas(data); 
    } catch (error) {
      console.error('Error obteniendo tomas:', error);
    } finally {
      props.setIsLoading(false);
    }
  };

    return (
        <>
          {props.toma.estado === "FUTURA" ? (
            <View style={style.containerFutura}>
                <View>
                    <Text style={style.title}>{props.toma.nameMedicamento}</Text>
                    {props.toma.tipo==="JARABE" ? (
                      <Text style={style.text}>{props.toma.cantidadIngesta} mililitros (ml)</Text>
                    ) : (
                      <Text style={style.text}>{props.toma.cantidadIngesta} {props.toma.cantidadIngesta === 1 ? props.toma.tipo?.slice(0, -1).toLowerCase() : props.toma.tipo?.toLowerCase() || ""}</Text>
                    )}
                </View>
                <View style={{alignItems:"center"}}>
                    <Image style={style.reloj} source={require("../../assets/images/relojNegro.png")}/>
                    <Text style={style.text}>{getFormattedTime(props.toma.fechaHora)}</Text>
                </View>
            </View>
          ) : props.toma.estado === "COMPLETA" ? (
            <View style={style.containerCompleta}>
              <View>
                  <Text style={style.title}>{props.toma.nameMedicamento}</Text>
                  {props.toma.tipo==="JARABE" ? (
                    <Text style={style.text}>{getFormattedTime(props.toma.fechaHora)}, {props.toma.cantidadIngesta} mililitros(ml)</Text>
                  ) : (
                      <Text style={style.text}>{getFormattedTime(props.toma.fechaHora)}, {props.toma.cantidadIngesta} {props.toma.cantidadIngesta === 1 ? props.toma.tipo?.slice(0, -1).toLowerCase() : props.toma.tipo?.toLowerCase() || ""}</Text>
                  )}
              </View>
              <Image style={style.imageCompleta} source={require("../../assets/images/COMPLETA.png")}/>
            </View>
          ) : (
            <View style={style.containerPendiente}>
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                <View>
                    <Text style={[style.title,{color:"white"}]}>{props.toma.nameMedicamento}</Text>
                    {props.toma.tipo==="JARABE" ? (
                      <Text style={style.text}>{getFormattedTime(props.toma.fechaHora)}, {props.toma.cantidadIngesta} mililitros(ml)</Text>
                    ) : (
                      <Text style={[style.text,{color:"white"}]}>{getFormattedTime(props.toma.fechaHora)}, {props.toma.cantidadIngesta} {props.toma.cantidadIngesta === 1 ? props.toma.tipo?.slice(0, -1).toLowerCase() : props.toma.tipo?.toLowerCase() || ""}</Text>
                    )}
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Image style={style.imagePendiente} source={{uri: props.toma.imagenUrl}} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{alignItems:"center"}} onPress={registrarToma}>
                <View style={style.pendienteButton}>
                  <Image style={style.imageConfirmar} source={require("../../assets/images/CONFIRMAR.png")}/>
                  <Text style={style.textConfirmar}>Registrar toma</Text>
                </View>
              </TouchableOpacity>

              <Modal isVisible={modalVisible} onBackdropPress={()=>setModalVisible(false)} style={{ alignItems: "center" }}>
                  <View style={style.modalContainer}>
                      <Image style={style.modalImage} source={{uri: props.toma.imagenUrl}} />
                      <AppButton theme="blue" text="CERRAR" habilitado={true} onPress={()=>setModalVisible(false)}/>
                  </View>
              </Modal>

            </View>
          )}
        </>
      );
}

export default Toma

const style=StyleSheet.create({
    containerFutura:{
        backgroundColor:"white",
        borderColor:"#808080",
        paddingHorizontal:20,
        paddingVertical:15,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        borderWidth:1
    },
    title:{
        fontSize:20,
        fontWeight:"bold",
        marginBottom:10
    },
    text:{
        fontSize:18
    },
    containerPendiente:{
        backgroundColor:"#CF2C1C",
        borderColor:"#808080",
        borderWidth:1,
        paddingHorizontal:20,
        paddingVertical:15,
    },
    containerCompleta:{
        backgroundColor:"#88FFA2",
        borderColor:"#808080",
        borderWidth:1,
        paddingHorizontal:20,
        paddingVertical:15,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center"
    },
    reloj:{
        resizeMode:"contain",
        width:30,
        height:30,
        marginBottom:4
    },
    imageCompleta:{
        resizeMode:"contain",
        width:40,
        height:40
    },
    imagePendiente:{
        resizeMode:"cover",
        width:65,
        height:80,
        borderColor:"white",
        borderWidth:2
    },
    pendienteButton:{
      flexDirection:"row",
      padding:10,
      borderColor:"#0057CF",
      borderWidth:4,
      borderRadius:30,
      backgroundColor:"#F6EFEE",
      marginTop:15,
      alignItems:"center",
      justifyContent:"center",
      width:"70%"
    },
    imageConfirmar:{
      resizeMode:"contain",
      width:20,
      height:20,
      marginRight:15
    },
    textConfirmar:{
      color:"#0057CF",
      fontSize:19,
      fontWeight:"bold"
    },
    modalContainer: { 
        alignItems: "center", 
        width: Dimensions.get("window").width*0.9
    },
    modalImage: { 
      width: 300,
      height: 400,
      resizeMode: "contain",
      borderRadius:20,
      borderColor:"white",
      borderWidth:3
    }
})