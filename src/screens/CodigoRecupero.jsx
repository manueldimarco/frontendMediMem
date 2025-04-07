import React,{useState,useContext} from "react";
import { View, Text, StyleSheet,SafeAreaView,Image} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import AppInput from "../components/AppInput.jsx";
import { HostContext } from "../context/HostContext.jsx";
import LoadingOverlay from '../LoadingOverlay';

const CodigoRecupero = ({navigation,route}) => {

    const host = useContext(HostContext);
    const [isLoading, setIsLoading] = useState(false);
    const {correo}=route.params;
    const [codigoRecuperacion,setCodigoRecuperacion]=useState("");

    const enviarCodigo = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(host+"/usuarios/auth/verify-code?correo="+correo+"&codigo="+codigoRecuperacion, {
            method: 'POST'
          });
    
          if (response.ok) {
            setIsLoading(false);
            navigation.navigate("NuevaPassword",{
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
                    <Text></Text>
                    <Text style={style.text}>Ingresa el código de 6 dígitos que te enviamos a {correo} para poder establecer tu nueva contraseña.{"\n"}Si no recibes el correo, verifica en la casilla de Spam.</Text>
                    <Text></Text>
                    <AppInput actualizarCampo={setCodigoRecuperacion} instructivo="Código" seguro={false}/>
                    <Text></Text>
                    <AppButton habilitado={codigoRecuperacion.length==6} theme="blue" text="CONTINUAR" onPress={enviarCodigo}/>
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
        paddingHorizontal:10,
        flex:1
    },
    title:{
        color:"#0057CF",
        fontSize:24,
        fontWeight:"bold"
    },
    text:{
        color:"black",
        fontSize:18,
        marginVertical:8,
        textAlign:"justify"
    },
    logo:{
        width:70,
        height:70,
        resizeMode:"contain"
    },
    container:{
        flex:1,
        justifyContent:"center",
        paddingHorizontal:20,
        paddingVertical:80
    }
})

export default CodigoRecupero