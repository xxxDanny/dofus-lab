/** @jsx jsx */

import * as React from 'react';
import { jsx, ClassNames } from '@emotion/core';
import { Popover } from 'antd';
import { useTheme } from 'emotion-theming';

import {
  popoverTitleStyle,
  itemImageBox,
  selected as selectedBox,
  itemImageDimensions,
  popoverShadow,
} from 'common/mixins';
import { customSet_equippedItems_exos } from 'graphql/fragments/__generated__/customSet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faTimes } from '@fortawesome/free-solid-svg-icons';
import ItemStatsList from '../common/ItemStatsList';
import { item } from 'graphql/fragments/__generated__/item';
import { TTheme } from 'common/themes';
import { CardTitleWithLevel, BrokenImagePlaceholder } from 'common/wrappers';

const wrapperStyles = {
  position: 'absolute' as 'absolute',
  right: 6,
  top: 6,
  fontSize: '0.75rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 4,
  margin: -4,
  transition: '0.3s opacity',
  opacity: 0,
};

interface IProps {
  item: item;
  exos?: Array<customSet_equippedItems_exos>;
  deletable?: boolean;
  selected?: boolean;
  onDelete?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  overlayCSS?: React.CSSProperties;
}

const BasicItemWithStats: React.FC<IProps> = ({
  item,
  exos,
  deletable,
  onDelete,
  selected,
  overlayCSS,
}) => {
  const theme = useTheme<TTheme>();
  const [brokenImage, setBrokenImage] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <ClassNames>
      {({ css }) => {
        const wrapperClass = css(wrapperStyles);
        return (
          <Popover
            placement="bottom"
            getPopupContainer={triggerNode => triggerNode.parentElement!}
            title={<CardTitleWithLevel title={item.name} level={item.level} />}
            content={
              item.stats.length > 0 && <ItemStatsList item={item} exos={exos} />
            }
            overlayClassName={css({
              ...popoverTitleStyle,
              ...overlayCSS,
              '.ant-popover-content': {
                maxHeight: contentRef.current
                  ? `calc(100vh - ${contentRef.current.offsetTop +
                      contentRef.current.offsetHeight +
                      20}px)`
                  : undefined,
                overflow: 'auto',
              },
              boxShadow: popoverShadow,
              width: 240,
            })}
            autoAdjustOverflow={{ adjustX: 1, adjustY: 0 }}
          >
            <div
              css={{
                ...itemImageBox(theme),
                ...(selected && { ...selectedBox(theme) }),
                ['&:hover']: {
                  [`.${wrapperClass}`]: {
                    opacity: 0.3,
                    ['&:hover']: {
                      opacity: 1,
                    },
                  },
                },
              }}
              ref={contentRef}
            >
              {brokenImage ? (
                <BrokenImagePlaceholder
                  css={{ ...itemImageDimensions, fontSize: '1.2rem' }}
                />
              ) : (
                <img
                  src={item.imageUrl}
                  css={itemImageDimensions}
                  onError={() => {
                    setBrokenImage(true);
                  }}
                />
              )}
              {(exos?.length ?? 0) > 0 && (
                <FontAwesomeIcon
                  icon={faMagic}
                  css={{
                    position: 'absolute',
                    left: 6,
                    bottom: 6,
                    fontSize: '0.75rem',
                    opacity: 0.3,
                  }}
                />
              )}
              {deletable && (
                <div className={wrapperClass} onClick={onDelete}>
                  <FontAwesomeIcon icon={faTimes} />
                </div>
              )}
            </div>
          </Popover>
        );
      }}
    </ClassNames>
  );
};

export default BasicItemWithStats;
