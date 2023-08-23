import React from 'react';
import { ImageBackground, Text } from 'react-native';
import libraryPic from './Images/library.jpg'; // Ensure you have imported the image

export default function CustomHeader({ title }) {
  return (
    <ImageBackground source={libraryPic} style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Text>{title}</Text>
    </ImageBackground>
  );
}