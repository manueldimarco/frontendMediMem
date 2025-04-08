import React, { useState, useContext, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet,SafeAreaView,Dimensions,ActivityIndicator,Image,Alert,TouchableOpacity,TextInput,BackHandler} from "react-native";
import { HostContext } from "../context/HostContext.jsx";
import useAppStore from "../stores/useAppStore";
import LoadingOverlay from "../LoadingOverlay";
import { useImageManipulator, FlipType, SaveFormat } from "expo-image-manipulator";
import { CameraView, useCameraPermissions } from "expo-camera";
import AppButton from "../components/AppButton.jsx";

const ChatUsuario = ({navigation,route}) => {

    const {jwt,usuarioId,fotoUrlCuidador,usernameCuidador,nameCuidador,username,usuarioCuidadorId,tokenExpoCuidador} = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const host = useContext(HostContext);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [textInput, setTextInput] = useState("");
    const [cameraOn, setCameraOn] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState(null);
    const cameraRef = useRef(null);
    const [context, setContext] = useState(null); 
    const [isImageLoading, setIsImageLoading] = useState(null); 

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', function() {return true})
        return () => BackHandler.removeEventListener; 
    }, []);

    useEffect(() => {
        setIsLoading(true);
        sendPushNotification("START");
        const ws = new WebSocket(`ws://192.168.100.9:8080/chat?userId=${usuarioId}`);

        ws.onopen = () => console.log('Conectado al WebSocket');
        ws.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data);
            setMessages(prev => [...prev, receivedMessage]);
        };
        ws.onerror = (error) => console.error('Error WebSocket:', error);
        ws.onclose = () => console.log('WebSocket USUARIO cerrado');

        setSocket(ws);
        setIsLoading(false);
        return () => ws.close();
    }, []);


    //Envío notificación de inicio o fin de chat al cuidador
    const sendPushNotification = async (tipo) => {
        const title = tipo==="START" ? `SOLICITUD DE CHAT` : "FIN DE CHAT";
        const body = tipo==="START" ? `${username} quiere hablar con vos` : "Finalizó el chat";
        const message = {
          to: tokenExpoCuidador,
          sound: 'notification_sound.wav',
          title: title,
          body: body,
          channelId: "myNotificationChannel",
          data: {
            usuarioId: usuarioId 
          } 
        };
    
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
    
        console.log('Notificación enviada');
    };

    const enviarMensaje = (content,type) => {
        if (socket && content.trim()) {
            const chatMessage = {
                senderId: usuarioId, 
                type,
                content,
                receiverId: usuarioCuidadorId
            };
            socket.send(JSON.stringify(chatMessage));
            setMessages(prev => [...prev, chatMessage]);
            setTextInput('');
        }
    };
      
    const finalizarChat = async () => {
        try {
            const response = await fetch(host+"/usuarios/finalizarChat/"+usuarioCuidadorId, {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' +jwt,
                'Content-Type': 'application/json',
            }
            });
            if (response.ok) {
             console.log("Se reportó el fin de chat con éxito.")
            } else if(response.status==401){
                const error = await response.text(); 
                Alert.alert("SESIÓN VENCIDA", error || "Inicia sesión nuevamente");
            } else if (response.status === 404) {
                const error = await response.text(); 
                Alert.alert("ERROR", error || "Cuidador no logueado");
            } else {
                Alert.alert("Error inesperado", "Ocurrió un error inesperado");
            }
        } catch (error) {
            Alert.alert('Error', "Error inesperado.");
        } 
    };

    const handleCloseChat = () => {
        finalizarChat();
        sendPushNotification("END");
        if (socket) {
            socket.close(); 
            console.log("Socket consumidor cerrado con éxito.")
        }
        setMessages([]); 
        navigation.navigate("Home")
    };

    useEffect(() => {
        if (photo && photo.uri) {
            setContext(useImageManipulator(photo.uri)); 
        } else {
            setContext(null);
        }
    }, [photo]);
    
    if (!permission) return <View />;
    if (!permission.granted) requestPermission();

    const takePicture = async () => {
        setIsLoading(true);
        if (cameraRef.current) {
            try {
            const photoData = await cameraRef.current.takePictureAsync();
            setPhoto(photoData.uri);
            } catch (error) {
            Alert.alert("Error", "No se pudo tomar la foto.");
            }
        }
        setIsLoading(false);
    };
    
    const uploadToCloudinaryAndSend = async (imageUri) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", { uri: imageUri, name: "imagenchat.jpg", type: "image/jpeg" });
            formData.append("upload_preset", "MediMem"); 
            formData.append("cloud_name", "dmbtwdexi"); 
            const response = await fetch("https://api.cloudinary.com/v1_1/dmbtwdexi/image/upload", {
            method: "POST",
            body: formData,
            });
            const data = await response.json();
            console.log("Respuesta de Cloudinary:", data);
            if (data.secure_url) {
            enviarMensaje(data.secure_url, "FOTO");
            }          
        } catch (error) {
            Alert.alert("Error", "No se pudo subir la imagen.");
            console.error("Error en la subida a Cloudinary:", error);
        } finally {
            setIsLoading(false);
            setCameraOn(false);
            setPhoto(null)
        }
    };

    return(
        <SafeAreaView style={{ flex: 1, flexGrow: 1 }}>
            <LoadingOverlay isLoading={isLoading} />
            {cameraOn ? (
                !photo ? (
                    <View style={{ flex: 1 }}>
                        <CameraView style={style.camera} ref={cameraRef} mode="picture">
                            <AppButton habilitado={true} theme="blue" text="REGRESAR" onPress={()=>setCameraOn(false)}/>
                            <TouchableOpacity onPress={takePicture} style={style.buttonContainer}>
                                <Image style={style.buttonImage} source={require("../../assets/images/camara.png")} />
                                <Text style={style.text}>TOMAR FOTO</Text>
                            </TouchableOpacity>
                        </CameraView>
                    </View>
                ) : (
                    <View style={{ flex: 1 ,alignItems:"center",backgroundColor:"white",paddingVertical:30}}>
                        <Image source={{ uri: photo }} style={style.previewImage} />
                        <AppButton habilitado={true} theme="blue" text="ENVIAR" onPress={()=>uploadToCloudinaryAndSend(photo)}/>
                        <AppButton habilitado={true} theme="red" text="TOMAR OTRA" onPress={() => setPhoto(null)}/>
                    </View>
                )
            ) : (
                <View style={style.screen}>

                    <View style={style.encabezadoReceptor}>
                        <Image style={{width:72,height:72,marginRight:10,borderRadius:50,borderColor:"white",borderWidth:0.5}} source={{uri:fotoUrlCuidador}}/>
                        <View style={{width:"70%",alignItems:"flex-end"}}>
                            <Text style={{fontSize:18,color:"white",marginBottom:5}}>Estás hablando con</Text>
                            <Text style={{fontSize:22,color:"white",fontStyle:"italic",fontWeight:"bold"}}> {nameCuidador}</Text>
                        </View>
                    </View>

                    <View style={style.encabezado}>
                        <TouchableOpacity style={{flexDirection:"row",alignItems:"center",backgroundColor:"white",paddingHorizontal:10,paddingVertical:3,borderRadius:20}} onPress={()=>handleCloseChat()}>
                            <Text style={{fontSize:16,color:"#A21A1A",fontWeight:"bold",marginRight:5}}>Finalizar chat</Text>
                            <Image style={{width:40,height:40}} source={require("../../assets/images/ENDROJO.png")}/>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{flexGrow:1,width:"100%",backgroundColor:"white",paddingVertical:15}}>
                        {messages.map((msg, index) => (
                            <View key={index} style={{ marginVertical:7,marginHorizontal:10,width:"96%",alignItems:msg.senderId===usuarioId ? "flex-end" : "flex-start"}}>
                                <View style={{ padding: 15,maxWidth:"80%",backgroundColor:"#F0F0F0",alignItems:msg.senderId===usuarioId ? "flex-end" : "flex-start",borderRadius:15}}>
                                    <Text style={{fontSize:14,color:"black",fontWeight:"bold",marginBottom:7}}>
                                        {msg.senderId===usuarioId ? username : usernameCuidador}
                                    </Text>                             
                                    {msg.type === "TEXTO" ? (
                                        <Text style={{fontSize:18,color:"black"}}>{msg.content}</Text>
                                    ) : (
                                        <>
                                            <Image source={{ uri: msg.content }} style={{ width: 200, height: 250,resizeMode:"cover"}} onLoadStart={() => setIsImageLoading(true)} onLoadEnd={() => setIsImageLoading(false)}/>
                                            {isImageLoading && (
                                                    <ActivityIndicator style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} size="large" color="#0000ff"/>
                                            )}
                                        </>
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",padding:10}}>
                        <TextInput style={{flex:1,padding:10,fontSize:18,width:"70%",borderColor:"#333333",borderWidth:1,borderRadius:15}} placeholder="Escribe..."
                        placeholderTextColor="gray" onChangeText={(text) => setTextInput(text)} value={textInput}/>
                        {textInput==="" ? (
                            <TouchableOpacity onPress={()=>setCameraOn(true)}>
                                <Image style={{width:40,height:40,marginLeft:5}} source={require("../../assets/images/CAMARAGRIS.png")}/>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={()=>enviarMensaje(textInput,"TEXTO")}>
                                <Image style={{width:38,height:38,marginLeft:8}} source={require("../../assets/images/SEND.png")}/>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
            
        </SafeAreaView>
    )
}

const style=StyleSheet.create({
    screen:{
        backgroundColor: 'white',
        flex:1,
        flexGrow:1
    },
    encabezado:{
        paddingTop:15,
        paddingBottom:12,
        paddingHorizontal:15,
        width:"100%",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#0057CF"
    },
    encabezadoReceptor:{
        paddingTop:18,
        paddingHorizontal:15,
        width:"100%",
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        backgroundColor:"#0057CF"
    },
    camera: { width: "100%", height: "100%", justifyContent: "space-between", alignItems: "center",paddingVertical:20 },
    buttonContainer: { backgroundColor: "#0057CF", borderRadius: 25, padding: 15, borderWidth: 3, borderColor: "#FFFFFF", alignItems: "center",marginBottom:10 },
    buttonImage: { width: 50, height: 50, resizeMode: "contain"},
    text: { fontSize: 18, fontWeight: "bold", color: "white", textAlign: "center" },
    previewImage: { width: "95%", height: "65%", resizeMode: "cover",borderRadius:40,marginBottom:30}
    
})

export default ChatUsuario