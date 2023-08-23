const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');  
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { expressjwt: jwtMiddleware } = require("express-jwt");
require('dotenv').config();
app.use(cors());
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.listen(4000, () => {
    console.log('Port is listening');
});
const axios = require('axios');


mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


const secret = process.env.SECRET;
const authenticateJWT = jwtMiddleware({
    secret,
    algorithms: ['HS256'],
    userProperty: 'auth', 
    getToken: (req) => {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer' ? req.headers.authorization.split(' ')[1] : null;
        return token;
    }
    ,
  });
  

app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        let userExists = await User.findOne({ username });
        let emailExists = await User.findOne({email});
    
        if (userExists || emailExists) return res.status(400).send('User already exists');

        const hashedPassword = await bcrypt.hash(password, 12);

        let user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        const payload = {
            userId: user.id,
        };

        jwt.sign(
            payload,
            secret,  
            { expiresIn: '1h' },
            (err, token) => {
                
                if (err) throw err;
                res.json({ message: "User registered and logged in successfully", userId: user.id, token });
            }
        );

    } catch (err) {
        console.error(err);

        res.status(500).send('Server error');
    }
});


app.post('/login', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;


        let user = await User.findOne({ username: emailOrUsername });

        if (!user) {
            user = await User.findOne({ email: emailOrUsername });
        }

        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const payload = {
            userId: user.id,
        };

      
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });
        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).send(`Server error: ${err.message}`);
    }
});

app.post('/addBook', authenticateJWT, async (req, res) => {
    try {
        const { book } = req.body;
        console.log(book);
        const subjects = book.subject; 
        if (!book) {
            return res.status(400).json({ message: "Please provide a book." });
        }

        const user = await User.findById(req.auth.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }


        const duplicateBook = user.books.find(b => b.title === book.title);

        if (duplicateBook) {
            return res.status(400).json({ message: "You've already added this book." });
        }

      
        if (Array.isArray(subjects)) {
        for (const patternSubject of user.bookPattern.keys()) {
            for (const currentSubject of subjects) {
                const standardizedSubject = currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1).toLowerCase();
                if (patternSubject === standardizedSubject || standardizedSubject.indexOf(patternSubject) !== -1) {
                   user.bookPattern.set(patternSubject, user.bookPattern.get(patternSubject) + 1);
                }
            }
        }
    }

        user.books.push(book);
        await user.save();

        res.status(200).json({ message: "Book added successfully!", books: user.books });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});




app.get('/getForYou', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.auth.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const bookPatternArray = Array.from(user.bookPattern.entries());

        const sortedSubjects = bookPatternArray
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
  
        const excludeKeys = req.query.excludeKeys ? JSON.parse(req.query.excludeKeys) : [];

        let potentialBooks = [];
        let subjectCount = 0;

        for (const subject of sortedSubjects) {
            if (potentialBooks.length >= 25) break; 

            try {
                const url = `http://openlibrary.org/subjects/${subject}.json?limit=75`;
      

                const openLibraryResponse = await axios.get(url);
                
                if (openLibraryResponse.data.works && openLibraryResponse.data.works.length > 0) {
                    potentialBooks = [...potentialBooks, ...openLibraryResponse.data.works];
                }
                
                subjectCount++;
            } catch (err) {
                console.error(`Error fetching books for subject ${subject}: `, err);
            }
        }

        const uniqueBooks = potentialBooks.filter((book, index, self) => 
            index === self.findIndex((b) => (
                b.key === book.key
            ))
        ).filter(book => !excludeKeys.includes(book.key));

      
        const booksToRecommend = uniqueBooks.slice(0, 5);


        for (let book of booksToRecommend) {
            const rating = await fetchRatingForBook(book.key);
            book.rating = rating;
        }

        res.json(booksToRecommend);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const fetchRatingForBook = async (key) => {
    try {
        const ratingsResponse = await axios.get(`https://openlibrary.org${key}/ratings.json`);
        return (ratingsResponse.data && ratingsResponse.data.summary && ratingsResponse.data.summary.average) ? ratingsResponse.data.summary.average : 0;
    } catch (error) {
        console.error("Error fetching rating:", error);
        return 0;
    }
};

app.delete('/removeFromLibrary', authenticateJWT, async (req, res) => {
    try {
        const { book } = req.body;  
        const subjects = book.subject; 

        if (!book) {
            return res.status(400).json({ message: "Please provide a book to remove." });
        }

        const user = await User.findById(req.auth.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

      
        const bookIndex = user.books.findIndex(b => b.key === book.key);

       
        if (bookIndex === -1) {
            return res.status(400).json({ message: "Book not found in your library." });
        }

       
        for (const patternSubject of user.bookPattern.keys()) {
            for (const currentSubject of subjects) {
                const standardizedSubject = currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1).toLowerCase();
                if (patternSubject === standardizedSubject || standardizedSubject.indexOf(patternSubject) !== -1) {
                    
                    const currentValue = user.bookPattern.get(patternSubject);
                    user.bookPattern.set(patternSubject, Math.max(currentValue - 1, 0));
                }
            }
        }

        user.books.splice(bookIndex, 1);

       
        await user.save();

        res.status(200).json({ message: "Book removed successfully!", books: user.books });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
});

app.get('/myLibrary', authenticateJWT, async(req, res) => {
    try {
        const user = await User.findById(req.auth.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({books : user.books});
    } catch (err) {
        console.error(err);
        res.status(500).send(`Server error: ${err.message}`);
    }
})


app.get('/userDetails', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.auth.userId);
      
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userWithoutPassword = {
            ...user._doc, 
            password: undefined
        };
    
        return res.json({
            success: true,
            data: userWithoutPassword,
        });
    } catch (err) {
        console.error("Error fetching user details:", err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

app.post('/saveUserDetails', authenticateJWT, async(req, res) => {
    try {
        const { name, username, email, bio } = req.body; 

      
        const user = await User.findById(req.auth.userId); 
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

     
        user.name = name;
        user.username = username;
        user.email = email;
        user.bio = bio;
        await user.save();

        return res.json({ success: true, message: "User details updated successfully" });
    } catch (err) {
        console.error("Error updating user details:", err);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
