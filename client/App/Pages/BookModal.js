import { Image, Modal, View, ScrollView, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking } from 'react-native';

import React, { useState, useEffect, useContext } from 'react';

export default function BookModal({ selectedBook, closeModal, addToLibrary, removeFromLibrary, modalLoading, renderExactStars, averageRating, ratingsCount, bookDescription, userBooks, type }) {
    const handleBuyBook = () => {
        const searchQuery = `Buy ${selectedBook?.title} ${selectedBook?.author || selectedBook?.author_name?.[0] || selectedBook?.authors[0].name}`;
        const encodedQuery = encodeURIComponent(searchQuery);
        Linking.openURL(`https://www.google.com/search?q=${encodedQuery}`);
    };
    const handleRateBook = () => {
        if (selectedBook?.key) {
            const bookId = selectedBook.key.split('/')[2];  
            Linking.openURL(`https://openlibrary.org/books/${bookId}`);
        }
    };

    
    const isBookInLibrary = (book) => {
        if (book && userBooks) {
        return userBooks.some(userBook => userBook.key === book.key);
        } 
        return false;
    };

 if (!type) {
    return (
        
        <Modal
            visible={selectedBook !== null}
            onRequestClose={closeModal}
            animationType="slide"
            presentationStyle="pageSheet"
           
        >
        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
    <Entypo name="cross" size={30} color="black" />
</TouchableOpacity>

            <View style={styles.modalWrapperAddToLibrary}>
                <ScrollView contentContainerStyle={styles.modalContainerAddToLibrary}>
                    {modalLoading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="gray" />
                        </View>
                    ) : (
                        <>
                          

                            {selectedBook?.cover_i || selectedBook?.cover_id ? (
                               <Image 
                               source={{ uri: `http://covers.openlibrary.org/b/id/${selectedBook?.cover_i || selectedBook?.cover_id}-L.jpg` }}
                               style={styles.modalBookCover}
                               resizeMode="contain" 
                           />
                           
                            ) : (
                                <View style={styles.defaultCover}>
                                    <Text style={styles.defaultCoverText}>{selectedBook?.title}</Text>
                                </View>
                            )}

                            <Text style={styles.modalTitle}>{selectedBook?.title}</Text>
                            <Text style={styles.modalAuthor}>{selectedBook?.author_name?.[0] || selectedBook?.authors[0].name}</Text>

                            {averageRating !== null && (
                                <View style={styles.ratingContainer}>
                                    <View style={styles.starContainer}>
                                        {renderExactStars(averageRating)}
                                    </View>
                                    <Text style={styles.modalRating}>
                                        {averageRating.toFixed(2)}/5 ({ratingsCount} reviews)
                                    </Text>
                                </View>
                            )}

                            <View style={styles.ovularBox}>
                                <Text style={styles.ovularText}>
                                    Published: {selectedBook?.publish_date}
                                </Text>
                                <View style={styles.separator}></View>
                                <Text style={styles.ovularText}>
                                    Pages: {selectedBook?.pages || 'N/A'}
                                </Text>
                            </View>

                            <Text style={styles.modalDescription}>{bookDescription}</Text>
                        </>
                    )}
                </ScrollView>

                <LinearGradient
    colors={['#000000', 'rgba(0,0,0,0.5)']}
    style={styles.buttonsGradientContainer}
>
{
    selectedBook && isBookInLibrary(selectedBook) ? (
        <TouchableOpacity style={styles.actionButton} onPress={removeFromLibrary}>
            <FontAwesome name="minus" size={20} color="white" />
            <Text style={styles.buttonText}>Remove from Library</Text>
        </TouchableOpacity>
    ) : (
        <TouchableOpacity style={styles.actionButton} onPress={addToLibrary}>
            <FontAwesome name="plus" size={20} color="white" />
            <Text style={styles.buttonText}>Add to Library</Text>
        </TouchableOpacity>
    )
}


    <TouchableOpacity style={[styles.actionButton, { borderRightWidth: 1 }]} onPress={handleBuyBook}>
    <FontAwesome name="shopping-cart" size={20} color="white" />
    <Text style={styles.buttonText}>Buy Book</Text>
</TouchableOpacity>


<TouchableOpacity style={[styles.actionButton, { borderRightWidth: 0 }]} onPress={handleRateBook}>
    <FontAwesome name="star" size={20} color="white" />
    <Text style={styles.buttonText}>Rate Book</Text>
</TouchableOpacity>

</LinearGradient>
            </View>
        </Modal>
    );
}
return (
    <Modal
    visible={selectedBook !== null}
    onRequestClose={closeModal}
    animationType="slide"
    presentationStyle="pageSheet"
>
<TouchableOpacity style={styles.closeButton} onPress={closeModal}>
<Entypo name="cross" size={30} color="black" />
</TouchableOpacity>

    <View style={styles.modalWrapperAddToLibrary}>
        <ScrollView contentContainerStyle={styles.modalContainerAddToLibrary}>
            {modalLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="gray" />
                </View>
            ) : (
                <>
                  

                    {selectedBook?.coverImage ? (
                       <Image 
                       source={{ uri: selectedBook?.coverImage.replace('-S.jpg', '-L.jpg') }}
                       style={styles.modalBookCover}
                       resizeMode="contain" 
                   />
                   
                    ) : (
                        <View style={styles.defaultCover}>
                            <Text style={styles.defaultCoverText}>{selectedBook?.title}</Text>
                        </View>
                    )}

                    <Text style={styles.modalTitle}>{selectedBook?.title}</Text>
                    <Text style={styles.modalAuthor}>{selectedBook?.author}</Text>

                    {averageRating !== null && (
                        <View style={styles.ratingContainer}>
                            <View style={styles.starContainer}>
                                {renderExactStars(averageRating)}
                            </View>
                            <Text style={styles.modalRating}>
                                {averageRating.toFixed(2)}/5 ({ratingsCount} reviews)
                            </Text>
                        </View>
                    )}

                    <View style={styles.ovularBox}>
                        <Text style={styles.ovularText}>
                            Published: {selectedBook?.publish_date}
                        </Text>
                        <View style={styles.separator}></View>
                        <Text style={styles.ovularText}>
                            Pages: {selectedBook?.pages || 'N/A'}
                        </Text>
                    </View>

                    <Text style={styles.modalDescription}>{selectedBook?.description}</Text>
                </>
            )}
        </ScrollView>

        <LinearGradient
colors={['#000000', 'rgba(0,0,0,0.5)']}
style={styles.buttonsGradientContainer}
>
{
selectedBook && isBookInLibrary(selectedBook) ? (
<TouchableOpacity style={styles.actionButton} onPress={removeFromLibrary}>
    <FontAwesome name="minus" size={20} color="white" />
    <Text style={styles.buttonText}>Remove from Library</Text>
</TouchableOpacity>
) : (
<TouchableOpacity style={styles.actionButton} onPress={addToLibrary}>
    <FontAwesome name="plus" size={20} color="white" />
    <Text style={styles.buttonText}>Add to Library</Text>
</TouchableOpacity>
)
}


<TouchableOpacity style={[styles.actionButton, { borderRightWidth: 1 }]} onPress={handleBuyBook}>
<FontAwesome name="shopping-cart" size={20} color="white" />
<Text style={styles.buttonText}>Buy Book</Text>
</TouchableOpacity>


<TouchableOpacity style={[styles.actionButton, { borderRightWidth: 0 }]} onPress={handleRateBook}>
<FontAwesome name="star" size={20} color="white" />
<Text style={styles.buttonText}>Rate Book</Text>
</TouchableOpacity>

</LinearGradient>
    </View>
</Modal>

)
}

const styles = StyleSheet.create({
    modalWrapperAddToLibrary: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContainerAddToLibrary: {
        padding: 20,
        paddingBottom: 90,
    },

    modalBookCover: {
        maxWidth: '100%',
        height: 400,
        marginTop: 50, // Added margin to move the image down
    },

    defaultCover: {
        maxWidth: '100%',
        height: 400,
        marginTop: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        flex: 0, // Prevents flex shrinking/expanding
    },
    
    defaultCoverText: {
        fontSize: 18,
        textAlign: 'center',
        width: '90%',
        height: 100, // Adjust the fixed height as needed
        lineHeight: 100, // Set line height equal to the container's height
    },
    

    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
    },

    modalAuthor: {
        fontSize: 18,
        textAlign: 'center',

    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        justifyContent: 'center',  // Center the stars container horizontally
    },

    ovularBox: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',  // Adjust spacing within ovular container
        backgroundColor: '#E0E0E0',
        borderRadius: 30,
        paddingHorizontal: 20,
        marginVertical: 10,
        alignSelf: 'center',
        borderWidth: 0.5,
        borderColor: '#999',
       
    },

    starContainer: {
        flexDirection: 'row',
    },

    modalRating: {
        marginLeft: 10,
        fontSize: 16,
    },



    ovularText: {
        fontSize: 16,
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },

    separator: {
        height: '100%',
        width: 1,
        backgroundColor: '#999',
        marginHorizontal: 15,
    },

    modalDescription: {
        fontSize: 16,
        marginVertical: 10,
    },

    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
        zIndex: 1,
    },

    addToLibraryGradientContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        borderRadius: 5,
    },

    addToLibraryButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
    },

    addToLibraryButtonText: {
        color: 'white',
        marginLeft: 10,
        textAlign:'center'
    },
       buttonsGradientContainer: {
        flexDirection: 'row', 
        position: 'absolute',
        bottom: 0,  // Adjusted to be at the bottom
        left: 0,   // Adjusted to cover from the left edge
        right: 0,  // Adjusted to cover to the right edge
        borderRadius: 0,  // Remove border radius so it covers entirely
        // Remove the border and box shadow for a clean look, adjust if needed
        height:80
    },
    
    actionButton: {
        flex: 1, 
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15.5,
        // If you want a border separator between the buttons, adjust here
        borderRightWidth: 1,
        borderColor: 'grey', 
    },
    buttonText: {
        color: 'white',
        marginLeft: 5,
        fontSize: 13,
        textAlign:'center',
    },
});
