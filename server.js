const express = require('express')
const bodyParser= require('body-parser')
const nodemailer = require('nodemailer')
const app = express()

const MongoClient = require('mongodb').MongoClient
const {ObjectId} = require('mongodb')

MongoClient.connect('mongodb+srv://root:root@cluster0.i7hx1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('EADatabase')
    const questionsCollection = db.collection('questions')
    const assessmentsCollection = db.collection('assessments')

    // Middleware
    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(express.static('public'))

    app.listen(process.env.PORT || 3000, function(){
      console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
    });

    // Questions
    app.get('/', (req, res) => {
      questionsCollection.find().toArray()
        .then(results => {
          res.render('questions.ejs', { questions: results })
        })
        .catch(error => console.error(error))
    })
    app.post('/questions', (req, res) => {
      questionsCollection.insertOne(req.body)
        .then(result => {
          res.redirect('/')
        })
        .catch(error => console.error(error))
    })
    app.put('/questions', (req, res) => {
      questionsCollection.findOneAndUpdate(
        { _id : ObjectId(req.body.doc_id) },
        {
          $set: {
            question: req.body.question
          }
        },
        {
          upsert: true
        }
      )
        .then(result => res.json('Success'))
        .catch(error => console.error(error))
    })
    app.delete('/questions', (req, res) => {
      questionsCollection.deleteOne(
        { _id : ObjectId(req.body.doc_id) }
      )
        .then(result => {
          res.json('Deleted')
        })
        .catch(error => console.error(error))
    })

    //User assessments
    app.get('/assessments', (req, res) => {
      assessmentsCollection.aggregate([
        {
          $lookup:
            {
              from: "questions",
              localField: "questions",
              foreignField: "_id",
              as: "questions"
            }
       }
     ]).toArray()
     .then(results => {
        res.render('assessments.ejs', { assessments: results })
      })
     .catch(error => console.error(error))
    })
    app.post('/assessments', (req, res) => {
      // Find random question
      questionsCollection.aggregate([{ $sample: { size: 1 } }]).toArray()
        .then((results) => {
          if (results.length === 0) {
            res.redirect('/')
          }
          assessmentsCollection.insertOne({
            candidate_email: req.body.candidate_email,
            creator_email: req.body.creator_email,
            questions: [ObjectId(results[0]._id)]
          })
            .then(result => {
              const transporter = nodemailer.createTransport({
                port: 587,
                host: "smtp.gmail.com",
                auth: {
                  user: 'iassessment14@gmail.com',
                  pass: 'iassess14',
                },
                debug: true,
                logger: true
              });
              const mailOptions = {
                from: 'iassessment14@gmail.com',
                to: req.body.candidate_email,
                cc: req.body.creator_email,
                subject: 'Essay Assessment',
                html: '<b>Hey there! </b><br> Take this assessment<br/><a href="'+req.protocol + '://' + req.get('Host')+ '/assessment/' + result.insertedId + '">Click here</a>',
              };
              transporter.sendMail(mailOptions, function (err, info) {
                if(err)
                  console.log(err)
                else
                  console.log(info);
                  res.redirect('/assessments')
              });
            })
            .catch(error => console.error(error))
        })
        .catch(error => console.error(error))
    })
    app.delete('/assessments', (req, res) => {
      assessmentsCollection.deleteOne(
        { _id : ObjectId(req.body.doc_id) }
      )
        .then(result => {
          res.json('Deleted')
        })
        .catch(error => console.error(error))
    })

    //User assessment
    app.get('/assessment/:id', (req, res) => {
      assessmentsCollection.aggregate([
        { $match : { _id : ObjectId(req.params.id) } },
        {
          $lookup:
            {
              from: "questions",
              localField: "questions",
              foreignField: "_id",
              as: "questions"
            }
       }
     ]).toArray()
     .then(results => {
        res.render('assessment.ejs', { assessment: results[0] })
      })
     .catch(error => console.error(error))
    })
    app.post('/assessment/:id', (req, res) => {
      assessmentsCollection.findOneAndUpdate(
        { _id : ObjectId(req.params.id) },
        {
          $set: {
            answers: req.body.answers
          }
        },
        {
          upsert: true
        }
      )
        .then(result => {
          res.redirect('/assessment/' + req.params.id)
        })
        .catch(error => console.error(error))
    })

  })
  .catch(error => console.error(error))
