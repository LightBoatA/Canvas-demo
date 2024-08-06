import React, { CSSProperties, useMemo } from 'react';
interface IProps {
  isShow: boolean;
  boxStyles: CSSProperties;
}
export const SelectionBox: React.FC<IProps> = props => {
  const { isShow, boxStyles } = props;
  return useMemo(() => {
    return (
      <>
        {isShow && (
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              ...boxStyles
            }}
          ></div>
        )}
      </>
    );
  }, [boxStyles, isShow]);
};

export default SelectionBox;
