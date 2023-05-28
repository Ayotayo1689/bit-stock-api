const express = require("express");
const app = express();
const admin = require("firebase-admin");
const credentials = require("./key.json");

var cors = require('cors')




admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

const db = admin.firestore();

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(cors())

app.get('/',(req, res) => {
    res.status(201).json({
        message: 'welcome to bitstock api '
    })
})


app.post('/users', async (req, res) => {
    try {
      const { firstName, lastName, email, phoneNo, ssn, password} = req.body;
      const usersRef = admin.firestore().collection('users');
      const newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNo: phoneNo,
        ssn: ssn,
        cardId: "",
        password: password
      };
      const docRef = await usersRef.add(newUser);
      res.status(201).json({ id: newUser,
        message: 'User created sucessfully'
    });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });


// user id = "ZuAT9uQwnpcrZkCWEzOr"


//get all user 
app.get('/users', async (req, res) => {
    try {
      const usersRef = admin.firestore().collection('users');
      const querySnapshot = await usersRef.get();
      
      if (querySnapshot.empty) {
        // No users found
        return res.status(404).json({ error: 'No users found' });
      }
      
      const users = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNo: userData.phoneNo,
          ssn: userData.ssn
        });
      });
      
      res.status(200).json(users);
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  });
  


//get user by Id
app.get('/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const usersRef = admin.firestore().collection('users');
      const userDoc = await usersRef.doc(userId).get();
  
      if (!userDoc.exists) {
        // User with the given ID doesn't exist
        return res.status(404).json({ error: 'User not found' });
      }
  
      const userData = userDoc.data();
      res.status(200).json({
        id: userDoc.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNo: userData.phoneNo,
        ssn: userData.ssn
      });
    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(500).json({ error: 'Failed to retrieve user' });
    }
  });
  





app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const usersRef = admin.firestore().collection('users');
      const querySnapshot = await usersRef.where('email', '==', email).get();
      
      if (querySnapshot.empty) {
        // User with the given email doesn't exist
        return res.status(404).json({ error: 'email does not exist' });
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (userData.password !== password) {
        // Incorrect password
        return res.status(401).json({ error: 'Incorrect password' });
      }
      
      res.status(200).json({
        id: userDoc.id,
        firstName: userDoc._fieldsProto.firstName.stringValue,
        lastName: userDoc._fieldsProto.lastName.stringValue,
        email: userDoc._fieldsProto.email.stringValue,
        phoneNo: userDoc._fieldsProto.phoneNo.stringValue,
        ssn: userDoc._fieldsProto.ssn.stringValue,
        cardId: userDoc._fieldsProto.cardId.stringValue,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });
  




//   R8vY0KX5HGPRirN8m868

// Define a route to register a card to a user
app.post('/users/:userId/cards', async (req, res) => {
    try {
      const { userId } = req.params;
      const { cardNo, firstName, lastName, expMonth, expYear, cvv } = req.body;
    
      function formatDebitCardNumber(cardNumber) {
        const formattedNumber = cardNumber.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
        return formattedNumber;
      }
    
      const formattedCardNumber = formatDebitCardNumber(cardNo);
      const cardsRef = admin.firestore().collection(`classes/${userId}/cards`);
      const newCard = {
        cardNo: formattedCardNumber,
        firstName: firstName,
        lastName: lastName,
        expMonth: expMonth,
        expYear: expYear,
        cvv: cvv
      };
      const docRef = await cardsRef.add(newCard);
  
      if (docRef) {
        try {
          const cardId = docRef.id;
          const userRef = admin.firestore().collection('users').doc(userId);
          
          // Update only the cardId field
          await userRef.update({ cardId: cardId });
          
          res.status(200).json({ message: 'CardId registered successfully' });
        } catch (error) {
          console.error('Error updating cardId:', error);
          res.status(500).json({ error: 'Failed to update cardId' });
        }
      } else {
        res.status(200).json({ message: 'success' });
      }
    } catch (error) {
      console.error('Error creating card:', error);
      res.status(500).json({ error: 'Failed to create card' });
    }
  });
  
   
      








    //   res.status(201).json({ id: docRef.id,
        // message: `card registered sucessfully ${formattedCardNumber}` });
    // catch (error) {
    //   console.error('Error registering Card:', error);
    //   res.status(500).json({ error: 'Failed to register Card' });
    // }
//   });

//get card by id 
app.get('/users/:userId/cards/:cardId', async (req, res) => {
    try {
      const { userId, cardId } = req.params;
      const cardRef = admin.firestore().doc(`classes/${userId}/cards/${cardId}`);
      const cardDoc = await cardRef.get();
  
      if (!cardDoc.exists) {
        // Card with the given ID doesn't exist
        return res.status(404).json({ error: 'Card not found' });
      }
  
      const cardData = cardDoc.data();
      res.status(200).json({
        id: cardDoc.id,
        cardNo: cardData.cardNo,
        firstName: cardData.firstName,
        lastName: cardData.lastName,
        expMonth: cardData.expMonth,
        expYear: cardData.expYear,
        cvv: cardData.cvv
      });
    } catch (error) {
      console.error('Error retrieving card:', error);
      res.status(500).json({ error: 'Failed to retrieve card' });
    }
  });
  



// get all cards
app.get('/users/:userId/cards', async (req, res) => {
    try {
      const { userId } = req.params;
      const cardsRef = admin.firestore().collection(`classes/${userId}/cards`);
      const querySnapshot = await cardsRef.get();
  
      if (querySnapshot.empty) {
        // No cards found for the user
        return res.status(404).json({ error: 'No cards found for the user' });
      }
  
      const cards = [];
      querySnapshot.forEach((doc) => {
        const cardData = doc.data();
        cards.push({
          id: doc.id,
          cardNo: cardData.cardNo,
          firstName: cardData.firstName,
          lastName: cardData.lastName,
          expMonth: cardData.expMonth,
          expYear: cardData.expYear,
          cvv: cardData.cvv
        });
      });
  
      res.status(200).json(cards);
    } catch (error) {
      console.error('Error retrieving cards:', error);
      res.status(500).json({ error: 'Failed to retrieve cards' });
    }
  });
  






const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log(`server is running on PORT ${PORT}...`)
})