// get_genres.js
const axios = require('axios');
const ExcelJS = require('exceljs');

// Bearer 토큰 (TMDB v4 인증 토큰 사용)
const token = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YjhkODBiODBlNjE4YmZkOGM1MjMxYzYxZTQ2N2I1YiIsIm5iZiI6MTU5NjE4MjgyNy45NzEsInN1YiI6IjVmMjNkMTJiMzUwMzk4MDAzNGU4ZjhjYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nfTMm_oavxl65mHU4CHAGAy0Dciqhp0oE9C1d750J84';
const baseURL = 'https://api.themoviedb.org/3';

async function fetchGenres() {
  try {
    const response = await axios.get(`${baseURL}/genre/movie/list`, {
      headers: {
        accept: 'application/json',
        Authorization: token,
      },
      params: {
        language: 'ko-KR',
      },
    });
    return response.data;
  } catch (error) {
    console.error('장르 목록 호출 에러:', error);
  }
}

async function exportGenresToExcel() {
  const data = await fetchGenres();
  const genres = data.genres; // [{ id: 28, name: 'Action' }, ...] 형태

  // Excel 워크북 및 워크시트 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Genres');

  // 워크시트 열 정의
  worksheet.columns = [
    { header: 'Genre ID', key: 'id', width: 10 },
    { header: 'Genre Name', key: 'name', width: 30 },
  ];

  // 장르 데이터를 행으로 추가
  genres.forEach((genre) => {
    worksheet.addRow({
      id: genre.id,
      name: genre.name,
    });
  });

  // Excel 파일로 저장
  await workbook.xlsx.writeFile('genres.xlsx');
  console.log('장르 목록을 genres.xlsx 파일로 저장하였습니다.');
}

exportGenresToExcel();
