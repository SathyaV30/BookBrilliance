import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Particle() {
    const verticalPosition = useRef(new Animated.Value(0)).current;
    const horizontalPosition = useRef(new Animated.Value(0)).current;

    const [startY] = useState(Math.random() * -500 - 100); 
    const [startX] = useState(Math.random() * width );

    const [duration] = useState(8000 + Math.random() * 12000); 
    const horizontalMovement = Math.random() * 100 - 50;

    useEffect(() => {
        const fallAnimation = Animated.timing(verticalPosition, {
            toValue: height + startY,
            duration: duration,
            useNativeDriver: true,
        });

        const swayAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(horizontalPosition, {
                    toValue: horizontalMovement,
                    duration: duration / 2,
                    useNativeDriver: true,
                }),
                Animated.timing(horizontalPosition, {
                    toValue: -horizontalMovement,
                    duration: duration / 2,
                    useNativeDriver: true,
                })
            ])
        );

        const startAnimation = () => {
            verticalPosition.setValue(startY);
            fallAnimation.start(startAnimation);
            swayAnimation.start();
        };

        startAnimation();

        return () => {
            fallAnimation.stop();
            swayAnimation.stop();
        };
    }, [verticalPosition, duration, horizontalPosition]);

    return (
        <Animated.View style={[
            styles.particle,
            {
                transform: [
                    { translateY: verticalPosition },
                    { translateX: horizontalPosition }
                ],
                left: startX,
            }
        ]} />
    );
}

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 192, 0.06)',
    },
});
