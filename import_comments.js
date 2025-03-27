const sqlite3 = require('sqlite3').verbose();

// SQLite3 데이터베이스 연결
const db = new sqlite3.Database('movies.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// comments 테이블 생성 (없으면 생성)
db.run(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(ID)
  );
`, (err) => {
  if (err) {
    console.error('Error creating comments table:', err.message);
  } else {
    console.log('Comments table created (if it didn\'t exist).');
  }
});

// 데이터베이스 연결 종료
db.close((err) => {
  if (err) {
    console.error('Error closing the database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});
