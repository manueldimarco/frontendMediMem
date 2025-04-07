import React, { useState, useRef, useEffect,useContext} from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Modal from "react-native-modal";
import LoadingOverlay from "../LoadingOverlay.js";
import { useImageManipulator, FlipType, SaveFormat } from "expo-image-manipulator";
import { HostContext } from "../context/HostContext.jsx";

const FotoUsuario = ({navigation,route}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [registradoVisible, setRegistradoVisible] = useState(false);
  const cameraRef = useRef(null);
  const [context, setContext] = useState(null); 
  const {name,username,correo,password,telefono,tipoUsuario} = route.params;
  const host = useContext(HostContext);

  useEffect(() => {
    if (photo && photo.uri) {
      setContext(useImageManipulator(photo.uri)); 
    } else {
      setContext(null);
    }
  }, [photo]);


  const cerrarModal = () => {
    setRegistradoVisible(false);
    navigation.navigate('Login');
  };

  if (!permission) return <View />;
  if (!permission.granted) requestPermission();

  const takePicture = async () => {
    setIsLoading(true);
    if (cameraRef.current) {
      try {
        const photoData = await cameraRef.current.takePictureAsync();
        setPhoto(photoData.uri);
        setModalVisible(true);
      } catch (error) {
        Alert.alert("Error", "No se pudo tomar la foto.");
      }
    }
    setIsLoading(false);
  };

  const uploadToCloudinary = async (imageUri) => {
    setIsLoading(true);
    try {
      console.log("Iniciando subida a Cloudinary, URI original:", imageUri);
      const formData = new FormData();
      formData.append("file", { uri: imageUri, name: "usuarioCuidador.jpg", type: "image/jpeg" });
      formData.append("upload_preset", "MediMem"); // Reemplaza con tu upload_preset
      formData.append("cloud_name", "dmbtwdexi"); // Reemplaza con tu cloud name
      console.log("Enviando petición a Cloudinary con formData:", formData);
      const response = await fetch("https://api.cloudinary.com/v1_1/dmbtwdexi/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Respuesta de Cloudinary:", data);
      setIsLoading(false);
      console.log("URL de Cloudinary recibida:", data.secure_url);
      return data.secure_url;
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "No se pudo subir la imagen.");
      console.error("Error en la subida a Cloudinary:", error);
      return null;
    }
  };

  const registrarUsuario = async () => {
    setModalVisible(false);
    const imageUrl = await uploadToCloudinary(photo);
    if (imageUrl) {
        setIsLoading(true);
        const datos = {
            name: name,
            username:username,
            tipoUsuario: tipoUsuario,
            correo: correo,
            password:password,
            telefono:telefono,
            fotoUrl:imageUrl
        };
        try {
            const response = await fetch(host+'/usuarios', {
              method: 'POST',
              headers: { 
                "Content-Type": "application/json",
              },
              body: JSON.stringify(datos),
            });

            if (response.ok) {
              console.log('Registro exitoso');
              setIsLoading(false);
              setRegistradoVisible(true);
            } else{
              setIsLoading(false);
              alert("Algo salió mal.");
            }
          } catch (error) {
            setIsLoading(false);
            console.error('Error:', error);
            alert("Algo salió mal.")
          }
    }
  };


  return (
    <View style={styles.container}>
      <LoadingOverlay isLoading={isLoading} />

      {!photo ? (
        <CameraView style={styles.camera} ref={cameraRef} mode="picture" facing="front">
          {tipoUsuario==="CONSUMIDOR" ? (
            <Text style={styles.textInstructivo}>Toma una foto de tu cara.</Text>
          ) : (
            <Text style={styles.textInstructivo}>Para que tus cuidados te identifiquen, toma una foto de tu cara.</Text>
          )}
          <TouchableOpacity disabled={isLoading} onPress={takePicture} style={styles.buttonContainer}>
            <Image style={styles.buttonImage} source={require("../../assets/images/camara.png")} />
            <Text style={styles.text}>TOMAR FOTO</Text>
          </TouchableOpacity>
        </CameraView>
      ) : (
        <Image source={{ uri: photo }} style={styles.previewImage} />
      )}

      <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)} style={{ alignItems: "center" }}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>¿Deseas registrarte con esta foto, o tomar otra?</Text>
          <View style={styles.modalFila}>
            <TouchableOpacity onPress={() => {setPhoto(null);setModalVisible(false)}} style={styles.buttonContainer}>
              <Text style={styles.text}>Tomar otra</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={registrarUsuario} style={styles.buttonContainer}>
              <Text style={styles.text}>Registrarme</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal style={{alignItems:'center'}} isVisible={registradoVisible} backdropOpacity={0.45} backdropTransitionOutTiming={0} onBackdropPress={cerrarModal}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalText}>¡Registro exitoso!</Text>
                <TouchableOpacity onPress={cerrarModal}>
                    <View style={styles.buttonContainer}>
                        <Text style={styles.text}>CERRAR</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Modal>
    </View>
  );
};

export default FotoUsuario;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  camera: { width: "100%", height: "100%", justifyContent: "space-between", alignItems: "center",paddingVertical:20 },
  buttonContainer: { backgroundColor: "#0057CF", borderRadius: 25, padding: 15, borderWidth: 3, borderColor: "#FFFFFF", alignItems: "center",marginBottom:10 },
  buttonImage: { width: 50, height: 50, resizeMode: "contain"},
  text: { fontSize: 18, fontWeight: "bold", color: "white", textAlign: "center" },
  previewImage: { width: "100%", height: Dimensions.get("screen").height * 0.78, resizeMode: "contain" },
  modalContainer: { backgroundColor: "white", borderColor: "#0057CF", borderWidth: 5, borderRadius: 35, paddingVertical: 30, alignItems: "center", width: "98%" },
  modalText: { color: "#333333", fontSize: 20, textAlign: "center", fontWeight: "600", width: "80%", marginBottom: 25 },
  modalFila: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  textInstructivo:{color:"white",fontSize:24,fontWeight:"bold",width:Dimensions.get("window").width*0.9,textAlign:"center"}
});