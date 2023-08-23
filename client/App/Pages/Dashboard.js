import React, { useState, useEffect, useContext } from 'react';
import {
    View, TextInput, StyleSheet, TouchableOpacity, Modal, FlatList, Text,
    ActivityIndicator, Dimensions, Image, ScrollView
} from 'react-native';
import { FontAwesome, Entypo, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles } from './GlobalStyles';
import { subjects } from './subjects';
import BookModal from './BookModal';
import Toast from 'react-native-toast-message';
import { backendUrl } from '../../config';
import {
    Fiction,
    NonFiction,
    ScienceNature,
    HistorySocialSciences,
    ArtsLiterature,
    SelfHelpPersonalDevelopment,
    ReligionSpirituality,
    BusinessEconomics,
    ChildrenYoungAdult,
    ReferenceEducation
} from './Topics'
import { AuthContext } from '../../AuthContext';
const { width, height } = Dimensions.get('window');
const scaleWidth = (size) => (width / 414) * size;  // 414 is the width of iPhone 11 pro max
const scaleHeight = (size) => (height / 896) * size;  // 896 is the height of iPhone 11 pro max


export const renderExactStars = (rating) => {
    const fullStars = Math.floor(rating);
    const fractionalPart = rating - fullStars;
    const fractionalWidth = Math.round(24 * fractionalPart);
    const emptyStars = 5 - fullStars - (fractionalPart > 0 ? 1 : 0);
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
        stars.push(<FontAwesome key={`full${i}`} name="star" size={24} color="gold" />);
    }

   
   
    if (fractionalPart > 0) {
        stars.push(
            <View key={`fractional`} style={{ position: 'relative' }}>
                <Text><FontAwesome name="star-o" size={24} color="gray" /> </Text>{/* Background empty star */}
                <Text style={{ position: 'absolute', top: 0, left: 0, width: fractionalWidth, overflow: 'hidden' }}>
                    <FontAwesome name="star" size={24} color="gold" /> {/* Foreground fractional star */}
                </Text>
            </View>
        );
    }
    
    

    for (let i = 0; i < emptyStars; i++) {
        stars.push(<FontAwesome key={`empty${i}`} name="star-o" size={24} color="gray" />);
    }

    return (
        <>
            {stars.map((star, index) => (
                <React.Fragment key={index}>
                    {star}
                </React.Fragment>
            ))}
        </>
    );
    
};

export const fetchRatingForBook = async (key) => {
    try {
        const ratingsResponse = await axios.get(`https://openlibrary.org${key}/ratings.json`);
        return (ratingsResponse.data && ratingsResponse.data.summary.average) ? ratingsResponse.data.summary.average : 0;
    } catch (error) {
        console.error("Error fetching rating:", error);
        return 0;
    }
};


export default function Dashboard({ navigation }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [bookDescription, setBookDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [averageRating, setAverageRating] = useState(null);
    const [ratingsCount, setRatingsCount] = useState(0);
    const [modalLoading, setModalLoading] = useState(false);
    const [dailyBooks, setDailyBooks] = useState([]);
    const [dailyBooksLoading, setDailyBooksLoading] = useState(true);
    const {userToken} = useContext(AuthContext);
    const [forYouBooks, setForYouBooks] = useState([]);
    const [loadingForYouBooks, setLoadingForYouBooks] = useState(true);
    const [offset, setOffset] = useState(0); 
    const [viewMoreClicked, setViewMoreClicked] = useState(false);
    const [userBooks, setUserBooks] = useState([]);
   

     const fetchUserLibrary = async () => {
        try {
            const response = await axios.get(`${backendUrl}/myLibrary`, {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
            
            if (response.data && response.data.books) {
                setUserBooks(response.data.books);
            }
        } catch (error) {
            console.error(`Error fetching user library: ${error.response.data.message}`);
           alert('There was an error fetching user library')
        }
    };



    useEffect(() => {
        fetchUserLibrary();
    }, [userBooks]);

    
    const renderFooter = () => {
        const footerContainer = {
            flexDirection: 'column',      
            justifyContent: 'center',   
            padding: 10,               
        };
        
        return (
            !viewMoreClicked ?
            (
                <View style={footerContainer}>
                    <TouchableOpacity 
                        style={styles.viewMoreButton} 
                        onPress={() => { setViewMoreClicked(true); loadMoreBooks(); }}
                    >
                        <Text style={styles.viewMoreText}>View More</Text>
                    </TouchableOpacity>
                </View>
            ) : 
            (
                <View style={footerContainer}>
                    <TouchableOpacity 
                        style={styles.viewMoreButton} 
                    >
                        <Text style={styles.viewMoreText}>Loading...</Text>
                    </TouchableOpacity>
                </View>
            )
        );
    };
    const addToLibrary = async () => {
  
        const filteredBook = {
            title: selectedBook.title,
            author: selectedBook.author_name ? selectedBook.author_name[0] : 'Unknown Author',
            description: bookDescription,
            rating: averageRating,
            ratingsCount: ratingsCount,
            subject: selectedBook.subject,
            key: selectedBook.key,
            publish_date: selectedBook.publish_date,
            coverImage:`http://covers.openlibrary.org/b/id/${selectedBook.cover_i || selectedBook.cover_id}-S.jpg`,
            pages: selectedBook.pages,
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
            setUserBooks(response.data.books);
        } catch (error) {
            console.error(`Error adding book: ${error.response.data.message}`);
            throw error; 
        }
 
   
    };
    const removeFromLibrary = async () => {
    const filteredBook = {
        title: selectedBook.title,
        author: selectedBook.author_name ? selectedBook.author_name[0] : 'Unknown Author',
        description: bookDescription,
        rating: averageRating,
        ratingsCount: ratingsCount,
        subject: selectedBook.subject,
        key: selectedBook.key,
        publish_date: selectedBook.publish_date,
        coverImage:`http://covers.openlibrary.org/b/id/${selectedBook.cover_i || selectedBook.cover_id}-S.jpg`,
        pages: selectedBook.pages
    }

    try {
        const response = await axios({
            method: 'delete', 
            url: 'http://192.168.0.130:4000/removeFromLibrary',
            data: { book: filteredBook }, 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });

        alert('Book has been removed from library')
        setUserBooks(response.data.books);
    } catch (error) {
        console.error(`Error removing book: ${error.response.data.message}`);
       alert('Server error')
        throw error; 
    }
};

    

    const loadMoreBooks = async () => {
        try {
            setViewMoreClicked(true);
            const currentBookKeys = forYouBooks.map(book => book.key); 
    
            const response = await axios.get(`${backendUrl}/getForYou`, {
                params: {
                    offset: offset,
                    excludeKeys: JSON.stringify(currentBookKeys) 
                },
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
            
            const newBooks = response.data;
            setForYouBooks(prevBooks => [...prevBooks, ...newBooks]);
            setOffset(prevOffset => prevOffset + 5);
    
        } catch (error) {
            console.error("Error loading more books with Axios:", error);
        }
        setViewMoreClicked(false);
    }
    
    
    

    
    useEffect(()=> {
        if (searchTerm.length == 0) {
            setSearchResults(null)
        }
    }, [searchTerm])



    useEffect(() => {   
        fetchBooksOfTheDay();
        fetchForYouBooks();
    }, []);

  



    const fetchForYouBooks = async () => {
        try {
         
            const response = await axios.get(`${backendUrl}/getForYou`, {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            setForYouBooks(response.data);
        } catch (error) {
            console.error("Failed to fetch 'For you' books:", error);
        } finally {
            setLoadingForYouBooks(false);
        }
    }
    
   
    


    const onSearch = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://openlibrary.org/search.json?q=${searchTerm}`);
            const books = response.data.docs.slice(0,10);
            
            
            const ratingsPromises = books.map(book => axios.get(`https://openlibrary.org${book.key}/ratings.json`));
            const ratingsResponses = await Promise.all(ratingsPromises);
            
            const booksWithRatings = books.map((book, index) => {
                const avgRating = ratingsResponses[index].data.summary ? ratingsResponses[index].data.summary.average : 0;
                return { ...book, average_rating: avgRating };
            });
    
            setSearchResults(booksWithRatings);
            setLoading(false);
        } catch (error) {
            console.error("Error searching:", error);
            setLoading(false);
        }
        
    };
 
   
    const fetchBooksOfTheDay = async () => {
        setDailyBooksLoading(true);
        try {
            const shuffleArray = (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            };
    
            const uniqueBookKeys = new Set();
            const MAX_BOOK_COUNT = 5;
    
     
    
            const fetchBooksForSubject = async (subject) => {
                const response = await axios.get(`https://openlibrary.org/subjects/${subject}.json?limit=50`);
                const booksWithCovers = response.data.works;
    
                for (let book of booksWithCovers) {
                    book.rating = await fetchRatingForBook(book.key);
                }
    
                return booksWithCovers.filter(book => book.rating >= 4 && !uniqueBookKeys.has(book.key))
                                      .map(book => {
                                          uniqueBookKeys.add(book.key);
                                          return book;
                                      });
            };
    
            const shuffledSubjects = shuffleArray([...subjects]);
            let chosenBooks = [];
    
            for (let subject of shuffledSubjects) {
                if (chosenBooks.length >= MAX_BOOK_COUNT) {
                    break;
                }
    
                const validBooks = await fetchBooksForSubject(subject);
                chosenBooks.push(...validBooks.slice(0, MAX_BOOK_COUNT - chosenBooks.length));
            }
    
            setDailyBooks(chosenBooks);
        } catch (error) {
            console.error("Error fetching books of the day:", error);
        }
        setDailyBooksLoading(false);
    }
    
    
    
    
    
    
   

    const onSelectDailyBook = async (book) => {
        setModalLoading(true);
    
        setBookDescription('');
        setAverageRating(null);
        setRatingsCount(0);
        
        let updatedBook = { ...book };
    
        if (book.key) {
            try {
                
                const bookDetailsResponse = await axios.get(`https://openlibrary.org${book.key}.json`);
                const description = bookDetailsResponse.data.description;
                setBookDescription(typeof description === 'string' ? description : "");
    
                
                const url = `https://openlibrary.org/works/${book.key.split('/')[2]}/editions.json`;
                const editionsResponse = await axios.get(url);
    
                if (editionsResponse.data && editionsResponse.data.entries) {
                  
                    for (let edition of editionsResponse.data.entries) {
                        if (edition.number_of_pages) {
                            updatedBook.pages = edition.number_of_pages.toString();
                            break;
                        }
                    }
                    
                    if (!updatedBook.pages) {
                        updatedBook.pages = "Not Available";
                    }
                   
                    const firstEdition = editionsResponse.data.entries[0];
                    let matchedDate = (firstEdition.publish_date.match(/\d{4}/) || [])[0];
                    updatedBook.publish_date = matchedDate ? matchedDate.slice(0, 4) : "Not Available";
                }
    
           
                const ratingsResponse = await axios.get(`https://openlibrary.org${book.key}/ratings.json`);
                if (ratingsResponse.data && ratingsResponse.data.summary.average && ratingsResponse.data.summary.count) {
                    setAverageRating(ratingsResponse.data.summary.average);
                    setRatingsCount(ratingsResponse.data.summary.count);
                }
    
            } catch (error) {
                console.error("Error fetching daily book details:", error);
                setBookDescription("Failed to fetch book details.");
            }
        }
        setSelectedBook(updatedBook); 
        setModalLoading(false);
    };
    
    
    
    

     const onSelectBook = async (book) => {
    
        setModalLoading(true);

        setBookDescription('');
        setAverageRating(null);
        setRatingsCount(0);
            
        let updatedBook = { ...book };
        
        if (book.key) {
            try {
               
                const descriptionResponse = await axios.get(`https://openlibrary.org${book.key}.json`);
                const description = descriptionResponse.data.description;
                setBookDescription(typeof description === 'string' ? description : "");
    
               
                const url = `https://openlibrary.org/works/${book.key.split('/')[2]}/editions.json`;
                const editionsResponse = await axios.get(url);
    
                if (editionsResponse.data && editionsResponse.data.entries) {
                   
                    for (let edition of editionsResponse.data.entries) {
                        if (edition.number_of_pages) {
                            updatedBook.pages = edition.number_of_pages;
                            break;
                        }
                    }
    
                   
                    if (!updatedBook.pages) {
                        updatedBook.pages = "Not Available";
                    }
    
                  
                    const firstEdition = editionsResponse.data.entries[0];
                    updatedBook.publish_date = (firstEdition.publish_date.match(/\d{4}/) || [])[0] || "Not Available";
                }

                const ratingsResponse = await axios.get(`https://openlibrary.org${book.key}/ratings.json`);
                if (ratingsResponse.data && ratingsResponse.data.summary.average && ratingsResponse.data.summary.count) {
                    setAverageRating(ratingsResponse.data.summary.average);
                    setRatingsCount(ratingsResponse.data.summary.count);
                }
                
            } catch (error) {
                console.error("Error fetching book details:", error);
                setBookDescription("Failed to fetch book details.");
            }
        }
    
        setSelectedBook(updatedBook); 
        setModalLoading(false);
    };
    

    const closeModal = () => {
        setSelectedBook(null);
        setAverageRating(null);
        setBookDescription(null);
        setRatingsCount(null);
    };
    const renderBookItem = (book) => {
        
        const authorName = book.author_name ? book.author_name[0] : 'Unknown Author';
        const avgRating = book.average_rating || 0;  
    
        return (
            <TouchableOpacity key={book.key} onPress={() =>  onSelectDailyBook(book)} style={styles.bookItem}>
               
                {/* Book Cover */}
                {book.cover_i || book.cover_id? (
                    <Image
                        source={{ uri: `http://covers.openlibrary.org/b/id/${book.cover_i || book.cover_id}-S.jpg` }}
                        style={styles.smallCoverImage}
                    />
                ) : (
                    <View style={styles.defaultSmallCover}></View>
                )}
                
                {/* Title and Author */}
                <View style={styles.titleAuthorContainer}>
                    <Text>{book.title ? book.title : 'Unknown Title'}</Text>
                    <Text style={styles.authorText}>{authorName}</Text>
                </View>
                
                {/* Rating */}
                <View style={styles.ratingContainer}>
                    <Text>{avgRating.toFixed(1)}</Text>
                    {/* Here you can also render star icons based on avgRating if needed */}
                </View>
                
            </TouchableOpacity>
    
        );
    }
    
    
    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1 , y: 1 }}
            colors={['#000000', '#FFFFFF']}
            style={{ flex: 1 }}>
    
            <View style={styles.container}>
                {/* Profile and Search Section */}
                <View style={styles.searchBoxContainer}>
                    <TouchableOpacity style={styles.profileContainer} onPress={() => navigation.navigate('Profile')}>
                    <FontAwesome name="user" size={40} style={styles.profileImage} color="grey"/>
                    </TouchableOpacity>
                    <View style = {styles.outerSearchBox}>
                    <TextInput
                        style={[styles.searchBox, { borderBottomColor: 'transparent' }]}
                        placeholder="Search for books..."
                        value={searchTerm}
                        onChangeText={text => setSearchTerm(text)}
                        onSubmitEditing={onSearch}
                        underlineColorAndroid="transparent"
                    />
                    {searchTerm ? (
                        <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={() => setSearchTerm('')}
                        >
                        <Text style={styles.clearButtonText}>Clear</Text>
                        </TouchableOpacity>
                    ) : null}
                    </View>
                    {loading ? (
                        <ActivityIndicator color="gray" size={24} />
                    ) : (
                        <TouchableOpacity onPress={onSearch}>
                            <FontAwesome name="search" size={24} color="gray" />
                        </TouchableOpacity>
                    )}
                </View>
    
                {/* Books of the Day */}
                <View style={styles.dailyBooksContainer}>
    <Text style={styles.dailyBooksTitle}>Books of the Day</Text>

    {dailyBooksLoading ? (
        <View style={styles.dailyBookActivityWrapper}>
        <ActivityIndicator size="large" color="white"/>
        </View>
    ) : (
        <FlatList
            data={dailyBooks}
            horizontal={true}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => onSelectBook(item)}>
                    <LinearGradient 
                        colors={['#e0e0e0', '#fff']}  // Default colors
                        style={styles.gradientBackground}
                    >
                        {item.cover_i || item.cover_id ? (
                            <Image
                                source={{ uri: `http://covers.openlibrary.org/b/id/${item.cover_i || item.cover_id}-L.jpg` }}
                                style={styles.dailyBookCover}
                            />
                        ) : (
                            <View style={styles.defaultCoverBOD}>
                                <Text style={styles.defaultCoverText}>{item.title}</Text>
                            </View>
                        )}
                        {/* Rating Widget here */}
                        <View style={styles.ratingWidget}>
                            <FontAwesome name="star" size={20} color="#FFD700" />
                            <Text style={styles.ratingText}>{parseFloat(item.rating).toFixed(1)}</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            )}
            keyExtractor={item => item.key.toString()}
        />
    )}
                </View>


    
                {/* Search Results */}
                {!loading && searchTerm.length > 0 &&
                    <View style={styles.autoCompleteContainer}>
                        <FlatList
                            data={searchResults}
                            renderItem={({ item }) => renderBookItem(item)}
                            keyExtractor={item => item.key.toString()}
                        />
                    </View>
                }
    
                {/* Modal */}
                <BookModal 
            selectedBook={selectedBook}
            closeModal={closeModal}  
            addToLibrary={addToLibrary} 
            removeFromLibrary = {removeFromLibrary}
            modalLoading={false} 
            renderExactStars={renderExactStars} 
            averageRating={averageRating}
            ratingsCount={ratingsCount}
            bookDescription={bookDescription}
            userBooks = {userBooks}
            type = {false}
                />

               {/* For you */}
               <View style={styles.dailyBooksContainer}>
        <Text style={styles.dailyBooksTitle}>For You</Text>

        {loadingForYouBooks ? (
            <View style={styles.dailyBookActivityWrapper}>
                <ActivityIndicator size="large" color="white"/>
            </View>
        ) : (
            <FlatList
                data={forYouBooks}
                horizontal={true}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => onSelectBook(item)}>
                        <LinearGradient 
                            colors={['#e0e0e0', '#fff']}  // Default colors
                            style={styles.gradientBackground}
                        >
                            {item.cover_i || item.cover_id ? (
                                <Image
                                    source={{ uri: `http://covers.openlibrary.org/b/id/${item.cover_i || item.cover_id}-L.jpg` }}
                                    style={styles.dailyBookCover}
                                />
                            ) : (
                                <View style={styles.defaultCoverBOD}>
                                    <Text style={styles.defaultCoverText}>{item.title}</Text>
                                </View>
                            )}
                            <View style={styles.ratingWidget}>
                                <FontAwesome name="star" size={20} color="#FFD700" />
                                <Text style={styles.ratingText}>{parseFloat(item.rating).toFixed(1)}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.key.toString()}
                ListFooterComponent={renderFooter}
            />
        )}
    </View>
                <Text style={styles.dailyBooksTitle}>Find books by Genre</Text>
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer}>
            <Fiction />
            <NonFiction />
            <ScienceNature />
            <HistorySocialSciences />
            <ArtsLiterature />
            <SelfHelpPersonalDevelopment />
            <ReligionSpirituality />
            <BusinessEconomics />
            <ChildrenYoungAdult />
            <ReferenceEducation />
        </ScrollView>


    
                {/* Navbar */}
                <View style={styles.navbar}>
                    {createNavItem(onSearch, "magnifying-glass", "Search")}
                    {createNavItem(() => navigation.navigate('Library'), "library-books", "Library")}
                    {createNavItem(() => navigation.navigate('Reading'), "book", "Start Reading")}
                </View>

             
            </View>
        </LinearGradient>
    );
    
    
}

const createNavItem = (onPress, iconName, label) => {
    let IconComponent;
    switch (iconName) {
        case "magnifying-glass":
            IconComponent = Entypo;
            break;
        case "library-books":
            IconComponent = MaterialIcons;
            break;
        case "book": 
            IconComponent = FontAwesome;
            break;
        default:
            IconComponent = FontAwesome;
            break;
    }
    return (
        <TouchableOpacity style={styles.navItem} onPress={onPress}>
            <IconComponent name={iconName} size={24} color="gray" />
            <Text style={styles.navLabel}>{label}</Text>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: 'gray',
        borderWidth: 1, 
        borderRadius: 5, 
    },
    searchBox: {
        flex: 1, 
        padding: 10,
        width:'100%',
     
    },
    clearButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'absolute',
        right: 5,
        height: '100%',  
    },
    clearButtonText: {
        fontSize: 16,
        color: 'gray',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingTop: 50,
        paddingHorizontal: 15,
    },
    profileContainer: {
        marginRight: 10,
    },
    profileImage: {
        width: 40,
        height: 40,
    },
    searchBoxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        border:'none',
    },
    searchBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
        backgroundColor:'white'
    },
    autoCompleteContainer: {
        position: 'absolute',
        top: 95,
        left: 15,
        right: 15,
        zIndex: 5,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
    },
    modalContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalBookCover: {
        width: scaleWidth(300),
        height: scaleHeight(450),
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalAuthor: {
        fontSize: 16,
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 14,
        marginBottom: 20,
    },
    closeIconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    navbar: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        width: Dimensions.get('window').width,
        justifyContent: 'space-around',
        paddingVertical: 15,
        backgroundColor: '#EEE',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    navLabel: {
        marginTop: 5,
        fontSize: 10,
        color: 'gray',
    },
    bookItem: {
        padding: 10,
        
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    starContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    modalRating: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'darkgray',
    }, 
     closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10, 
        zIndex: 1,
      },
       defaultCover: {
        width: scaleWidth(300) * 0.9,
        height: scaleHeight(450) * 0.9,
        marginBottom: 20,
        backgroundColor: '#D3D3D3',  
        justifyContent: 'center', 
        alignItems: 'center',     
        borderWidth: 1,           
        borderColor: 'gray',
        borderRadius: 5,          
    },
    defaultCoverBOD: {
        width: scaleWidth(140) * 0.9,
        height: scaleHeight(215) * 0.9,   
        borderRadius: 5, 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, 

    },
    defaultCoverText: {
        fontSize: scaleHeight(16),
        color: 'white',
        textAlign: 'center',     
        paddingHorizontal: 10,    
    },
    dailyBooksContainer: {
        marginTop: scaleHeight(10),
    
    },
    dailyBooksTitle: {
        fontSize: scaleHeight(24),
        fontWeight: 'bold',
        color:'white',
        textAlign:'center',
    },
     gradientBackground: {
        borderRadius: 5, 
        margin: 15,
        position:'relative',
        boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
    },
    dailyBookCover: {
        width: scaleWidth(140) * 0.9,
        height: scaleHeight(215) * 0.9,  
        borderRadius: 5,  
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, 
    },
    dailyBookActivityWrapper: {
        width: '100%', 
        height: scaleHeight(215) * 0.9, 
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
    
    },
    authorText: {
        fontSize: 14,
        color: 'grey',
        marginTop: 5
    },   bookItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    smallCoverImage: {
        width: 40,
        height: 60,
        marginRight: 10
    },
    defaultSmallCover: {
        width: 40,
        height: 60,
        backgroundColor: '#eee',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleAuthorContainer: {
        flex: 1
    },
    authorText: {
        fontSize: 12,
        color: 'gray'
    },
    outerSearchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        flex:1,
    },
 
    ratingWidget: {
        position: 'absolute',  
        top: 5,                
        right: 5,              
        flexDirection: 'row',  
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  
        borderRadius: 15,     
        paddingVertical: 5,    
        paddingHorizontal: 8   
    },
    ratingText: {
        color: '#FFF',
        marginLeft: 5         
    },
    activityIndicatorSmall: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,

    },
     ovularBox: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,  
        backgroundColor: '#f1f1f1',  
        marginVertical: 10,
    },
    ovularText: {
        marginHorizontal: 10, 
        
    },
    addToLibraryButton: {
        flexDirection: 'row',    
        position: 'absolute',   
        bottom: 20,              
        left: 5,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#007BFF', 
        borderRadius: 5,
        elevation: 5,            
        shadowOffset: { width: 0, height: 2 },   
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: 'white',
        marginLeft: 10           
    },
    gradientContainerAddToLibrary: {
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
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        marginLeft: 10
    },
    viewMoreButton: {
        borderRadius: 5,
        marginHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
    },
    viewMoreText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    }
    


    
});

