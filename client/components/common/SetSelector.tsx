/** @jsx jsx */

import React from 'react';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import InfiniteScroll from 'react-infinite-scroller';

import SetQuery from 'graphql/queries/sets.graphql';
import { SharedFilters } from 'common/types';
import {
  sets,
  setsVariables,
  sets_sets_edges_node,
} from 'graphql/queries/__generated__/sets';
import SetCard from './SetCard';
import { mq } from 'common/constants';
import { getResponsiveGridStyle } from 'common/mixins';
import SkeletonCardsLoader from './SkeletonCardsLoader';
import SetModal from './SetModal';
import { customSet } from 'graphql/fragments/__generated__/customSet';

const PAGE_SIZE = 12;

const THRESHOLD = 600;

interface IProps {
  filters: SharedFilters;
  customSet: customSet | null;
}

const SetSelector: React.FC<IProps> = ({ filters, customSet }) => {
  const { data, loading, fetchMore } = useQuery<sets, setsVariables>(SetQuery, {
    variables: { first: PAGE_SIZE, filters },
  });

  const [
    selectedSet,
    setSelectedSet,
  ] = React.useState<sets_sets_edges_node | null>(null);
  const [setModalVisible, setSetModalVisible] = React.useState(false);

  const openSetModal = React.useCallback(
    (selectedSet: sets_sets_edges_node) => {
      setSelectedSet(selectedSet);
      setSetModalVisible(true);
    },
    [],
  );

  const closeSetModal = React.useCallback(() => {
    setSetModalVisible(false);
  }, []);

  const onLoadMore = React.useCallback(async () => {
    if (!data || !data.sets.pageInfo.hasNextPage) {
      return () => {};
    }

    try {
      const fetchMoreResult = await fetchMore({
        variables: { after: data.sets.pageInfo.endCursor },
        updateQuery: (prevData, { fetchMoreResult }) => {
          if (
            !fetchMoreResult ||
            fetchMoreResult.sets.pageInfo.endCursor ===
              prevData.sets.pageInfo.endCursor
          ) {
            return prevData;
          }
          return {
            ...prevData,
            sets: {
              ...prevData.sets,
              edges: [...prevData.sets.edges, ...fetchMoreResult.sets.edges],
              pageInfo: fetchMoreResult.sets.pageInfo,
            },
          };
        },
      });
      return fetchMoreResult;
    } catch (e) {}
  }, [data]);

  return (
    <InfiniteScroll
      hasMore={data?.sets.pageInfo.hasNextPage}
      loader={
        <SkeletonCardsLoader key="loader" length={data?.sets.edges.length} />
      }
      loadMore={onLoadMore}
      css={{
        ...getResponsiveGridStyle([2, 2, 2, 3, 4, 5, 6]),
        marginTop: 12,
        marginBottom: 20,
        position: 'relative',
        gridGap: 20,
        minWidth: 0,
        [mq[1]]: { gridGap: 12 },
      }}
      useWindow={false}
      threshold={THRESHOLD}
    >
      {loading ? (
        <SkeletonCardsLoader
          key="initial-loader"
          multiplier={2}
          length={data?.sets.edges.length}
        />
      ) : (
        (data?.sets.edges ?? [])
          .map(edge => edge.node)
          .map(set => <SetCard key={set.id} set={set} onClick={openSetModal} />)
      )}
      {selectedSet && (
        <SetModal
          setId={selectedSet.id}
          setName={selectedSet.name}
          onCancel={closeSetModal}
          visible={setModalVisible}
          customSet={customSet}
        />
      )}
    </InfiniteScroll>
  );
};

export default SetSelector;
