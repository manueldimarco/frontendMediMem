import React,{useEffect,useState,useContext} from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet,SafeAreaView,Image,Alert} from "react-native";
import AppInput from "../components/AppInput";
import { HostContext } from "../context/HostContext";
import AppButton from "../components/AppButton";
import useAppStore from "../stores/useAppStore";
import * as SecureStore from 'expo-secure-store';
import LoadingOverlay from '../LoadingOverlay';
import Constants from 'expo-constants';

const Login = ({navigation}) => {
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");
    const [habilitado, setHabilitado] = useState(false); 
    const host = useContext(HostContext)
    const setMedicamentos = useAppStore((state) => state.setMedicamentos);
    const setCuidadorData = useAppStore((state) => state.setCuidadorData);
    const login = useAppStore((state) => state.login);
    const setUserData = useAppStore((state) => state.setUserData);
    const tokenExpo = useAppStore((state) => state.tokenExpo);
    const iniciandoApp = useAppStore((state) => state.iniciandoApp);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setHabilitado(username.length>=4 && password.length >= 8);
    }, [username, password]);

    const handleLogin =  async(usuarioId,usuarioJWT) => {
      login(usuarioId,usuarioJWT);
      console.log("Seteando el userid"+usuarioId+" con el JWT "+usuarioJWT)
      await SecureStore.setItemAsync('usuarioIdMediMem',usuarioId); 
      await SecureStore.setItemAsync('usuarioJWTMediMem',usuarioJWT); 
    };

    const autenticarUsuario = async () => {
        const datos = {
          username: username,
          password: password,
          tokenExpo:tokenExpo,
        };
    
        try {
          setIsLoading(true);
          console.log("Host:"+host)
          const response = await fetch(host+"/usuarios/login", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos),
          });
    
          const data = await response.json();
          console.log(data)
          if (!response.ok) {
            throw new Error(data.error || "Error desconocido en la autenticación");
          }

          handleLogin(data.usuario.usuarioId,data.token);
          setMedicamentos(data.usuario.medicamentos);
          setUserData({name: data.usuario.name,username: data.usuario.username,correo: data.usuario.correo,telefono:data.usuario.telefono,tipoUsuario:data.usuario.tipoUsuario,fotoUrl:data.usuario.fotoUrl,usuariosAsociados:data.usuario.usuariosAsociados});
          console.log('Solicitud exitosa');
          console.log('Datos obtenidos: '+data.usuario.usuarioId+data.usuario.username+" "+data.usuario.medicamentos);
          if(data.usuario.tipoUsuario==="CONSUMIDOR" && data.usuario.usuariosAsociados){
            setCuidadorData({
              fotoUrlCuidador:data.usuario.usuariosAsociados[0].fotoUrl,
              nameCuidador:data.usuario.usuariosAsociados[0].name,
              usernameCuidador:data.usuario.usuariosAsociados[0].username,
              telefonoCuidador:data.usuario.usuariosAsociados[0].telefono,
              usuarioCuidadorId:data.usuario.usuariosAsociados[0].usuarioId,
            })
          }

        } catch (error) {
          console.error("Error de autenticación:", error.message);
          Alert.alert("ERROR DE AUTENTICACIÓN",error.message); 
        } finally {
          setIsLoading(false);
        }
    };

    return(
        <SafeAreaView style={{flex:1}}>
            <ScrollView contentContainerStyle={style.screen}>
                <LoadingOverlay isLoading={isLoading || iniciandoApp} />
                <Image style={style.logo} source={require("../../assets/images/LogoConLetras.png")}/>
                <View style={{width:"100%",alignItems:"center"}}>
                    <AppInput actualizarCampo={setUsername} instructivo="Nombre de usuario" seguro={false} capitalizar={"none"}/>
                    <View>
                        <AppInput actualizarCampo={setPassword} instructivo="Contraseña" seguro={true} capitalizar={"none"}/>
                        <TouchableOpacity onPress={() => navigation.navigate('SolicitarRecupero')}>
                            <Text style={{paddingBottom:17,fontSize:17,color:"#303030"}}>Olvidé mi contraseña!</Text>
                        </TouchableOpacity>
                    </View>
                      <AppButton habilitado={habilitado} theme="blue" text="INGRESAR" onPress={autenticarUsuario}/>
                </View>
                
                <View style={{ alignItems: "center",marginTop:28,marginBottom:-10 }}>
                    <Text style={style.text}>¿Primera vez con Memomed?</Text>
                    <AppButton habilitado={true} theme="red" text="REGISTRATE" onPress={() => navigation.navigate('TipoUsuario')}/>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const style=StyleSheet.create({
    screen:{
        justifyContent: "space-around",
        backgroundColor: 'white',
        alignItems: "center",
        paddingTop: Constants.statusBarHeight,
        paddingBottom:Constants.statusBarHeight*2,
        flex:1
    },
    text:{
        margin:7,
        fontSize:18,
        color:"#303030"
    },
    logo:{
      resizeMode:"contain",
      width:180,
      height:180,
      margin:15,
  }
})

export default Login