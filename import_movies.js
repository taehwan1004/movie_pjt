const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();

// 엑셀 파일 읽기
const workbook = XLSX.readFile('movies.xlsx');
const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 선택
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

// SQLite3 데이터베이스 연결
const db = new sqlite3.Database('movies.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// movies 테이블 생성 (없으면 생성)
db.run(`
  CREATE TABLE IF NOT EXISTS movies (
    ID INTEGER PRIMARY KEY,
    Title TEXT,
    Original_Title TEXT,
    Overview TEXT,
    Release_Date TEXT,
    Poster_Path TEXT,
    Backdrop_Path TEXT,
    Popularity REAL,
    Vote_Average REAL,
    Vote_Count INTEGER
  );
`);

// 데이터 삽입을 위한 준비: SQL INSERT 구문 준비
const stmt = db.prepare(`
  INSERT OR IGNORE INTO movies (ID, Title, Original_Title, Overview, Release_Date, Poster_Path, Backdrop_Path, Popularity, Vote_Average, Vote_Count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`);

// 트랜잭션을 시작하여 배치 처리 (성능 향상)
db.run("BEGIN TRANSACTION");

data.forEach((row) => {
  stmt.run(
    row.ID,
    row.Title,
    row['Original Title'],  // 엑셀에서 'Original Title'이 존재하는지 확인
    row.Overview,
    row['Release Date'],  // 엑셀에서 'Release Date'가 존재하는지 확인
    row['Poster Path'],  // 엑셀에서 'Poster Path'가 존재하는지 확인
    row['Backdrop Path'],  // 엑셀에서 'Backdrop Path'가 존재하는지 확인
    row.Popularity,
    row['Vote Average'],  // 엑셀에서 'Vote Average'가 존재하는지 확인
    row['Vote Count']  // 엑셀에서 'Vote Count'가 존재하는지 확인
  );
});

// 트랜잭션 종료 및 커밋
db.run("COMMIT");

// 데이터 삽입 완료 후, statement 종료 및 데이터베이스 연결 닫기
stmt.finalize();
db.close((err) => {
  if (err) {
    console.error('Error closing the database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});
