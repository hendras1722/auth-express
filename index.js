require('dotenv').config()

const express = require('express')
const Routes = require('./src/routes')
const cookieParser = require('cookie-parser')
const { connectDB } = require('./src/configs/mongodb')
const { StatusError } = require('./src/helpers/Status')
const swaggerUI = require('swagger-ui-express')
const swaggerSpec = require('./src/configs/swagger')
const cors = require('cors')
const path = require('path')

const app = express()

app
  .use(async (req, res, next) => {
    try {
      await connectDB()
      next()
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'MongoDB connect failed' })
    }
  })
  .use(cors())
  .use(express.json())
  .use(cookieParser())
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: true }))
  .use('/v1', Routes)
  .get('/', (req, res) => {
    res.send('ping')
  })
  .use(
    '/docs',
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec, {
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
      ],
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'The Cookies API Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
      },
    })
  )
  .use((req, res, next) => {
    StatusError(res, 404, 'Route not found', 'Oh You are lost')
  })
  .use((err, req, res, next) => {
    console.error(err)
    StatusError(res, 500, 'Internal Server Error', 'Something wrong!')
  })

if (require.main === module) {
  const port = process.env.PORT || 3000
  connectDB().then(() => {
    console.log('MongoDB is ready')
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  })
}

module.exports = app
