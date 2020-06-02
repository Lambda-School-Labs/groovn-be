const router = require("express").Router();
const Videos = require("./video_model");
const Songs = require("../songs/songs_model");
const restricted = require("../middleware/restricted_middleware");
const axios = require('axios')
const uuid = require("uuid");
const AWS = require("aws-sdk");

router.get("/", async (req, res) => {
  try {
    const videos = await Videos.find();
    res.status(200).json({ videos });
  } catch (err) {
    res.status(500).json({ message: "Try again later.", err });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Videos.findById(id);
    res.status(200).json(video);
  } catch (err) {
    res.status(500).json({ message: "Try again later.", err });
  }
});

AWS.config.update({
  subregion: "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();



// Check if S3 file exists
router.get("/check-for-file", (req, res) => {
  const { fileName } = req.body;

  s3.headObject(params, function (err, metadata) {
    if (err && err.code === "NotFound") {
      // Handle no object on cloud here
    } else {
      s3.getSignedUrl("getObject", params, callback);
    }
  });
});

// if you post to video
// You want to check for main variables in two tables
// Song table first because videos has a foreign key referencing the song.id
// songs: deezer_id, title, artist_name
// videos: video_title, location
// We'll want to adjust the model to allow for both


router.post("/", restricted, async (req, res) => {
  const {
    title_short,
    preview,
    artist,
    deezer_id,
    location,
    video_title,
    user_id,
  } = req.body;

  const songObject = {
    deezer_id: deezer_id,
    title: title_short,
    artist_name: artist
  };

  const videoObject = {
    video_title: video_title,
    location: location,
    song_id: "",
    user_id: user_id
  };

  try {
    if (!title_short) {
      res.status(400).json({ message: "Missing title_short!" });
    } else {
      if (!preview) {
        res.status(400).json({ message: "Missing preview!" });
      } else {
        if (!artist) {
          res.status(400).json({ message: "Missing artist!" });
        } else {
          if (!deezer_id) {
            res.status(400).json({ message: "Missing deezer_id!" });
          } else {
            if (!location) {
              res.status(400).json({ message: "Missing location!" });
            } else {
              if (!video_title) {
                res.status(400).json({ message: "Missing video_title!" });
              } else {
                if (!user_id) {
                  res.status(400).json({ message: "Missing user_id!" });
                } else {

                  const song = await Songs.add(songObject);

                  const videoObjectComplete = { ...videoObject, song_id: song };

                  // we want song to return its id
                  // then we'll destructure or spread some object to add that in
                  // then we'll 'add' that object to videos.add
                  const video = await Videos.add(videoObjectComplete);
                  const videoId = uuid.v4();
                  
                  axios
                    .post(
                      "http://sample.eba-5jeurmbw.us-east-1.elasticbeanstalk.com/entry",
                      null,
                      {
                        params: {
                          preview: preview,
                          video_id: videoId
                        },
                      }
                    )
                    .catch((err) => console.log(err));

                  objectIds = {
                    songId: song,
                    videoId: video
                  };

                  console.log(objectIds);;

                  res.status(200).json(objectIds);
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Try again later!", err });
  }
});

router.put("/:id", restricted, (req, res) => {
  const { id } = req.params;
  const data = req.body;

  console.log(id);
  console.log(data);

  Videos.update(data, id)
    .then((updatedVideo) => {
      console.log(updatedVideo);
      res.status(200).json({ message: "Successfully updated video!", data });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Something failed", err });
    });

});

module.exports = router;