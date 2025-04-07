import React,{useState,useContext} from "react";
import { View, Text, StyleSheet,SafeAreaView,ScrollView,TouchableOpacity,Image, Dimensions,Alert,ActivityIndicator,Linking} from "react-native";
import Constants from 'expo-constants';
import Encabezado from "../components/Encabezado";
import NumberInput from "../components/NumberInput";
import Modal from "react-native-modal";
import LoadingOverlay from '../LoadingOverlay';
import { HostContext } from "../context/HostContext.jsx";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AppButton from "../components/AppButton";
import useAppStore from "../stores/useAppStore";
import * as Clipboard from 'expo-clipboard';
import EncabezadoCuidador from "../components/EncabezadoCuidador";

const Medicamento = ({navigation,route}) => {
    
    const host = useContext(HostContext);
    const { medicamento } = route.params;
    const [nuevaDosis,setNuevaDosis]=useState(0);
    const [cantidadEnvases,setCantidadEnvases]=useState(0);
    const [contenidoEnvase,setContenidoEnvase]=useState(0);
    const [isOn,setIsOn]=useState(false);
    const [modalReposicionVisible,setModalReposicionVisible]=useState(false);
    const {jwt,setTomas,setMedicamentos,medicamentos,tipoUsuario,usuarioCuidadoId,usuarioId} = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [dosisLocal, setDosisLocal] = useState(medicamento.cantidadIngesta);
    const [isLoadingImage, setIsLoadingImage] = useState(true);

    const copiarAlPortapapeles = async (texto) => {
        await Clipboard.setStringAsync(texto);
        Alert.alert('Medicamento copiado', 'Los datos del medicamento se han copiado al portapapeles.');
    };

    const mensajeParaCopiar = `Solicito receta del siguiente medicamento.\n*Nombre:* ${medicamento.nameMedicamento}\n*Laboratorio:* ${medicamento.laboratorio}\n*Descripción:* ${medicamento.descripcion}\n*Tipo:* ${medicamento.tipo}`;

    const getFormattedTime = (date) => {
        if(medicamento){
            const formattedDate = format(date, "EEEE d 'de' MMMM'", { locale: es }); 
            return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        } else{
            return ""
        }
    };

    const idUsuarioAModificar=tipoUsuario==="CUIDADOR" ? usuarioCuidadoId : usuarioId;

    const actualizarDosis = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(host+"/medicamentos/"+medicamento.medicamentoId+"/dosis?nuevaDosis="+nuevaDosis, {
                method: "PUT",
                headers: {
                    'Authorization': 'Bearer ' + jwt,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json(); 
            if (response.ok) {
                setDosisLocal(nuevaDosis);
                setMedicamentos(data.medicamentos);
                setTomas(data.tomas); 
                setNuevaDosis(0);
                setIsOn(false);
                Alert.alert("EXITO", "Se actualizó la dosis");
            } else if (response.status === 401) {
                setIsOn(false)
                Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
            } else {
                setIsOn(false)
                Alert.alert("Error inesperado", "Ocurrió un error inesperado");
            }
        } catch (error) {
            setIsOn(false)
            Alert.alert("ERROR", "No se pudo actualizar la dosis");
        } finally {
            setIsLoading(false)
        }
    };
 
    const registrarReposicion = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(host+"/medicamentos/"+medicamento.medicamentoId+"/reposicion?cantidad="+(cantidadEnvases*contenidoEnvase), {
                method: "POST",
                headers: {
                    'Authorization': 'Bearer ' + jwt,
                    'Content-Type': 'application/json',
                },
            });
    
            const medicamentoActualizado = await response.json();

            if (response.ok) {
                const nuevosMedicamentos = medicamentos.map((medicamento) => {
                    if (medicamento.medicamentoId === medicamentoActualizado.medicamentoId) {
                        return medicamentoActualizado;
                    }
                    return medicamento;
                });
                setMedicamentos(nuevosMedicamentos);
                console.log("Reposición registrada y estado actualizado:", medicamentos);
                setModalReposicionVisible(false);
                Alert.alert("EXITO", "Se registró la reposición");
                navigation.navigate("Medicamentos")           
            } else if (response.status==401) {
                Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
            } else {
                Alert.alert("Error inesperado", "Ocurrió un error inesperado");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false)
        }
    };
    
    const eliminarMedicamento = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(host+"/usuarios/"+idUsuarioAModificar+"/medicamentos/"+medicamento.medicamentoId, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + jwt,
                    'Content-Type': 'application/json',
                }
            });
      
            if (response.ok) {
                const data = await response.json(); 
                setMedicamentos(data.medicamentos);
                setTomas([]);
                if(tipoUsuario==="CUIDADOR"){
                    navigation.navigate("HomeCuidador")
                } else {
                    navigation.navigate("Home")
                }
                Alert.alert("EXITO", "Medicamento eliminado!");
            } else if (response.status==401) {
                Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
            } else {
                Alert.alert("ERROR", "Error desconocido");
            }
        } catch (error) {
            console.error('Error al eliminar medicamento:', error);
            Alert.alert("ERROR", "Error al eliminar medicamento");
        } finally {
            setIsLoading(false);
        }
      };

    const handleToFrecuenciaDia = () => {
        console.log("IDMEDICAMENTO: "+medicamento.medicamentoId)
        navigation.navigate('FrecuenciaDia', {
          nameMedicamento: medicamento.nameMedicamento,
          laboratorio:medicamento.laboratorio,
          descripcion:medicamento.descripcion,
          imagenUrl:medicamento.imagenUrl,
          tipo: medicamento.tipo,
          cantidadIngesta: medicamento.cantidadIngesta,
          contenidoActual: medicamento.contenidoActual,
          modo:"ACTUALIZACION",
          medicamentoId:medicamento.medicamentoId,
          fechaInicio:medicamento.cronograma.fechaInicio
        });
    };

    return(
        <SafeAreaView style={{flex:1}}>
            <LoadingOverlay isLoading={isLoading}/>

            {medicamento ? (
                <>
                    
                    <ScrollView contentContainerStyle={style.screen}>
                        {tipoUsuario==="CUIDADOR" ? (
                            <EncabezadoCuidador navigation={navigation}/>
                        ) : (
                            <Encabezado navigation={navigation}/>
                        )}
                        <View style={style.container}>
                            <Text style={style.title}>{medicamento.nameMedicamento}</Text>
                            {medicamento.laboratorio!=="" ? (
                                <Text style={{fontSize:18,color:"#0057CF"}}>Laboratorio {medicamento.laboratorio}</Text>
                            ) : null}
                            {medicamento.descripcion!=="" ? (
                                <Text style={{fontSize:15,fontStyle:"italic",color:"#0057CF"}}>{medicamento.descripcion}</Text>
                            ) : null}
                            <Image style={style.imageMedicamento} source={{ uri: medicamento.imagenUrl }} onLoadStart={() => setIsLoadingImage(true)} onLoadEnd={() => setIsLoadingImage(false)}/>
                            {isLoadingImage ? (
                                <ActivityIndicator size="large" color="#0000ff" style={{}} />
                            ): null}
                            <TouchableOpacity onPress={() => Linking.openURL('whatsapp://send?text='+mensajeParaCopiar)}>
                                <View style={{flexDirection:"row",alignItems:"center",marginTop:12,marginBottom:9}}>
                                    <Image style={{width:20,height:20,marginRight:12}} source={require("../../assets/images/SHARE.png")}/>
                                    <Text style={{fontSize:16,color:"#2D2C2C"}}>Solicitar receta</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => copiarAlPortapapeles(mensajeParaCopiar)}>
                                <View style={{flexDirection:"row",alignItems:"center",marginBottom:12}}>
                                    <Image style={{width:20,height:20,marginRight:12}} source={require("../../assets/images/COPY.png")}/>
                                    <Text style={{fontSize:16,color:"#2D2C2C"}}>Copiar datos para receta</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={style.rowButtons}>
                                <TouchableOpacity onPress={handleToFrecuenciaDia}>
                                    <View style={style.button}>
                                        <Image style={style.imageButton} source={require("../../assets/images/ALARMA.png")}/>
                                        <Text style={style.textButton}>EDITAR{"\n"}CALENDARIO</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>setModalReposicionVisible(true)}>
                                    <View style={style.button}>
                                        <Image style={style.imageButton} source={require("../../assets/images/COMPRA.png")}/>
                                        <Text style={style.textButton}>REGISTRAR{"\n"}REPOSICIÓN</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={style.containerInfo}>
                                <Text style={style.subtitle}>Dosis</Text>
                                <View style={style.rowInfo}>
                                    <Image style={style.imageInfo} source={require("../../assets/images/DOSIS.png")}/>
                                    <Text style={[style.textInfo,{width:Dimensions.get("window").width*0.56}]}>{dosisLocal} {dosisLocal===1 ? medicamento.tipo?.slice(0, -1).toLowerCase() : medicamento.tipo?.toLowerCase() || ""}</Text>
                                    <TouchableOpacity onPress={()=>setIsOn(true)}>
                                        <Image style={style.buttonDosis} source={require("../../assets/images/EDITAR.png")}/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={style.containerInfo}>
                                <Text style={style.subtitle}>Calendario</Text>
                                <View style={style.rowInfo}>
                                    <Image style={style.imageInfo} source={require("../../assets/images/RECORDATORIO.png")}/>
                                    <Text style={style.textInfo}>Cada {medicamento.cronograma.frecuenciaDia} {medicamento.cronograma.frecuenciaDia==1 ? "día" : "días"}.{"\n"}A las {medicamento.cronograma.horas.map(hora=>hora.slice(0,5)).join(", ")} hs.{"\n"}Activo hasta el {getFormattedTime(medicamento.cronograma.fechaFin)}.</Text>
                                </View>
                            </View>
                            <View style={style.containerInfo}>
                                <Text style={style.subtitle}>Disponibilidad</Text>
                                <View style={style.rowInfo}>
                                    {medicamento.contenidoActual > 5 ? (
                                        <>
                                            <Image style={style.imageInfo} source={require("../../assets/images/DISPONIBLE.png")}/>
                                            <Text style={style.textInfo}>Quedan {medicamento.contenidoActual} {medicamento.tipo.toLowerCase()}</Text>
                                        </>
                                    ) : 5 > medicamento.contenidoActual && medicamento.contenidoActual > 0 ? (
                                        <>
                                            <Image style={style.imageInfo} source={require("../../assets/images/REPONE.png")}/>
                                            <Text style={style.textInfo}>{medicamento.contenidoActual===1 ? "Queda" : "Quedan"} {medicamento.contenidoActual} {medicamento.contenidoActual===1 ? medicamento.tipo?.slice(0, -1).toLowerCase() : medicamento.tipo?.toLowerCase() || ""}</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Image style={style.imageInfo} source={require("../../assets/images/NODISPONIBLE.png")}/>
                                            <Text style={style.textInfo}>No disponible. Repone!</Text>
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>
                        
                        <View style={{alignItems:"center",marginTop:40}}>
                            <AppButton habilitado={true} theme="red" text="ELIMINAR MEDICAMENTO" onPress={eliminarMedicamento}/>
                        </View>



                        <Modal style={{alignItems:'center'}} isVisible={isOn} onBackdropPress={()=>setIsOn(false)}>
                            <LoadingOverlay isLoading={isLoading}/>
                            <View style={style.modalContainer}>
                                <Text style={[style.modalText,{fontSize:28}]}>Establezca la nueva dosis de {medicamento.nameMedicamento}</Text>
                                <View style={{flexDirection:"row"}}>
                                    <NumberInput valor={nuevaDosis} actualizarCampo={setNuevaDosis}/>
                                    <Text style={[style.modalText,{fontWeight:"300"}]}>{medicamento.tipo.slice(0,-1).toLowerCase()}/s</Text>
                                </View>
                                <View style={style.modalFila}>
                                    <AppButton widthTotal={false} theme="blue" text="GUARDAR" onPress={actualizarDosis} habilitado={nuevaDosis.length>0 && nuevaDosis!==0}/>
                                    <AppButton widthTotal={false} theme="red" text="CANCELAR" onPress={()=>setIsOn(false)} habilitado={true}/>
                                </View>
                            </View>
                        </Modal> 

                        <Modal style={{alignItems:'center'}} isVisible={modalReposicionVisible} onBackdropPress={()=>setModalReposicionVisible(false)}>
                            <LoadingOverlay isLoading={isLoading}/>
                            <View style={style.modalReponerContainer}>
                                {medicamento.tipo==="GOTAS" ? (
                                    <Text style={style.modalReponerText}>¿Cuántos envases compraste?</Text>
                                ) : (
                                    <Text style={style.modalReponerText}>¿Cuántos empaques compraste?</Text>
                                )}
                                <NumberInput valor={cantidadEnvases} actualizarCampo={setCantidadEnvases}/>
                                <Text></Text>
                                {medicamento.tipo==="GOTAS" ? (
                                    <>
                                        <Text style={style.modalReponerText}>Contenido del envase</Text>
                                        <View style={{flexDirection:"row"}}>
                                            <NumberInput valor={contenidoEnvase} actualizarCampo={setContenidoEnvase}/>
                                            <Text style={style.modalReponerText}>gotas</Text>
                                        </View>
                                        <Text style={{marginTop:10,fontSize:15}}>Se estima que 1 GOTA=0,05 mL</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={style.modalReponerText}>Contenido del empaque</Text>
                                        <View style={{flexDirection:"row",alignItems:"center"}}>
                                            <NumberInput valor={contenidoEnvase} actualizarCampo={setContenidoEnvase}/>
                                            <Text style={[style.modalReponerText,{fontSize:22,fontWeight:"200"}]}>{medicamento.tipo==="JARABE" ? "mililitros" : medicamento.tipo.toLowerCase()}</Text>
                                        </View>
                                    </>
                                )}
                                <Text></Text>
                                <Text></Text>
                                <View>
                                    <AppButton widthTotal={false} theme="blue" text="CONFIRMAR" onPress={registrarReposicion} habilitado={cantidadEnvases>0 && contenidoEnvase>0}/>
                                    <AppButton widthTotal={false} theme="red" text="CANCELAR" onPress={()=>setModalReposicionVisible(false)} habilitado={true}/>
                                </View>
                            </View>
                        </Modal> 

                    </ScrollView>
                </>
            ) : (
                <LoadingOverlay isLoading={!medicamento}/>
            )}
        </SafeAreaView>
    )
}

const style=StyleSheet.create({
    screen:{
        justifyContent: "space-around",
        backgroundColor: 'white',
        paddingBottom: Constants.statusBarHeight*0.6,
        flexGrow:1
    },
    title:{
        fontSize:42,
        fontWeight:"bold",
        color:"#black",
        marginTop:8
    },
    container:{
        justifyContent:"space-around",
        alignItems:"center",
        flex:1,
    },
    rowButtons:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        width:Dimensions.get("window").width*0.88,
        marginVertical:10
    },
    button:{
        backgroundColor:"#0057CF",
        borderRadius:25,
        paddingHorizontal:10,
        paddingVertical:11,
        justifyContent:"center",
        alignItems:"center",
        width:Dimensions.get("window").width*0.41
    },
    textButton:{
        color:"white",
        fontSize:14,
        textAlign:"center",
        marginTop:10,
        fontWeight:"bold"
    },
    imageButton:{
        resizeMode:"contain",
        width:30,
        height:30,
        marginBottom:1
    },
    containerInfo:{
        marginVertical:5,
        alignItems:"flex-start",
        width:Dimensions.get("window").width*0.86,
        padding:10
    },
    subtitle:{
        color:"#332f2c",
        fontSize:23,
        fontWeight:"bold",
        marginBottom:10
    },
    rowInfo:{
        flexDirection:"row",
        alignItems:"center"
    },
    imageInfo:{
        resizeMode:"contain",
        width:30,
        height:30,
        marginRight:15
    },
    buttonDosis:{
        resizeMode:"contain",
        width:37,
        height:37
    },
    textInfo:{
        color:"#0057CF",
        fontSize:20,
        textAlign:"left",
        width:Dimensions.get("window").width*0.7
    },
    modalContainer:{
        borderColor:"#0057CF",
        borderWidth:3,
        borderRadius:15,
        justifyContent:"space-around",
        alignItems:"center",
        width:Dimensions.get("window").width*0.94,
        height:Dimensions.get("window").height*0.7,
        backgroundColor:"white",
        padding:10
    },
    modalText:{
        color:"#0057CF",
        fontWeight:"bold",
        fontSize:26,
        textAlign:"center",
        margin:15
    },
    modalTextInput:{
        borderColor:"black",
        borderRadius:10,
        borderWidth:3,
        padding:10,
        fontSize:24,
        width:"30%",
        textAlign:"center"
    },
    imageMedicamento:{
        resizeMode:"contain",
        width:Dimensions.get("window").width*0.6,
        height:Dimensions.get("window").height*0.4,
        borderWidth:2,
        backgroundColor:"black",
        borderRadius:20,
        marginVertical:10
    },
    modalReponerContainer:{
        borderColor:"#0057CF",
        borderWidth:3,
        borderRadius:15,
        justifyContent:"space-around",
        alignItems:"center",
        width:Dimensions.get("window").width*0.94,
        backgroundColor:"white",
        paddingVertical:20,
        paddingHorizontal:10
    },
    modalReponerText:{
        color:"#0057CF",
        fontWeight:"bold",
        fontSize:25,
        textAlign:"center",
        margin:10
    }
})

export default Medicamento