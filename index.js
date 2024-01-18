const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
const multer = require('multer');
const path = require('path')
const fs = require('fs')




app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v94js04.mongodb.net/?retryWrites=true&w=majority`;

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

    app.get('/ebooks',async(req,res)=>{
      try {
        const result= await ebookCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.send('Failed to get ebooks:',error)
      }
    });

    app.delete('/ebooks/:id',async(req,res)=>{
      try {
        const id= req.params.id;
        const deleteQuery= {_id: new ObjectId(id)};
        const result= await ebookCollection.deleteOne(deleteQuery);
        res.send(result);
      } catch (error) {
        res.send('failed to delete:',error)
      }
    })



    // get image from database to show cliet side ###################################################
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