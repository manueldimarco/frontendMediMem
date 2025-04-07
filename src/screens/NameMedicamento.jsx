import React,{useEffect,useState,useContext} from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions, TouchableOpacity,Image} from "react-native";
import AppButton from "../components/AppButton.jsx";
import Constants from 'expo-constants';
import AppInput from "../components/AppInput.jsx";
import QuestionContainer from "../components/QuestionContainer.jsx";
import Encabezado from "../components/Encabezado";
import BottomRegresar from "../components/BottomRegresar";
import EncabezadoCuidador from "../components/EncabezadoCuidador.jsx";

const NameMedicamento = ({navigation,route}) => {

    const [nameMedicamento,setNameMedicamento]=useState("");
    const [descripcion,setDescripcion]=useState("");
    const [laboratorio,setLaboratorio]=useState("");
    const [habilitado, setHabilitado] = useState(false);
    const {tipoUsuario} = route.params;

    useEffect(() => {
        setHabilitado(nameMedicamento.length>2);
    }, [nameMedicamento]);

    return(
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={style.screen}>
                {tipoUsuario==="CUIDADOR" ? (
                    <EncabezadoCuidador navigation={navigation}/>
                ) : (
                    <Encabezado navigation={navigation}/>
                )}
                <View style={{ flex:1,alignItems:"center",marginVertical:30}}>
                    <QuestionContainer text="¿QUÉ MEDICAMENTO QUIERE AGREGAR?"/>
                    <Text style={style.text}>Ingrese el nombre del medicamento. Luego presione "CONTINUAR"</Text>
                    <AppInput actualizarCampo={setNameMedicamento} instructivo="Medicamento*" seguro={false}/> 
                    <AppInput actualizarCampo={setDescripcion} instructivo="Descripción médica" seguro={false}/>                    
                    <AppInput actualizarCampo={setLaboratorio} instructivo="Laboratorio" seguro={false}/>                                       
                    <Text></Text>
                    <AppButton habilitado={habilitado} theme="blue" text="CONTINUAR" onPress={()=>navigation.navigate('FotoMedicamento',{tipoUsuario:tipoUsuario,nameMedicamento: nameMedicamento,descripcion:descripcion,laboratorio:laboratorio})}/>
                </View>
                <BottomRegresar/>
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
    text:{
        color:"#8696BB",
        fontSize:16,
        width:Dimensions.get("window").width*0.75,
        textAlign:"center",
        marginVertical:10
    }
})

export default NameMedicamento