import React,{useEffect,useState,useContext} from "react";
import { View, Text, StyleSheet,SafeAreaView,Image} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import AppInput from "../components/AppInput.jsx";
import { HostContext } from "../context/HostContext.jsx";
import LoadingOverlay from '../LoadingOverlay';

const SolicitarRecupero = ({navigation}) => {

    const host = useContext(HostContext);
    const [isLoading, setIsLoading] = useState(false);
    const [habilitado, setHabilitado] = useState(false);
    const [correo,setCorreo]=useState("");

    function validarCorreo(correo) {
        const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.]*$/;
        return expresionRegular.test(correo);
    }

    useEffect(() => {
        const correoValido=validarCorreo(correo);
        setHabilitado(correoValido && correo.length<25);
    }, [correo]);

    const enviarCorreo = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(host+"/usuarios/auth/recover?correo="+correo, {
            method: 'POST'
          });
    
          if (response.ok) {
            setIsLoading(false);
            navigation.navigate("CodigoRecupero",{
                correo: correo,
            })
          } else {
            setIsLoading(false);
            const errorData = await response.text(); 
            Alert.alert('Error',errorData); 
          }
        } catch (error) {
          Alert.alert('Error de conexión', 'Hubo un problema al intentar contactar al servidor');
        }
    } 

    return(
        <SafeAreaView style={{ flex: 1 }}>
            <View style={style.screen}>
                <LoadingOverlay isLoading={isLoading} />
                <Image style={style.logo} source={require("../../assets/images/LogoSinLetras.png")}/>
                <View style={style.container}>
                    <Text style={style.title}>Recupero de contraseña</Text>
                    <Text style={style.text}>Ingresa tu correo electrónico para iniciar el proceso de recupero de contraseña.</Text>
                    <AppInput actualizarCampo={setCorreo} instructivo="Correo" seguro={false}/>
                    <Text></Text>
                    <AppButton habilitado={habilitado} theme="blue" text="CONTINUAR" onPress={enviarCorreo}/>
                </View>
            </View>
        </SafeAreaView>
    )
}

const style=StyleSheet.create({
    screen:{
        backgroundColor: 'white',
        alignItems:"center",
        paddingVertical:Constants.statusBarHeight,
        paddingHorizontal:20,
        flex:1
    },
    title:{
        color:"#0057CF",
        fontSize:25,
        fontWeight:"bold",
        marginBottom:30
    },
    text:{
        color:"black",
        fontSize:20,
        marginVertical:8
    },
    logo:{
        width:70,
        height:70,
        resizeMode:"contain"
    },
    container:{
        flex:1,
        justifyContent:"center"
    }
})

export default SolicitarRecupero