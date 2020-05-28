/**
 * 用户路由；
 * 用户属于角色，一个角色可以有多个用户;
 * 先确定角色的权限，即可以浏览多少个界面，再在角色下可创建多个用户，相应的权限也就确定了;
 */
import React,{ Component } from "react";
import {
    Card,
    Table,
    Button,
    Modal,
    message
} from "antd";

import {formateDate} from "../../utils/dateUtils";
import LinkButton from "../../components/link-button/index";
import {PAGE_SIZE} from "../../utils/constants";
import {reqUsers,reqDeleteUser,reqAddOrUpdateUser} from "../../api/index";
import UserForm from "./user-form";


export default class User extends Component {
    state={
        users: [],//所有的用户列表
        roles: [],//所有角色列表
        isShow: false,//模态框是否显示
    };

    initColumns=()=>{
        /*{
            title: '所属角色',
            dataIndex: 'role_id',
            render: (role_id) => this.state.roles.find(role=>role._id===role_id).name
          },
        */
        this.columns=[
            {
                title: '用户名',
                dataIndex: 'username'
            },
            {
                title: '邮箱',
                dataIndex: 'email'
            },

            {
                title: '电话',
                dataIndex: 'phone'
            },
            {
                title: '注册时间',
                dataIndex: 'create_time',
                render: formateDate
            },
            {
                title: '所属角色',
                dataIndex: 'role_id',
                render: (role_id) => this.roleNames[role_id]
            },
            {
                title: '操作',
                render: (user) => (
                    <span>
                        <LinkButton onClick={()=>this.showUpdate(user)}>修改</LinkButton>
                        {/*传参需用函数包裹起来再调用方法*/}
                        <LinkButton onClick={()=>this.deleteUser(user)}>删除</LinkButton>
                    </span>
                )
            },
        ];
    };

    /*根据role的数组, 生成包含所有角色名的对象(属性名用角色id值);
    map: 根据数组返回一个新的数组*/
    initRoleNames=(roles)=>{
        const roleNames=roles.reduce((pre,role)=>{
            pre[role._id]=role.name;
            return pre;
        },{});
        //保存
        this.roleNames=roleNames;
    };

    /*显示修改用户界面*/
    showUpdate=(user)=>{
        this.user=user;//保存user
        this.setState({isShow: true});
    };

    /*删除指定用户*/
    deleteUser=(user)=>{
        Modal.confirm({
            title: `确认删除${user.username}吗?`,
            onOk: async () => {
                const result = await reqDeleteUser(user._id);
                if(result.status===0) {
                    message.success('删除用户成功!');
                    this.getUsers();
                }
            }
        });
    };

    /*显示添加Modal*/
    showAdd=()=>{
        this.user=null;//添加用户前把更新时保存的user清空，以免添加时数据user回显到界面上
        this.setState({isShow: true});
    };

    /*添加或更新用户*/
    addOrUpdateUser=async ()=>{
        this.setState({isShow: false});

        // 1. 收集输入数据
        const user = this.form.getFieldsValue();
        this.form.resetFields();//清空表格字段

        //***判断是添加还是更新，添加时没有设置_id属性，由后台数据库自增长设置
        if(this.user){
            //如果是更新，需要给user指定_id属性
            user._id=this.user._id;
        }

        // 2. 提交添加的请求
        const result = await reqAddOrUpdateUser(user);

        // 3. 更新列表显示
        if(result.status===0) {
            message.success(`${this.user ? '修改' : '添加'}用户成功`);
            this.getUsers();
        }
    };

    /*获取所有用户*/
    getUsers=async ()=>{
        const result=await reqUsers();
        //console.log("User...getUsers()...result: ", result);
        if(result.status===0){
            const {users, roles}=result.data;
            this.initRoleNames(roles);//Table某个字段数据的处理
            this.setState({
                users,
                roles
            });
        }
    };

    componentWillMount() {
        this.initColumns();
    }

    componentDidMount() {
        this.getUsers();
    }

    render() {
        const {users,roles,isShow}=this.state;
        const user=this.user || {};//显示修改界面保存的user

        const title=<Button type="primary" onClick={this.showAdd}>创建用户</Button>;

        /*visible={isShow}：公用的一个Modal，就不用判断是哪个了，直接赋Boolean值*/
        return (
              <Card title={title}>
                  <Table
                      bordered
                      rowKey='_id'
                      dataSource={users}
                      columns={this.columns}
                      pagination={{defaultPageSize: PAGE_SIZE, showQuickJumper: true}}
                  />

                  <Modal
                      title={user._id ? '修改用户' : '添加用户'}
                      visible={isShow}
                      onOk={this.addOrUpdateUser}
                      onCancel={()=>{
                          this.form.resetFields();
                          this.setState({isShow: false})
                      }}
                  >
                      {/*父组件给子组件传值步骤1，子组件里设置：roles={roles}*/}
                      <UserForm
                          //setForm={form => this.form = form}  //err
                          setForm={(form) => {this.form = form}}
                          roles={roles}
                          user={user}
                      />
                  </Modal>
              </Card>
        );
  }
}
