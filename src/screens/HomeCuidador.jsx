import React, { useEffect, useContext,useState } from "react";
import {View,Text,SafeAreaView,ScrollView,StyleSheet,Dimensions,Image,TouchableOpacity,Alert,BackHandler,RefreshControl} from "react-native";
import Constants from "expo-constants";
import useAppStore from "../stores/useAppStore";
import { HostContext } from "../context/HostContext.jsx";
import LoadingOverlay from '../LoadingOverlay';
import Modal from "react-native-modal";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";
import handleLogout from '../utils/handleLogout.js'; 

const HomeCuidador = ({ navigation }) => {
  
  const {jwt,usuarioChatUsername,setUsuarioChat,alertaOn,setAlertaOn,fotoUrl,usuariosAsociados,setUsuariosAsociados,name,username,usuarioId,logout, clearUserData, clearCuidadorData, clearAsociadoData} = useAppStore();
  const host = useContext(HostContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [usernameCuidado, setUsernameCuidado] = useState("");

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', function() {return true})
    return () => BackHandler.removeEventListener; 
  }, []);

  const asociarUsuario = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(host+"/usuarios/"+usuarioId+"/asociar/"+usernameCuidado, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + jwt,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsuariosAsociados(data);
        setIsModalVisible(false);
        Alert.alert('Éxito', 'Usuario asociado con éxito.');
      } else {
        let errorMessage = "Error al asociar usuario.";
        switch (response.status) {
            case 401:
                errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
                break;
            case 404:
                errorMessage = "Usuario no encontrado.";
                break;
            case 409:
                errorMessage = "Conflicto al asociar usuario.";
                break;
            case 500:
                errorMessage = "Error interno del servidor.";
                break;
            default:
                errorMessage = `Error al asociar usuario (código ${response.status}).`;
        }
        console.error(`Error ${response.status}: ${errorMessage}`);
        Alert.alert('Error', errorMessage);
    }
    } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'Error de red. Verifica tu conexión a internet.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleToVistaCuidador=(usuario)=>{
    navigation.navigate("VistaCuidador",{
      usuario:usuario
    })
  }

  const handleToChat=()=>{
    setAlertaOn(false);
    navigation.navigate("ChatCuidador")
  }

const fetchUsuario= async () => {
      try {
        setIsLoading(true)
        console.log("OBTENIENDO DATOS CON idUsuario: "+usuarioId)
        const response = await fetch(host+'/usuarios/'+usuarioId, {
          method: 'GET',
          headers: {
              'Authorization': 'Bearer ' + jwt,
              'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) { 
          const idChat = data.idChat; 
          const usuarioEncontrado = usuariosAsociados.find(usuario => usuario.usuarioId === idChat);
          if (usuarioEncontrado) {
            console.log("Usuario encontrado:", usuarioEncontrado);
            const username=usuarioEncontrado.username
            setUsuarioChat({usuarioChatUsername:username,usuarioChatId:idChat})
          } else {
            console.log("No se encontró ningún usuario con usuarioId:", idChat);
          } 
        } else if (response.status === 401) {
          Alert.alert("SESIÓN VENCIDA", data.mensaje || "Inicia sesión nuevamente");
        } else {
          Alert.alert("Error inesperado", "Ocurrió un error inesperado");
        }
      } catch (error) {
        console.error('Error obteniendo usuario:', error);
        Alert.alert('Error', "Error obteniendo usuario.");
      } finally {
        setIsLoading(false)
      }
    };

  return (
    <SafeAreaView style={{ flex: 1, flexGrow: 1 }}>
      <LoadingOverlay isLoading={isLoading}/>
      <ScrollView contentContainerStyle={style.screen} refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={() => {
          fetchUsuario(); 
        }} />}>
        <View style={style.encabezado}>
            <TouchableOpacity onPress={()=>navigation.navigate("HomeCuidador")}>
              <Image style={style.imageEncabezado} source={require("../../assets/images/CASABLANCA.png")}/>
            </TouchableOpacity>
            <Image style={style.logo} source={require("../../assets/images/LOGOBORDEADO.png")}/>
            <TouchableOpacity onPress={()=>handleLogout({ usuarioId,logout, clearUserData, clearCuidadorData, clearAsociadoData })}>
              <Image style={style.imageEncabezado} source={require("../../assets/images/CERRARSESION.png")}/>
            </TouchableOpacity>
        </View>
        <View style={{ flex: 1,alignItems:"center"}}>
          <View style={style.tarjeta}>
            <Image style={style.fotoPerfil} source={{uri:fotoUrl}}/>
            <View>
              <Text style={style.textName}>{name}</Text>
              <Text style={style.textUsername}>{username}</Text>
            </View>
          </View>
          
          {usuarioChatUsername ? (
            <TouchableOpacity onPress={()=>handleToChat()}>
              <View style={{width:"90%",backgroundColor:"yellow",borderRadius:25,padding:15,alignItems:"center",marginBottom:10}}>
                <Text style={{fontSize:22,color:"black",fontWeight:"bold",textAlign:"center"}}>{usuarioChatUsername} necesita hablar con vos!</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={()=>setIsModalVisible(true)}>
              <View style={style.button}>
                <Image style={style.imageButton} source={require("../../assets/images/AGREGAR.png")}/>
                <Text style={style.textButton}>ASOCIAR USUARIO</Text>
              </View>
            </TouchableOpacity>
          )}

          

          <View style={style.containerCuidados}>
            {usuariosAsociados && usuariosAsociados.length>0 ? (
              <>
                <Text style={[style.textCuidas,{marginVertical:10}]}>Cuidas a...</Text>
                <View style={{flex:1}}>
                {usuariosAsociados.map(usuario => (
                  <TouchableOpacity key={usuario.usuarioId} onPress={()=>handleToVistaCuidador(usuario)}>
                    <View style={style.containerCuidado}>
                      {usuario.fotoUrl ? (
                        <Image style={style.fotoPerfil} source={{ uri: usuario.fotoUrl }}/>
                      ) : (
                        <Image style={{width:40,height:40,resizeMode:"contain",marginRight:15}} source={require('../../assets/images/PERFILBLANCO.png')}/>
                      )}
                      <View>
                        <Text style={style.nameCuidado}>{usuario.name}</Text>
                        <Text style={style.usernameCuidado}>{usuario.username}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                </View>
              </>
            ) : (
              <Text style={{fontSize:21,textAlign:"center"}}>Por el momento, no tienes usuarios asociados. Asocia a la persona que cuidas para monitorearla.</Text>
            )} 
          </View>
        </View>

        <Modal style={{alignItems:'center'}} isVisible={isModalVisible} backdropOpacity={0.45} backdropTransitionOutTiming={0} onBackdropPress={()=>setIsModalVisible(false)}>
            <View style={style.modalContainer}>
                <Text style={style.modalText}>Ingresa el nombre de usuario de la persona que quieres monitorear</Text>
                <Text></Text>
                <AppInput actualizarCampo={setUsernameCuidado} instructivo="Nombre de usuario" seguro={false}/>
                <Text></Text>
                <Text></Text>
                <AppButton habilitado={usernameCuidado.length>3} theme="blue" text="ASOCIAR" onPress={asociarUsuario}/>
            </View>
        </Modal> 

        <Modal isVisible={alertaOn} style={{justifyContent:"center",flex:1}} backdropOpacity={0.55}>
            <View style={{width:"98%",backgroundColor:"white",borderColor:"#0057CF",borderWidth:4,borderRadius:20,alignItems:"center",paddingVertical:55}}>
                <Text style={{marginHorizontal:10,textAlign:"center",fontSize:33,marginBottom:40,color:"black",fontWeight:"bold"}}>{usuarioChatUsername} quiere hablar con vos!</Text>
                <AppButton habilitado={true} theme="blue" text="IR AL CHAT" onPress={()=>handleToChat()}/>
            </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingBottom: Constants.statusBarHeight*0.6,
    alignContent:"center"
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
    backgroundColor:"#0057CF",
    paddingHorizontal:15,
    paddingTop:20,
    paddingBottom:110,
    borderBottomLeftRadius:60,
    borderBottomRightRadius:60,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between"
  },
  tarjeta:{
    backgroundColor:"#F2F2F2",
    borderColor:"#0057CF",
    borderWidth:2,
    borderRadius:40,
    paddingHorizontal:15,
    paddingVertical:25,
    flexDirection:"row",
    alignItems:"center",
    width:Dimensions.get("window").width*0.88,
    marginTop:-80,
    marginBottom:30
  },
  fotoPerfil:{
    width:70,
    height:70,
    resizeMode:"cover",
    marginRight:15,
    borderRadius:45,
    borderWidth:1,
    borderColor:"white"
  },
  textName:{
    fontSize:24,
    color:"#0057CF",
    fontWeight:"bold",
    marginBottom:5,
    width:Dimensions.get("window").width*0.5,
  },
  textUsername:{
    fontSize:22,
    color:"black",
    fontStyle:"italic"
  },
  button:{
    flexDirection:"row",
    alignItems:"center",
    paddingHorizontal:17,
    paddingVertical:11,
    borderRadius:25,
    backgroundColor:"#A21A1A",
    marginBottom:20
  },
  imageButton:{
    resizeMode:"contain",
    width:40,
    height:40,
    marginRight:10
  },
  textButton:{
    color:"white",
    fontSize:20,
    fontWeight:"bold"
  },
  containerCuidados:{
    width:Dimensions.get("window").width*0.9,
    flex:1,
    justifyContent:"center"
  },
  textCuidas:{
    color:"#36454F",
    fontSize:22,
    fontWeight:"bold",
    textAlign:"justify"
  },
  containerCuidado:{
    width:Dimensions.get("window").width*0.88,
    marginVertical:8,
    paddingHorizontal:20,
    paddingVertical:15,
    backgroundColor:"#0057CF",
    borderRadius:30,
    flexDirection:"row",
    alignItems:"center",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  nameCuidado:{
    color:"white",
    fontSize:22,
    fontWeight:"bold",
    width:Dimensions.get("window").width*0.64,
    marginBottom:3
  },
  usernameCuidado:{
    color:"white",
    fontSize:20,
    fontStyle:"italic",
    width:Dimensions.get("window").width*0.64
  },
  modalText: {
    color:'#0057CF',
    fontSize:21,
    textAlign:"center",
    marginTop:10,
    marginBottom:27,
    marginHorizontal:-15,
    fontWeight:"bold",
    width:Dimensions.get("window").width*0.7
  },
  modalContainer:{
      paddingTop:35,
      paddingBottom:25,
      justifyContent: 'space-evenly', 
      alignItems: 'center',
      backgroundColor:'white',
      borderColor:'#0057CF',
      borderWidth:5,
      borderRadius:30,
      width:Dimensions.get("window").width*0.9
  }
});

export default HomeCuidador;