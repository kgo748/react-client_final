/*
角色路由
 */
import React, {Component} from 'react'
import {
  Card,
  Button,
  Table,
  Modal,
  message
} from 'antd'
import {PAGE_SIZE} from "../../utils/constants"
import {reqRoles, reqAddRole, reqUpdateRole} from '../../api'
import AddForm from './add-form'
import AuthForm from './auth-form'
import memoryUtils from "../../utils/memoryUtils"
import {formateDate} from '../../utils/dateUtils'
import storageUtils from "../../utils/storageUtils";

export default class Role extends Component {

  state = {
    roles: [], // 所有角色的列表
    role: {}, // 选中的role
    isShowAdd: false, // 是否显示添加界面
    isShowAuth: false, // 是否显示设置权限界面
  };

  constructor (props) {
    super(props);

    /*子组件有一个可以不断变化的数据，父组件在需要的时候就能读取到，(通过父组件访问子组件的方法获取);
    * 读取子组件(auth-form)数据(数组)步骤1：this.auth = React.createRef();
    */
    this.auth = React.createRef();
  }

  /*初始化表格列字段*/
  initColumn = () => {
    this.columns = [
      {
        title: '角色名称',
        dataIndex: 'name'
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        render: (create_time) => formateDate(create_time) /*时间转换，定义一个函数再去调用 formateDate(xxx) 函数*/
      },
      {
        title: '授权时间',
        dataIndex: 'auth_time',
        render: formateDate
      },
      {
        title: '授权人',
        dataIndex: 'auth_name'
      },
    ]
  };

  /*获取角色列表*/
  getRoles = async () => {
    const result = await reqRoles();
    if (result.status===0) {
      const roles = result.data;
      this.setState({
        roles
      })
    }
  };

  /*表格行点击事件*/
  onRow = (role) => {   //role 表格当前角色对象
    return {
      onClick: event => { // 点击行事件设置当前登陆的角色在state里
        //console.log('Role...row onClick()...role...', role);
        this.setState({role})
      },
    }
  };

  /*添加角色*/
  addRole = () => {
    // 进行表单验证, 只能通过了才向下处理
    this.form.validateFields(async (error, values) => {
      if (!error) {
        // 隐藏确认框
        this.setState({
          isShowAdd: false
        });
        //console.log("role...addROle()...", this.form, values);

        // 收集输入数据
        const {roleName} = values;
        this.form.resetFields();

        // 请求添加
        const result = await reqAddRole(roleName);
        // 根据结果提示/更新列表显示
        if (result.status===0) {
          message.success('添加角色成功');
          //更新roles状态方式3：重新执行向后台请求数据的方法
          // this.getRoles()

          // 新产生的角色
          const role = result.data;
          // 更新roles状态方式1：react不推荐
          /*const roles = this.state.roles;//获取
          roles.push(role);//添加
          this.setState({   //更新
            roles
          })*/

          // 更新roles状态方式2：基于原本状态数据更新，推荐传入函数去更新；更新的属性值和原来的没关系，退家使用对象的方式；
          this.setState((state, props) => ({
            roles: [...state.roles, role]
          }))
        } else {
          message.success('添加角色失败')
        }
      }
    })
  };

  /*更新角色*/
  updateRole = async () => {
    // 隐藏确认框
    this.setState({
      isShowAuth: false
    });

    const role = this.state.role;//获取当前角色对象
    // 读取子组件数据(数组)步骤4：调用子组件的方法：得到最新的menus
    const menus = this.auth.current.getMenus();
    role.menus = menus;//把从子组件那里获取到的数据设置在role上
    role.auth_time = Date.now();//设置权限设置的时间
    role.auth_name = memoryUtils.user.username;//授权人设置为当前登陆用户

    // 请求更新
    const result = await reqUpdateRole(role);
    if (result.status===0) {
      // this.getRoles()
      //*** 如果当前更新的是自己角色的权限, 强制退出(设置后权限变大或变小，需重新登陆进入)
      if (role._id === memoryUtils.user.role_id) {
        memoryUtils.user = {};
        storageUtils.removeUser();
        this.props.history.replace('/login');
        message.success('当前用户角色权限成功')
      } else {
        message.success('设置角色权限成功');
        this.setState({
          roles: [...this.state.roles]
        })
      }
    }
  };

  componentWillMount () {
    this.initColumn();
  }

  componentDidMount () {
    this.getRoles();
  }

  render() {
    const {roles, role, isShowAdd, isShowAuth} = this.state;
    //const superAdmin=memoryUtils.user.username;

    //假设只有超级管理员才有修改角色权限的权限？？？
    const title = (
        <span>
          <Button type='primary' onClick={() => this.setState({isShowAdd: true})}>创建角色</Button> &nbsp;&nbsp;
          <Button type='primary' disabled={!role._id} onClick={() => this.setState({isShowAuth: true})}>设置角色权限</Button>
        </span>
    );

    return (
      <Card title={title}>
        <Table
          bordered
          rowKey='_id'
          dataSource={roles}
          columns={this.columns}
          pagination={{defaultPageSize: PAGE_SIZE}}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: [role._id],
            onSelect: (role) => { // 选择某个radio时回调
              this.setState({
                role
              })
            }
          }}
          onRow={this.onRow}
        />

        <Modal
          title="添加角色"
          visible={isShowAdd}
          onOk={this.addRole}
          onCancel={() => {
            this.setState({isShowAdd: false});//隐藏Modal
            this.form.resetFields();  //清空表单字段
          }}
        >
          <AddForm
            setForm={(form) => this.form = form}
          />
        </Modal>

        <Modal
          title="设置角色权限"
          visible={isShowAuth}
          onOk={this.updateRole}
          onCancel={() => {
            this.setState({isShowAuth: false})
          }}
        >
          {/*role={role} 传递数据给子组件;
          读取子组件数据(数组)步骤2：ref={this.auth}
          */}
          <AuthForm ref={this.auth} role={role}/>
        </Modal>
      </Card>
    )
  }
}
