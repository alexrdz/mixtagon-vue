<template>
  <li>
    <nuxt-link :to="{path: `playlists/${playlist.title_slug}`}">
    <h3>{{playlist.title}}</h3>
    <p>{{playlist.description}}</p>
    </nuxt-link>
  </li>
</template>

<script>

  export default {
    name: 'PlaylistListItem',
    props: ['playlist'],
  }
</script>
