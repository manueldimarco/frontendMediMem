import React,{useState} from "react";
import {View,StyleSheet,Dimensions,TextInput} from "react-native";

const AppInput=(props)=>{
    const [text, setText] = useState("");

    function actualizarDatos(text){
        setText(text);
        props.actualizarCampo(text);
    }

    return(
        <View style={style.input}>
            <TextInput style={{flex:1,padding:10,fontSize:18}} placeholder={props.instructivo} 
            placeholderTextColor="gray" onChangeText={(text) => actualizarDatos(text)} value={props.valor} secureTextEntry={props.seguro} autoCapitalize={props.capitalizar}/>
        </View>
    )
}

export default AppInput

const style=StyleSheet.create({
    input:{
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
    placeholder:{
        fontStyle:"italic",
        fontSize: 20
    }
})