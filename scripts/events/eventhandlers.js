const favoriteBtn = document.querySelector(".movie-card__favorite-btn");
const unfavoriteBtn = document.querySelector(".movie-card__favorite-btn--un");

favoriteBtn.addEventListener("click", function () {
    favoriteBtn.classList.remove("movie-card__favorite-btn");
    favoriteBtn.classList.add("movie-card__favorite-btn--un");
    favoriteBtn.innerHTML = `<i class="fa-solid fa-minus"></i> Unfavorite`;
});

unfavoriteBtn.addEventListener("click", function () {
    unfavoriteBtn.classList.remove("movie-card__favorite-btn--un");
    unfavoriteBtn.classList.add("movie-card__favorite-btn");
    unfavoriteBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Favorite`;
});
