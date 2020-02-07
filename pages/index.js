import {useEffect} from 'react'
import {Button,Icon,Tabs} from 'antd'
import getConfig from 'next/config'
import {connect} from 'react-redux'
import Router, {withRouter} from 'next/router'
import LRU from 'lru-cache'

import Repo from '../components/Repo'
import { cacheArray} from '../lib/repo-basic-cache'

const cache = new LRU({
    maxAge: 1000 * 60 *10
})


const api = require('../lib/api')
const { publicRuntimeConfig }  = getConfig()

const isServer = typeof window === 'undefined'

function Index ({userRepos,userStarredRepos,user,router}) {
    const tabKey = router.query.key || '1'

    const handleTabChange = (activeKey) => {
        Router.push(`/?key=${activeKey}`)
    }    

    useEffect(() => {
        if (!isServer) {
            if (userRepos){
                cache.set('userRepos', userRepos)
            }

            if (userStarredRepos) {
                cache.set('userStarredRepos', userStarredRepos)
            }
        }
    
    }, [userRepos, userStarredRepos])

    useEffect (() => {
        // 服务器端渲染不需要缓存
        if (!isServer){
            cacheArray(userRepos)
            cacheArray(userStarredRepos)
        }
    })

    if(!user || !user.id) {
        return (<div className="root">
            <p>亲，您还没有登录哦~</p>
            <Button type="primary" href={publicRuntimeConfig.OAUTH_URL}>
                点击登录
                </Button>
                <style jsx>{`
                .root {
                    height: 400px;
                    display:flex;
                    flex-direction:column;
                    justify-content:center;
                    align-items:center;
                }
                `}</style>
        </div>)
    }
    return (
       <div className="root">
           <div className="user-info">
               <img src={user.avatar_url} alt="user avatar"/>
                <span className="login">{user.login}</span>
                <span className="name">{user.name}</span>
                <span className="bio">{user.bio}</span>
                <p className="email">
                    <Icon type="mail" style={{marginRight:10}}></Icon>
                    <a href={`maito:${user.email}`}>{user.email}</a>
                </p>
           </div>
           <div className="user-repos">
                <Tabs activeKay={tabKey} onChange={handleTabChange} animated={false}>
                    <Tabs.TabPane tab="你的仓库" key="1">
                        {
                            userRepos.map((repo,index) =><Repo repo={repo} key={repo.id}></Repo>)
                        }
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="你关注的仓库" key="2">
                        {
                            userStarredRepos.map((repo, index) =><Repo repo={repo} key={repo.id}></Repo>)
                        }
                    </Tabs.TabPane>
                </Tabs>
           </div>
           <style jsx>{`
                .root{
                    display:flex;
                    align-item:flex-start;
                    padding: 20px 0;
                }
                .user-info {
                    width: 200px;
                    margin-right: 40px;
                    flex-shrink: 0;
                    display:flex;
                    flex-direction:column;
                }
                .login{
                    font-weight:800;
                    font-size:20px;
                    margin-top:20px;
                }
                .name{
                    font-size:16px;
                    color:#777;
                }
                .bio{
                    margin-top:20px;
                    color:#333;
                }
                .avatar{
                    width:100%;
                    border-radius: 5px;
                }
                .user-repos {
                    flex-grow:1;
                }
            `}</style>
       </div>
    )
}


//客户端不同页面间跳转调用，服务器端调用
Index.getInitialProps = async ({ctx,reduxStore}) => {
    const user = reduxStore.getState().user
    if(!user || !user.id){
        return {
            isLogin: false
        }
    }

    if (!isServer) {
        if (cache.get('userRepos') && cache.get('userStarredRepos')) {
            return {
                userRepos: cache.get('userRepos'),
                userStarredRepos: cache.get('userStarredRepos')
            }
        } 
    }
    

    const userRepos = await api.request({
        url: '/user/repos'
    },ctx.req,ctx.res)
  
    const userStarredRepos = await api.request({
        url: '/user/starred'
    },ctx.req,ctx.res)

    console.log('userRepos',userRepos.data.length)
    console.log('userStarredRepos',  userStarredRepos.data.length)
    
    return {
        isLogin:true,
        userRepos: userRepos.data,
        userStarredRepos: userStarredRepos.data
    }
}
export default withRouter(
    connect(function maoState(state){
    return {
        user: state.user
    }
})(Index))