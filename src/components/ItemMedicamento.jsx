import React,{useState} from "react";
import {View,StyleSheet,Text,Image, TouchableOpacity,Dimensions} from "react-native";
import Modal from "react-native-modal";
import AppButton from "../components/AppButton.jsx";

const ItemMedicamento=(props)=>{

    const [modalVisible, setModalVisible] = useState(false);

    const handleToMedicamento=()=>{
        props.navigation.navigate('Medicamento', { medicamento: props.medicamento });
    }

    return (
        <TouchableOpacity onPress={handleToMedicamento}>
            <View style={style.container}>
                <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
                    <View>
                        <Text style={style.title}>{props.medicamento.nameMedicamento}</Text>
                        <View style={{flexDirection:"row",alignItems:"center"}}>
                            {props.medicamento.contenidoActual > 5 ? (
                                <>
                                    <Image style={style.image} source={require("../../assets/images/DISPONIBLE.png")}/>
                                    <Text style={style.text}>Hay {props.medicamento.contenidoActual} {props.medicamento.tipo==="JARABE" ? "mililitros" : props.medicamento.tipo.toLowerCase()}</Text>
                                </>
                            ) : props.medicamento.contenidoActual > 0 ? (
                                <>
                                    <Image style={style.image} source={require("../../assets/images/REPONE.png")}/>
                                    <Text style={style.text}>Hay {props.medicamento.contenidoActual} {props.medicamento.contenidoActual===1 ? props.medicamento.tipo?.slice(0, -1).toLowerCase() : props.medicamento.tipo?.toLowerCase() || ""}</Text>
                                </>
                            ) : (
                                <>
                                    <Image style={style.image} source={require("../../assets/images/NODISPONIBLE.png")}/>
                                    <Text style={style.text}>No disponible. Repone!</Text>
                                </>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Image style={{width:55,height:70,resizeMode:"contain",borderWidth:2,borderColor:"white"}} source={{uri:props.medicamento.imagenUrl}}/>
                    </TouchableOpacity>
                </View>
                <Modal isVisible={modalVisible} onBackdropPress={()=>setModalVisible(false)} style={{ alignItems: "center" }}>
                  <View style={style.modalContainer}>
                      <Image style={style.modalImage} source={{uri: props.medicamento.imagenUrl}} />
                      <AppButton theme="blue" text="CERRAR" habilitado={true} onPress={()=>setModalVisible(false)}/>
                  </View>
              </Modal>
            </View>
        </TouchableOpacity>
      );
}

export default ItemMedicamento

const style=StyleSheet.create({
    container:{
        backgroundColor:"#F2F2F2",
        borderColor:"#0057CF",
        borderRadius:25,
        borderWidth:2,
        justifyContent:"center",
        paddingHorizontal:15,
        paddingVertical:20,
        marginVertical:7,
        marginHorizontal:12
    },
    title:{
        color:"black",
        fontSize:25,
        fontWeight:"bold",
        marginBottom:10,
        width:Dimensions.get("window").width*0.63
    },
    text:{
        color:"#0057CF",
        fontSize:18,
        textAlign:"left"
    },
    image:{
        resizeMode:"contain",
        width:20,
        height:20,
        marginRight:10
    },
    modalContainer: { 
        alignItems: "center", 
        width: Dimensions.get("window").width*0.9
    },
    modalImage: { 
      width: 300,
      height: 400,
      resizeMode: "contain",
      borderRadius:20,
      borderColor:"white",
      borderWidth:3
    }
})