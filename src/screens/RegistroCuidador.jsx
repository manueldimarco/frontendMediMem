import React,{useEffect,useState} from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions, TouchableOpacity,Image} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import AppInput from "../components/AppInput.jsx";

const RegistroCuidador = ({navigation,route}) => {

    const {tipoUsuario}=route.params
    
    const [correo,setCorreo]=useState("");
    const [name,setName]=useState("");
    const [password,setPassword]=useState("");
    const [telefono,setTelefono]=useState("");
    const [username,setUsername]=useState("");
    const [confirmPassword,setConfirmPassword]=useState("");
    const [habilitado, setHabilitado] = useState(false);

    function validarCorreo(correo) {
        const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.]*$/;
        return expresionRegular.test(correo);
    }

    useEffect(() => {
        const contrasenaValida = password.length >= 8 && password==confirmPassword;
        const correoValido=validarCorreo(correo);
        const nombreValido=name.length>1;
        const usernameValido=username.length>3;
        const telefonoValido=telefono.length>9;
        setHabilitado(contrasenaValida && correoValido && nombreValido && usernameValido && telefonoValido);
    }, [correo,telefono,password,confirmPassword,name,username]);

    const handleToFotoUsuario = () => {
        navigation.navigate('FotoUsuario', {
            name: name,
            username:username,
            telefono:telefono,
            tipoUsuario: tipoUsuario,
            correo: correo,
            password:password
        });
      };

    return(
        <SafeAreaView style={{ flex: 1,flexGrow:1 }}>
            <ScrollView contentContainerStyle={style.screen}>
                <Image style={style.logo} source={require("../../assets/images/LogoSinLetras.png")}/>
                <View>
                    <Text style={style.text}>Registrate</Text>
                    <View style={style.form}>
                        <AppInput actualizarCampo={setName} instructivo="Nombre y apellido" seguro={false}/>
                        <AppInput actualizarCampo={setCorreo} instructivo="Correo electrónico" seguro={false}/>
                        <AppInput actualizarCampo={setUsername} instructivo="Nombre de usuario" seguro={false}/>
                        <AppInput actualizarCampo={setTelefono} instructivo="Teléfono" seguro={false}/>
                        <AppInput actualizarCampo={setPassword} instructivo="Contraseña" seguro={true}/>
                        <AppInput actualizarCampo={setConfirmPassword} instructivo="Confirmar contraseña" seguro={true}/>
                    </View>
                    
                    <View style={{marginTop:15}}>
                      <AppButton habilitado={habilitado} theme="blue" text="CONFIRMAR" onPress={handleToFotoUsuario}/>
                      <AppButton habilitado={true} theme="red" text="REGRESAR" onPress={() => navigation.navigate('Login')}/>
                    </View>
                    
                </View>

            </ScrollView>
        </SafeAreaView>
        
        
    )
}

const style=StyleSheet.create({
    screen:{
        justifyContent:"space-around",
        backgroundColor: 'white',
        alignItems:"center",
        paddingVertical:Constants.statusBarHeight,
        flexGrow:1
    },
    form:{
        alignItems:"center",
    },
    text:{
        color:"#303030",
        fontSize:20,
        marginBottom:8,
        fontWeight:"bold"
    },
    buttonNac:{
        marginVertical:7,
        width:Dimensions.get('window').width-60,
        height:58,
        borderWidth: 1,
        justifyContent:"center",
        backgroundColor:"white",
        borderColor:"303030",
        borderRadius:10,
        paddingLeft:10
    },
    buttonText:{
      marginLeft:7,
      fontSize:18,
      opacity:0.5
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
      resizeMode:"contain",
      width:75,
      height:75,
      marginBottom:10,
    }
})

export default RegistroCuidador