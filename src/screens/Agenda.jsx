import React,{useEffect,useState} from "react";
import { View, Text, StyleSheet,SafeAreaView,Image} from "react-native";
import Encabezado from "../components/Encabezado";
import BottomBar from "../components/BottomBar";
import LoadingOverlay from '../LoadingOverlay';
import TomasDia from "../components/TomasDia"
import Swiper from "react-native-swiper";
import {addDays} from 'date-fns';
import EncabezadoCuidador from "../components/EncabezadoCuidador";
import BottomBarCuidador from "../components/BottomBarCuidador";
import useAppStore from "../stores/useAppStore";

const Agenda = ({navigation}) => {
    
    const [isLoading, setIsLoading] = useState(false);
    const [index, setIndex] = useState(3);
    const [dias, setDias] = useState([]);
    const {tipoUsuario} = useAppStore();  

    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const formattedDate = `${day}/${month}`;

    const generarDias = () => {
        const hoy = new Date();
        const nuevosDias = [];
        for (let i = -3; i <= 3; i++) {
            nuevosDias.push(addDays(hoy, i));
        }
        setDias(nuevosDias);
    };

    useEffect(() => {
        generarDias();
    }, []);

    return(
        
        <SafeAreaView style={{flex:1}}>
            <LoadingOverlay isLoading={isLoading} />
            <View style={style.screen}>
                {tipoUsuario==="CUIDADOR" ? (
                    <EncabezadoCuidador square={true} navigation={navigation}/>
                ) : (
                    <Encabezado navigation={navigation}/>
                )}
                {tipoUsuario==="CUIDADOR" ? null : (
                    <View style={style.containerText}>
                        <Text style={style.textTitle}>Mis tomas</Text>
                        <View style={style.cartelHoy}>
                            <Image style={style.imageHoy} source={require("../../assets/images/TODAY.png")}/>
                            <Text style={style.textHoy}>{formattedDate}</Text>
                        </View>
                    </View>
                )}
                
                <View style={{ flex: 1 }}>
                    <Swiper loop={false} showsPagination={true} index={index} onIndexChanged={(newIndex) => setIndex(newIndex)}>
                        {dias.map((dia) => (
                            <TomasDia key={dia.toISOString()} dia={dia} setIsLoading={setIsLoading}/>
                        ))}
                    </Swiper>
                </View>
                {tipoUsuario==="CUIDADOR" ? (
                    <BottomBarCuidador navigation={navigation}/>
                ) : (
                    <BottomBar navigation={navigation}/>
                )}
            </View>
        </SafeAreaView>
    )
}

const style=StyleSheet.create({
    screen:{
        justifyContent: "space-around",
        backgroundColor: 'white',
        flex:1
    },
    textTitle:{
        fontSize:24,
        fontWeight:"bold",
        color:"#00008B"
    },
    containerText:{
        paddingHorizontal:15,
        paddingBottom:12,
        borderBottomColor:"#00008B",
        borderBottomWidth:2,
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"space-between"
    },
    cartelHoy:{
        backgroundColor:"#0057CF",
        borderRadius:15,
        paddingVertical:8,
        paddingHorizontal:12,
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"center"
    },
    imageHoy:{
        width:25,
        height:25,
        resizeMode:"contain",
        marginRight:6
    },
    textHoy:{
        fontSize:18,
        fontWeight:"bold",
        color:"white"
    }
})

export default Agenda