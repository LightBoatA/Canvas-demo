import React, { useMemo, CSSProperties } from 'react';
import { Modal } from 'antd';

interface IProps {
  open: boolean;
  width?: number;
  style?: CSSProperties;
  onCancel: () => void;
  children: React.ReactNode;
}

export const ContextMenuModal: React.FC<IProps> = props => {
  const { open, width = 150, style, onCancel, children } = props;
  return useMemo(() => {
    const modal = (
      <Modal
        open={open}
        width={width}
        closable={false}
        mask={false}
        title={null}
        footer={null}
        style={style}
        onCancel={() => {
          onCancel && onCancel();
        }}>
        {children}
      </Modal>
    );

    return modal;
  }, [children, onCancel, open, style, width]);
};

export default ContextMenuModal;
