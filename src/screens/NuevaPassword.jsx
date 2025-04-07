import React,{useEffect,useState,useContext} from "react";
import { View, Text, StyleSheet,SafeAreaView,Image,Dimensions,TouchableOpacity} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import AppInput from "../components/AppInput.jsx";
import { HostContext } from "../context/HostContext.jsx";
import Modal from "react-native-modal";
import LoadingOverlay from '../LoadingOverlay';

const NuevaPassword = ({navigation,route}) => {

    const host = useContext(HostContext);
    const [isLoading, setIsLoading] = useState(false);
    const {correo}=route.params;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [habilitado, setHabilitado] = useState(false);
    const [password,setPassword]=useState("");
    const [confirmPassword,setConfirmPassword]=useState("");

    const cerrarModal = () => {
        setIsModalVisible(false);
        navigation.navigate('Login');
    };

    useEffect(() => {
        const contrasenaValida = password.length >= 8 && password==confirmPassword;
        setHabilitado(contrasenaValida);
    }, [password,confirmPassword]);


    const actualizarContraseña = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(host+"/usuarios/auth/reset-password?correo="+correo+"&nuevaPassword="+password, {
            method: 'POST'
          });
    
          if (response.ok) {
            setIsLoading(false);
            setIsModalVisible(true);
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
                    <Text style={style.text}>Ingresa tu nueva contraseña. Debe contener más de 8 caracteres.</Text>
                    <AppInput actualizarCampo={setPassword} instructivo="Nueva contraseña" seguro={true}/>
                    <AppInput actualizarCampo={setConfirmPassword} instructivo="Confirmar contraseña" seguro={true}/>
                    <Text></Text>
                    <AppButton habilitado={habilitado} theme="blue" text="CONTINUAR" onPress={actualizarContraseña}/>
                </View>
            </View>

            <Modal style={{alignItems:'center'}} isVisible={isModalVisible} backdropOpacity={0.45} backdropTransitionOutTiming={0} onBackdropPress={cerrarModal}>
                <View style={style.modalContainer}>
                    <Text style={style.modalText}>Se actualizó tu contraseña</Text>
                    <TouchableOpacity onPress={cerrarModal}>
                        <View style={style.buttonModal}>
                            <Text style={style.textButtonModal}>CONTINUAR</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal> 

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
        fontSize:20,
        marginVertical:8
    },
    modalText: {
        color:'#0057CF',
        fontSize:28,
        textAlign:"center",
        marginTop:10,
        marginBottom:27,
        marginHorizontal:-15,
        fontWeight:"bold"
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
          width:Dimensions.get("window").width/1.1
      },
      buttonModal:{
          backgroundColor:'#A21A1A',
          padding:15,
          borderRadius:20,
          marginTop:10
      },
      textButtonModal:{
          color:"white",
          fontSize:18,
          fontWeight:"bold"
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

export default NuevaPassword