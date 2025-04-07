import React from "react";
import { View,Text,Dimensions, StyleSheet} from "react-native";
import { useNavigation } from '@react-navigation/native';
import AppButton from "../components/AppButton"

const BottomRegresar=(props)=>{
    const navigation = useNavigation();

    return(
        <View style={style.container}>
            <AppButton theme="red" text="REGRESAR" onPress={()=>navigation.goBack()} habilitado={true}/>
        </View>
    )
}

export default BottomRegresar

const style=StyleSheet.create({
    container:{
        width:Dimensions.get('window').width,
        padding:10,
        backgroundColor:"#ECECEC",
        justifyContent:"center",
        alignItems:"center",
        marginTop:10
    }
})