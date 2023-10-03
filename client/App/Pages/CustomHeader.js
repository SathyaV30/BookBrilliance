import React from 'react';
import { ImageBackground, Text } from 'react-native';
import libraryPic from './Images/library.jpg';

export default function CustomHeader({ title }) {
  if (!libraryPic) {
    return null;
  }
  return (
    <ImageBackground source={libraryPic} style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Text>{title}</Text>
    </ImageBackground>
  );
}
