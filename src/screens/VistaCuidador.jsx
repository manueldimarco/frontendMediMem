import React, { useEffect, useContext,useState,useMemo} from "react";
import {View,Text,SafeAreaView,ScrollView,StyleSheet,Dimensions,Image,TouchableOpacity,Alert,BackHandler} from "react-native";
import useAppStore from "../stores/useAppStore";
import { HostContext } from "../context/HostContext.jsx";
import LoadingOverlay from '../LoadingOverlay';
import AppButton from "../components/AppButton";
import BottomBarCuidador from "../components/BottomBarCuidador";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import handleLogout from '../utils/handleLogout.js'; 

const VistaCuidador = ({ navigation,route }) => {
  
    const {jwt,fotoUrl,setAsociadoData,usuarioId,tomas,setTomas,medicamentos,setMedicamentos,setUsuariosAsociados,logout, clearUserData, clearCuidadorData, clearAsociadoData} = useAppStore();
    const host = useContext(HostContext);
    const [isLoading, setIsLoading] = useState(false);
    const {usuario} = route.params;

    useEffect(() => {
      BackHandler.addEventListener('hardwareBackPress', function() {return true})
      return () => BackHandler.removeEventListener; 
    }, []);
    
    const fetchUsuarioAsociado= async () => {
      try {
          const response = await fetch(host+'/usuarios/'+usuario.usuarioId, {
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + jwt,
                'Content-Type': 'application/json',
            },
          });
          const data = await response.json();

          if(response.ok){
            setMedicamentos(data.medicamentos); 
          } else if (response.status==401){
            Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresá nuevamente");
          }
      } catch (error) {
        console.error('Error obteniendo usuario:', error);
        Alert.alert('Error', "Error obteniendo usuario.");
      } 
    };

    const fetchTomas = async () => {
      try {
        const response = await fetch(host+'/tomas/'+usuario.usuarioId, {
          method: "GET",
          headers: {
              'Authorization': 'Bearer ' + jwt,
              'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if(response.ok) {
          setTomas(data); 
        } else if (response.status==401) {
          Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
        } else {
          Alert.alert('Error', "Error obteniendo tomas.");
        }
      } catch (error) {
        console.error('Error obteniendo tomas:', error);
        Alert.alert('Error', "Error obteniendo tomas.");
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
        setIsLoading(true);
        setAsociadoData({fotoUrlAsociado:usuario.fotoUrl,nameAsociado:usuario.name,usuarioCuidadoId:usuario.usuarioId});
        fetchUsuarioAsociado();        
        fetchTomas(); 
      }, []);

    const desasociarCuidado = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(host+'/usuarios/'+usuarioId+"/desasociar/"+usuario.usuarioId, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + jwt,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json(); 
        if (response.ok) {
          setUsuariosAsociados(data);
          setIsLoading(false);
          navigation.navigate("HomeCuidador");
          Alert.alert("ÉXITO","Usuario desasociado.")
        } else if (response.status==401) {
          Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
        } else {
          Alert.alert('Error', "Error obteniendo tomas.");
        }
      } catch (error) {
        console.error('Error al desasociar cuidado:', error);
        Alert.alert("ERROR","Error al desasociar cuidado")
      }
    };
  
    const pendientes = useMemo(() => {
      if(!tomas || tomas.length==0){
        return []
      } else{
        return tomas.filter(toma => toma.estado === "PENDIENTE");
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
      } else {
        return null
      }
    }, [medicamentos]);


  return (
    <SafeAreaView style={{flexGrow: 1,flex:1 }}>
      <LoadingOverlay isLoading={isLoading}/>
      <ScrollView contentContainerStyle={style.screen}>
        
            <View style={style.encabezado}>
                <TouchableOpacity onPress={()=>navigation.navigate("HomeCuidador")}>
                  <Image style={style.imageEncabezado} source={require("../../assets/images/CASABLANCA.png")}/>
                </TouchableOpacity>
                <Image style={style.logo} source={require("../../assets/images/LOGOBORDEADO.png")}/>
                <TouchableOpacity onPress={()=>handleLogout({ usuarioId,logout, clearUserData, clearCuidadorData, clearAsociadoData })}>
                  <Image style={style.imageEncabezado} source={require("../../assets/images/CERRARSESION.png")}/>
                </TouchableOpacity>
            </View>

            <View style={style.containerUsuarios}>
                <View style={style.containerFoto}>
                    <Image style={style.fotoPerfil} source={{uri:fotoUrl}}/>
                </View>
                <Image style={{width:50,height:50,resizeMode:"contain",marginHorizontal:-10,zIndex:2}} source={require("../../assets/images/ASOCIACION.png")}/>
                <View style={style.containerFoto}>
                    <Image style={style.fotoPerfil} source={{uri:usuario.fotoUrl}}/>
                </View>
            </View>


            {medicamentos === null || medicamentos.length == 0 ? (
                <View style={{ flex: 1,alignItems:"center",justifyContent:"center"}}>  
                  <Text style={{fontSize:22,textAlign:"center",marginBottom:20}}>{usuario.name} no tiene medicamentos registrados.</Text>
                  <AppButton text="AGREGAR MEDICAMENTO" theme="blue" onPress={()=>navigation.navigate("NameMedicamento",{tipoUsuario:"CUIDADOR"})} habilitado={true}/>
                </View>
            ) : (

                <>
                    {pendientes.length === 0 ? (
                        <View style={style.cartelAlDia}>
                          <Text style={style.textAlDia}>{usuario.name} está al día con las tomas</Text>
                          <Image style={style.imageAldia} source={require("../../assets/images/alDia.png")}/>
                        </View>
                    ) : (
                        <View style={style.cartelAdeudaIngesta}>
                          <Text style={style.textTomasPendientes}>¡{usuario.name} tiene tomas pendientes!</Text>
                          <TouchableOpacity onPress={() => navigation.navigate("Pendientes")}>
                            <View style={style.botonPendientes}>
                              <Text style={style.textPendientes}>Ver tomas pendientes</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                    )}

                    {proximaToma ? (
                      <View style={{marginVertical:9}}>
                        <Text style={[style.textBienvenida,{fontSize:23,fontWeight:"400",marginBottom:10,paddingLeft:15}]}>Próxima toma</Text>

                        <View style={style.proximaIngesta}>
                          <View style={{width:"70%"}}>
                            <Text style={style.textNameMedicamento}>{proximaToma ? proximaToma.nameMedicamento : "Cargando medicamento..."}</Text>
                            <Text style={style.textFechaHora}>{fechaFormateada}</Text>
                          </View>
                          <Image style={style.imageProximaToma} source={{uri:proximaToma.imagenUrl}}/>
                        </View>

                      </View>
                    ) : (
                      <View style={{marginVertical:9}}>
                        <Text style={[style.textBienvenida,{fontSize:23,fontWeight:"400",marginBottom:10}]}>Próxima toma</Text>
                        <View style={style.proximaIngesta}>
                          <Text style={style.textSinProximas}>No hay tomas en los próximos 3 días</Text>
                        </View>
                      </View>
                    )}

                    {alertasDeReposición.length>0 ? (
                      <View style={{ marginVertical:10}}>
                        <Text style={[style.textBienvenida,{fontSize:23,fontWeight:"400",marginBottom:4,paddingLeft:15}]}>Debe reponer</Text>
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
                    ): null }

                </>

            )}
            <View style={{alignItems:"center",paddingBottom:20,paddingTop:23}}>
              <AppButton text="DESASOCIAR CUIDADO" theme="red" onPress={desasociarCuidado} habilitado={true}/>
          </View>

      </ScrollView>
      <BottomBarCuidador navigation={navigation}/>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: "white",
  },
  imageEncabezado:{
    resizeMode:"contain",
    width:30,
    height:30
  },
  logo:{
    resizeMode:"contain",
    width:70,
    height:70
  },
  encabezado:{
    width:Dimensions.get("window").width,
    backgroundColor:"#0057CF",
    paddingHorizontal:15,
    paddingTop:20,
    paddingBottom:90,
    borderBottomLeftRadius:60,
    borderBottomRightRadius:60,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    marginBottom:-70
  },
  containerUsuarios:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    marginBottom:10
  },
  containerFoto:{
    borderRadius:70,
    padding:7,
    borderWidth:2,
    borderColor:"#0057CF",
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"white",
  },
  fotoPerfil:{
    width:100,
    height:100,
    borderRadius:50
  },
  textName:{
    fontSize:22,
    color:"#0057CF",
    fontWeight:"bold",
    marginBottom:5,
    paddingHorizontal:10,
    textAlign:"center"
  },
  cartelAdeudaIngesta: {
    borderRadius: 15,
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 25,
    paddingVertical:20,
    backgroundColor: "#C03030",
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 7,
    marginHorizontal:15
  },
  textTomasPendientes: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign:"center",
    paddingHorizontal:25,
    paddingBottom:15,
    color:"white"
  },
  imageAldia:{
    resizeMode:"contain",
    width:50,
    height:50
  },
  cartelAlDia: {
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal:15,
    backgroundColor: "#7FFF9B",
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 7,
    marginVertical:20,
    marginHorizontal:15
  },
  textAlDia:{
    fontSize: 21,
    fontWeight: "bold",
    width:Dimensions.get("window").width*0.65,
    paddingHorizontal:10
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
    borderRadius: 15,
    alignItems: "center",
    justifyContent:"space-between",
    paddingVertical: 26,
    paddingHorizontal: 18,
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
    marginRight:2
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
    borderWidth:2,
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
});

export default VistaCuidador;