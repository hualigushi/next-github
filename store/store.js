import { createStore, combineReducers, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'

import axios from 'axios'

const userInitialState = {}

const LOGOUT ='LOGOUT'
function userReducer(state=userInitialState, action){
    switch (action.type) {
       case LOGOUT: {
           return {}
       }
        default:
            return state
    }
}

const allReducers = combineReducers({
    user: userReducer
})

export function logout () {
    return dispatch => {
        axios.post('/logout')
        .then(res => {
            if (res.status === 200) {
                dispatch({
                    type: LOGOUT
                })
            } else {
                console.log('logout failed', res)
            }
        }).catch(err => {
            console.log('logout failed', err)
        })
    }
}

// 导出一个方法，每次服务器端渲染是都调用这个这个重新生成一个新的store
export default function initializeStore (state) {
    const store = createStore(
        allReducers, 
        Object.assign(
            {},
            {
                user: userInitialState
            }, 
            state
            ),
            applyMiddleware(ReduxThunk))

    return store
}