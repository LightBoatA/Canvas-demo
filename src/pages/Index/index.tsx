import React, { useCallback, useMemo, useState } from 'react';
import './index.less';
import { Menu, MenuProps } from 'antd';
import { CustomerServiceOutlined, BookOutlined } from '@ant-design/icons';
import { EPage } from './common';
import Home from '../Home';
import Canvas from '../Canvas';
const items: MenuProps['items'] = [
  {
    label: '首页',
    key: EPage.home,
    icon: <CustomerServiceOutlined />,
  },
  {
    label: '其他',
    key: EPage.score,
    icon: <BookOutlined />,
  }
];
interface IProps {

}
export const Index: React.FC<IProps> = props => {
  const [current, setCurrent] = useState<EPage>(EPage.home);
  const menuClickHandle = useCallback((e: any) => {
    setCurrent(e.key);
  }, [])
  const contentComp = useMemo(() => {
    switch (current) {
      case EPage.home:
        return <Canvas/>
      case EPage.score:
        return <></>
      default:
        return <Home />
    }
  }, [current])
  return useMemo(() => {
    return (
      <div className="page">
        <div className="header">
          顶部
        </div>
        <div className="menu-wrap">
          <Menu className='menu' onClick={menuClickHandle} selectedKeys={[current]} mode="horizontal" items={items} />

        </div>
        <div className="content">
          {contentComp}
        </div>
        <div className="footer">
          底部
        </div>
      </div>
    );
  }, [contentComp, current, menuClickHandle]);

};

export default Index;