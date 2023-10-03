import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    Animated,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ImageBackground,
    PanResponder,
    TextInput,
    Alert,
    ActivityIndicator,
    Image
} from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import libraryPic from './Images/library.jpg';
import Particle from './Particle';
import Slider from '@react-native-community/slider'



export default function Reading() {
    const [showMusicModal, setShowMusicModal] = useState(false);
    const [showCustomTimerModal, setShowCustomTimerModal] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [initialTime, setInitialTime] = useState(10 * 60);
    const [timeRemaining, setTimeRemaining] = useState(initialTime);
    const [customMinutes, setCustomMinutes] = useState("");
    const [customSeconds, setCustomSeconds] = useState("");
    const [playbackStatus, setPlaybackStatus] = useState(null);
    const [volume, setVolume] = useState(1.0);
    const [isRepeating, setIsRepeating] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true); 
    const birds = require('./Music/birds.mp3');
    const coffee = require('./Music/coffee.mp3');
    const fireplace = require('./Music/fireplace.mp3');
    const ms = require('./Music/ms.mp3');
    const rain = require('./Music/rain.mp3');
    const tld = require('./Music/tld.mp3');
    const [showSongs, setShowSongs] = useState(true); 
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isModalImageLoaded, setIsModalImageLoaded] = useState(false);



    
    const [sound, setSound] = useState();

    useEffect(() => {
        return sound
            ? () => {
                console.log("Unloading Sound");
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: () => {}
    });

    const particles = useMemo(() => {
        return [...Array(10)].map((_, i) => (
            <Particle key={i} />
        ));
    }, []);

    useEffect(() => {
        let interval;
        if (timerActive) {
            interval = setInterval(() => {
                setTimeRemaining(prevTime => {
                    if (prevTime === 0) {
                        clearInterval(interval);
                        Alert.alert('Timer', 'Timer has finished!');
                        setTimerActive(false);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive]);

    const toggleTimer = () => {
        if (timerActive) {
            handleStopTimer();
        } else {
            handleStartTimer();
        }
    };

    const handleStartTimer = () => {
        setTimerActive(true);
    };

    const handleStopTimer = () => {
        setTimerActive(false);
    };

    const handleResetTimer = () => {
        setTimeRemaining(initialTime);
    };
    const handlePauseResume = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

  const toggleRepeat = async () => {
    if (sound) {
        await sound.setIsLoopingAsync(!isRepeating);
    }
    setIsRepeating(!isRepeating);
};


    const setCustomTime = () => {
        const customTimeInSeconds = (parseInt(customMinutes) * 60) + parseInt(customSeconds);
        setInitialTime(customTimeInSeconds);
        setTimeRemaining(customTimeInSeconds);
        setShowCustomTimerModal(false);
    };

    const handleChooseMusic = async (track) => {
        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            setSound(null);
        }
    
        let newSound;
        try {
            newSound = new Audio.Sound();
            await newSound.loadAsync(track);
            setSound(newSound);
            await newSound.playAsync();
        } catch (error) {
            console.error("Error playing song:", error);
            if (newSound) {
                newSound.unloadAsync();
            }
        }

    if (newSound) {
        newSound.setOnPlaybackStatusUpdate(updatePlaybackStatus);
        await newSound.playAsync();
    }
    };
    const updatePlaybackStatus = (status) => {
        setPlaybackStatus(status);
    };
    
    return (
        <ImageBackground 
            source={libraryPic} 
            style={styles.backgroundImage}  
            onLoad={() => setIsImageLoaded(true)}
        >
            {isImageLoaded ? (
                <>
                    {particles}
                    <View style={{ flexDirection: 'row', width: '100%', marginTop: 5 }}>
                        <Animated.View {...panResponder.panHandlers} style={[pan.getLayout(), styles.draggableTimer, { flex: 0.2 }]}>
                            <FontAwesome name="clock-o" size={48} color="white" />
                            <Text style={styles.timerText2}>
                                {Math.floor(timeRemaining / 60)}:{timeRemaining % 60 < 10 ? '0' : ''}
                                {timeRemaining % 60}
                            </Text>
                        </Animated.View>
    
                        <View style={styles.audioControlContainer}>
                            <View style={styles.sliderContainer}>
                                <Text style={styles.timerText}>
                                    {Math.floor((playbackStatus ? playbackStatus.positionMillis : 0) / 60000)}:
                                    {((playbackStatus ? playbackStatus.positionMillis : 0) % 60000 / 1000).toFixed(0).padStart(2, '0')}
                                </Text>
    
                                <Slider
                                    style={styles.sliderStyle}
                                    value={playbackStatus ? playbackStatus.positionMillis : 0}
                                    maximumValue={playbackStatus ? playbackStatus.durationMillis : 1}
                                    onSlidingComplete={value => {
                                        if (sound) sound.setPositionAsync(value);
                                    }}
                                />
    
                                <Text style={styles.timerText}>
                                    {Math.floor((playbackStatus ? playbackStatus.durationMillis : 0) / 60000)}:
                                    {((playbackStatus ? playbackStatus.durationMillis : 0) % 60000 / 1000).toFixed(0).padStart(2, '0')}
                                </Text>
                            </View>
    
                            <View style={styles.sliderContainer}>
                                <Slider
                                    style={{ ...styles.sliderStyle, flex: 1 }}
                                    thumbStyle={{ height: 10, width: 10, backgroundColor: 'white' }}
                                    value={volume}
                                    onValueChange={value => {
                                        setVolume(value);
                                        if (sound) sound.setVolumeAsync(value);
                                    }}
                                />
    
                                <FontAwesome name="volume-up" size={24} color="white" style={{ marginLeft: 5 }} />
                            </View>
    
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 0, width: '50%' }}>
                                <TouchableOpacity onPress={handlePauseResume}>
                                    {isPlaying ? 
                                        <FontAwesome name="pause" size={30} color="white" /> :
                                        <FontAwesome name="play" size={30} color="white" />
                                    }
                                </TouchableOpacity>
    
                                <TouchableOpacity onPress={toggleRepeat}>
                                    {!isRepeating ? 
                                        <FontAwesome name="repeat" size={30} color="white" /> :
                                        <FontAwesome name="refresh" size={30} color="white" /> 
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.container}>
                        <View style={styles.optionsContainer}>
                            <TouchableOpacity style={styles.button} onPress={toggleTimer}>
                                <Text style={styles.buttonText}>{timerActive ? 'Pause' : 'Start'} Timer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={handleResetTimer}>
                                <Text style={styles.buttonText}>Reset Timer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => setShowCustomTimerModal(true)}>
                                <Text style={styles.buttonText}>Custom Timer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => setShowMusicModal(true)}>
                                <Text style={styles.buttonText}>Choose Music</Text>
                            </TouchableOpacity>
                        </View>
    
                        <Modal
                            visible={showMusicModal}
                            onRequestClose={() => setShowMusicModal(false)}
                        >
                            <ImageBackground 
                                source={libraryPic} 
                                style={styles.modalBackgroundImage} 
                                onLoad={() => setIsModalImageLoaded(true)}
                            >
                                {isModalImageLoaded ? (
                                    <View style={styles.modalContainer}>
                                        <Text style={styles.modalHeaderText}>Select a {showSongs ? 'song' : 'sound'}:</Text>
                                        <TouchableOpacity style={styles.button} onPress={() => setShowSongs(!showSongs)}>
                                            <Text style={styles.buttonText}>Toggle to {showSongs ? 'Sounds' : 'Songs'}</Text>
                                        </TouchableOpacity>
                                        {showSongs ? (
                                            <>
                                                <TouchableOpacity style={styles.button} onPress={() => handleChooseMusic(coffee)}>
                                                    <Text style={styles.buttonText}>Coffee Shop Vibes</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.button} onPress={() => handleChooseMusic(ms)}>
                                                    <Text style={styles.buttonText}>Moonlight Sonata</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.button} onPress={() => handleChooseMusic(tld)}>
                                                    <Text style={styles.buttonText}>The Long Dark</Text>
                                                </TouchableOpacity>
                                            </>
                                        ) : (
                                            <>
                                                <TouchableOpacity style={styles.button} onPress={() => handleChooseMusic(birds)}>
                                                    <Text style={styles.buttonText}>Birds</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.button} onPress={() => handleChooseMusic(fireplace)}>
                                                    <Text style={styles.buttonText}>Fireplace</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.button} onPress={() => handleChooseMusic(rain)}>
                                                    <Text style={styles.buttonText}>Rain</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                        <TouchableOpacity style={styles.button} onPress={() => {setShowMusicModal(false)}}>
                                            <Text style={styles.buttonText}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.centered}>
                                        <ActivityIndicator size="large" color="#000000" />
                                    </View>
                                )}
                            </ImageBackground>
                        </Modal>
    
                        <Modal
                            visible={showCustomTimerModal}
                            onRequestClose={() => setShowCustomTimerModal(false)}
                        >
                            <ImageBackground 
                                source={libraryPic} 
                                style={styles.modalBackgroundImage} 
                                onLoad={() => setIsModalImageLoaded(true)}
                            >
                                {isModalImageLoaded ? (
                                    <View style={styles.modalContainer}>
                                        <Text style={styles.modalHeaderText}>Set Custom Time:</Text>
                                        <TextInput
                                            placeholder="Minutes"
                                            keyboardType="numeric"
                                            value={customMinutes}
                                            onChangeText={setCustomMinutes}
                                            style={styles.textInput}
                                        />
                                        <TextInput
                                            placeholder="Seconds"
                                            keyboardType="numeric"
                                            value={customSeconds}
                                            onChangeText={setCustomSeconds}
                                            style={styles.textInput}
                                        />
                                        <TouchableOpacity style={styles.button} onPress={setCustomTime}>
                                            <Text style={styles.buttonText}>Set Time</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.button} onPress={() => setShowCustomTimerModal(false)}>
                                            <Text style={styles.buttonText}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.centered}>
                                        <ActivityIndicator size="large" color="#000000" />
                                    </View>
                                )}
                            </ImageBackground>
                        </Modal>
                    </View>
                </>
            ) : (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#000000" />
                </View>
            )}
        </ImageBackground>
    );
    
}
const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionsContainer: {
        paddingBottom: 200,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#8B4513',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        alignItems: 'center',
        width: 200, 

    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    draggableTimer: {
        flex: 0.2,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 69, 19, 0.8)',
        borderRadius: 50,   
        padding: 10,
        margin:5,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#8B4513',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        width: 200,
        
        textAlign: 'center',
    },
    audioControlContainer: {
        flex: 0.8, 
        flexDirection: 'column',
        alignItems: 'center',
        padding: 5, 
        backgroundColor: 'rgba(139, 69, 19, 0.8)',
        borderRadius: 50,
        margin:5,
    },
    
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        marginVertical: 5 
    },
    
    sliderStyle: {
        flex: 0.85, 
        height: 30,  
        marginVertical: 5  
        
    },
    
    timerText: {
        color: 'white',
        fontSize: 18, 
        marginLeft: 5,
    },
    timerText2: {
        color: 'white',
        fontSize: 22, 

    },
    modalBackgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeaderText: {
        fontSize: 24,
        color: 'white', 
        marginBottom: 10,
    },
    
    
});

