import ApiService from '@/common/api.service';
import JwtService from '@/common/jwt.service';
import { LOGIN, LOGOUT, REGISTER, CHECK_AUTH, UPDATE_USER } from './actions.type';
import { SET_AUTH, PURGE_AUTH, SET_ERROR } from './mutations.type';
import { Auth } from 'aws-amplify';

/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/

const state = {
    errors: null,
    user: {}, // <<
    username: '',
    isAuthenticated: !!JwtService.getToken()
};

const getters = {
    currentUsername(state){
        return state.username;
    },
    currentUser (state) {
        return state.user;
    },
    isAuthenticated (state) {
        return state.isAuthenticated;
    }
};

const actions = {
    [LOGIN] (context, credentials) {
        return new Promise((resolve) => {
            Auth.signIn(credentials.username, credentials.password)
                .then(user => {
                    context.commit(SET_AUTH, user);
                    resolve(user);
                }).catch(err =>{
                    context.commit(SET_ERROR, err);
                });
        });
    },
    [LOGOUT] (context) {
        Auth.signOut()
            .then(data =>{
                context.commit(PURGE_AUTH);
            }).catch(err => console.log('FAILED Amplify [Sign out]', err));
    },
    [REGISTER] (context, credentials) {
        // return new Promise((resolve, reject) => {
        //     ApiService
        //         .post('users', {user: credentials})
        //         .then(({data}) => {
        //             context.commit(SET_AUTH, data.user);
        //             resolve(data);
        //         })
        //         .catch(({response}) => {
        //             context.commit(SET_ERROR, response.data.errors);
        //             reject();
        //         });
        // });
    },
    [CHECK_AUTH] (context) {
        let session = Auth.currentSession();
        if (JwtService.getToken()) {
            ApiService.setHeader();
            Auth.currentAuthenticatedUser()
                .then(user => {
                    context.commit(SET_AUTH, user);
                }).catch( err => {
                    context.commit(SET_ERROR, response.data.errors);
                });
        } else {
            context.commit(PURGE_AUTH);
        }
    },
    [UPDATE_USER] (context, payload) {
        const {email, username, password, image, bio} = payload;
        const user = { email, username, bio, image };
        if (password) {
            user.password = password;
        }
        return ApiService
            .put('user', user)
            .then(({data}) => {
                context.commit(SET_AUTH, data.user);
                return data;
            });
    }
};

const mutations = {
    [SET_ERROR] (state, error) {
        state.errors = error;
    },
    [SET_AUTH] (state, user) {
        state.isAuthenticated = true;
        state.user = user;
        state.username = user.username;
        state.errors = {};
        JwtService.saveToken(state.user.signInUserSession.idToken.jwtToken);
    },
    [PURGE_AUTH] (state) {
        state.isAuthenticated = false;
        state.username = '';
        state.user = {}; // will have an USER OBJECT one day
        state.errors = {};
        JwtService.destroyToken();
    }
};

export default {
    state,
    actions,
    mutations,
    getters
};
