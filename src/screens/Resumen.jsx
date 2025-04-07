import React,{useState,useContext} from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions,ActivityIndicator,Image,Alert} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Encabezado from "../components/Encabezado";
import BottomRegresar from "../components/BottomRegresar";
import { HostContext } from "../context/HostContext.jsx";
import useAppStore from "../stores/useAppStore";
import LoadingOverlay from "../LoadingOverlay";
import Modal from "react-native-modal";
import EncabezadoCuidador from "../components/EncabezadoCuidador.jsx";

const Resumen = ({navigation,route}) => {

    const {tipoUsuario,nameMedicamento,descripcion,laboratorio,imagenUrl,tipo,cantidadIngesta,contenidoActual,frecuenciaDia,horas,fechaFin,modo,medicamentoId,fechaInicio} = route.params;
    const {jwt,usuarioId,usuarioCuidadoId,setTomas,setMedicamentos} = useAppStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [usuarioActualizado, setUsuarioActualizado] = useState(null);
    const host = useContext(HostContext);
    const horariosFormateados = horas.join(' - ');
    
    const fechaFinDate = new Date(fechaFin);
    const fechaFormateada = fechaFinDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
    });

    const obtenerFechaHora = () => {
        const fecha = new Date();
        const offset = -3 * 60; 
        const fechaUTC3 = new Date(fecha.getTime() + offset * 60 * 1000);
        return fechaUTC3.toISOString().slice(0, 19); 
      };
    const fechaHora = obtenerFechaHora();

    const handleCerrarModal=()=>{
        setModalVisible(false);
        if(tipoUsuario==="CUIDADOR"){
            navigation.navigate("VistaCuidador",{usuario:usuarioActualizado});
        } else {
            navigation.navigate("Home");
        }
    }

    const registrarMedicamento = async () => {
        setIsLoading(true);
        const usuarioIdCondicional = tipoUsuario === "CUIDADOR" ? usuarioCuidadoId : usuarioId;

        const medicamento = {
            idUsuario:usuarioIdCondicional,
            nameMedicamento: nameMedicamento,
            descripcion:descripcion,
            laboratorio:laboratorio,
            imagenUrl: imagenUrl,
            tipo: tipo,
            cantidadIngesta: cantidadIngesta,
            contenidoActual: contenidoActual,
            cronograma: {
              frecuenciaDia: frecuenciaDia,
              horas: horas, 
              fechaInicio: fechaHora, 
              fechaFin: fechaFin, 
            },
        };

        try {
          const response = await fetch(host+"/usuarios/"+usuarioIdCondicional+"/medicamentos",
            {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + jwt,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(medicamento),
            }
          );
          const data = await response.json();
          if (response.ok) {
            setUsuarioActualizado(data.usuario);
            setTomas(data.tomas);
            setMedicamentos(data.usuario.medicamentos);
            setIsLoading(false);
            setModalVisible(true);
          } else if (response.status==401) {
            setIsLoading(false);
            Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
          } else {
            setIsLoading(false);
            Alert.alert("ERROR DESCONOCIDO", "No se guardó el medicamento");
          }
        } catch (error) {
            setIsLoading(false);
            console.error('Error al enviar el medicamento:', error);
        }
      };


      const actualizarCronograma = async () => {
        setIsLoading(true);
        const cronograma = {
            frecuenciaDia: frecuenciaDia,
            horas: horas, 
            fechaInicio: fechaInicio, 
            fechaFin: fechaFin,
        };

        try {
            const response = await fetch(host+"/medicamentos/"+medicamentoId+"/cronograma",{
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + jwt,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cronograma),
            });
            const data = await response.json();
            if (response.ok) {
                setMedicamentos(data);
                setIsLoading(false);
                setModalVisible(true);
            } else if (response.status==401) {
                setIsLoading(false);
                Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
            } else {
                setIsLoading(false);
                Alert.alert("Error inesperado", "Ocurrió un error inesperado");
            }          
        } catch (error) {
            setIsLoading(false);
            console.error('Error al actualizar cronograma:', error);
            Alert.alert("Error", "Error de red");
        }
      };


    return(
        <SafeAreaView style={{ flex: 1 }}>
            <LoadingOverlay isLoading={isLoading} />
            <ScrollView contentContainerStyle={style.screen}>
                {tipoUsuario==="CUIDADOR" ? (
                    <EncabezadoCuidador navigation={navigation}/>
                ) : (
                    <Encabezado navigation={navigation}/>
                )}   
                {modo==="REGISTRO" ? (
                    <Text style={[style.textTitle,{fontSize:22,marginTop:12}]}>Resumen</Text>
                ): (
                    <Text style={[style.textTitle,{fontSize:22,marginTop:3}]}>Resumen de actualización</Text>
                )}
                <View style={{flex:1,marginVertical:10,alignItems:"center",justifyContent:"center"}}>
                    
                    <View style={style.container}>
                        <Text style={style.textTitleContainer}>{nameMedicamento}</Text>
                        {laboratorio!=="" ? (
                            <Text style={{fontSize:18}}>Laboratorio {laboratorio}</Text>
                        ) : null}
                        {descripcion!=="" ? (
                            <Text style={{fontSize:16,fontStyle:"italic"}}>{descripcion}</Text>
                        ) : null}
                        <Image style={{resizeMode:"contain",width:Dimensions.get("window").width*0.75,height:Dimensions.get("window").height*0.56}} source={{ uri: imagenUrl }} onLoadStart={() => setIsLoadingImage(true)} onLoadEnd={() => setIsLoadingImage(false)}/>
                        {isLoadingImage ? (
                            <ActivityIndicator size="large" color="#0000ff" style={{}} />
                        ): null}
                        <View style={{alignItems:"flex-start",paddingHorizontal:15}}>
                            <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                <Text style={style.textContainer}>TIPO: {tipo.toLowerCase()}</Text>
                            </View>
                            {tipo==="JARABE" ? (
                                <>
                                    <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                        <Text style={style.textContainer}>DOSIS: {cantidadIngesta} mililitros</Text>
                                    </View>
                                    <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                        <Text style={style.textContainer}>CONTENIDO ACTUAL: {contenidoActual} mililitros</Text>
                                    </View>
                                </>
                            ) : tipo!=="JARABE" && cantidadIngesta==1 ? (
                                <>
                                    <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                        <Text style={style.textContainer}>DOSIS: {cantidadIngesta} {tipo.slice(0,-1).toLowerCase()}</Text>
                                    </View>
                                    <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                        <Text style={style.textContainer}>CONTENIDO ACTUAL: {contenidoActual} {tipo.toLowerCase()}</Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                        <Text style={style.textContainer}>DOSIS: {cantidadIngesta} {tipo.toLowerCase()}</Text>
                                    </View>
                                    <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                        <Text style={style.textContainer}>CONTENIDO ACTUAL: {contenidoActual} {tipo.toLowerCase()}</Text>
                                    </View>
                                </>
                            )}
                            
                            {frecuenciaDia>1 ? (
                                <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                    <Text style={style.textContainer}>FRECUENCIA: Cada {frecuenciaDia} días</Text>
                                </View>
                            ) : (
                                <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                    <Text style={style.textContainer}>FRECUENCIA: Todos los días</Text>
                                </View>
                            )}
                            {horas.length>1 ? (
                                <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                    <Text style={style.textContainer}>HORARIOS: {horariosFormateados}</Text>
                                </View>
                            ) : (
                                <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                    <Text style={style.textContainer}>HORARIO: {horariosFormateados}</Text>
                                </View>
                            )}
                            <View style={{borderTopWidth:1,borderTopColor:"#0057CF"}}>
                                <Text style={style.textContainer}>FINALIZA EL: {fechaFormateada}</Text>
                            </View>
                        </View>
                    </View>
                    {modo==="REGISTRO" ? (
                        <AppButton habilitado={true} theme="blue" text="AGREGAR" onPress={registrarMedicamento}/>
                    ) : (
                        <AppButton habilitado={true} theme="blue" text="ACTUALIZAR" onPress={actualizarCronograma}/>
                    )}
                </View>             
                <BottomRegresar/>

                <Modal isVisible={modalVisible} onBackdropPress={handleCerrarModal} style={{ alignItems: "center" }}>
                    <View style={style.modalContainer}>
                        <Image style={style.modalImage} source={require("../../assets/images/LogoSinLetras.png")} />
                        {modo==="REGISTRO" ? (
                            <Text style={style.modalText}>Se agregó el medicamento</Text>
                        ) : (
                            <Text style={style.modalText}>Se actualizó el calendario</Text>                        
                        )}
                        <AppButton theme="blue" text="CONTINUAR" habilitado={true} onPress={handleCerrarModal}/>
                    </View>
                </Modal>

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
    textTitle:{
        fontSize:32,
        color:"#0057CF",
        marginLeft:30,
        fontWeight:"bold",
        marginTop:20,
        marginBottom:5
    },
    container:{
        alignItems:"center",
        paddingTop:15,
        borderRadius:20,
        borderWidth:2,
        borderColor:"#0057CF",
        width:Dimensions.get("window").width*0.83,
        marginBottom:20
    },
    textTitleContainer:{
        fontSize:26,
        color:"#0057CF",
        fontWeight:"bold",
        paddingVertical:10
    },
    textContainer:{
        fontSize:20,
        color:"black",
        paddingBottom:10,
        width:Dimensions.get("window").width*0.83,
        paddingLeft:18,
        paddingVertical:10,
        paddingRight:8
    },
    modalContainer: { 
        backgroundColor: "white", 
        borderColor: "#0057CF", 
        borderWidth: 5, 
        borderRadius: 25, 
        paddingVertical: 30, 
        alignItems: "center", 
        width: Dimensions.get("window").width*0.9
    },
    modalText: { 
        color: "#0057CF", 
        fontSize: 28, 
        textAlign: "center", 
        fontWeight: "bold", 
        paddingHorizontal: 20, 
        marginVertical: 55 
    },
    modalImage: { 
        resizeMode: "contain",  
        width: 60, 
        height: 60
    }
})

export default Resumen