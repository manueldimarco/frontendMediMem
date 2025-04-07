import React from "react";
import {View,Text,SafeAreaView,ScrollView,StyleSheet,Dimensions,Image,TouchableOpacity,Linking} from "react-native";
import Encabezado from "../components/Encabezado";
import Constants from "expo-constants";
import AppButton from "../components/AppButton.jsx";
import useAppStore from "../stores/useAppStore";
import handleLogout from '../utils/handleLogout.js'; 

const Perfil = ({ navigation }) => {
  
  const {name,username,correo,fotoUrl,telefonoCuidador,nameCuidador,fotoUrlCuidador, usuarioId,logout, clearUserData, clearCuidadorData, clearAsociadoData} = useAppStore();

  return (
    <SafeAreaView style={{ flex: 1, flexGrow: 1 }}>
        <Encabezado navigation={navigation} />
      <ScrollView contentContainerStyle={style.screen}>
        
        <View style={style.containerPerfil}>
            <View style={style.fondoPerfil}>
                <Image style={style.fotoPerfil} source={{uri:fotoUrl}}/>
                <Text style={style.textName}>{name}</Text>
            </View>
        </View>
        <View style={style.containerInfo}>
            <Text style={style.textSubtitle}>Nombre de usuario</Text>
            <Text style={style.textInfo}>{username}</Text>
        </View>
        <View style={style.containerInfo}>
            <Text style={style.textSubtitle}>Correo electrónico</Text>
            <Text style={style.textInfo}>{correo}</Text>
        </View>
        {nameCuidador!=="" ? (
          <View style={style.containerInfo}>
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginRight:20}}>
                <View>
                  <Text style={style.textSubtitle}>Te cuida</Text>
                  <Text style={style.textInfo}>{nameCuidador}</Text>
                </View>
                <Image style={{width:50,height:50,borderRadius:50,resizeMode:"cover"}} source={{uri:fotoUrlCuidador}}/>
              </View>
              <View style={{flexDirection:"row",marginTop:10,alignItems:"center",justifyContent:"center"}}>
                  <TouchableOpacity onPress={()=>Linking.openURL('whatsapp://send?phone='+telefonoCuidador)}>
                      <Image style={style.fotoButton} source={require("../../assets/images/BOTONWP.png")}/>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>Linking.openURL(`tel:`+telefonoCuidador)}>
                      <Image style={style.fotoButton} source={require("../../assets/images/BOTONLLAMAR.png")}/>
                  </TouchableOpacity>
              </View>
          </View>
        ) : (
          <View style={style.containerInfo}>
            <Text style={style.textSubtitle}>Cuidador</Text>
            <Text style={style.textInfo}>Decile a tu cuidador que se registre en MediMem, y te asocie con tu nombre de usuario</Text>
          </View>
        )}
        
        <View style={[style.containerInfo,{alignItems:"center",paddingTop:20}]}>
            <AppButton text="CERRAR SESIÓN" theme="red" onPress={()=>handleLogout({ usuarioId,logout, clearUserData, clearCuidadorData, clearAsociadoData })} habilitado={true}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingBottom: Constants.statusBarHeight*0.3,
  },
  containerPerfil:{
    paddingVertical:25,
    justifyContent:"center",
    alignItems:"center",
    paddingHorizontal:10
  },
  fondoPerfil:{
    backgroundColor:"#EBEBEB",
    paddingVertical:25,
    paddingHorizontal:10,
    borderRadius:25,
    alignItems:"center",
    width:Dimensions.get("window").width*0.85
  },
  fotoPerfil:{
    height:120,
    width:120,
    resizeMode:"cover",
    marginBottom:15,
    borderRadius:100,
    borderColor:"white",
    borderWidth:1
  },
  textName:{
    fontSize:30,
    fontWeight:"bold",
    color:"#0057CF",
    textAlign:"center"
  },
  containerInfo:{
    paddingVertical:10,
    borderTopColor:"#36454F",
    borderTopWidth:1,
    justifyContent:"center",
    width:Dimensions.get("window").width
  },
  textSubtitle:{
    color:"black",
    paddingLeft:15,
    marginBottom:5,
    fontSize:18,
    fontWeight:"bold"
  },
  textInfo:{
    color:"#0057CF",
    paddingLeft:15,
    fontSize:18,
  },
  fotoButton:{
    marginHorizontal:10,
    width:45,
    height:45,
    resizeMode:"contain"
  }
});

export default Perfil;