import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');
const scaleWidth = (size) => (width / 414) * size; 
const scaleHeight = (size) => (height / 896) * size;  
const styles = StyleSheet.create({
    topicContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        margin: scaleHeight(10),
        width: scaleWidth(150) * 0.9,
        height: scaleHeight(150) * 0.9,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    topicText: {
        fontSize: 15,
        marginLeft: 5,
        textAlign:'center'
    },
    icon: {
        fontSize: 30, 
    },
    scrollViewContainer: {
        flexDirection: 'row',
    },
});


function Topic({ iconName, iconType, color, title }) {
    const navigation = useNavigation();
    const handleTopicPress = () => {
        navigation.navigate('SubjectScreen', { subject: title });
    };
    return (
        <TouchableOpacity activeOpacity={0.7}  style={styles.topicContainer} onPress={handleTopicPress} >
            <View style={styles.topicContainer}>
                {iconType === "FontAwesome5" ? (
                    <FontAwesome5 name={iconName} style={styles.icon} color={color} />
                ) : (
                    <FontAwesome name={iconName} style={styles.icon} color={color} />
                )}
                <Text style={styles.topicText}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
}

export function Fiction() {
    return <Topic iconName="book" iconType="FontAwesome" color="#3498db" title="Fiction" />;
}

export function NonFiction() {
    return <Topic iconName="newspaper-o" iconType="FontAwesome" color="#e74c3c" title="Non-Fiction" />;
}

export function ScienceNature() {
    return <Topic iconName="flask" iconType="FontAwesome" color="#2ecc71" title="Science" />;
}

export function HistorySocialSciences() {
    return <Topic iconName="history" iconType="FontAwesome" color="#9b59b6" title="History" />;
}

export function ArtsLiterature() {
    return <Topic iconName="paint-brush" iconType="FontAwesome" color="#f39c12" title="Arts" />;
}

export function SelfHelpPersonalDevelopment() {
    return <Topic iconName="heart" iconType="FontAwesome" color="#ff4033" title="Self-help" />;
}

export function ReligionSpirituality() {
    return <Topic iconName="pray" iconType="FontAwesome5" color="#3498db" title="Religion" />;
}

export function BusinessEconomics() {
    return <Topic iconName="briefcase" iconType="FontAwesome" color="#95a5a6" title="Business" />;
}

export function ChildrenYoungAdult() {
    return <Topic iconName="child" iconType="FontAwesome" color="#f1c40f" title="Children" />;
}

export function ReferenceEducation() {
    return <Topic iconName="graduation-cap" iconType="FontAwesome" color="#2c3e50" title="Education" />;
}
