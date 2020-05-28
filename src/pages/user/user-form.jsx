/*
添加和修改用户的form组件
 */
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
    Form,
    Input,
    Select
} from 'antd'

const Item = Form.Item;
const Option = Select.Option;

class UserForm extends Component {
    static propTypes = {
        setForm: PropTypes.func.isRequired, // 用来传递form对象的函数
        roles: PropTypes.array.isRequired, // 父组件给子组件传值步骤2：声明父组件传递过来的参数 roles
        user: PropTypes.object, // 修改用户用的，因为公用界面，所以非必须
    };

    componentWillMount () {
        this.props.setForm(this.props.form);
        //console.log("user...user-form...form: ", this.props.form);
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        //console.log("role...add-form...getFieldDecorator: ", getFieldDecorator);
        const {roles}=this.props;//父组件给子组件传值步骤3: 获取使用
        const user=this.props.user || {};//先处理或 在使用时用三元运算符吹
        //console.log("user...user-from...user: ", user.username);

        // 指定Item布局的配置对象
        const formItemLayout = {
            labelCol: { span: 4 },  // 左侧label的宽度
            wrapperCol: { span: 15 }, // 右侧包裹的宽度
        };

        return (
            <Form>
                <Item label='用户名' {...formItemLayout}>
                    {
                        getFieldDecorator('username', {
                            //initialValue: user ? user.username : "",
                            initialValue: user.username,
                            rules: [
                                {required: true, message: '用户名必须输入'},
                                { min: 4, message: '用户名至少4位' },
                                { max: 12, message: '用户名最多12位' }
                            ]
                        })(
                            <Input placeholder='请输入用户名'/>
                        )
                    }
                </Item>
                {/*更新就不显示密码项*/}
                {
                    user._id ? null : (
                        <Item label='密码' {...formItemLayout}>
                            {
                                getFieldDecorator('password', {
                                    initialValue: user.password,
                                })(
                                    <Input type="password" placeholder='请输入密码'/>
                                )
                            }
                        </Item>
                    )
                }
                <Item label='手机号' {...formItemLayout}>
                    {
                        getFieldDecorator('phone', {
                            initialValue: user.phone,
                        })(
                            <Input placeholder='请输入手机号'/>
                        )
                    }
                </Item>
                <Item label='邮箱' {...formItemLayout}>
                    {
                        getFieldDecorator('email', {
                            initialValue: user.email,
                        })(
                            <Input placeholder='请输入邮箱'/>
                        )
                    }
                </Item>
                <Item label='角色' {...formItemLayout}>
                    {
                        getFieldDecorator('role_id', {
                            initialValue: user.role_id,
                        })(
                            <Select>
                                {
                                    roles.map(role=><Option key={role._id} value={role._id}>{role.name}</Option>)
                                }
                            </Select>
                        )
                    }
                </Item>
            </Form>
        )
    }
}

/*使用高阶函数封装组件，用来 让父组件收集子组件里 from表单的数据*/
export default Form.create()(UserForm);
