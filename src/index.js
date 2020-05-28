/**
 * 入口js
 * react v.16.8.6, antd v.3.xxx，使用的非最新react框架和antd插件，未使用redux的版本
 * tea基础上的做工部分: role
 */
import React from 'react'
import ReactDOM from 'react-dom'
// import 'antd/dist/antd.css'

import App from './App'
import storageUtils from './utils/storageUtils'
import memoryUtils from './utils/memoryUtils'

// 读取local中保存user, 保存到内存中
const user = storageUtils.getUser();
memoryUtils.user = user;


// 将App组件标签渲染到index页面的div上
ReactDOM.render(<App />, document.getElementById('root'));
