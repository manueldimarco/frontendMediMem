import * as SecureStore from 'expo-secure-store';
import useAppStore from "../stores/useAppStore";
import { Alert } from 'react-native';



const resetearToken = async (usuarioId) => {
    try {
        console.log("Intentando resetear el tokenExpo al usuario con id "+usuarioId)
        const response = await fetch("https://backendmedimem.onrender.com/usuarios/"+usuarioId+"/resetearToken", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error("Error al resetear token");
        }
        console.log("Token reseteado")
    } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "No se pudo resetear el token de notificación.");
    } 
  };

const handleLogout = async ({usuarioId,logout,clearUserData,clearCuidadorData,clearAsociadoData}) => {
    console.log("EJECUTANDO LOGOUT")
    await resetearToken(usuarioId);
    await SecureStore.setItemAsync('usuarioIdMediMem', "");
    await SecureStore.setItemAsync('usuarioJWTMediMem', "");
    clearUserData();
    clearAsociadoData();
    clearCuidadorData();
    logout();

};

export default handleLogout;