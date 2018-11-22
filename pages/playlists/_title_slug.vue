<template>
  <div>
    
    <div class="px-16 mx-auto">
      <h2>{{playlist.title}}</h2>

      <p class="p-8 my-8">{{playlist.description}}</p>
    </div>
    <!-- <div v-for="song in playlist.songs" :key="song.name">
      <Song :song="song" />
    </div> -->


  <div class="audioContainer">
		<a class="nav-icon" v-on:click="isPlaylistActive=!isPlaylistActive" :class="{'isActive': isPlaylistActive}" title="Music List">
		  <span></span>
		  <span></span>
		  <span></span>
		</a>
		<div class="audioPlayerList" :class="{'isActive': isPlaylistActive}">
			<div class="item" v-for="(item,index) in playlist.songs" :key="item._id" v-bind:class="{ 'isActive':isCurrentSong(index) }" v-on:click="changeSong(index),isPlaylistActive=!isPlaylistActive">
				<p class="title">{{ item.value.title }}</p>
				<p class="artist">{{ item.value.artist }}</p>
			</div>

		</div>
		<div class="audioPlayerUI" :class="{'isDisabled': isPlaylistActive}">
			
			<div class="albumDetails">
				<transition name="slide-fade" mode="out-in">
					<p class="title" :key="currentSong">{{ playlist.songs[currentSong].value.songName }} </p>
				</transition>
				<transition name="slide-fade" mode="out-in">
					<p class="artist" :key="currentSong">{{ playlist.songs[currentSong].value.artist }}</p>
				</transition>
			</div>

			<div class="playerButtons">
        
				<a class="button" :class="{'isDisabled':(currentSong==0)}" v-on:click="prevSong()" title="Previous Song"><i class="zmdi zmdi-skip-previous"></i></a>
				<a class="button play" v-on:click="playAudio()" title="Play/Pause Song">
					<transition name="slide-fade" mode="out-in">
						<i class="zmdi" :class="[currentlyStopped ? 'zmdi-stop' : (currentlyPlaying ? 'zmdi-pause-circle' : 'zmdi-play-circle')]" :key="1"></i>
					</transition>
				</a>
				<a class="button" :class="{'isDisabled':(currentSong==playlist.songs.length-1)}" v-on:click="nextSong()" title="Next Song"><i class="zmdi zmdi-skip-next"></i></a>
			</div>

			<div class="currentTimeContainer" style="text-align:center">
				<span class="currentTime">{{ currentTime | fancyTimeFormat }}</span>
				<span class="totalTime"> {{ trackDuration | fancyTimeFormat }}</span>
				<!--<span style="color:black">({{ currentSong+1 }}/{{ playlist.songs.length }})</span>-->
			</div>

			<div class="currentProgressBar">
				<div class="currentProgress" :style="{ width: currentProgressBar + '%' }"></div>
			</div>

      <transition name="slide-fade" mode="out-in">
        <div class="song-description mt-16">
          <p class="color">{{playlist.songs[currentSong].value.songDescription}}</p>
        </div>
      </transition>
		</div>

	</div>





    <p>
      <small>
        Challenge: {{playlist.challenge.display}}
      </small>
    </p>
  </div>
</template>


<script>
import Song from '~/components/Song'

export default {
  components: {
    Song
  },
  computed: {
    playlist() {
      const { title_slug } = this.$route.params
      return this.$store.getters.playlists.find(list => list.title_slug === title_slug)
    }
  },
  data() {
    return {
      audio: '',
      imgLoaded: false,
      currentlyPlaying: false,
      currentlyStopped: false,
      currentTime: 0,
      checkingCurrentPositionInTrack: '',
      trackDuration: 0,
      currentProgressBar: 0,
      isPlaylistActive: false,
      currentSong: 0,
      debug: false,

      audioFile: ''
    }
  },
  mounted: function() {
    this.changeSong()
    this.audio.loop = false
  },
  filters: {
    fancyTimeFormat: function(s) {
      return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s
    }
  },
  methods: {
    togglePlaylist: function() {
      this.isPlaylistActive = !this.isPlaylistActive
    },
    nextSong: function() {
      if (this.currentSong < this.playlist.songs.length - 1)
        this.changeSong(this.currentSong + 1)
    },
    prevSong: function() {
      if (this.currentSong > 0) this.changeSong(this.currentSong - 1)
    },
    changeSong: function(index) {
      var wasPlaying = this.currentlyPlaying
      this.imageLoaded = false
      if (index !== undefined) {
        this.stopAudio()
        this.currentSong = index
      }
      this.audioFile = this.playlist.songs[this.currentSong].value.songFile
      this.audio = new Audio(this.audioFile)
      var localThis = this
      this.audio.addEventListener('loadedmetadata', function() {
        localThis.trackDuration = Math.round(this.duration)
      })
      this.audio.addEventListener('ended', this.handleEnded)
      if (wasPlaying) {
        this.playAudio()
      }
    },
    isCurrentSong: function(index) {
      if (this.currentSong == index) {
        return true
      }
      return false
    },
    getCurrentSong: function(currentSong) {
      return this.playlist.songs[currentSong].value.songFile
    },
    playAudio: function() {
      if (
        this.currentlyStopped == true &&
        this.currentSong + 1 == this.playlist.songs.length
      ) {
        this.currentSong = 0
        this.changeSong()
      }
      if (!this.currentlyPlaying) {
        this.getCurrentTimeEverySecond(true)
        this.currentlyPlaying = true
        this.audio.play()
      } else {
        this.stopAudio()
      }
      this.currentlyStopped = false
    },
    stopAudio: function() {
      this.audio.pause()
      this.currentlyPlaying = false
      this.pausedMusic()
    },
    handleEnded: function() {
      if (this.currentSong + 1 == this.playlist.songs.length) {
        this.stopAudio()
        this.currentlyPlaying = false
        this.currentlyStopped = true
      } else {
        this.currentlyPlaying = false
        this.currentSong++
        this.changeSong()
        this.playAudio()
      }
    },
    onImageLoaded: function() {
      this.imgLoaded = true
    },
    getCurrentTimeEverySecond: function(startStop) {
      var localThis = this
      this.checkingCurrentPositionInTrack = setTimeout(
        function() {
          localThis.currentTime = localThis.audio.currentTime
          localThis.currentProgressBar =
            (localThis.audio.currentTime / localThis.trackDuration) * 100
          localThis.getCurrentTimeEverySecond(true)
        }.bind(this),
        1000
      )
    },
    pausedMusic: function() {
      clearTimeout(this.checkingCurrentPositionInTrack)
    }
  },
  watch: {
    currentTime: function() {
      this.currentTime = Math.round(this.currentTime)
    }
  },
  beforeDestroy: function() {
    this.audio.removeEventListener('ended', this.handleEnded)
    this.audio.removeEventListener('loadedmetadata', this.handleEnded)

    clearTimeout(this.checkingCurrentPositionInTrack)
  }
}
</script>




<style>
@import url('https://fonts.googleapis.com/css?family=Inconsolata:400,700');
@import url('https://fonts.googleapis.com/css?family=Raleway:400,400i,700');
@import url('https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.2.0/css/material-design-iconic-font.min.css');
* {
  box-sizing: border-box;
}

.animated {
  -webkit-animation-duration: 0.5s;
  animation-duration: 0.5s;
}

.audioContainer {
  position: relative;
  background-color: #eceff1;
  min-height: 45rem;
  width: 20rem;
  overflow: hidden;
  padding: 1.5rem;
  margin: 0 auto;
  border-radius: 6px;
  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.audioContainer .nav-icon {
  width: 15px;
  height: 12px;
  position: absolute;
  top: 1.125rem;
  left: 1.5rem;
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
  cursor: pointer;
}
.audioContainer .nav-icon span {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 6px;
  opacity: 1;
  left: 0;
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
  transition: 0.5s ease-in-out;
}
.audioContainer .nav-icon span:nth-child(1) {
  top: 0px;
}
.audioContainer .nav-icon span:nth-child(2) {
  top: 5px;
}
.audioContainer .nav-icon span:nth-child(3) {
  top: 10px;
}
.audioContainer .nav-icon.isActive span:nth-child(1) {
  top: 5px;
  -webkit-transform: rotate(135deg);
  transform: rotate(135deg);
}
.audioContainer .nav-icon.isActive span:nth-child(2) {
  opacity: 0;
  left: -60px;
}
.audioContainer .nav-icon.isActive span:nth-child(3) {
  top: 5px;
  -webkit-transform: rotate(-135deg);
  transform: rotate(-135deg);
}
.audioContainer .audioPlayerList {
  color: rgba(0, 0, 0, 0.75);
  width: 17rem;
  transition: 0.5s;
  -webkit-transform: translateX(-200%);
  transform: translateX(-200%);
  position: absolute;
  margin-top: 1.5rem;
  overflow: auto;
  z-index: 10;
  will-change: transform;
}
.audioContainer .audioPlayerList.isActive {
  -webkit-transform: translateX(0);
  transform: translateX(0);
}
.audioContainer .audioPlayerList .item {
  margin-bottom: 1.5rem;
  border-left: 0.1rem solid transparent;
  transition: 0.2s;
}
.audioContainer .audioPlayerList .item:hover {
  padding-left: 0.5rem;
  cursor: pointer;
}
.audioContainer .audioPlayerList .item .title {
  color: black;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}
.audioContainer .audioPlayerList .item .artist {
  color: rgba(0, 0, 0, 0.5);
  font-size: 0.8rem;
}
.audioContainer .audioPlayerList .item.isActive {
  border-left-color: black;
  padding-left: 1rem;
}
.audioContainer .audioPlayerUI {
  margin-top: 1.5rem;
  will-change: transform, filter;
  transition: 0.5s;
}
.audioContainer .audioPlayerUI.isDisabled {
  -webkit-transform: scale(0.75) translateX(100%);
  transform: scale(0.75) translateX(100%);
  -webkit-filter: blur(5px) grayscale(100%);
  filter: blur(5px) grayscale(100%);
}
.audioContainer .audioPlayerUI .albumDetails {
  text-align: center;
  margin: 2rem 0;
}
.audioContainer .audioPlayerUI .albumDetails p {
  margin: 0px;
}
.audioContainer .audioPlayerUI .albumDetails p.title {
  font-size: 1rem;
  color: black;
}
.audioContainer .audioPlayerUI .albumDetails p.artist {
  margin-top: 1rem;
  font-size: 0.75rem;
  font-weight: none;
  color: rgba(0, 0, 0, 0.75);
  transition-delay: 100ms;
}
.audioContainer .audioPlayerUI .albumImage {
  width: 17rem;
  height: 17rem;
  overflow: hidden;
  margin: 0 auto;
}
.audioContainer .audioPlayerUI .albumImage img {
  width: 100%;
  height: 100%;
  z-index: 10;
  -o-object-fit: cover;
  object-fit: cover;
  -o-object-position: 50% 50%;
  object-position: 50% 50%;
}
.audioContainer .audioPlayerUI .playerButtons {
  position: relative;
  margin: 0 auto;
  margin-bottom: 1.5rem;
  text-align: center;
}
.audioContainer .audioPlayerUI .playerButtons* {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
}
.audioContainer .audioPlayerUI .playerButtons .button {
  font-size: 2rem;
  display: inline-block;
  vertical-align: middle;
  padding: 0.5rem;
  margin: 0 0.25rem;
  color: rgba(0, 0, 0, 0.75);
  border-radius: 50%;
  outline: 0;
  text-decoration: none;
  cursor: pointer;
  transition: 0.5s;
}
.audioContainer .audioPlayerUI .playerButtons .button.play {
  font-size: 4rem;
  margin: 0 1.5rem;
}
.audioContainer .audioPlayerUI .playerButtons .button:active {
  opacity: 0.75;
  -webkit-transform: scale(0.75);
  transform: scale(0.75);
}
.audioContainer .audioPlayerUI .playerButtons .button.isDisabled {
  color: rgba(0, 0, 0, 0.2);
  cursor: initial;
}
.audioContainer .audioPlayerUI .playerButtons .button.isDisabled:active {
  -webkit-transform: none;
  transform: none;
}
.audioContainer .audioPlayerUI .currentTimeContainer {
  width: 100%;
  height: 1rem;
}
.audioContainer .audioPlayerUI .currentTimeContainer .currentTime,
.audioContainer .audioPlayerUI .currentTimeContainer .totalTime {
  font-size: 0.5rem;
  font-family: monospace;
  color: rgba(0, 0, 0, 0.75);
}
.song-description {
  color: rgba(0, 0, 0, 0.75);
}
.audioContainer .audioPlayerUI .currentTimeContainer .currentTime {
  float: left;
}
.audioContainer .audioPlayerUI .currentTimeContainer .totalTime {
  float: right;
}
.audioContainer .audioPlayerUI .currentProgressBar {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  margin-top: 1.5rem;
}
.audioContainer .audioPlayerUI .currentProgressBar .currentProgress {
  background-color: rgba(0, 0, 0, 0.75);
  width: 0px;
  height: 1px;
  transition: 100ms;
}

.loader,
.loader:after {
  border-radius: 50%;
  width: 10em;
  height: 10em;
}

.loader {
  margin: 60px auto;
  font-size: 10px;
  position: relative;
  text-indent: -9999em;
  border-top: 0.1em solid rgba(0, 0, 0, 0.2);
  border-right: 0.1em solid rgba(0, 0, 0, 0.2);
  border-bottom: 0.1em solid rgba(0, 0, 0, 0.2);
  border-left: 0.1em solid rgba(0, 0, 0, 0.75);
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation: load8 1.1s infinite linear;
  animation: load8 1.1s infinite linear;
}

@-webkit-keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes load8 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
/* data change transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  -webkit-transform: translateY(10px);
  transform: translateY(10px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Codepen Formatting */
body {
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-repeat: no-repeat;
  background-attachment: fixed;
  color: rgba(255, 255, 255, 0.7);
  font-family: Raleway, sans-serif;
  padding: 3rem;
}

.heading {
  text-align: center;
  margin: 0;
  margin: 2rem 0;
  font-family: Inconsolata, monospace;
}
.heading h1 {
  margin: 0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}
.heading p {
  margin: 0;
  font-size: 0.8rem;
}
.heading a {
  color: rgba(255, 255, 255, 0.8);
  transition: 0.3s;
}
.heading a:hover {
  color: white !important;
}
.heading a:visited {
  color: rgba(255, 255, 255, 0.5);
}
</style>
