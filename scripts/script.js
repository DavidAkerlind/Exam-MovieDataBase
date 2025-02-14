import { renderMovieCard } from "./components/movieCard.js";
import { fetchMovieData } from "./modules/api.js";

if (
    window.location.pathname === "/" ||
    window.location.pathname === "/index.html"
) {
    console.log("index.html");
} else if (window.location.pathname === "/favorites.html") {
    console.log("favorites.html");

    renderMovieCard(fetchMovieData("Simpsons"));
} else if (window.location.pathname === "/movie.html") {
    console.log("movie.html");
} else if (window.location.pathname === "/search.html") {
    console.log("search.html");
}
