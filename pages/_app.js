import App from 'next/app'
import {Provider} from 'react-redux'

import 'antd/dist/antd.css'

import Layout from '../components/Layout'
import PageLoading from '../components/PageLoading'
import Router from 'next/router'

import withRedux from '../lib/with-redux'
class MyApp extends App {
    state = {
      loading: false
    }

    startLoading = () => {
      this.setState({
        loading: true
      })
    }

    stopLoading = () => {
      this.setState({
        loading: false
      })
    }

    componentDidMount() {
      Router.events.on('routeChangeStart', this.startLoading)
      Router.events.on('routeChangeComplete', this.stopLoading)
      Router.events.on('routeChangeError', this.stopLoading)
    }

    componentWilUnmount(){
      Router.events.off('routeChangeStart', this.startLoading)
      Router.events.off('routeChangeComplete', this.stopLoading)
      Router.events.off('routeChangeError', this.stopLoading)
    }
    
    // 全局性的数据获取
    // 手动判断Component对应的页面是否有getInitialProps方法
    // 如果有的话需要执行，然后传递给实际渲染的页面
    // 每次页面切换，该方法都会被执行
    static async getInitialProps (ctx) {
      const {Component} = ctx
        let pageProps = {}
    
        if (Component.getInitialProps) {
          pageProps = await Component.getInitialProps(ctx)
        }
    
        return {pageProps}
      }
    render () {
        const { Component, pageProps, reduxStore } = this.props // 对应的每个页面
        
        return (
          <Provider store={reduxStore}> 
            {this.state.loading ? <PageLoading/> : null}
            <Layout>
                <Component {...pageProps}/>
            </Layout>
            </Provider>
        )
    }
}
export default withRedux(MyApp)