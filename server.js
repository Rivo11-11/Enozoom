const express =require('express')
const morgan = require('morgan')
const mammoth = require('mammoth');
const axios = require('axios');
const { Document, Packer, Paragraph, TextRun } = require('docx');
require("dotenv").config() 

const connectDB = require("./connect_db")
const userModel = require("./user_model")
const fs = require('fs');


const app = express()
const PORT = 3000;


// chains of middlewares
app.use(morgan('dev'))
app.use(express.json())


// Mock users data
// let users = [
//   { id: 1, name: 'Alice', email: 'alice@example.com' },
//   { id: 2, name: 'Bob', email: 'bob@example.com' }
// ];


// **** CRUD OPERATIONS ****** 

app.get('/users', async (req, res) => {
    users = await userModel.find({})
    if (users ) {
        res.json(users)
    }
  });
  

app.get('/users/:id', async (req, res) => {
    const user = await userModel.findById(req.params.id)
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
  
 
app.post('/users', async (req, res) => {
    const user = await userModel.create({
        name : req.body.name,
        email : req.body.email
    })
    res.status(201).json(user);
  });
  

  app.put('/users/:id', async (req, res) => {
    const user = await userModel.findByIdAndUpdate(req.params.id,{
        name : req.body.name,
        email : req.body.email
    },{new : true})
    if ( user ) {
            res.status(200).json(user)
    }
    else {
    res.status(404).json({ message: 'User not found' });
    }
  });
  
  app.delete('/users/:id', async (req, res) => {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (user) {
    res.json({ message: 'User deleted' });
    }
  });


  // **** Files Operations *******
  
  app.get('/read-file', (req, res) => {
    const filePath = './file.txt'; // Make sure to have a 'sample.txt' in your root directory
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.status(500).json({ message: 'Error reading file', error: err });
      } else {
        res.send(data);
      }
    });
  });

  app.get('/create-file', (req, res) => {
    const filePath = './outputfile.txt';
    const content = 'This is a sample .txt file created using Node.js.\nAnother line of text.';
  
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        res.status(500).json({ message: 'Error creating .txt file', error: err });
      } else {
        res.send('output.txt file created successfully.');
      }
    });
  });

  app.get('/copy-file', (req, res) => {
    const src = './file.txt'; // Source file
    const dest = './copy_file.txt'; // Destination file
  
    fs.copyFile(src, dest, (err) => {
      if (err) {
        res.status(500).json({ message: 'Error copying .txt file', error: err });
      } else {
        res.send(`File copied to ${dest}`);
      }
    });
  });

  app.get('/read-docx', async (req, res) => {
    const filePath = './cover-letter.docx'; 
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      res.send(result.value); // The raw text from the .docx file
    } catch (error) {
      res.status(500).json({ message: 'Error reading .docx file', error });
    }
  });

  app.get('/create-docx', async (req, res) => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun("This is a sample .docx file created in Node.js."),
                new TextRun({
                  text: " This text is bold.",
                  bold: true,
                }),
              ],
            }),
          ],
        },
      ],
    });
  
    const buffer = await Packer.toBuffer(doc);
  
    fs.writeFileSync('output.docx', buffer);
  
    res.send('output.docx file created successfully.');
  });

  // ****** Calling External Apis (do pagination) ******* 
  app.get('/github-users', async (req, res) => {
    try {
    //   const query = axios.get('https://api.github.com/users');
    //   const page = req.query.page * 1 || 1;
    //   const limit = req.query.limit * 1 || 10;
    //   const skip = (page - 1) * limit;
    //   response = await query.skip(skip).limit(limit);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log(page)
     const response = await axios.get('https://api.github.com/users', {
        params: {
          page: page,
          per_page: limit,
        },
      });
      res.json({
        page,
        limit,
        length: response.data.length,
        data: response.data,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching data', error });
    }
  });
  
  // ******** Strings Manipulation ****************
  app.post('/reverse-string', (req, res) => {
    const originalString = req.body.string;
    
    if (!originalString) {
      return res.status(400).json({ message: 'No string provided' });
    }
    console.log(originalString.split('').reverse())
    console.log(originalString.replace(/\W/g, '').toLowerCase()); // remove whitespaces turn all to lowercases
    console.log(originalString.match(/[aeiou]/gi).length) // return the list of vowels found .. and u can retrun the length
    console.log(originalString.split(' ').join('#'))
    const reversedString = originalString.split('').reverse().join('');
    res.json({ originalString, reversedString });
  });
  

const Mongo_url = process.env.MONGO_URL
let server = null
async function startProgram()
{
            await connectDB(Mongo_url)
            server = app.listen(PORT,console.log(`Listening on Port: ${PORT}...`))
}

startProgram()
