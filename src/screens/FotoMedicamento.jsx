import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Modal from "react-native-modal";
import LoadingOverlay from "../LoadingOverlay";
import { useImageManipulator, FlipType, SaveFormat } from "expo-image-manipulator";
import QuestionContainer from "../components/QuestionContainer";

const FotoMedicamento = ({navigation,route}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const cameraRef = useRef(null);
  const [context, setContext] = useState(null); 
  const {tipoUsuario,nameMedicamento,descripcion,laboratorio} = route.params;

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
      formData.append("file", { uri: imageUri, name: "medicamento.jpg", type: "image/jpeg" });
      formData.append("upload_preset", "MediMem"); 
      formData.append("cloud_name", "dmbtwdexi"); 
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

  const handleContinue = async () => {
    setModalVisible(false);
    const imageUrl = await uploadToCloudinary(photo);
    if (imageUrl) {
      console.log("Navegando a TipoMedicamento con URL:", imageUrl);
      navigation.navigate("TipoMedicamento", {tipoUsuario:tipoUsuario,nameMedicamento:nameMedicamento,descripcion:descripcion,laboratorio:laboratorio,imagenUrl:imageUrl });
    }
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay isLoading={isLoading} />

      {!photo ? (
        <CameraView style={styles.camera} ref={cameraRef} mode="picture">
          <QuestionContainer text="TOMA UNA FOTO DEL MEDICAMENTO"/>
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
          <Text style={styles.modalText}>¿Desea continuar con esta foto o tomar otra?</Text>
          <View style={styles.modalFila}>
            <TouchableOpacity onPress={() => setPhoto(null)} style={styles.buttonContainer}>
              <Text style={styles.text}>Tomar otra</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleContinue} style={styles.buttonContainer}>
              <Text style={styles.text}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FotoMedicamento;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  camera: { width: "100%", height: "100%", justifyContent: "space-between", alignItems: "center",paddingVertical:20 },
  buttonContainer: { backgroundColor: "#0057CF", borderRadius: 25, padding: 15, borderWidth: 3, borderColor: "#FFFFFF", alignItems: "center",marginBottom:10 },
  buttonImage: { width: 50, height: 50, resizeMode: "contain"},
  text: { fontSize: 18, fontWeight: "bold", color: "white", textAlign: "center" },
  previewImage: { width: "100%", height: Dimensions.get("screen").height * 0.78, resizeMode: "contain" },
  modalContainer: { backgroundColor: "white", borderColor: "#0057CF", borderWidth: 5, borderRadius: 35, paddingVertical: 30, alignItems: "center", width: "90%" },
  modalText: { color: "#333333", fontSize: 20, textAlign: "center", fontWeight: "600", width: "80%", marginBottom: 25 },
  modalFila: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
});