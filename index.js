const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
const multer = require('multer');
const path = require('path')
const fs = require('fs');
const bcrypt = require('bcrypt');
app.use(cors())
app.use(express.json())

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtSecretKey);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
}


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v94js04.mongodb.net/?retryWrites=true&w=majority`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pviqyfq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Set a unique filename
  },
});

const upload = multer({ storage });

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const studentCollection = client.db('KalnaMadrasha').collection('students')
    const teacherCollection = client.db('KalnaMadrasha').collection('teachers')
    const committeeCollection = client.db('KalnaMadrasha').collection('committee')
    const resultCollection = client.db('KalnaMadrasha').collection('results')
    const noticeCollection = client.db('KalnaMadrasha').collection('notices')
    const routineCollection = client.db('KalnaMadrasha').collection('routines')
    const newsCollection = client.db('KalnaMadrasha').collection('news')
    const campusImageCollection = client.db('KalnaMadrasha').collection('campusimages')
    const headlineCollection = client.db('KalnaMadrasha').collection('headline')
    const ebookCollection = client.db('KalnaMadrasha').collection('ebooks')
    const syllabusCollection = client.db('KalnaMadrasha').collection('syllabuses')
    const lillahBoardingImageCollection = client.db('KalnaMadrasha').collection('lillahboardingimages');
    const contactCollection = client.db('KalnaMadrasha').collection('contacts');

    // SignUp and signIn **********************************************************************
    const userCollection = client.db('KalnaMadrasha').collection('users');

    app.post('/signup', async (req, res) => {
      try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userCollection.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create new user object
        const newUser = {
          username,
          email,
          password: hashPassword,
          isAdmin: false,
        };

        // Insert the user object into the database
        await userCollection.insertOne(newUser);

        return res.status(201).json({ message: 'User registered successfully' });
      } catch (error) {
        console.error('Error occurred during signup:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    });

    const jwt = require('jsonwebtoken');
    const jwtSecretKey = process.env.ACCESS_TOKEN;

    app.post('/login', async (req, res) => {
      try {
        const { email, password } = req.body;

        // Find user by email
        const user = await userCollection.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: 'User not found' });
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token with user ID and email
        const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecretKey, { expiresIn: '1h' });

        // Send JWT token in response
        return res.status(200).json({ message: 'Login successful', token });
      } catch (error) {
        console.error('Error occurred during login:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    });

    // SignUp and signIn end ******************************************************************

    // Post Sudent####################################################################
    app.post('/poststudent', upload.single('image'), async (req, res) => {
      const requestData = req.body;
      const imagePath = req.file.path;

      // Save image path or URL along with other student data in MongoDB
      const studentData = { ...requestData, imagePath };

      try {
        const result = await studentCollection.insertOne(studentData);
        res.send(result);
      } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).send('Failed to add student. Please try again.');
      }
    });
    // get student############################################################################
    app.get('/students', async (req, res) => {
      const result = await studentCollection.find().toArray();
      res.send(result);
    });
    // Delete student###################################################################
    app.delete('/students/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) };
        const result = await studentCollection.deleteOne(deleteQuery)
        res.send(result)
      } catch (error) {
        res.status(200).send('Failed to delete student')
      }
    })
    // Post Teacher#########################################################################
    app.post('/postteacher', upload.single('image'), async (req, res) => {
      const request = req.body;
      const imagePath = req.file.path;
      const teacherData = { ...request, imagePath }
      try {
        const result = await teacherCollection.insertOne(teacherData);
        res.send(result)
      } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).send('Failed to add teacher. Please try again.');
      }
    })
    // Get teachers##############################################################################
    app.get('/teachers', async (req, res) => {
      try {
        const result = await teacherCollection.find().toArray();
        res.send(result)
      } catch (error) {
        res.status(500).send('Error to get teachers')
      }
    });
    // Delete teacher##############################################################################
    app.delete('/teachers/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) };
        const result = await teacherCollection.deleteOne(deleteQuery);
        res.send(result)
      } catch (error) {
        res.status(500).send('Failed to delete Teacher')
      }
    });
    // Post Committee################################################################################
    app.post('/postcommittee', upload.single('image'), async (req, res) => {
      const request = req.body;
      const imagePath = req.file.path;
      const teacherData = { ...request, imagePath }
      try {
        const result = await committeeCollection.insertOne(teacherData);
        res.send(result);
      } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).send('Failed to add committe. Please try again.');
      }
    });

    // Get committee#####################################################################################
    app.get('/committes', async (req, res) => {
      try {
        const result = await committeeCollection.find().toArray();
        res.send(result)
      } catch (error) {
        res.status(200).send('Error to get committees')
      }
    });
    // Delete teacher##############################################################################
    app.delete('/committes/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) };
        const result = await committeeCollection.deleteOne(deleteQuery);
        res.send(result)
      } catch (error) {
        res.send('Failed to delete Committe')
      }
    });

    // Post Routine#################################################################################

    app.post('/postroutine', upload.single('pdf'), async (req, res) => {
      const request = req.body;
      const filePath = req.file.path;
      const routineData = { ...request, filePath };

      try {
        const result = await routineCollection.insertOne(routineData);
        res.send(result);
      } catch (error) {
        res.status(500).json({ error: 'Error posting routine', details: error.message });
      }
    });


    app.get('/routines', async (req, res) => {
      try {
        const routines = await routineCollection.find().toArray();
        res.send(routines);
      } catch (error) {
        console.error('Error retrieving routines:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.delete('/routines/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) };
        const result = await routineCollection.deleteOne(deleteQuery);
        res.send(result)
      } catch (error) {
        res.send('failed to delete Routine :', error.message)
      }
    })
    // Post Notice ##########################################################################
    app.post('/postnotice', upload.single('file'), async (req, res) => {
      const request = req.body;
      const filePath = req.file.path;
      const noticeData = { ...request, filePath }
      try {
        const result = await noticeCollection.insertOne(noticeData);

        res.send(result)
      } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/notices', async (req, res) => {
      try {
        const notices = await noticeCollection.find().toArray();
        res.send(notices)
      } catch (error) {
        res.send('Err to ger notices', error)
      }
    });

    app.delete('/notices/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = ({ _id: new ObjectId(id) })
        const result = await noticeCollection.deleteOne(deleteQuery);
        res.send(result)
      } catch (error) {
        res.send('Delete Incomplete:', error)
      }
    });

    app.get('/noticeDtails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await noticeCollection.findOne(query)
      res.send(result)
    })

    // Post Result ############################################################################
    app.post('/postresult', upload.single('pdf'), async (req, res) => {
      const request = req.body;
      const filePath = req.file.path;
      const resultData = { ...request, filePath }
      try {
        const result = await resultCollection.insertOne(resultData);
        res.send(result);
      } catch (error) {
        console.error('Error adding result:', error);
      }
    });

    app.get('/results', async (req, res) => {
      try {
        const result = await resultCollection.find().toArray();
        res.send(result)
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.delete('/results/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) };
        const result = await resultCollection.deleteOne(deleteQuery);
        res.status(200, 'ok').send(result)

      } catch (error) {
        res.send('Delete incomplete:', error)
      }
    });

    // Post news #########################################################

    app.post('/postnews', upload.single('image'), async (req, res) => {
      const request = req.body;
      const imagePath = req.file.path;
      const newsData = { ...request, imagePath }
      try {
        const result = await newsCollection.insertOne(newsData);
        res.send(result)
      } catch (error) {
        res.status(500).send('Failed to add news')
      }
    });

    app.get('/news', async (req, res) => {
      try {
        const result = await newsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send('Error to get News', error)
      }
    });

    app.delete('/news/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) }
        const result = await newsCollection.deleteOne(deleteQuery);
        res.send(result);
      } catch (error) {
        res.status(500).send('Error to Delete News', error)
      }
    });

    app.get('/newsDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newsCollection.findOne(query)
      res.send(result)
    })

    //Others ######################################################

    app.post('/postcampusimage', upload.single('image'), async (req, res) => {
      const imagePath = req.file.path;
      const campusImageData = { imagePath };
      try {
        const result = await campusImageCollection.insertOne(campusImageData);
        res.send(result);
      } catch (error) {
        res.status(500).send('Failed to post campus Image:', error)
      }
    });

    app.get('/campusimages', async (req, res) => {
      try {
        const result = await campusImageCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send('Failed to get campus Image:', error)
      }
    });
    app.delete('/campusimages/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) };
        const result = await campusImageCollection.deleteOne(deleteQuery);
        res.send(result);
      } catch (error) {
        res.status(500).send('Failed to get campus Image:', error)
      }
    });

    // Headline in Other option############################################################

    app.post('/headline', upload.none(), async (req, res) => {
      const request = req.body;
      const headlineData = { ...request }
      try {
        const result = await headlineCollection.insertOne(headlineData);
        res.send(result)

      } catch (error) {
        res.status(500).send('Failed to get post headline:', error)
      }
    });

    app.get('/headline', async (req, res) => {
      try {
        const result = await headlineCollection.find().toArray();
        res.send(result)
      } catch (error) {
        res.send('Error to fetch headline', error)
      }
    });
    app.delete('/headline/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) };
        const result = await headlineCollection.deleteOne(deleteQuery)
        res.send(result);
      } catch (error) {
        console.log('Failed to delete headline:', error)
      }
    })
    // Ebooks ###################################################
    app.post('/ebook', upload.fields([{ name: 'imageEbook' }, { name: 'pdf' }]), async (req, res) => {
      const request = req.body;

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }

      const imagePath = req.files['imageEbook'][0].path;
      const filePath = req.files['pdf'][0].path;
      const ebookData = { ...request, imagePath, filePath };

      try {
        const result = await ebookCollection.insertOne(ebookData);
        res.send(result);
        ;
      } catch (error) {
        res.status(500).send('Failed to post Ebook:', error);
      }
    });

    app.get('/ebooks', async (req, res) => {
      try {
        const result = await ebookCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.send('Failed to get ebooks:', error)
      }
    });

    app.delete('/ebooks/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) };
        const result = await ebookCollection.deleteOne(deleteQuery);
        res.send(result);
      } catch (error) {
        res.send('failed to delete:', error)
      }
    });

    // syllabus #######################################################################################
    app.post('/postsyllabus', upload.single('pdf'), async (req, res) => {
      const request = req.body;
      const imagePath = req.file.path;
      const syllabusData = { ...request, imagePath }
      try {
        const result = await syllabusCollection.insertOne(syllabusData);
        res.send(result)
      } catch (error) {
        res.status(500).send('Failed to add syllabus')
      }
    });

    app.get('/syllabuses', async (req, res) => {
      try {
        const result = await syllabusCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send('Error to get syllabuses', error)
      }
    });

    app.delete('/syllabuses/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) }
        const result = await syllabusCollection.deleteOne(deleteQuery);
        res.send(result);
      } catch (error) {
        res.status(500).send('Error to Delete syllabuses', error)
      }
    });

    // Lillah Boarding ##################################################################################
    app.post('/postlillahBoardingimage', upload.single('image'), async (req, res) => {
      const imagePath = req.file.path;
      const lillahBoardingImageData = { imagePath };
      try {
        const result = await lillahBoardingImageCollection.insertOne(lillahBoardingImageData);
        res.send(result);
      } catch (error) {
        res.status(500).send('Failed to post lillahBoarding Image:', error)
      }
    });

    app.get('/lillahBoardingimages', async (req, res) => {
      try {
        const result = await lillahBoardingImageCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send('Failed to get lillahBoarding Image:', error)
      }
    });
    app.delete('/lillahBoardingimages/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) };
        const result = await lillahBoardingImageCollection.deleteOne(deleteQuery);
        res.send(result);
      } catch (error) {
        res.status(500).send('Failed to get lillahBoarding Image:', error)
      }
    });
    // Lillah Boarding ##################################################################################

    // Routine #####################################################################################
    app.post('/postroutine', upload.single('image'), async (req, res) => {
      const request = req.body;
      const imagePath = req.file.path;
      const routineData = { ...request, imagePath }
      try {
        const result = await routineCollection.insertOne(routineData);
        res.send(result)
      } catch (error) {
        res.status(500).send('Failed to add routine')
      }
    });

    app.get('/routines', async (req, res) => {
      try {
        const result = await routineCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send('Error to get routines', error)
      }
    });

    app.delete('/routines/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) }
        const result = await routineCollection.deleteOne(deleteQuery);
        res.send(result);
      } catch (error) {
        res.status(500).send('Error to Delete routine', error)
      }
    });
    // ####################################################################
    app.post('/postcontact', async (req, res) => {
      const contact = req.body;
      try {
        const result = await contactCollection.insertOne(contact);
        res.send(result)
      } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).send('Error saving contact');
      }
    });

    // GET request to retrieve all contacts
    app.get('/contacts', async (req, res) => {
      try {
        const contacts = await contactCollection.find().toArray();
        res.send(contacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).send('Error fetching contacts');
      }
    });

    // DELETE request to delete a contact by ID
    app.delete('/contacts/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const deleteQuery = { _id: new ObjectId(id) }
        const result = await contactCollection.deleteOne(deleteQuery);
        res.send(result);
      } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).send('Error deleting contact');
      }
    });
    // ####################################################################



    // get image/file from database to show cliet side ###################################################
    app.get('/getimage', async (req, res) => {
      try {
        const imagePath = req.query.path;
        console.log(imagePath)
        const filepath = path.join(__dirname, "./" + imagePath)
        const stream = fs.createReadStream(filepath)
        stream.pipe(res)

      } catch (error) {
        console.error('Error retrieving routines:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Madrasha server is running')
})

app.listen(port, () => {
  console.log(`Madrasha server listening on port ${port}`)
})