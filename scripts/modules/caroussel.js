
export function renderTrailers(movie, num) {
    const iFrameRef = document.createElement(`iframe`);
    iFrameRef.classList.add(`trailers__video`, `trailers__video-${num}`);
    iFrameRef.src = movie.Trailer_link;
    document.querySelector(`.trailers__container`).appendChild(iFrameRef);

    const trailerList = document.querySelectorAll(`.trailers__video`);
    const trailerArray = Array.from(trailerList);
    
    document.querySelectorAll(`.trailers__arrow`).forEach(arrow => {
        arrow.addEventListener(`click`, (event) => {
            changeTrailer(event, trailerList, trailerArray);
        });
    })
}

function changeTrailer(event, trailerList, trailerArray) {
    if (event.target.dataset.direction === `right`) {
        trailerArray.push(trailerArray.shift());
    } else if (event.target.dataset.direction === `left`) {
        trailerArray.unshift(trailerArray.pop());
    }

    trailerList.forEach(item => {
        item.classList.remove(
            `trailers__video-1`,
            `trailers__video-2`,
            `trailers__video-3`,
            `trailers__video-4`,
            `trailers__video-5`
        );
    });

    trailerArray.slice(0, 5).forEach((item, i) => {
        item.classList.add(`trailers__video-${i + 1}`)
    });
}

