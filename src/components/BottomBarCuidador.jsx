import React from "react";
import {View,TouchableOpacity,Image,Text,StyleSheet,Dimensions} from "react-native";

const BottomBarCuidador = ({ navigation }) => {
  return (
    <View style={style.container}>
      
      <TouchableOpacity onPress={() => navigation.navigate("Medicamentos")}>
        <View style={style.itemBar}>
          <Image style={style.image} source={require("../../assets/images/REMEDIOS.png")}/>
          <Text style={style.texto}>Medicamentos</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Agenda")}>
        <View style={style.itemBar}>
          <Image style={style.image} source={require("../../assets/images/AGENDA.png")}/>
          <Text style={style.texto}>Tomas</Text>
        </View>
      </TouchableOpacity>

    </View>
  );
};

export default BottomBarCuidador;

const style = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECECEC",
    borderTopColor: "#303030",
    borderTopWidth: 1,
    paddingVertical: 12,
    width: Dimensions.get("window").width,
  },
  itemBar: {
    justifyContent: "center",
    alignItems: "center",
    width:Dimensions.get("window").width*0.5
  },
  texto: {
    fontSize: 15,
    color: "#303030",
    fontWeight: "800",
    paddingTop: 6,
  },
  image: {
    resizeMode: "contain",
    height: 25,
  },
});
