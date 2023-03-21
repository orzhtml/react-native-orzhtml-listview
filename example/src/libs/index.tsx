import React, { FC, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native'

import { MergedRowsParams, OrzhtmlListHandles, OrzhtmlListProps, OrzhtmlListViewProps, PaginationStatus, ScrollToEndTypes, ScrollToIndexTypes, ScrollToItemTypes, ScrollToOffsetTypes } from './common'
import styles from './OrzhtmlListViewStyle'

const OrzhtmlListView: FC<OrzhtmlListViewProps> = (props) => {
  const [dataSource, setDataSource] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [paginationStatus, setPaginationStatus] = useState<number>(PaginationStatus.FIRST_LOAD)

  const rows = useRef<any[]>([])
  const refreshing = useRef<boolean>(true)
  const mounted = useRef<boolean>()
  const loadingMore = useRef<boolean>(false)
  const _flatList = useRef<FlatList<any>>(null)

  useImperativeHandle(props.refInstance, () => ({
    /** 手动刷新 */
    refresh: () => {
      onRefresh()
    },
    /** 手动更新数据 */
    updateDataSource: (rows = []) => {
      updateDataSource(rows)
    },
    /** 第一次数据加载 */
    firstAddData: (rows = []) => {
      firstAddData(rows)
    },
    /** 获取已存的所有数据 */
    getRows: () => {
      return getRows()
    },
    scrollToEnd: (params: ScrollToEndTypes) => {
      scrollToEnd(params)
    },
    scrollToIndex: (params: ScrollToIndexTypes) => {
      scrollToIndex(params)
    },
    scrollToItem: (params: ScrollToItemTypes) => {
      scrollToItem(params)
    },
    scrollToOffset: (params: ScrollToOffsetTypes) => {
      scrollToOffset(params)
    }
  }))

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  /** 刷新 */
  const onRefresh = () => {
    if (mounted.current) {
      props.setRefreshing && props.setRefreshing(true)
      onRefreshing(true)
      setIsRefreshing(true)
      props.setRefresh && props.setRefresh(postRefresh, endFetch)
    }
  }
  /** 刷新处理数据 */
  const postRefresh = (rows: any[] = []) => {
    let paginationStatus = PaginationStatus.WAITING
    let mergedRows: any[] = []
    let isRefresh = false
    if (mounted.current) {
      if (props.noRefresh) {
        mergedRows = rows
        isRefresh = true
      } else {
        mergedRows = rows.concat(getRows())
      }
      if (rows.length > 0 && rows.length < props.initialNumToRender) {
        paginationStatus = PaginationStatus.ALL_LOADED
      } else if (rows.length === 0) {
        paginationStatus = PaginationStatus.NO_DATA
      }
      updateRows({
        rows: mergedRows,
        paginationStatus,
        isRefresh
      })
    }
  }
  /** 执行上拉加载动作 */
  const onEndReached = useCallback(() => {
    if (refreshing.current) {
      return false
    }
    if (!isRefreshing && props.pagination && paginationStatus === PaginationStatus.WAITING) {
      onPaginate()
    }
  }, [isRefreshing, paginationStatus])
  /** 上拉加载方法 */
  const onPaginate = () => {
    if (paginationStatus !== PaginationStatus.ALL_LOADED) {
      if (loadingMore.current) {
        return false
      }
      loadingMore.current = true
      setPaginationStatus(PaginationStatus.IN_LOADED)
      props.setEndReached && props.setEndReached(postPaginate, endFetch)
    }
  }
  /** 下一页 */
  const postPaginate = (rows: any[] = []) => {
    let mergedRows = []
    let _paginationStatus
    if (rows.length === 0) {
      _paginationStatus = PaginationStatus.ALL_LOADED
    } else {
      mergedRows = getRows().concat(rows)
      _paginationStatus = rows.length < props.initialNumToRender ? PaginationStatus.ALL_LOADED : PaginationStatus.WAITING
    }
    loadingMore.current = false
    updateRows({
      rows: mergedRows,
      paginationStatus: _paginationStatus
    })
  }
  /** 更新数据 */
  const updateRows = ({ rows, paginationStatus, isRefresh }: MergedRowsParams) => {
    let mergedRows = rows
    if (rows.length) {
      setRows(rows)
    } else {
      mergedRows = isRefresh ? rows : getRows().slice()
    }
    props.setRefreshing && props.setRefreshing(false)

    setDataSource(mergedRows)
    setIsRefreshing(false)
    setPaginationStatus(paginationStatus)

    refreshing.current = false
  }
  /** 手动更新数据 */
  const updateDataSource = (rows = []) => {
    let _paginationStatus = PaginationStatus.WAITING
    if (rows.length === 0) {
      _paginationStatus = PaginationStatus.NO_DATA
    } else if (rows.length < props.initialNumToRender) {
      _paginationStatus = PaginationStatus.ALL_LOADED
    }

    setRows(rows)
    setDataSource(rows)
    setPaginationStatus(_paginationStatus)
  }
  /** 第一次数据加载 */
  const firstAddData = (rows = []) => {
    updateDataSource(rows)
    onRefreshing(false)
  }
  /** 上拉加载结束 */
  const endFetch = () => {
    if (mounted.current) {
      setIsRefreshing(false)
    }
  }

  const onRefreshing = (r: boolean) => {
    refreshing.current = r
  }

  const setRows = (data: any[]) => {
    rows.current = data
  }

  const getRows = () => rows.current

  const scrollToEnd = (params: ScrollToEndTypes) => {
    _flatList.current?.scrollToEnd(params)
  }

  const scrollToIndex = (params: ScrollToIndexTypes) => {
    _flatList.current?.scrollToIndex(params)
  }

  const scrollToItem = (params: ScrollToItemTypes) => {
    _flatList.current?.scrollToItem(params)
  }

  const scrollToOffset = (params: ScrollToOffsetTypes) => {
    _flatList.current?.scrollToOffset(params)
  }
  /** 上拉等待加载 */
  const PaginationBtnView = () => {
    if (props.pagination) {
      if (props.PaginationBtnView) {
        return props.PaginationBtnView
      }
      return (
        <View style={styles.fetchingView}>
          <Text style={styles.paginationViewText}>{props.paginationBtnText}</Text>
        </View>
      )
    }
    return null
  }
  /** 上拉加载完成，没有更多数据 */
  const PaginationAllLoadedView = () => {
    if (props.pagination) {
      if (props.PaginationAllLoadedView) {
        return props.PaginationAllLoadedView
      }
      return (
        <View style={styles.paginationView}>
          <Text style={styles.allLoadedText}>{props.allLoadedText}</Text>
        </View>
      )
    }
    return null
  }
  /** 上拉加载中 */
  const PaginationWaitingView = () => {
    if (props.pagination) {
      if (props.PaginationWaitingView) {
        return props.PaginationWaitingView
      }
      return (
        <View style={styles.paginationView}>
          <ActivityIndicator color={props.spinnerColor} size={props.waitingSpinnerSize} />
          <Text style={[styles.paginationViewText, styles.ml5]}>
            {props.waitingSpinnerText}
          </Text>
        </View>
      )
    }
    return null
  }
  const _ListHeaderComponent = () => {
    if (props.HeaderView) {
      return props.HeaderView
    }
    return null
  }
  const _ListFooterComponent = useCallback(() => {
    if (paginationStatus === PaginationStatus.WAITING) {
      /** 等待上拉加载 */
      return PaginationBtnView()
    }
    if (paginationStatus === PaginationStatus.IN_LOADED) {
      if (props.initialNumToRender && props.initialNumToRender > 0) {
        if (getRows().length < props.initialNumToRender) {
          return PaginationAllLoadedView()
        }
      }
      /** 上拉加载中 */
      return PaginationWaitingView()
    }
    if (
      /** 上拉加载完成 / 没有更多数据 */
      getRows().length !== 0 && paginationStatus === PaginationStatus.ALL_LOADED
    ) {
      return PaginationAllLoadedView()
    }
    // 再次加载数据为空
    if (paginationStatus === PaginationStatus.NO_DATA) {
      return _ListEmptyComponent()
    }
    return null
  }, [paginationStatus])

  const _ListEmptyComponent = useCallback(() => {
    if (paginationStatus !== PaginationStatus.NO_DATA) {
      return null
    }
    if (props.EmptyView) {
      return props.EmptyView
    }
    return (
      <View style={styles.emptyView}>
        <Text style={styles.emptyViewTxt}>{props.emptyViewText}</Text>
      </View>
    )
  }, [paginationStatus])
  /** 自定义分割线 */
  const _RenderItemSeparatorComponent = () => <View style={styles.line} />
  /** 下拉组件 */
  const _RenderRefreshControl = useCallback(() => {
    if (props.refreshable) {
      return (
        <RefreshControl
          colors={props.refreshableColors}
          onRefresh={onRefresh}
          progressBackgroundColor={props.refreshableProgressBackgroundColor}
          refreshing={isRefreshing}
          size={props.refreshableSize}
          tintColor={props.refreshableTintColor}
          title={props.refreshableTitle}
        />
      )
    }
    return undefined
  }, [isRefreshing])

  const _keyExtractor = (item: any, index: any) => `RenderItemKey-${index}`

  return (
    <FlatList
      ItemSeparatorComponent={_RenderItemSeparatorComponent}
      keyExtractor={_keyExtractor}
      onEndReachedThreshold={0.1}
      {...props}
      numColumns={props.numColumns}
      key={props.keyIdx}
      ref={_flatList}
      data={dataSource}
      ListEmptyComponent={null}
      ListFooterComponent={_ListFooterComponent()}
      ListHeaderComponent={_ListHeaderComponent()}
      onEndReached={onEndReached}
      refreshControl={_RenderRefreshControl()}
    />
  )
}
const OrzhtmlList = forwardRef<OrzhtmlListHandles, Partial<OrzhtmlListProps>>((props, ref) => {
  let {
    initialNumToRender = 10,
    numColumns = 1,
    refreshable = true,
    keyIdx = 'OrzhtmlListViewKey',
    noRefresh = true,
    refreshableColors = ['dimgray', 'tomato', 'limegreen'],
    refreshableProgressBackgroundColor = '#fff',
    refreshableTintColor = 'lightgray',
    pagination = true,
    allLoadedText = 'End of List',
    waitingSpinnerSize = 'small',
    waitingSpinnerText = 'Loading...',
    paginationBtnText = 'Load more...',
    emptyViewText = 'Sorry no data',
    renderItem = null,
    ...other
  } = props
  let initProps: OrzhtmlListProps = {
    initialNumToRender, numColumns, refreshable,
    keyIdx, noRefresh, refreshableColors,
    refreshableProgressBackgroundColor,
    refreshableTintColor,
    pagination, allLoadedText,
    waitingSpinnerSize, waitingSpinnerText,
    paginationBtnText, emptyViewText,
    renderItem,
    ...other,
  }
  return (
    <OrzhtmlListView {...initProps} refInstance={ref} />
  )
})

export type OrzhtmlListIHandles = OrzhtmlListHandles

export type OrzhtmlListIProps  = OrzhtmlListProps

// 注意：这里不要在 Component 上使用 ref, 换个属性名字比如 refInstance 不然会导致覆盖
export default OrzhtmlList
