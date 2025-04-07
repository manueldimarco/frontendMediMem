import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const LoadingOverlay = ({ isLoading }) => {

  const rotateValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLoading) {
      startRotation();
      fadeOut();
    } else {
      rotateValue.setValue(0);
      fadeIn();
    }
  }, [isLoading]);

  const startRotation = () => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeValue, {
      toValue: 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const fadeIn = () => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  if (!isLoading) return null; 

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.overlay, { opacity: fadeValue }]} />
      <Animated.Image
        source={require('../assets/images/LOADING.png')}
        style={[styles.image, animatedStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  image: {
    width: 140,
    height: 140,
    zIndex: 2,
  },
});

export default LoadingOverlay;