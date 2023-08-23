import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, Linking, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-deck-swiper';
const { width, height } = Dimensions.get('window');
import FlipCard from 'react-native-flip-card';
import {  renderExactStars } from './Dashboard';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../AuthContext';
import { FontAwesome } from '@expo/vector-icons';
const scaleWidth = (size) => (width / 414) * size;  
const scaleHeight = (size) => (height / 896) * size;  



export default function SubjectStack({ route }) {
    const { subject } = route.params;
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentIndex, setCurrentIndex] = useState(0);
    const {userToken} = useContext(AuthContext);
    const [userBooks, setUserBooks] = useState([]);
    const handleBuyBook = (book) => {
      const searchQuery = `Buy ${book?.title} ${book?.author_name?.[0] || book?.authors[0]?.name}`;
      const encodedQuery = encodeURIComponent(searchQuery);
      Linking.openURL(`https://www.google.com/search?q=${encodedQuery}`);
  };
  
  const handleRateBook = (book) => {
      if (book?.key) {
          const bookId = book.key.split('/')[2];
          Linking.openURL(`https://openlibrary.org/books/${bookId}`);
      }
  };
  

  

    const fetchUserLibrary = async () => {
      try {
          const response = await axios.get('http://192.168.0.130:4000/myLibrary', {
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


const handleRemoveFromLibrary = async (book) => {

  const filteredBook = {
    title: book.title,
    author: book.authors && book.authors[0] ? book.authors[0].name : 'Unknown Author',
    description: book.description,
    rating: book.rating,
    ratingsCount: book.ratingsCount,
    subject: book.subject,
    key:book.key,
    publish_date: book.publish_date,
    coverImage:`http://covers.openlibrary.org/b/id/${book.cover_i || book.cover_id}-S.jpg`,
    pages:book.pages,

};
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

   
    setUserBooks(prevBooks => prevBooks.filter(b => b.key !== book.key));
    alert('Removed book from library')
    return response.data; 
} catch (error) {
    console.error(`Error removing book: ${error.response.data.message}`);
   alert('Server error')
    throw error;  
}

}
const isBookInLibrary = (book) => {
  return userBooks.some(userBook => userBook.key === book.key);
};
    const getDynamicFontSize = (description) => {
      const length = description.length;
  
      if (length <= 50) {
          return scaleHeight(18); 
      } else if (length > 50 && length <= 100) {
          return scaleHeight(16);
      } else if (length > 100 && length <= 200) {
          return scaleHeight(14);
      } else {
          return scaleHeight(12);
      }
  };

    
    const getBookDetails = async (bookKey) => {
      try {
          const response = await axios.get(`https://openlibrary.org${bookKey}.json`);
          return response.data;
      } catch (error) {
          console.error("Error fetching book details:", error);
      }
  };
  
  const getBookEditions = async (bookKey) => {
      try {
          const response = await axios.get(`https://openlibrary.org/works/${bookKey.split('/')[2]}/editions.json`);
          return response.data.entries;
      } catch (error) {
          console.error("Error fetching book editions:", error);
      }
  };
  
  const getBookRatings = async (bookKey) => {
      try {
          const response = await axios.get(`https://openlibrary.org${bookKey}/ratings.json`);
          if (response.data && response.data.summary) {
              return response.data.summary;
          }
      } catch (error) {
          console.error("Error fetching book ratings:", error);
      }
  };
  const handleAddToLibrary = async (book) => {
    const filteredBook = {
    title: book.title,
    author: book.authors && book.authors[0] ? book.authors[0].name : 'Unknown Author',
    description: book.description,
    rating: book.rating,
    ratingsCount: book.ratingsCount,
    subject: book.subject,
    key:book.key,
    publish_date: book.publish_date,
    coverImage:`http://covers.openlibrary.org/b/id/${book.cover_i || book.cover_id}-S.jpg`,
    pages:book.pages,
    
};

    try {
     const response =  await axios.post('http://192.168.0.130:4000/addBook', 
            { book: filteredBook },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            }
        );
        
     
        setUserBooks(prevBooks => [...prevBooks, filteredBook]);
        alert('Added book to library');
        return response.data
    } catch (error) {
        console.error(`Error adding book: ${error.response.data.message}`);
      

    }

};

 

const renderCard = (book) => {
  if (!book) {
      return null;
  }

  return (
      <FlipCard style={styles.card}>
          {/* Front side */}
          <View style={styles.cardFront}>
              {book?.cover_id || book?.cover_i ? (
                <Image
                  style={styles.image}
                  source={{ uri: `http://covers.openlibrary.org/b/id/${book.cover_id || book.cover_i}-L.jpg` }}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.noCover}>
                 
                </View>
              )}
              <Text style={styles.title}>{book.title}</Text>
          </View>

          {/* Back side */}
          <View style={styles.cardBack}>
              <Text style={styles.backText}>Author: {book.authors && book.authors[0] ? book.authors[0].name : 'N/A'}</Text>
              
              {book.description && (
                  <View style={{maxHeight:'50%', overflow:'hidden'}}>
                      <Text 
                          numberOfLines={19} 
                          ellipsizeMode='tail' 
                          style={[styles.backText, {fontSize: getDynamicFontSize(book.description)}]}
                      >
                          {book.description}
                      </Text>
                  </View>
              )}

              {book.pages && <Text style={styles.backText}>Pages: {book.pages}</Text>}
              {book.publish_date && <Text style={styles.backText}>Published: {book.publish_date}</Text>}

              <View style={styles.ratingContainer}>
                  {renderExactStars(book.rating || 0)}
                  {book.rating 
                      ? <Text style={styles.backText}>{book.rating?.toFixed(2)}/5 ({book.ratingsCount} ratings)</Text>
                      : <Text style={styles.backText}>0.00 (0 ratings)</Text>
                  }
              </View>

              <View style={styles.buttonContainer}>
                  {
                      (book && !isBookInLibrary(book)) ? 
                      <TouchableWithoutFeedback 
                          onPressOut={(e) => {
                              e.stopPropagation();
                              handleAddToLibrary(book);
                          }}
                      >
                          <View style={styles.addButton}>
                              <FontAwesome name="plus" size={20} color="white" />
                              <Text style={styles.addButtonText}>Add to Library</Text>
                          </View>
                      </TouchableWithoutFeedback>
                      
                      :
                      <TouchableWithoutFeedback 
                          onPressOut={(e) => {
                              e.stopPropagation();
                              handleRemoveFromLibrary(book);
                          }}
                      >
                          <View style={styles.addButton}>
                              <FontAwesome name="minus" size={20} color="white" />
                              <Text style={styles.addButtonText}>Remove from Library</Text>
                          </View>
                      </TouchableWithoutFeedback>
                  }

                  <TouchableWithoutFeedback 
                      onPressOut={() => handleBuyBook(book)}
                  >
                      <View style={styles.addButton}>
                          <FontAwesome name="shopping-cart" size={20} color="white" />
                          <Text style={styles.addButtonText}>Buy Book</Text>
                      </View>
                  </TouchableWithoutFeedback>

                  <TouchableWithoutFeedback 
                      onPressOut={() => handleRateBook(book)}
                  >
                      <View style={styles.addButton}>
                          <FontAwesome name="star" size={20} color="white" />
                          <Text style={styles.addButtonText}>Rate Book</Text>
                      </View>
                  </TouchableWithoutFeedback>
              </View>
          </View>
      </FlipCard>
  );
};




    const fetchBooks = async () => {
      try {
        const booksPerPage = 20;
        const offset = (currentPage - 1) * booksPerPage;
        const url = `https://openlibrary.org/subjects/${subject.toLowerCase()}.json?limit=${booksPerPage}&offset=${offset}`;
      

          const response = await axios.get(url);
  
          if (response.data.works && response.data.works.length) {
              const fetchedBooks = response.data.works
  
              const bookPromises = fetchedBooks.map(async book => {
                  const bookDetails = await getBookDetails(book.key);
                  const bookEditions = await getBookEditions(book.key);
                  const ratings = await getBookRatings(book.key);
  
                  book.description = typeof bookDetails.description === 'string' ? bookDetails.description : '';
                  if (bookEditions && bookEditions.length) {
                    book.pages = bookEditions[0].number_of_pages || "Not Available";
                    
                    
                    if (bookEditions[0].publish_date) {
                        let matchedDate = (bookEditions[0].publish_date.match(/\d{4}/) || [])[0];
                        book.publish_date = matchedDate ? matchedDate.slice(0, 4) : "Not Available";
                    } else {
                        book.publish_date = "Not Available";
                    }
                    
                   
                    book.rating = ratings.average;
                    book.ratingsCount = ratings.count;
                }
                
                  return book;
              });
  
              const detailedBooks = await Promise.all(bookPromises);
              setBooks(prevBooks => [...prevBooks, ...detailedBooks]);
              setCurrentPage(prevPage => prevPage + 1);
          }
  

  
      } catch (error) {
          console.error('Failed to fetch books:', error);
      } finally {
          setLoading(false);
      }

  };


  
  

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
      if (currentIndex >= books.length * 0.50) { 
          fetchBooks();

      }
  }, [currentIndex]);
  
  

    const onSwiped = () => {
        setCurrentIndex(prevIndex => prevIndex + 1);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#000000" />
            </View>
        );
    }

    return (
      <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1 , y: 1 }}
      colors={['#000000', '#FFFFFF']}
      style={styles.container}>
              <Swiper
                  cards={books}
                  renderCard={renderCard}    
                  onSwiped={onSwiped}
                  stackSize={3}
                  infinite
                  backgroundColor="transparent"
                  cardIndex={currentIndex}
                  key = {userBooks.length}
                 
              />
      </LinearGradient>
  );
  
}


const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',    
  },
  centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  card: {
    flex: 0.8, 
    borderRadius: 4,
    borderColor: '#E8E8E8',
    justifyContent: 'flex-end',
    backgroundColor: 'white',
    overflow: 'hidden',
},

  title: {
      fontSize: 24,
      alignSelf: 'center',
      fontWeight: 'bold',
      padding: 10,
      position: 'absolute', 
      top: 10,
      left: 10,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.6)',
      color: 'white',
      textAlign: 'center',
      borderRadius: 4
  },
  image: {
    width: '100%', 
    height: '100%', 
    position: 'absolute',
    top: 0,
    left: 0,
},

  noCover: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#eaeaea',
  },
  cardFront: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  backText: {
    fontSize: 16,
    margin: 5,
    textAlign: 'center'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  addButton: {
    flexDirection: 'row',  
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#000000', 
    margin: 5,
    width: '33%',  
  },
  addButtonText: {
    marginLeft: 5,  
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign:'center'
  }, 
  buttonContainer: {
    display:'flex',
    flexDirection:'row'
  }
 
 
  
});

