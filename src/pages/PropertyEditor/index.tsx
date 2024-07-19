import React, { useMemo } from 'react';
import './index.less';
interface IProps {
    className?: string;
}
export const PropertyEditor: React.FC<IProps> = props => {
  const { className } = props;
  return useMemo(() => {
    return (
      <div className={`comp-property-editor ${className || ''}`}>
        <div className="mr10">边框颜色：</div>
        边框粗细 
      </div>
    );
  }, [className]);

};

export default PropertyEditor;