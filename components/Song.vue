<template>
  <div>
    <p>{{song.value.songName}}</p>
    <p>by {{song.value.artist}} </p>
    <audio :src="song.value.songFile" controls>
      Your browser kinda sucks... try Chrome or FireFox.
    </audio>
  </div>
  
</template>

<script>
  export default {
    name: 'Song',
    props: ['song'],
  }
</script>