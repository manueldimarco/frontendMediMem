import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useState, useEffect, useRef} from 'react';
import Home from '../src/screens/Home';
import HomeCuidador from '../src/screens/HomeCuidador';
import VistaCuidador from '../src/screens/VistaCuidador';
import Login from '../src/screens/Login';
import Pendientes from '../src/screens/Pendientes';
import Agenda from '../src/screens/Agenda';
import Carga from '../src/screens/Carga';
import Medicamentos from '../src/screens/Medicamentos';
import Medicamento from '../src/screens/Medicamento';
import TipoUsuario from '../src/screens/TipoUsuario';
import Registro from '../src/screens/Registro';
import RegistroCuidador from '../src/screens/RegistroCuidador';
import FotoUsuario from '../src/screens/FotoUsuario';
import SolicitarRecupero from '../src/screens/SolicitarRecupero';
import CodigoRecupero from '../src/screens/CodigoRecupero';
import NuevaPassword from '../src/screens/NuevaPassword';
import NameMedicamento from '../src/screens/NameMedicamento';
import FotoMedicamento from '../src/screens/FotoMedicamento';
import TipoMedicamento from '../src/screens/TipoMedicamento';
import ChatUsuario from '../src/screens/ChatUsuario';
import ChatCuidador from '../src/screens/ChatCuidador';
import DosisMedicamento from '../src/screens/DosisMedicamento';
import DisponibilidadMedicamento from '../src/screens/DisponibilidadMedicamento';
import FrecuenciaDia from '../src/screens/FrecuenciaDia';
import TodosLosDias from '../src/screens/TodosLosDias';
import AlgunosDias from '../src/screens/AlgunosDias';
import DiaFin from '../src/screens/DiaFin';
import Resumen from '../src/screens/Resumen';
import Perfil from '../src/screens/Perfil';
import useAppStore from "../src/stores/useAppStore";
import * as SecureStore from 'expo-secure-store';
import HostContextProvider from '../src/context/HostContext';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform,Alert } from 'react-native';
import 'firebase/messaging';
import { Audio } from 'expo-av';

const Stack = createStackNavigator();

export default function index() {

    const usuarioId = useAppStore((state) => state.usuarioId);
    const jwt = useAppStore((state) => state.jwt);
    const login = useAppStore((state) => state.login);
    const setTokenExpo = useAppStore((state) => state.setTokenExpo);
    const setMedicamentos = useAppStore((state) => state.setMedicamentos);
    const setTomas = useAppStore((state) => state.setTomas);
    const tipoUsuario = useAppStore((state) => state.tipoUsuario);
    const setUserData = useAppStore((state) => state.setUserData);
    const setCuidadorData = useAppStore((state) => state.setCuidadorData);
    const setIniciandoApp = useAppStore((state) => state.setIniciandoApp);
    const chatFinalizado = useAppStore((state) => state.chatFinalizado);
    const setChatFinalizado = useAppStore((state) => state.setChatFinalizado);
    const setUsuarioChat = useAppStore((state) => state.setUsuarioChat);
    const cleanUsuarioChat = useAppStore((state) => state.cleanUsuarioChat);
    const setAlertaOn = useAppStore((state) => state.setAlertaOn);
    const usuariosAsociados = useAppStore((state) => state.usuariosAsociados);

    const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
      undefined
    );
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    //Arranca la ejecución de la app
    useEffect(() => {
        const checkLoginStatus = async () => {
          const jwt = await SecureStore.getItemAsync('usuarioJWTMediMem');
          const userId = await SecureStore.getItemAsync('usuarioIdMediMem');
          console.log("De SecureStore: jwt "+jwt+" usuarioId "+userId)
          if (jwt!=="" && jwt && userId) {
            validarToken(jwt,userId);
          } else {
            console.log("Sesión NO iniciada")
          }
          setIniciandoApp(false);
        };
        setIniciandoApp(true);
        registerForPushNotificationsAsync().then(token => token && setTokenExpo(token));
        checkLoginStatus();

        if (Platform.OS === 'android') {
          Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
        }

        
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          if (response.notification) {
            const notification = response.notification;
            const tituloNotificacion = notification.request.content.title;
            const bodyNotificacion = notification.request.content.body;
            if(usuarioId!=="") {
              console.log("Notificación recibida en primer plano");
              setNotification(notification);
              if(tipoUsuario==="CONSUMIDOR"){
                fetchTomas(usuarioId);
              } else if(tituloNotificacion==="SOLICITUD DE CHAT"){
                setAlertaOn(true)
                let usernameRemitente = ""; 
                if (bodyNotificacion) {
                  usernameRemitente = bodyNotificacion.split(" ")[0]; 
                }
                let usuarioIdRemitente: string | null = null;
                if (Platform.OS === 'android' && (notification.request.content as any).dataString) {
                  try {
                    const data = JSON.parse((notification.request.content as any).dataString); 
                    usuarioIdRemitente = data.usuarioId;
                  } catch (error) {
                    console.error("Error al analizar dataString:", error);
                  }
                } else {
                  usuarioIdRemitente = notification.request.content.data?.usuarioId;
                }
                console.log("Usuario ID del remitente:", usuarioIdRemitente);
                setUsuarioChat({usuarioChatUsername:usernameRemitente,usuarioChatId:usuarioIdRemitente})
              } else if(tituloNotificacion==="FIN DE CHAT"){
                setChatFinalizado(true)
                cleanUsuarioChat();
              }
            }
          } else {
            console.log("No se encontró información de la notificación en la respuesta.");
          }
        });

        return () => {
          notificationListener.current &&
            Notifications.removeNotificationSubscription(notificationListener.current);
          responseListener.current &&
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);


    //Se obtiene el expo token de la app en el dispositivo y se guarda en el estado global
    async function registerForPushNotificationsAsync(){
      let token;
      if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('myNotificationChannel', {
            name: 'A channel is needed for the permissions prompt to appear',
            importance: Notifications.AndroidImportance.MAX,
            lightColor: '#FF231F7C',
            sound: 'notification_sound.wav'
          });
        }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('Failed to get push token for push notification!');
          return;
        }

        try {
          const projectId =Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
          if (!projectId) {
            console.log("Project ID no hallado");
            throw new Error('Project ID not found');
          }
          token = (await Notifications.getExpoPushTokenAsync(projectId)).data;
          console.log("Token obtenido: "+token);
          setTokenExpo(token);
          return token;
        } catch (e) {
          const token = `${e}`;
          console.log("ERROR: "+token)
        }
      } else {
        alert('Must use physical device for Push Notifications');
      }
    }

    // Si ya estaba logueado, se valida el token
    const validarToken = async (jwt: string,userId: string) => {
      try {
        console.log()
          const response = await fetch('https://backendmedimem.onrender.com/usuarios/validarJWT', {
              method: 'GET',
              headers: {
                  'Authorization': 'Bearer ' + jwt,
                  'Content-Type': 'application/json',
              },
          });
          const data = await response.json();
          if (response.ok) {
            obtenerUsuario(jwt,userId);
            console.log("Token valido");
          } else if (response.status === 401) {
            Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
          } else if (response.status === 500) {
              Alert.alert("Error del servidor", data.mensaje || "Error interno del servidor");
          } else {
              Alert.alert("Error inesperado", "Ocurrió un error inesperado");
          }
    } catch (error) {
        console.error("Error al validar el token:", error);
        Alert.alert("Error de red", "Verifica tu conexión a internet");
        return false;
    }
    };

    //Reproduzco el sonido al llegar notificación
    const playSound = async () => {
      try {
          console.log("Ejecutando sonido...");
          const soundObject = new Audio.Sound(); 
          await soundObject.loadAsync(require('./notification_sound.wav'));
          await soundObject.playAsync();
      } catch (error) {
          console.error('Error al reproducir sonido:', error);
      }
    };

    
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        console.log("recibida")
        const tituloNotificacion = notification.request.content.title;
        const bodyNotificacion = notification.request.content.body;
        if(usuarioId!=="") {
          console.log("Notificación recibida en primer plano");
          setNotification(notification);
          if(tipoUsuario==="CONSUMIDOR"){
            fetchTomas(usuarioId);
            playSound();
          } else if(tituloNotificacion==="SOLICITUD DE CHAT"){
            setAlertaOn(true)
            let usernameRemitente = ""; 
            if (bodyNotificacion) {
              usernameRemitente = bodyNotificacion.split(" ")[0]; 
            }
            let usuarioIdRemitente: string | null = null;
            if (Platform.OS === 'android' && (notification.request.content as any).dataString) {
              try {
                const data = JSON.parse((notification.request.content as any).dataString); 
                usuarioIdRemitente = data.usuarioId;
              } catch (error) {
                console.error("Error al analizar dataString:", error);
              }
            } else {
              usuarioIdRemitente = notification.request.content.data?.usuarioId;
            }
            console.log("Usuario ID del remitente:", usuarioIdRemitente);
            setUsuarioChat({usuarioChatUsername:usernameRemitente,usuarioChatId:usuarioIdRemitente})
          } else if(tituloNotificacion==="FIN DE CHAT"){
            setChatFinalizado(true)
            cleanUsuarioChat();
          }
        }

        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        };
      },
    });

    //Si el usuario ya estaba logueado y el token es válido, se obtienen sus datos
    const obtenerUsuario= async (jwt:string,userId: string) => {
      try {
        console.log("Obteniendo usuario con id "+userId)
        const response = await fetch(`https://backendmedimem.onrender.com/usuarios/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwt}`, 
            'Content-Type': 'application/json', 
          },
        });
        const data = await response.json();
        if(response.ok){
          console.log('Obteniendo usuario ya logueado: '+data.tipoUsuario);
          setMedicamentos(data.medicamentos);
          setUserData({name: data.name,username: data.username,correo: data.correo,telefono:data.telefono,tipoUsuario:data.tipoUsuario,fotoUrl:data.fotoUrl,usuariosAsociados:data.usuariosAsociados});
          if(data.tipoUsuario==="CONSUMIDOR" && data.usuariosAsociados){
            setCuidadorData({
              fotoUrlCuidador:data.usuariosAsociados[0].fotoUrl,
              nameCuidador:data.usuariosAsociados[0].name,
              usernameCuidador:data.usuariosAsociados[0].username,
              telefonoCuidador:data.usuariosAsociados[0].telefono,
              usuarioCuidadorId:data.usuariosAsociados[0].usuarioId
            })
          }
          console.log("Guardando en zustand: userId"+userId+" JWT "+jwt)
          login(userId,jwt);
        } else if(response.status==401){
          Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
        } else{
          Alert.alert('ERROR', "Error desconocido.");
        }
        
      } catch (error) {
        console.error('Error obteniendo usuario:', error);
        alert("Error obteniendo usuario.");
      } 
    };

    

    //Si se recibe la notificación con la app abierta y el token es válido, obtengo las tomas de ese usuario
    const fetchTomas= async (userId: string) => {
      console.log("OBTENIENDO TOMAS")
      try {
        const response = await fetch(`https://backendmedimem.onrender.com/tomas/${userId}`, {
          headers: {
            'Authorization': `Bearer ${jwt}`, 
            'Content-Type': 'application/json', 
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTomas(data);
        } else if (response.status === 401) {
          Alert.alert('SESIÓN VENCIDA', "Cierra sesión e ingresa nuevamente");
        } else if (response.status === 500) {
          Alert.alert("Error del servidor", "Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.");
        } else {
          Alert.alert("Error inesperado", `Ocurrió un error al obtener las tomas (código ${response.status}).`);
        }
      } catch (error) {
          console.error('Error obteniendo tomas:', error);
          Alert.alert("Error de red", "Verifica tu conexión a internet e inténtalo de nuevo.");
      }
    };


    return (
        <HostContextProvider>

          <Stack.Navigator screenOptions={{headerShown:false}}>
              {usuarioId=="" ? (
                  <>
                      <Stack.Screen name="Login" component={Login}/>
                      <Stack.Screen name="Registro" component={Registro} />
                      <Stack.Screen name="RegistroCuidador" component={RegistroCuidador} />
                      <Stack.Screen name="FotoUsuario" component={FotoUsuario} />
                      <Stack.Screen name="TipoUsuario" component={TipoUsuario} />
                      <Stack.Screen name="SolicitarRecupero" component={SolicitarRecupero} />
                      <Stack.Screen name="CodigoRecupero" component={CodigoRecupero} />
                      <Stack.Screen name="NuevaPassword" component={NuevaPassword} />
                  </>
              ) : (
                  <>
                      <Stack.Screen name="Carga" component={Carga} />
                      <Stack.Screen name="ChatUsuario" component={ChatUsuario} />
                      <Stack.Screen name="ChatCuidador" component={ChatCuidador} />
                      <Stack.Screen name="Home" component={Home} />
                      <Stack.Screen name="Perfil" component={Perfil} />
                      <Stack.Screen name="HomeCuidador" component={HomeCuidador} />
                      <Stack.Screen name="VistaCuidador" component={VistaCuidador} />
                      <Stack.Screen name="Pendientes" component={Pendientes} />
                      <Stack.Screen name="Agenda" component={Agenda} />
                      <Stack.Screen name="Medicamentos" component={Medicamentos} />
                      <Stack.Screen name="Medicamento" component={Medicamento} />
                      <Stack.Screen name="NameMedicamento" component={NameMedicamento} />
                      <Stack.Screen name="FotoMedicamento" component={FotoMedicamento} />
                      <Stack.Screen name="TipoMedicamento" component={TipoMedicamento} />
                      <Stack.Screen name="DosisMedicamento" component={DosisMedicamento} />
                      <Stack.Screen name="DisponibilidadMedicamento" component={DisponibilidadMedicamento} />
                      <Stack.Screen name="FrecuenciaDia" component={FrecuenciaDia} />
                      <Stack.Screen name="TodosLosDias" component={TodosLosDias} />
                      <Stack.Screen name="AlgunosDias" component={AlgunosDias} />
                      <Stack.Screen name="DiaFin" component={DiaFin} />
                      <Stack.Screen name="Resumen" component={Resumen} />
                      
                  </>
              )}
              </Stack.Navigator>

          </HostContextProvider> 

    );
}