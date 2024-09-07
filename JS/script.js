console.log("Hello I'm JavaScript");

let currentSong = new Audio();
let songs;
let currFolder;

function SecondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format the result
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5501/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  //show all songs in the playlists
  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li>
        <img class="invert" src="images/music.svg" alt>
        <div class="info">
            <div>${song.replaceAll("%20", " ")} </div>
            <div>Song Artist</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="images/play.svg" alt>
        </div>
        </li>`;
  }

  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      // console.log(e.songs)
    });
  });
  return songs
}
const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "images/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5501/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  console.log(div);
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    // console.log(e)
    if (e.href.includes("songs/")) {
      let folder = e.href.split("/").slice(-1)[0];
      console.log(folder);

      let infoResponse = await fetch(
        `http://127.0.0.1:5501/songs/${folder}/info.json`
      );
      let response = await infoResponse.json();
      console.log(response);
      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        `<div data-folder="${folder}" class="card">
           <div class="play">
               <img src="images/playbutton.svg" alt>
           </div>
           <img src="/songs/${folder}/cover.jpeg" alt>
           <h2>${response.title}</h2>
           <p>${response.description}</p>
       </div>`;
    }
  }
}

async function main() {
  await getsongs("songs/English");
  console.log(songs);
  playMusic(songs[0], true);

  //display the albums on the page
  await displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "images/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${SecondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${SecondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //slidebar
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
    document.querySelector(".close").style.display = "block";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
    document.querySelector(".left").style.transition = "left .5s ease";
    document.querySelector(".close").style.display = "none";
  });

  previous.addEventListener("click", () => {
    console.log("previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    console.log("Next clicked");
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value + "/100");
      currentSong.volume = parseInt(e.target.value) / 100;
      if(currentSong.volume>0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("images/mute.svg", "images/volume.svg");
      }
    });

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0])
    });
  });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("images/volume.svg")) {
      e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });



const cards = document.querySelectorAll(".card");

// Add event listeners to each card
cards.forEach(card => {
  card.addEventListener("mouseover", () => {
    card.querySelector(".play").style.bottom = "42%";
    card.querySelector(".play").style.opacity = 1;
  });

  card.addEventListener("mouseout", () => {
    card.querySelector(".play").style.bottom = "38%";
    card.querySelector(".play").style.opacity = 0;
  });
});

}
main();
