import Vuex from 'vuex';

const createStore = () => {
  return new Vuex.Store({
    state: {
      playlists: [],
      challenges: [],
    },
    mutations: {
      setPlaylists(state, playlists) {
        state.playlists = playlists;
      },
      setChallenges(state, challenges) {
        state.challenges = challenges;
      },
    },
    actions: {
      nuxtServerInit(vuexContext, context) {
        // console.log('init');
        // console.log('context', context);
        // const playlistsResponse = await this.$axios.get('http://mixtagon.hdsapps.com/admin/api/collections/get/playlists?token=');
        // const playlists = playlistsResponse.entries;
        
        // const challengesResponse = await this.$axios.get('http://mixtagon.hdsapps.com/admin/api/collections/get/challenges?token=');
        // const challenges = challengesResponse.entries;

        // vuexContext.commit('setPlaylists', playlists);
        // vuexContext.commit('setChallenges', challenges);
        
        // const test = await this.$axios.get('http://mixtagon.hdsapps.com/admin/api/collections/playlists?token=');
        // console.log('test', test);

        const playlists = this.$axios.get('http://mixtagon.hdsapps.com/admin/api/collections/get/playlists?token='+process.env.API_TOKEN)
          .then(response => {
            // vuexContext.commit('setPlaylists', response.data.entries);
            return response.data.entries;
          })
          .catch(error => {
            console.log('ufas! un error en init: ', error);
          });

        const challenges = this.$axios.get('http://mixtagon.hdsapps.com/admin/api/collections/get/challenges?token='+process.env.API_TOKEN)
          .then(response => {
            // vuexContext.commit('setChallenges', response.data.entries);
            return response.data.entries;
          })
          .catch(error => {
            console.log('ufas! un error en init: ', error);
          });

          return Promise.all([playlists, challenges]).then(values => {
            vuexContext.commit('setPlaylists', values[0]);
            vuexContext.commit('setChallenges', values[1]);
          })
      },

    },
    getters: {
      playlists(state) {
        return state.playlists;
      },
      challenges(state) {
        return state.challenges;
      },
    }
  })
};

export default createStore;