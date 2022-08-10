import express from "express"
import cors from "cors"
import lyricsFinder from "lyrics-finder"
import SpotifyWebApi from "spotify-web-api-node"
import dotenv from "dotenv"

const app = express()
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = 5050

// check if user log in is correct, get code from the front end which is uniqe for the user. SpotifyWebApi we get from the spotifi-web-api-node package. redirectUri, clientId, and clientsecrets are the same as the spotify developer website. 
app.post("/login", (req, res) => {
    const { code } = req.body
    const spotifyApi = new SpotifyWebApi({
      redirectUri: process.env.REDIRECT_URI,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    })
  
    // get the access, refresh, and expires token which we will use in the front end.
    spotifyApi
      .authorizationCodeGrant(code)
      .then(({ body: { access_token, refresh_token, expires_in } }) => {
        res.json({ access_token, refresh_token, expires_in })
      })
      .catch(console.error)
  })

app.post("/refresh", (req, res) => {
    const { refreshToken } = req.body
    const spotifyApi = new SpotifyWebApi({
      redirectUri: process.env.REDIRECT_URI,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken,
    })
  
    spotifyApi
      .refreshAccessToken()
      .then(({ body: { access_token, expires_in } }) => {
        res.json({ access_token, expires_in })
      })
      .catch((err) => console.log(err))
  })


app.get("/lyrics", (req, res, next) => {
    const { artist, track } = req.query
    lyricsFinder(artist, track)
      .then(lyrics => {
        res.json({ lyrics })
      })
      .catch(err => {
        next(err)
      })
  })

app.listen(PORT, err => {
  if (err) console.log(err)
  console.log("listening on port", PORT)
})