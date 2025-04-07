import React,{useState} from "react";
import {View,StyleSheet,TextInput} from "react-native";

const NumberInput=(props)=>{
    const [text, setText] = useState("");

    function actualizarDatos(text){
        setText(text);
        props.actualizarCampo(text);
    }

    return(
        <TextInput style={style.modalTextInput} keyboardType="numeric" onChangeText={(text) => actualizarDatos(text)} value={props.valor}/>
    )
} 

export default NumberInput

const style=StyleSheet.create({
    modalTextInput:{
        borderColor:"black",
        borderRadius:10,
        borderWidth:2,
        padding:10,
        fontSize:24,
        width:"30%",
        textAlign:"center"
    }
})