import React,{useContext,useState} from "react";
import { View, Text, StyleSheet,SafeAreaView,FlatList, Image,TouchableOpacity,Alert,Dimensions} from "react-native";
import Encabezado from "../components/Encabezado";
import { HostContext } from "../context/HostContext";
import useAppStore from "../stores/useAppStore";
import BottomBar from "../components/BottomBar";
import LoadingOverlay from '../LoadingOverlay';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EncabezadoCuidador from "../components/EncabezadoCuidador";
import BottomBarCuidador from "../components/BottomBarCuidador";
import Modal from "react-native-modal";
import AppButton from "../components/AppButton.jsx";

const Pendientes = ({navigation}) => {
    
    const host = useContext(HostContext)
    const {jwt,setTomas,tomas,setMedicamentos,tipoUsuario,usuarioId,usuarioCuidadoId} = useAppStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const tomasPendientes = Array.isArray(tomas) ? tomas.filter(toma => toma.estado === "PENDIENTE") : [];

    const getFormattedDay = (date) => {
        const formattedDate = format(date, "EEEE d 'de' MMMM", { locale: es });
        return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    };

    const getFormattedTime = (date) => {
        const formattedDate = format(date, "HH:mm' horas'", { locale: es });
        return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    };

    const registrarToma = async (idToma) => {
          try {
              setIsLoading(true);
              const response = await fetch(host+"/tomas/"+idToma+"/completar", {
                  method: "PUT",
                  headers: {
                    'Authorization': 'Bearer ' + jwt,
                    'Content-Type': 'application/json',
                  },
              });
              const data = await response.json(); 
              if (response.ok) {
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
                }else {
                    alert('Error desconocido: ' + response.status); 
                } 
              }
          } catch (error) {
              console.error("Error:", error);
              Alert.alert("Error", "No se pudo registrar la toma.");
          } finally{
            setIsLoading(false);
          }
      };

      const fetchTomas = async () => {
        console.log("OBTENIENDO TOMAS")
        const idUsuarioEnCuestion=tipoUsuario==="CUIDADOR" ? usuarioCuidadoId : usuarioId
        try {
            setIsLoading(true);          
            const response = await fetch(host+'/tomas/'+idUsuarioEnCuestion, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + jwt,
                'Content-Type': 'application/json',
            }
            });
            const data = await response.json();
            if(response.ok){
                setTomas(data); 
            } else if (response.status==401) {
                Alert.alert("SESIÓN VENCIDA","Ingrese nuevamente")
            } else {
                Alert.alert("ERROR","Error desconocido")
            }
        } catch (error) {
          console.error('Error obteniendo tomas:', error);
        } finally {
          setIsLoading(false);
        }
      };

    return(
        <SafeAreaView style={{flex:1}}>
            <LoadingOverlay isLoading={isLoading} />
            <View style={style.screen}>
                {tipoUsuario==="CUIDADOR" ? (
                    <EncabezadoCuidador navigation={navigation}/>
                ) : (
                    <Encabezado navigation={navigation}/>
                )}
                {tipoUsuario==="CUIDADOR" && tomasPendientes.length==0 ? null : (
                    <View style={style.containerText}>
                        <Text style={style.textTitle}>Tomas pendientes</Text>
                    </View>
                )}
                
                <View style={{flex: 1,width: '100%',justifyContent:"center"}}>
                    {tomasPendientes.length>0 ? (
                        <FlatList
                        data={tomasPendientes}
                        keyExtractor={(item) => item.idToma.toString()}
                        renderItem={({ item }) => 
                            <View style={style.containerPendiente}>
                                <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                                    <View>
                                        <Text style={[style.title,{color:"white",fontSize:28}]}>{item.nameMedicamento}</Text>
                                        <Text style={[style.text,{color:"white"}]}>{getFormattedDay(item.fechaHora)}</Text>
                                        <Text style={[style.text,{color:"white"}]}>{getFormattedTime(item.fechaHora)}</Text>
                                        <Text style={[style.text,{color:"white"}]}>{item.cantidadIngesta} {item.cantidadIngesta === 1 ? item.tipo?.slice(0, -1).toLowerCase() : item.tipo?.toLowerCase() || ""}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                                        <Image style={style.imagePendiente} source={{uri: item.imagenUrl}} />
                                    </TouchableOpacity>                                
                                </View>
                                <TouchableOpacity style={{alignItems:"center"}} onPress={()=>registrarToma(item.idToma)}>
                                    <View style={style.pendienteButton}>
                                        <Image style={style.imageConfirmar} source={require("../../assets/images/CONFIRMAR.png")}/>
                                        <Text style={style.textConfirmar}>Registrar toma</Text>
                                    </View>
                                </TouchableOpacity>

                                <Modal isVisible={modalVisible} onBackdropPress={()=>setModalVisible(false)} style={{ alignItems: "center" }}>
                                    <View style={style.modalContainer}>
                                        <Image style={style.modalImage} source={{uri: item.imagenUrl}} />
                                        <AppButton theme="blue" text="CERRAR" habilitado={true} onPress={()=>setModalVisible(false)}/>
                                    </View>
                                </Modal>
                            </View>
                        }/>
                    ): (
                        <Text style={[style.title,{textAlign:"center"}]}>No hay tomas pendientes</Text>
                    )}  
                    
                </View>
                {tipoUsuario==="CUIDADOR" ? (
                    <BottomBarCuidador navigation={navigation}/>
                ) : (
                    <BottomBar navigation={navigation}/>
                )}
            </View>

        </SafeAreaView>
    )
}

const style=StyleSheet.create({
    screen:{
        justifyContent: "space-around",
        backgroundColor: 'white',
        flex:1
    },
    textTitle:{
        fontSize:26,
        fontWeight:"bold",
        color:"#00008B"
    },
    containerText:{
        paddingHorizontal:15,
        paddingVertical:20,
        borderBottomColor:"#00008B",
        borderBottomWidth:2
    },
    title:{
        fontSize:22,
        fontWeight:"bold",
        marginBottom:5
    },
    text:{
        fontSize:18
    },
    containerPendiente:{
        backgroundColor:"#CF2C1C",
        borderColor:"#FFFFFF",
        borderTopWidth:1,
        borderBottomWidth:1,
        paddingHorizontal:20,
        paddingVertical:15,
    },
    pendienteButton:{
      flexDirection:"row",
      padding:10,
      borderColor:"#0057CF",
      borderWidth:4,
      borderRadius:30,
      backgroundColor:"#F6EFEE",
      marginTop:10,
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
    },
    imagePendiente:{
        resizeMode:"cover",
        width:87,
        height:110,
        borderColor:"white",
        borderWidth:2
    }
})

export default Pendientes