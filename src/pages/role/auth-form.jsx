/**
 * 添加分类的form组件，设置角色权限
 */
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Input,
  Tree
} from 'antd'
import menuList from '../../config/menuConfig';

const Item = Form.Item;
const { TreeNode } = Tree;

export default class AuthForm extends PureComponent {
  static propTypes = {
    role: PropTypes.object, //操作父组件数据步骤1：接收父组件传递的对象类型数据
  };

  constructor (props) {
    super(props);

    // 操作父组件数据步骤2：根据传入角色的menus生成初始状态
    const {menus} = this.props.role;
    //console.log("role->auth-from...constructor()...menus: ", menus);
    this.state = {
      checkedKeys: menus  //["/home", "/xxx"]，当前登陆角色的权限(数组里装的是可以访问的页面路由)
    }
  }

  /*供父组件调用：为父组件提交获取最新menus数据的方法*/
  //读取子组件数据(数组)步骤3：自定义函数拿到父组件需要的数据供父组件调用
  getMenus = () => this.state.checkedKeys;

  /*获取所有的菜单导航的路由*/
  getTreeNodes = (menuList) => {
    //遍历的每个对象为item，提供一个空数组[] 给pre，递归调用方法拼接 TreeNode 并push进pre
    return menuList.reduce((pre, item) => {
      pre.push(
        <TreeNode title={item.title} key={item.key}>
          {item.children ? this.getTreeNodes(item.children) : null}
        </TreeNode>
      );
      return pre
    }, [])
  };

  // 选中某个node时的回调
  onCheck = checkedKeys => {
    //console.log('role->auth-from...onCheck()...checkedKeys: ', checkedKeys);//所有选中的节点的key数组
    this.setState({ checkedKeys });//更新状态
  };

  componentWillMount () {
    this.treeNodes = this.getTreeNodes(menuList);
  }

  // 根据新传入的role来更新checkedKeys状态
  /***当组件接收到新的属性时自动调用，render()前调用*/
  componentWillReceiveProps (nextProps) {
    //console.log('componentWillReceiveProps()', nextProps);
    const menus = nextProps.role.menus;
    this.setState({
      checkedKeys: menus    //根据父组件传递过来的 role(父组件Table行点击事件的role数据对象) 来更新checkedKeys状态
    })
    // this.state.checkedKeys = menus;这里可以这样用，
  }

  render() {
    //console.log('AuthForm render()');
    const {role} = this.props;
    const {checkedKeys} = this.state;
    // 指定Item布局的配置对象
    const formItemLayout = {
      labelCol: { span: 4 },  // 左侧label的宽度
      wrapperCol: { span: 15 }, // 右侧包裹的宽度
    };

    return (
      <div>
        <Item label='角色名称' {...formItemLayout}>
          <Input value={role.name} disabled/>
        </Item>

        <Tree
          checkable
          defaultExpandAll={true}   //默认展开树结构
          checkedKeys={checkedKeys} //根据 checkedKeys 决定默认勾选的项
          onCheck={this.onCheck}    //选中事件
        >
          <TreeNode title="平台权限" key="all">
            {this.treeNodes}
          </TreeNode>
        </Tree>
      </div>
    )
  }
}
