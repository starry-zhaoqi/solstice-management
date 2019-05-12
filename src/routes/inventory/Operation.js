import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  TreeSelect,
  Radio,
  Icon,
  Button,
  Dropdown,
  Menu,
  message,
  Popconfirm,
  Badge,
  DatePicker,
  Divider,
} from 'antd';
import { routerRedux } from 'dva/router';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Manage.less';

const { RangePicker } = DatePicker;

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
@connect(({ dictionary, inventory, product, loading }) => ({
  inventory,
  product,
  operationTypeArray: dictionary.operationTypeArray,
  loading: loading.models.rule,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    expandForm: false,
    selectedRows: [],
    formValues: {},
  };

  componentWillMount() {
    const { dispatch } = this.props;

    dispatch({
      type: 'dictionary/getDataDictionary',
      payload: { key: 'operationType' },
    });
  }

  componentDidMount() {
    const { dispatch } = this.props;

    // dispatch({
    //   type: 'inventory/queryInventoryOperation',
    //   payload: {},
    // });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'product/queryProduct',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'product/queryProduct',
      payload: {},
    });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleRemoveClick = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/removeProduct',
      payload: [record.id],
    });
  }

  handleMenuClick = e => {
    const { dispatch, form } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove': {
        const idList = selectedRows.map(row => row.id);
        dispatch({
          type: 'product/removeProduct',
          payload: idList,
          callback: (response) => {
            this.setState({
              selectedRows: [],
            });
            if (response.success) {
              message.success(response.message);
            } else {
              message.error(response.message);
            }
            form.validateFields((err, fieldsValue) => {
              if (err) return;

              const values = {
                ...fieldsValue,
                updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
              };

              this.setState({
                formValues: values,
              });

              dispatch({
                type: 'product/queryProduct',
                payload: values,
              });
            });
          },
        });

        break;
      }
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'product/queryProduct',
        payload: values,
      });
    });
  };

  renderSimpleForm() {
    const { form, operationTypeArray } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="库存批次号">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="操作类型">
              {getFieldDecorator('categorySn')(
                <Select placeholder="请选择">
                  {operationTypeArray.map(operationType => <Option key={operationType.value}>{operationType.labelZhCn}</Option>)}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { form, operationTypeArray } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="库存批次号">
              {getFieldDecorator('batchSn')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="操作类型">
              {getFieldDecorator('operationType')(
                <Select placeholder="请选择">
                  {operationTypeArray.map(operationType => <Option key={operationType.value}>{operationType.labelZhCn}</Option>)}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="操作时间">
              {getFieldDecorator('creatTimeRange')(
                <RangePicker />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="关联ID">
              <div>
                {getFieldDecorator('correlationOperationId')(<Input placeholder="请输入" />)}
              </div>
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </span>
        </div>
      </Form>
    );
  }

  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const {
      inventory: { operationData },
      loading,
    } = this.props;
    const { selectedRows } = this.state;

    console.log("manage render props", this.props);
    const columns = [
      {
        title: 'ID',
        dataIndex: 'inventoryId',
        fixed: 'left',
        key: 'inventoryId',
      },
      {
        title: '库存批次号',
        dataIndex: 'batchSn',
        fixed: 'left',
        key: 'batchSn',
      },
      {
        title: '操作类型',
        dataIndex: 'operationType',
      },
      {
        title: '操作数量',
        dataIndex: 'number',
      },
      {
        title: '执行后库存数量',
        dataIndex: 'recordNumber',
      },
      {
        title: '关联ID',
        dataIndex: 'correlationOperationId',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        sorter: true,
        render(val) {
          return val ? <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span> : {};
        },
      },
      {
        title: '操作人',
        dataIndex: 'createName',
      },
      {
        title: '操作',
        fixed: 'right',
        render: (record) => (
          <Fragment>
            <Popconfirm title="你确定要覆盖该操作吗?" onConfirm={() => this.handleRemoveClick(record)} okText="确认" cancelText="取消">
              <a>覆盖</a>
            </Popconfirm>
            <Divider type="vertical" />
            <Popconfirm title="你确定要删掉该商品吗?" onConfirm={() => this.handleRemoveClick(record)} okText="确认" cancelText="取消">
              <a>删除</a>
            </Popconfirm>
          </Fragment>
        ),
      },
    ];

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
        <Menu.Item key="approval">批量上架</Menu.Item>
      </Menu>
    );

    return (
      <PageHeaderLayout title="入库&出库">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  const { dispatch } = this.props;
                  dispatch(
                    routerRedux.push({ pathname: '/product/add' })
                  );
                }}
              >
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button>批量下架</Button>
                  <Dropdown overlay={menu}>
                    <Button>
                      更多操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={operationData}
              scroll={{ x: 1500, y: 300 }}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
