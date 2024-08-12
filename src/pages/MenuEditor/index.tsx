import React, { useMemo } from 'react';
import './index.less';
interface IProps {
  rootclassName?: string;
}
export const MenuEditor: React.FC<IProps> = props => {
  const { rootclassName } = props;
  return useMemo(() => {
    return (
      <div className={`comp-menu-editor ${rootclassName || ''}`}>

      </div>
    );
  }, [rootclassName]);

};

export default MenuEditor;