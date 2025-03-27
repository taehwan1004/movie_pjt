// get_movies.js
const axios = require('axios');
const ExcelJS = require('exceljs');

// Bearer 토큰 (TMDB v4 인증 토큰 사용)
const token = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YjhkODBiODBlNjE4YmZkOGM1MjMxYzYxZTQ2N2I1YiIsIm5iZiI6MTU5NjE4MjgyNy45NzEsInN1YiI6IjVmMjNkMTJiMzUwMzk4MDAzNGU4ZjhjYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nfTMm_oavxl65mHU4CHAGAy0Dciqhp0oE9C1d750J84';
const baseURL = 'https://api.themoviedb.org/3';
const maxMovies = 100; // 원하는 영화 개수 (필요에 따라 조정)

async function fetchMovies(page = 1) {
  try {
    const response = await axios.get(`${baseURL}/discover/movie`, {
      headers: {
        accept: 'application/json',
        Authorization: token,
      },
      params: {
        language: 'ko-KR',
        sort_by: 'popularity.desc',
        page: page,
      },
    });
    return response.data;
  } catch (error) {
    console.error('영화 데이터 호출 에러:', error);
  }
}

async function exportMoviesToExcel() {
  let currentPage = 1;
  let totalPages = 1;
  let movies = [];
  let count = 0;

  // 최대 영화 개수에 도달하거나 모든 페이지를 처리할 때까지 반복
  while (currentPage <= totalPages && count < maxMovies) {
    const data = await fetchMovies(currentPage);
    totalPages = data.total_pages;
    for (const movie of data.results) {
      if (count < maxMovies) {
        movies.push(movie);
        count++;
      } else {
        break;
      }
    }
    console.log(`페이지 ${currentPage} 처리 완료 - 총 영화 수: ${count}`);
    currentPage++;
  }

  // Excel 워크북 및 워크시트 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Movies');

  // 워크시트 열 정의 (요청한 모든 키 포함)
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Original Title', key: 'original_title', width: 30 },
    { header: 'Overview', key: 'overview', width: 50 },
    { header: 'Release Date', key: 'release_date', width: 15 },
    { header: 'Poster Path', key: 'poster_path', width: 30 },
    { header: 'Backdrop Path', key: 'backdrop_path', width: 30 },
    { header: 'Popularity', key: 'popularity', width: 10 },
    { header: 'Vote Average', key: 'vote_average', width: 10 },
    { header: 'Vote Count', key: 'vote_count', width: 10 },
    { header: 'Genre IDs', key: 'genre_ids', width: 20 },
  ];

  // 영화 데이터를 행으로 추가 (genre_ids는 배열을 콤마로 구분된 문자열로 변환)
  movies.forEach((movie) => {
    worksheet.addRow({
      id: movie.id,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      popularity: movie.popularity,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      genre_ids: Array.isArray(movie.genre_ids) ? movie.genre_ids.join(', ') : movie.genre_ids,
    });
  });

  // Excel 파일로 저장
  await workbook.xlsx.writeFile('movies.xlsx');
  console.log('영화 데이터를 movies.xlsx 파일로 저장하였습니다.');
}

exportMoviesToExcel();
