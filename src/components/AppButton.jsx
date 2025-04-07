import React from "react";
import {Text,View,TouchableOpacity,StyleSheet,Dimensions} from 'react-native';

const AppButton=(props)=>{

    const backgroundTheme = props.theme === "red" ? style.red : style.blue;

    return (
        <TouchableOpacity disabled={!props.habilitado} onPress={props.onPress}>
            <View style={props.habilitado ? [style.buttonStyle, backgroundTheme] : [style.disabled,style.buttonStyle, backgroundTheme]}>
                <Text style={style.textStyle}>{props.text}</Text>
            </View>
        </TouchableOpacity>
    );
};

const style=StyleSheet.create({
    blue:{
        backgroundColor:"#0057CF",
    },
    red:{
        backgroundColor:"#A21A1A",
    },
    disabled:{
        opacity:0.5,
    },
    buttonStyle:{
        resizeMode:"contain",
        alignItems:"center",
        justifyContent:"center",
        borderRadius:15,
        paddingHorizontal:10,
        paddingVertical:15,
        marginBottom:10,
        width: Dimensions.get("window").width*0.8,        
        marginVertical:5,
        shadowColor: 'black',
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 7,
    },
    textStyle:{
        fontWeight:"bold",
        fontSize:22,
        color:"white",
        textAlign:"center"
    },
})

export default AppButton