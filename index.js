/* 
Your Student information in here
ASHISH TURAN
N01597858
*/

require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// middleware:
app.use(express.urlencoded({ extended: true })); // handle normal forms -> url encoded
app.use(express.json()); // Handle raw json data

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app
  .route("/upload")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "upload.html"));
  })
  .post(upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.send(`File uploaded successfully: ${req.file.path}`);
  });

app
  .route("/upload-multiple")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "upload-multiple.html"));
  })
  .post(upload.array("files", 100), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }
    const filePaths = req.files.map((file) => file.path);
    res
      .status(200)
      .send(`Files uploaded successfully: ${filePaths.join(", ")}`);
  });

app.get("/fetch-single", (req, res) => {
  let upload_dir = path.join(__dirname, "uploads");

  let uploads = fs.readdirSync(upload_dir);
  if (uploads.length == 0) {
    return res.status(503).send({
      message: "No images",
    });
  }
  let max = uploads.length - 1;
  let min = 0;

  let index = Math.round(Math.random() * (max - min) + min);
  let randomImage = uploads[index];

  res.sendFile(path.join(upload_dir, randomImage));
});

app.get("/single", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "single.html"));
});

// /multiple: handle a webpage to grab multiple random images from the server
app.get("/multiple", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "multiple.html"));
});

// /fetch-multiple - This route will grab the multiple photos for the webpage multiple
app.get("/fetch-multiple", (req, res) => {
  let upload_dir = path.join(__dirname, "uploads");

  let uploads = fs.readdirSync(upload_dir);
  if (uploads.length == 0) {
    return res.status(503).send({
      message: "No images",
    });
  }

  // Randomly select 5 images (or less if not enough images)
  let numImages = Math.min(5, uploads.length);
  let randomImages = [];
  while (randomImages.length < numImages) {
    let index = Math.floor(Math.random() * uploads.length);
    let image = uploads[index];
    if (!randomImages.includes(image)) {
      randomImages.push(image);
    }
  }

  res.status(200).json(randomImages);
});

// /gallery - showcases all images from the server
app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "gallery.html"));
});

// /fetch-all - Grab all items from the upload folder
app.get("/fetch-all", (req, res) => {
  let upload_dir = path.join(__dirname, "uploads");

  let uploads = fs.readdirSync(upload_dir);
  if (uploads.length == 0) {
    return res.status(503).send({
      message: "No images",
    });
  }

  res.status(200).json(uploads);
});

// /gallery-pagination - showcase all images from the server, using pagination
app.get("/gallery-pagination", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "gallery-pagination.html"));
});

// /fetch-all-pagination/pages/:index
app.get("/fetch-all-pagination/pages/:index", (req, res) => {
  let upload_dir = path.join(__dirname, "uploads");
  let uploads = fs.readdirSync(upload_dir);
  
  if (uploads.length == 0) {
    return res.status(503).send({
      message: "No images",
    });
  }

  const itemsPerPage = 10; // Number of images per page
  const pageIndex = parseInt(req.params.index, 10) - 1; // Page index (0-based)

  const start = pageIndex * itemsPerPage;
  const end = start + itemsPerPage;

  const paginatedItems = uploads.slice(start, end);

  res.status(200).json(paginatedItems);
});

// catch all other requests
app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
