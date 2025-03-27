const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('movies.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// 영화 리스트를 JSON으로 반환하는 API 엔드포인트
app.get('/movies', (req, res) => {
  const query = `
    SELECT ID, Title, Original_Title, Poster_Path, Vote_Average
    FROM movies;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 특정 영화의 상세 정보를 반환하는 API 엔드포인트
app.get('/movies/:id', (req, res) => {
  const movieId = req.params.id;
  const query = `
    SELECT ID, Title, Original_Title, Overview, Poster_Path, Vote_Average
    FROM movies
    WHERE ID = ?;
  `;

  db.get(query, [movieId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row); // 상세 영화 정보 반환
    } else {
      res.status(404).json({ error: 'Movie not found' });
    }
  });
});

app.post('/comments', (req, res) => {
  const { movie_id, comment } = req.body;
  if (!movie_id || !comment) {
    return res.status(400).json({ error: 'Movie ID and comment are required' });
  }

  const query = `
    INSERT INTO comments (movie_id, comment)
    VALUES (?, ?);
  `;

  db.run(query, [movie_id, comment], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Comment added successfully', id: this.lastID });
  });
});

// 댓글 불러오기 API
app.get('/comments/:movie_id', (req, res) => {
  const movieId = req.params.movie_id;

  const query = `
    SELECT c.id, c.comment, c.created_at
    FROM comments c
    WHERE c.movie_id = ?
    ORDER BY c.created_at DESC;
  `;

  db.all(query, [movieId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
