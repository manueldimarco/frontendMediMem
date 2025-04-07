import React, { useEffect, useContext,useMemo,useState } from "react";
import {View,Text,SafeAreaView,ScrollView,StyleSheet,Dimensions,Image,TouchableOpacity,Linking,RefreshControl,Alert,BackHandler} from "react-native";
import Encabezado from "../components/Encabezado";
import Constants from "expo-constants";
import BottomBar from "../components/BottomBar";
import AppButton from "../components/AppButton.jsx";
import useAppStore from "../stores/useAppStore";
import { HostContext } from "../context/HostContext.jsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import LoadingOverlay from '../LoadingOverlay';
import Modal from "react-native-modal";
import Swiper from "react-native-swiper";

const Home = ({ navigation }) => {
  
  const {jwt,tomas,setTomas,setMedicamentos,setCuidadorData,clearCuidadorData,usuarioId,name,username,fotoUrl,medicamentos,usernameCuidador,nameCuidador,fotoUrlCuidador,telefonoCuidador,setTokenExpoCuidador,tipoUsuario} = useAppStore();
  const host = useContext(HostContext);
  const [isLoading, setIsLoading] = useState(false);

  const formatearHora = (fechaHora) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const fetchTomas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(host+'/tomas/'+usuarioId, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + jwt,
            'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTomas(data); 
        console.log("Tomas:"+data);
      } else if (response.status === 401) {
        Alert.alert("SESIÓN VENCIDA", data.mensaje || "Inicia sesión nuevamente");
      } else {
          Alert.alert("Error inesperado", "Ocurrió un error inesperado");
      }
    } catch (error) {
      console.error('Error obteniendo tomas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsuario= async () => {
      try {
        const response = await fetch(host+'/usuarios/'+usuarioId, {
          method: 'GET',
          headers: {
              'Authorization': 'Bearer ' + jwt,
              'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMedicamentos(data.medicamentos); 
          if(data.usuariosAsociados && data.usuariosAsociados.length>0){
            setCuidadorData({
              fotoUrlCuidador:data.usuariosAsociados[0].fotoUrl,
              nameCuidador:data.usuariosAsociados[0].name,
              usernameCuidador:data.usuariosAsociados[0].username,
              telefonoCuidador:data.usuariosAsociados[0].telefono,
              usuarioCuidadorId:data.usuariosAsociados[0].usuarioId
            })
          } else {
            clearCuidadorData()
          }
        } else if (response.status === 401) {
          Alert.alert("SESIÓN VENCIDA", data.mensaje || "Inicia sesión nuevamente");
        } else {
          Alert.alert("Error inesperado", "Ocurrió un error inesperado");
        }
      } catch (error) {
        console.error('Error obteniendo usuario:', error);
        Alert.alert('Error', "Error obteniendo usuario.");
      } 
    };

  const registrarToma = async (idToma) => {
        try {
            setIsLoading(true);
            const response = await fetch(host+"/tomas/"+idToma+"/completar", {
                method: "PUT",
                headers: {
                  'Authorization': 'Bearer ' + jwt,
                  'Content-Type': 'application/json',
                }
            });
            const data = await response.json(); 
            if (response.ok) {
              setTomas(data.tomas); 
              setMedicamentos(data.medicamentos);
              Alert.alert("Éxito", "Toma registrada y contenido actualizado.");
            } else {
              if (response.status === 400) {
                Alert.alert("¡CONTENIDO INSUFICIENTE!", "Para poder registrar la toma, repone medicamento y registra la compra en la app.");
                fetchTomas();
              } else if (response.status === 401) {
                Alert.alert("SESIÓN VENCIDA", data.mensaje || "Inicia sesión nuevamente");
              } else if (response.status === 404) {
                alert('Toma no encontrada.'); 
              } else {
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

  const postergarToma = async (idToma) => {
    try {
        setIsLoading(true);
        const response = await fetch(host+"/tomas/"+idToma+"/postergarToma", {
            method: "PUT",
            headers: {
              'Authorization': 'Bearer ' + jwt,
              'Content-Type': 'application/json',
            }
        });
        const data = await response.json(); 
        if (response.ok) {
          setTomas(data); 
          Alert.alert("Éxito", "Toma postergada.");
        } else if (response.status === 401) {
          Alert.alert("SESIÓN VENCIDA", data.mensaje || "Inicia sesión nuevamente");
        } else {
          const errorData = await response.json();
          throw new Error("No se pudo postergar la toma.");
        }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", error.message);
    } finally{
      setIsLoading(false);
    }
  };

  const iniciarChat = async () => {
    try {
        const response = await fetch(host+"/usuarios/iniciarChat/"+usuarioId, {
          method: "POST",
          headers: {
            'Authorization': 'Bearer ' +jwt,
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const tokenCuidador = await response.text(); 
          setTokenExpoCuidador(tokenCuidador);
          navigation.navigate("ChatUsuario");
        } else if(response.status==401){
          const error = await response.text(); 
          Alert.alert("SESIÓN VENCIDA", error || "Inicia sesión nuevamente");
        } else if (response.status === 404) {
          const error = await response.text(); 
          Alert.alert("ERROR", error || "Cuidador no logueado");
        } else {
          Alert.alert("Error inesperado", "Ocurrió un error inesperado");
        }
      } catch (error) {
        Alert.alert('Error', "Error inesperado.");
      } 
  };

useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', function() {return true})
    return () => BackHandler.removeEventListener; 
  }, []);

  useEffect(() => {
    fetchTomas(); 
  }, []);

  const pendientes = useMemo(() => {
    if(!tomas || tomas.length==0){
      return []
    } else{
      return tomas.filter(toma => toma.estado === "PENDIENTE");
    }
  }, [tomas]);

  const tomasAhora = useMemo(() => {
    if(!tomas || tomas.length==0){
      return []
    } else{
      return tomas.filter(toma => toma.estado === "AHORA");
    }
  }, [tomas]);

  const proximaToma = useMemo(() => {
    if(!tomas || tomas.length==0){
      return null
    } else{
      return tomas
      .filter((toma) => toma.estado === "FUTURA")
      .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))[0]; 
    }
  }, [tomas]);

  const fechaFormateada = useMemo(() => {
    if (!proximaToma) return "No hay próximas tomas";
    const fecha=format(new Date(proximaToma.fechaHora), "EEEE d 'de' MMMM'\n'HH:mm 'horas'", { locale: es });
    const fechaConDiaCapitalizado = fecha.charAt(0).toUpperCase() + fecha.slice(1);
    return fechaConDiaCapitalizado;
  }, [proximaToma]);

  const alertasDeReposición = useMemo(() => {
    if(medicamentos){
      return medicamentos.filter(medicamento => medicamento.contenidoActual <=5);
    }
  }, [medicamentos]);

  return (
    <SafeAreaView style={{ flex: 1, flexGrow: 1 }}>
      <LoadingOverlay isLoading={isLoading} />

      <ScrollView refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => { 
            setIsLoading(true);
            fetchUsuario();
            fetchTomas();
          }} />
        } contentContainerStyle={style.screen}>
        <Encabezado navigation={navigation} blue={true}/>
        <View style={{alignItems:"center"}}>
          <View style={style.ondaBlue}></View>
          <View style={style.tarjeta}>
            <Image style={style.fotoPerfil} source={{uri:fotoUrl}}/>
            <View>
              <Text style={style.textName}>{name}</Text>
              <Text style={style.textUsername}>{username}</Text>
            </View>
          </View>
        </View>

        {medicamentos === null || medicamentos.length === 0 ? (
          <View style={{ flex: 1,marginVertical:20}}>
            <View style={{ flex: 1,alignItems:"center",justifyContent:"center"}}>  
              <Text style={{padding:10,fontSize:18,textAlign:"justify",marginBottom:20,width:"90%"}}>Registrá los medicamentos que debes consumir.{'\n'}Te ayudaremos a recordar cuándo tomarlo, la dosis a tomar y cuándo necesitas reponer.</Text>
              <AppButton text="AGREGAR MEDICAMENTO" theme="blue" onPress={()=>navigation.navigate("NameMedicamento",{tipoUsuario:tipoUsuario})} habilitado={true}/>
            </View>
          </View>
        ) : (
          <>
              {pendientes.length === 0 ? (
                <View style={{ marginVertical:10}}>
                  <View style={style.cartelAlDia}>
                    <Text style={style.textAlDia}>Estás al día con las tomas</Text>
                    <Image style={style.imageAldia} source={require("../../assets/images/alDia.png")}/>
                  </View>
                </View>
              ) : (
                <View style={{ marginVertical:10}}>
                  <View style={style.cartelAdeudaIngesta}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16}}>
                      <Text style={style.textTomasPendientes}>Tienes tomas pendientes</Text>
                      <Image style={style.imagePendiente} source={require("../../assets/images/adeudaIngesta.png")} />
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate("Pendientes")}>
                      <View style={style.botonPendientes}>
                        <Text style={style.textPendientes}>Ver tomas pendientes</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {proximaToma ? (
                <View style={{ marginVertical:7}}>
                  <Text style={[style.textSubtitle,{fontSize:23,fontWeight:"400",marginBottom:8}]}>Próxima toma</Text>

                  <View style={style.proximaIngesta}>
                    <View style={{width:"70%"}}>
                      <Text style={style.textNameMedicamento}>{proximaToma ? proximaToma.nameMedicamento : "Cargando medicamento..."}</Text>
                      <Text style={style.textFechaHora}>{fechaFormateada}</Text>
                    </View>
                    <Image style={style.imageProximaToma} source={{uri:proximaToma.imagenUrl}}/>

                  </View>

                </View>
              ) : (
                <View style={{ marginVertical:5}}>
                  <Text style={[style.textSubtitle,{fontSize:23,fontWeight:"400",marginBottom:10}]}>Próxima toma</Text>
                  <View style={style.proximaIngesta}>
                    <Text style={style.textSinProximas}>No hay próximas tomas esta semana</Text>
                  </View>
                </View>
              )}
              {alertasDeReposición.length>0 ? (
                <View style={{ marginTop:10}}>
                  <Text style={[style.textSubtitle,{fontSize:23,fontWeight:"400",marginBottom:4}]}>Debes reponer</Text>
                  <ScrollView horizontal={true} showsHorizontalScrollIndicator={true} style={style.horizontalScroll}>
                    {alertasDeReposición.map((item) => (
                      <View key={item.medicamentoId} style={style.containerAlerta}>
                          <Text style={style.textAlerta}>{item.nameMedicamento}</Text>
                          <View style={style.rowAlerta}>
                            <Image style={style.imageAlerta} source={require("../../assets/images/PENDIENTES.png")}/>
                            <Text style={style.textRestantes}>{item.contenidoActual===1 ? "Queda" : "Quedan"} {item.contenidoActual} {item.contenidoActual===1 ? item.tipo?.slice(0, -1).toLowerCase() : item.tipo?.toLowerCase() || ""}</Text>
                          </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
              
          </>
        )}
        {usernameCuidador!=="" ? (
                <View style={{marginVertical:10}}>
                  <Text style={[style.textSubtitle,{fontSize:23,fontWeight:"400",marginBottom:12}]}>Te cuida</Text>
                  <View style={style.cuidadorContainer}>
                    <View style={{flexDirection:"row",alignItems:"center"}}>
                      <Image style={style.fotoCuidador} source={{uri:fotoUrlCuidador}}/>
                      <View>
                        <Text style={style.textNamecuidador}>{nameCuidador}</Text>
                        <Text style={style.textUsernameCuidador}>{usernameCuidador}</Text>
                      </View>
                    </View>
                    <View style={{flexDirection:"row",marginTop:12,alignItems:"center",justifyContent:"center"}}>
                        <TouchableOpacity onPress={()=>iniciarChat()}>
                            <Image style={style.fotoButton} source={require("../../assets/images/CHATEAR.png")}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>Linking.openURL('whatsapp://send?phone='+telefonoCuidador)}>
                            <Image style={style.fotoButton} source={require("../../assets/images/BOTONWP.png")}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>Linking.openURL("tel:"+telefonoCuidador)}>
                            <Image style={style.fotoButton} source={require("../../assets/images/BOTONLLAMAR.png")}/>
                        </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : null}
      </ScrollView>
      <BottomBar navigation={navigation} />

      <Modal isVisible={tomasAhora.length>0} style={{justifyContent:"center",flex:1}} backdropOpacity={0.43}>
          <LoadingOverlay isLoading={isLoading} />
          <Swiper loop={false} showsPagination={true} showsButtons={true}>
            {tomasAhora.map((toma) => (
              <View key={toma.idToma} style={style.containerAhora}>
                <Text style={style.textEsHora}>{name}, es hora de tomar la medicación!</Text>
                <View style={{alignItems:"center"}}>
                  <Image style={style.imageMedicamento} source={{uri:toma.imagenUrl}} />
                  <Text style={style.titleTomaAhora}>{toma.nameMedicamento}</Text>
                  {toma.tipo==="JARABE" ? (
                    <Text style={style.bodyTomaAhora}>{formatearHora(toma.fechaHora)} hs, {toma.cantidadIngesta} mls</Text>
                  ) : (
                    <Text style={style.bodyTomaAhora}>{formatearHora(toma.fechaHora)} hs, {toma.cantidadIngesta} {toma.cantidadIngesta>1 ? toma.tipo.toLowerCase() : toma.tipo.slice(0,-1).toLowerCase()}</Text>
                  )}
                </View>
                <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
                  <TouchableOpacity onPress={()=>registrarToma(toma.idToma)}>
                    <View style={[style.containerDedo,{backgroundColor:"green"}]}>
                      <Image style={style.imageDedo} source={require("../../assets/images/DEDOARRIBA.png")} />
                      <Text style={style.textDedo}>Medicación tomada</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>postergarToma(toma.idToma)}>
                    <View style={[style.containerDedo,{backgroundColor:"red"}]}>
                      <Image style={style.imageDedo} source={require("../../assets/images/DEDOABAJO.png")} />
                      <Text style={style.textDedo}>La tomaré más tarde</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Swiper>
      </Modal>

    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  screen: {
    flexGrow: 1,
    justifyContent: "space-around",
    backgroundColor: "white",
    paddingBottom: Constants.statusBarHeight*0.6,
  },
  tarjeta:{
    backgroundColor:"#F2F2F2",
    borderColor:"#0057CF",
    borderWidth:2,
    borderRadius:40,
    paddingHorizontal:15,
    paddingVertical:19,
    flexDirection:"row",
    alignItems:"center",
    width:Dimensions.get("window").width*0.9,
    marginTop:-73,
    marginBottom:15
  },
  fotoPerfil:{
    width:80,
    height:80,
    resizeMode:"cover",
    marginRight:15,
    borderRadius:45,
    borderWidth:1,
    borderColor:"white"
  },
  textName:{
    fontSize:21,
    color:"#0057CF",
    fontWeight:"bold",
    marginBottom:5,
    width:Dimensions.get("window").width*0.51,
  },
  textUsername:{
    fontSize:22,
    color:"black",
    fontStyle:"italic"
  },
  ondaBlue:{
    backgroundColor:"#0057CF",
    width:Dimensions.get("window").width,
    height:95,
    borderBottomLeftRadius:30,
    borderBottomRightRadius:30
  },
  cartelAlDia: {
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal:3,
    marginHorizontal: 15,
    marginBottom:8,
    backgroundColor: "#7FFF9B",
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 7,
  },
  imageAldia:{
    resizeMode:"contain",
    width:50,
    height:50
  },
  imagePendiente:{
    resizeMode: "contain",
    width:50,
    height:50,
    marginLeft:10
  },
  textSinProximas:{
    fontSize: 23,
    fontWeight: "bold",
    color:"white",
    width:"80%",
    textAlign:"center"
  },
  cartelAdeudaIngesta: {
    borderRadius: 20,
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 15,
    marginTop:4,
    marginBottom:10,
    padding:15,
    backgroundColor: "#FF5050",
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 7,
  },
  textTomasPendientes: {
    fontSize: 23,
    fontWeight: "bold",
    marginRight:20,
    paddingLeft:10
  },
  textAlDia:{
    fontSize: 24,
    fontWeight: "bold",
    marginRight:20,
    width:"65%"
  },
  botonPendientes: {
    borderColor: "#0057CF",
    borderRadius: 15,
    borderWidth: 3,
    padding: 10,
    backgroundColor: "white",
  },
  textPendientes: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0057CF",
  },
  fecha: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#303030",
  },
  subtitulo: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#303030",
    marginLeft: 15,
    marginTop: 17,
  },
  proximaIngesta: {
    flexDirection:"row",
    borderRadius: 19,
    alignItems: "center",
    justifyContent:"space-between",
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginVertical: 5,
    marginHorizontal:10,
    backgroundColor: "#0057CF",
  },
  medicamento: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  textSubtitle:{
    fontSize: 24,
    fontWeight: "bold",
    color: "#00008B",
    textAlign:"left",
    paddingLeft:15,
    marginBottom:5
  },
  textNameMedicamento:{
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    paddingBottom:10
  },
  textFechaHora:{
    fontSize: 18,
    fontStyle:"normal",
    color: "#FFFFFF",
    marginRight:4
  },
  imageProximaToma:{
    resizeMode:"cover",
    width:70,
    height:93,
    borderRadius:5,
    borderColor:"white",
    borderWidth:0.8,
    backgroundColor:"black"
  },
  horizontalScroll:{
    margin:10,
    paddingBottom:5
  },
  containerAlerta:{
    borderRadius:25,
    padding:10,
    backgroundColor:"#F2F2F2",
    marginRight:10,
    height:110,
    borderColor:"#0057CF",
    borderWidth:0.8,
    justifyContent:"space-around",
    alignItems:"center"
  },
  textAlerta:{
    fontSize:20,
    textAlign:"center",
    color:"#0057CF",
    fontWeight:"bold"
  },
  rowAlerta:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center"
  },
  imageAlerta:{
    resizeMode:"contain",
    width:25,
    height:25,
    marginRight:10
  },
  textRestantes:{
    fontSize:15,
    textAlign:"left",
    color:"black",
    width:"60%"
  },
  fotoButton:{
    marginHorizontal:10,
    width:45,
    height:45,
    resizeMode:"contain"
  },
  cuidadorContainer:{
    marginHorizontal:10,
    borderWidth:2,
    borderColor:"#0057CF",
    backgroundColor:"#F2F2F2",
    borderRadius:30,
    paddingHorizontal:20,
    paddingVertical:15
  },
  textNamecuidador:{
    fontSize:21,
    fontWeight:"bold",
    color:"#0057CF",
    marginBottom:5,
    maxWidth:Dimensions.get("window").width*0.55
  },
  textUsernameCuidador:{
    fontSize:20,
    fontStyle:"italic",
    color:"#0057CF",
    maxWidth:Dimensions.get("window").width*0.55
  },
  fotoCuidador:{
    width:70,
    height:70,
    borderRadius:50,
    resizeMode:"cover",
    marginRight:15,
    borderColor:"white",
    borderWidth:2
  },
  containerAhora:{
    backgroundColor:"white",
    alignItems:"center",
    justifyContent:"space-around",
    paddingHorizontal:10,
    paddingVertical:20,
    borderColor:"yellow",
    borderWidth:5,
    borderRadius:25,
    width:Dimensions.get("window").width*0.89,
  },
  textEsHora:{
    color:"#0057CF",
    fontStyle:"italic",
    fontSize:17,
    textAlign:"center",
    marginHorizontal:15,
    marginTop:7,
    marginBottom:22
  },
  imageMedicamento:{
    resizeMode:"cover",
    width:150,
    height:210,
    borderRadius:20,
    borderWidth:1,
    backgroundColor:"black",
    marginBottom:12
  },
  titleTomaAhora:{
    color:"black",
    fontWeight:"bold",
    fontSize:28,
    textAlign:"center",
    marginBottom:5
  },
  bodyTomaAhora:{
    color:"#0057CF",
    fontSize:20,
    textAlign:"center",
    marginHorizontal:11
  },
  containerDedo:{
    borderRadius:20,
    justifyContent:"center",
    alignItems:"center",
    width:Dimensions.get("window").width*0.37,
    marginHorizontal:7,
    paddingHorizontal:10,
    paddingVertical:10,
    marginTop:35,
    marginBottom:5
  },
  imageDedo:{
    resizeMode:"contain",
    width:42,
    height:42,
    marginBottom:5
  },
  textDedo:{
    color:"white",
    fontSize:17,
    fontWeight:"bold",
    textAlign:"center"
  }

});

export default Home;