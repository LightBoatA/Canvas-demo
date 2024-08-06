import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { Typography } from 'antd';
import ContextMenuModal from '../ContextMenuModal';
import './index.less';

export interface IContextMenu {
  label: string;
  key: string;
  handle: () => void;
}
interface IProps {
  menus: IContextMenu[];
}
export const ContextMenu: React.FC<IProps> = props => {
  const { menus } = props;
  const [isShowContextMenu, setIsShowContextMenu] = useState<boolean>(false);
  const [contextMenuModalStyle, setContextMenuModalStyle] = useState<CSSProperties>({ top: 0, left: 0, margin: 0 });

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    const { clientX, clientY } = e;
    setIsShowContextMenu(true);
    setContextMenuModalStyle({
      top: clientY,
      left: clientX,
      margin: 0
    });
  }, []);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleContextMenu]);

  const handleCancel = useCallback(() => {
    setIsShowContextMenu(false);
  }, []);
  return useMemo(() => {
    return (
      <ContextMenuModal
        open={isShowContextMenu}
        style={contextMenuModalStyle}
        onCancel={() => {
          handleCancel();
        }}
      >
        <div>
          {menus.map(menu => {
            const { label, key, handle } = menu;
            return (
              <div key={label}>
                <Typography.Link className="w100p" onClick={handle}>
                  <div className="context-menu-item">
                    <span>{label}</span>
                    <span className="key">{key}</span>
                  </div>
                </Typography.Link>
              </div>
            );
          })}
        </div>
      </ContextMenuModal>
    );
  }, [contextMenuModalStyle, handleCancel, isShowContextMenu, menus]);
};

export default ContextMenu;
