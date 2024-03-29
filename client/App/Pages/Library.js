import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Image, TextInput, StyleSheet } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../AuthContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import BookModal from './BookModal';
import { renderExactStars } from './Dashboard';
import { LinearGradient } from 'expo-linear-gradient';
import { backendUrl } from '../../config';

export default function Library() {
    const [books, setBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);
    const {userToken} = useContext(AuthContext);
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get(`${backendUrl}/myLibrary`, {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    },
                });
                setBooks(response.data.books);
                setFilteredBooks(response.data.books);
            } catch(err) {
                alert('Server error');
            }
        };
    
        fetchBooks();
    }, []);

  
    const getHighQualityImageURL = (url) => {
        return url.replace('-S.jpg', '-L.jpg');
    }

    const handleBookPress = (item) => {
        console.log(item)
        setSelectedBook(item);
    }

    const closeModal = () => {
        setSelectedBook(null);
    }
    const addToLibrary = async () => {
        const filteredBook = {
            title: selectedBook.title,
            author: selectedBook.author,
            description: selectedBook.description,
            rating: selectedBook.rating,
            ratingsCount: selectedBook.ratingsCount,
            subject: selectedBook.subject,
            key: selectedBook.key,
            publish_date: selectedBook.publish_date,
            coverImage:selectedBook.coverImage,
            pages: selectedBook.pages
        }
        try {
            const response = await axios.post(`${backendUrl}/addBook`, 
                { book: filteredBook },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`

                    }
                    
                }
            );
    
             alert('Added book to library')

            setBooks(response.data.books);  
        } catch (error) {
            console.error(`Error adding book: ${error.response.data.message}`);
            throw error; 
        }


 
   
    };
    const removeFromLibrary = async () => {
    const filteredBook = {
        title: selectedBook.title,
        author: selectedBook.author,
        description: selectedBook.description,
        rating: selectedBook.rating,
        ratingsCount: selectedBook.ratingsCount,
        subject: selectedBook.subject,
        key: selectedBook.key,
        publish_date: selectedBook.publish_date,
        coverImage:selectedBook.coverImage,
        pages: selectedBook.pages
    }

    try {
        const response = await axios({
            method: 'delete', 
            url: `${backendUrl}/removeFromLibrary`,
            data: { book: filteredBook }, 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });

        alert('Book has been removed from library')
        setBooks(response.data.books);  
    } catch (error) {
        console.error(`Error removing book: ${error.response.data.message}`);
       alert('Server error')
        throw error; 
    }
};


    useEffect(() => {
      

        const filtered = books.filter((book) => {
            return book.title.toLowerCase().includes(searchQuery.toLowerCase());
        });
        setFilteredBooks(filtered);
    }, [searchQuery, books]);



    return (
        <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1 , y: 1 }}
        colors={['#5A5A5A', '#FFFFFF']}
        style={{ flex: 1 }}>
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                value={searchQuery}
                placeholder="Search for a book..."
                onChangeText={setSearchQuery}
            />
           <FlatList
    data={filteredBooks}
    renderItem={({ item }) => (
        item ? (
            <View style={styles.bookContainer}>
                <TouchableOpacity onPress = {()=> handleBookPress(item)}>
                    {item.coverImage ? (
                        <Image
                            style={styles.image}
                            source={{ uri: getHighQualityImageURL(item.coverImage) }}
                        />
                    ) : (
                        <View style={styles.noCover}>
                            <Text>{item.title}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        ) : null  
    )}
    
    keyExtractor={(item) => item._id} 
    numColumns={3} 
/>
        {selectedBook && 
            <BookModal 
            selectedBook={selectedBook}
            closeModal={closeModal}  
            addToLibrary={addToLibrary} 
            removeFromLibrary = {removeFromLibrary}
            modalLoading={false} 
            renderExactStars={renderExactStars} 
            averageRating={selectedBook.rating}
            ratingsCount={selectedBook.ratingsCount}
            bookDescription={selectedBook.description}
            userBooks = {books}
            type = {true}
            />
        }

        </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingLeft: 10,
        marginBottom: 10,
    },
    bookContainer: {
        flex: 1/3, 
        marginBottom: 10,
        marginHorizontal: 5, 
     
    },
    image: {
        width: '100%',
        minHeight: 250,
        maxHeight:250,
        resizeMode: 'contain',
    },
    noCover: {
        width: '100%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'gray',
    },
});