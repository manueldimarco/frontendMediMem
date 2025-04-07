import React, {useContext,useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, FlatList,Animated,Alert} from "react-native";
import Encabezado from "../components/Encabezado";
import EncabezadoCuidador from "../components/EncabezadoCuidador";
import BottomBar from "../components/BottomBar";
import BottomBarCuidador from "../components/BottomBarCuidador";
import AppButton from "../components/AppButton";
import LoadingOverlay from '../LoadingOverlay';
import ItemMedicamento from "../components/ItemMedicamento";
import useAppStore from "../stores/useAppStore";
import { HostContext } from "../context/HostContext";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const Medicamentos = ({ navigation }) => {

  const [isLoading, setIsLoading] = useState(false);
  const {jwt,setMedicamentos,medicamentos,tipoUsuario,nameAsociado,usuarioId,usuarioCuidadoId} = useAppStore();  
  const host = useContext(HostContext)
  const translateY = new Animated.Value(0);
  
  const idEndpoint=tipoUsuario==="CUIDADOR" ? usuarioCuidadoId : usuarioId;

  const fetchMedicamentos= async () => {
    try {
        const response = await fetch(host+'/usuarios/'+idEndpoint, {
          method: 'GET',
          headers: {
              'Authorization': 'Bearer ' + jwt,
              'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        if (response.ok) {
          setMedicamentos(data.medicamentos); 
        } else if (response.status==401) {
          Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
        } else {
          Alert.alert("ERROR",response.text)
        }
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      Alert.alert('Error', "Error obteniendo usuario.");
    } finally {
      setIsLoading(false);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const onGestureEvent = Animated.event([{ nativeEvent: { translationY: translateY } }], { useNativeDriver: true });

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > 50) { 
        setIsLoading(true);
        fetchMedicamentos();
      } else {
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
      <Animated.View style={[style.content, { transform: [{ translateY }] }]}>
    <SafeAreaView style={{ flex: 1,backgroundColor:"white"}}>
      <LoadingOverlay isLoading={isLoading} />
      {tipoUsuario === "CONSUMIDOR" ? (
        <>
          <Encabezado navigation={navigation} />
          <View style={style.containerText}>
            <Text style={style.textTitle}>Medicamentos</Text>
          </View>
        </>
      ) : (
        <EncabezadoCuidador navigation={navigation} />
      )}
      {!medicamentos || medicamentos.length==0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          {tipoUsuario === "CONSUMIDOR" ? (
            <Text style={{ color: "black", fontSize: 24, textAlign: "center", marginBottom: 40 }}>No has registrado medicamentos</Text>
          ) : (
            <Text style={{ color: "black", fontSize: 24, textAlign: "center", marginBottom: 40, width: "85%" }}>{nameAsociado} no ha registrado medicamentos</Text>
          )}
          <AppButton text="AGREGAR MEDICAMENTO" theme="blue" onPress={() => navigation.navigate("NameMedicamento", { tipoUsuario: tipoUsuario })} habilitado={true} />
        </View>
        
      ) : (
        <>
          <TouchableOpacity style={{ alignItems: "center"}} onPress={() => navigation.navigate("NameMedicamento", { tipoUsuario: tipoUsuario })}>
            <View style={style.buttonAddMedicamentos}>
              <Image style={style.imageAddMedicamentos} source={require("../../assets/images/AGREGAR.png")} />
              <Text style={style.textAddMedicamentos}>NUEVO MEDICAMENTO</Text>
            </View>
          </TouchableOpacity>
          <FlatList
            data={medicamentos}
            renderItem={({ item }) => <ItemMedicamento medicamento={item} navigation={navigation} />}
            keyExtractor={(item) => item.medicamentoId.toString()}
            style={{ backgroundColor:"white"}}
          />
        </>
      )}
      
      {tipoUsuario === "CONSUMIDOR" ? (
        <BottomBar navigation={navigation}/>
      ) : (
        <BottomBarCuidador navigation={navigation}/>
      )}
      
    </SafeAreaView>
    </Animated.View>
    </PanGestureHandler>
  );
};

const style = StyleSheet.create({
  screen: {
    justifyContent: "space-around",
    backgroundColor: 'white',
    flex: 1
  },
  content: {
    flex: 1,
    backgroundColor: "white",
  },
  textTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00008B",
    marginLeft: 10
  },
  containerText: {
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomColor: "#00008B",
    borderBottomWidth: 2
  },
  buttonAddMedicamentos: {
    backgroundColor: "#0057CF",
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 20
  },
  textAddMedicamentos: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginHorizontal: 8
  },
  imageAddMedicamentos: {
    resizeMode: "contain",
    width: 30,
    height: 30
  }
});

export default Medicamentos;