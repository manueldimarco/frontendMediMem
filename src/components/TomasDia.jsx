import React,{useState,useEffect} from "react";
import { View, StyleSheet,FlatList,Text} from "react-native";
import Toma from "../components/Toma"
import useAppStore from "../stores/useAppStore";
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale'; 

const TomasDia=(props)=>{

    const tomas = useAppStore((state) => state.tomas);
    const [tomasDiaActual,setTomasDiaActual]=useState([])

    useEffect(() => {
        const tomasFiltradas = tomas.filter((toma) => {
            const fechaToma = new Date(toma.fechaHora);
            return isSameDay(fechaToma, props.dia);
        });
        setTomasDiaActual(tomasFiltradas);
    }, [props.dia, tomas]);

    const esHoy = isSameDay(props.dia, new Date());

    const getDiaTexto = (dia) => {
        if (esHoy) {
            return "HOY";
        } else {
            return `${format(dia, 'd',{ locale: es })} DE ${format(dia, 'MMMM',{ locale: es }).toUpperCase()}`;
        }
    };

    return(
        <View style={{flex: 1,width: '100%'}}>
            <View style={esHoy ? style.headerHoy : style.header}>
                <Text style={esHoy ? style.textHeaderHoy : style.textHeader}>{getDiaTexto(props.dia)}</Text>
            </View>
            <FlatList
                data={tomasDiaActual}
                keyExtractor={(item) => item.idToma.toString()}
                renderItem={({ item }) => <Toma setIsLoading={props.setIsLoading} toma={item} />}
            />
            
        </View>
    )
}

export default TomasDia

const style=StyleSheet.create({
    header:{
        paddingHorizontal:10,
        paddingVertical:12,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#00008B"
    },
    textHeader:{
        color:"white",
        fontSize:24,
        fontWeight:"bold",
        textAlign:"center"
    },
    headerHoy:{
        paddingHorizontal:10,
        paddingVertical:14,
        justifyContent:"center",
        alignItems:"center",
        borderColor:"black",
        borderWidth:2,
        backgroundColor:"yellow"
    },
    textHeaderHoy:{
        color:"black",
        fontSize:26,
        fontWeight:"bold",
        textAlign:"center"
    }
})