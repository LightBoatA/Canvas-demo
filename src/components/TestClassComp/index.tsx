import React from 'react';

// 定义组件属性接口
interface TestClassCompProps {
  text?: string;
}

// 定义组件状态接口
interface TestClassCompState {
  name: string;
}

// 定义类组件
export class TestClassComp extends React.Component<TestClassCompProps, TestClassCompState> {
  // 定义默认属性
  static defaultProps: Partial<TestClassCompProps> = {
    text: '我的类组件测试',
  };

  constructor(props: TestClassCompProps) {
    super(props)

    this.state = {
      name: '按钮名称'
    }
  }

  render(): React.ReactNode {
    return <div>
      <button>{`props:${this.props.text}`}</button>
      <span>{`state:${this.state.name}`}</span>
    </div>
  }
}
