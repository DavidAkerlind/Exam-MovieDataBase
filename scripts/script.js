import { renderMovieCard } from "./components/movieCard.js";
import {
    fetchTopMovies,
    fetchMovieByImdbID,
    fetchMovieByTitle,
} from "./modules/api.js";
import { renderMoviePage } from "./components/fullMoviePage.js";
if (
    window.location.pathname === "/" ||
    window.location.pathname === "/index.html"
) {
    console.log("index.html");
} else if (window.location.pathname === "/favorites.html") {
    console.log("favorites.html");

    renderMovieCard(fetchMovieByTitle("Simpsons"));
    //
} else if (window.location.pathname === "/movie.html") {
    console.log("movie.html");
    const urlParams = new URLSearchParams(window.location.search);
    const imdbID = urlParams.get("id");
    renderMoviePage(fetchMovieByImdbID(imdbID));
} else if (window.location.pathname === "/search.html") {
    console.log("search.html");
}
