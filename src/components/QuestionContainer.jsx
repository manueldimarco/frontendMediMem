import React from "react";
import { View,Text,Dimensions, StyleSheet} from "react-native";

const QuestionContainer=(props)=>{
    return(
        <View style={style.container}>
            <Text style={style.text}>
                {props.text}
            </Text>
        </View>
    )
}

export default QuestionContainer

const style=StyleSheet.create({
    container:{
        width:Dimensions.get('window').width*0.9,
        padding:10,
        backgroundColor:"white",
        borderColor:"#0057CF",
        borderWidth:3,
        borderRadius:15,
        justifyContent:"center",
        alignItems:"center",
        marginVertical:10
    },
    text:{
        fontSize:24,
        textAlign:"center",
        color:"#0057CF"
    }
    
})