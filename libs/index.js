import React from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View
} from 'react-native'
import PropTypes from 'prop-types'

import styles from './OrzhtmlListViewStyle'

const PaginationStatus = {
  FIRST_LOAD: 0, // 第一次加载
  WAITING: 1, // 等待加载
  IN_LOADED: 2, // 加载中
  ALL_LOADED: 3, // 加载完成
  NO_DATA: 5 // 一个数据都没有
}

class OrzhtmlListView extends React.Component {
  constructor (props) {
    super(props)
    this.rows = []
    this.refreshing = true
    this.state = {
      dataSource: [],
      isRefreshing: false,
      paginationStatus: PaginationStatus.FIRST_LOAD
    }
  }

  componentDidMount () {
    this.mounted = true
  }

  componentWillUnmount () {
    this.mounted = false
  }

  /** 刷新 */
  onRefresh = () => {
    const { setRefreshing, setRefresh } = this.props
    if (this.mounted) {
      setRefreshing && setRefreshing(true)
      this.onRefreshing(true)
      this.setState({
        isRefreshing: true
      })
      setRefresh && setRefresh(this.postRefresh, this.endFetch)
    }
  }

  /** 刷新处理数据 */
  postRefresh = (rows = []) => {
    const { notRefresh, initialNumToRender } = this.props
    if (this.mounted) {
      let paginationStatus = PaginationStatus.WAITING
      let mergedRows = []
      if (notRefresh) {
        mergedRows = rows
      } else {
        mergedRows = rows.concat(this.getRows())
      }
      if (rows.length < initialNumToRender) {
        paginationStatus = PaginationStatus.ALL_LOADED
      }
      this.updateRows(mergedRows, paginationStatus)
    }
  }

  /** 执行上拉加载动作 */
  onEndReached = () => {
    const { pagination } = this.props
    const { paginationStatus, isRefreshing } = this.state
    if (this.refreshing) {
      return false
    }
    if (!isRefreshing && pagination && paginationStatus === PaginationStatus.WAITING) {
      this.onPaginate()
    }
  }

  /** 上拉加载方法 */
  onPaginate = () => {
    const { setEndReached } = this.props
    const { paginationStatus } = this.state
    if (paginationStatus !== PaginationStatus.ALL_LOADED) {
      if (this.loadingMore) {
        return false
      }
      this.loadingMore = true
      this.setState({
        paginationStatus: PaginationStatus.IN_LOADED
      })
      setEndReached && setEndReached(this.postPaginate, this.endFetch)
    }
  }

  /** 下一页 */
  postPaginate = (rows = []) => {
    let mergedRows = []
    let paginationStatus
    if (rows.length === 0) {
      paginationStatus = PaginationStatus.ALL_LOADED
    } else {
      mergedRows = this.getRows().concat(rows)
      paginationStatus = PaginationStatus.WAITING
    }
    this.loadingMore = false
    this.updateRows(mergedRows, paginationStatus)
  }

  /** 更新数据 */
  updateRows = (rows, paginationStatus) => {
    const { setRefreshing } = this.props
    let mergedRows = rows
    if (rows.length) {
      this.setRows(rows)
    } else {
      mergedRows = this.getRows().slice()
    }
    setRefreshing && setRefreshing(false)
    this.setState({
      dataSource: mergedRows,
      isRefreshing: false,
      paginationStatus
    })
    this.refreshing = false
  }

  /** 手动刷新 */
  refresh = () => {
    this.onRefresh()
  }

  /** 手动更新数据 */
  updateDataSource = (rows = []) => {
    const { initialNumToRender } = this.props
    let paginationStatus = PaginationStatus.WAITING
    if (rows.length === 0) {
      paginationStatus = PaginationStatus.NO_DATA
    } else if (rows.length < initialNumToRender) {
      paginationStatus = PaginationStatus.ALL_LOADED
    }

    this.setRows(rows)
    this.setState({
      dataSource: rows,
      paginationStatus
    })
  }

  /** 第一次数据加载 */
  firstAddData = (rows = []) => {
    this.updateDataSource(rows)
    this.onRefreshing(false)
  }

  /** 上拉加载结束 */
  endFetch = () => {
    if (this.mounted) {
      this.setState({
        isRefreshing: false
      })
    }
  }

  onRefreshing = refreshing => {
    this.refreshing = refreshing
  }

  setRows = rows => {
    this.rows = rows
  }

  getRows = () => this.rows

  scrollToEnd = params => {
    if (this._flatList) {
      this._flatList.scrollToEnd(params)
    }
  }

  scrollToIndex = params => {
    if (this._flatList) {
      this._flatList.scrollToIndex(params)
    }
  }

  scrollToItem = params => {
    if (this._flatList) {
      this._flatList.scrollToItem(params)
    }
  }

  scrollToOffset = params => {
    if (this._flatList) {
      this._flatList.scrollToOffset(params)
    }
  }

  /** 上拉等待加载 */
  PaginationBtnView = () => {
    const { pagination, PaginationBtnView, paginationBtnText } = this.props
    if (pagination) {
      if (PaginationBtnView) {
        return PaginationBtnView()
      }
      return (
        <View style={styles.fetchingView}>
          <Text style={styles.paginationViewText}>{paginationBtnText}</Text>
        </View>
      )
    }
    return null
  }

  /** 上拉加载完成，没有更多数据 */
  PaginationAllLoadedView = () => {
    const { pagination, PaginationAllLoadedView, allLoadedText } = this.props
    if (pagination) {
      if (PaginationAllLoadedView) {
        return PaginationAllLoadedView()
      }
      return (
        <View style={styles.paginationView}>
          <Text style={styles.allLoadedText}>{allLoadedText}</Text>
        </View>
      )
    }
    return null
  }

  /** 上拉加载中 */
  PaginationWaitingView = () => {
    const {
      pagination,
      PaginationWaitingView,
      spinnerColor,
      waitingSpinnerSize,
      waitingSpinnerText
    } = this.props
    if (pagination) {
      if (PaginationWaitingView) {
        return PaginationWaitingView()
      }
      return (
        <View style={styles.paginationView}>
          <ActivityIndicator color={spinnerColor} size={waitingSpinnerSize} />
          <Text style={[styles.paginationViewText, styles.ml5]}>
            {waitingSpinnerText}
          </Text>
        </View>
      )
    }
    return null
  }

  _ListHeaderComponent = () => {
    const { HeaderView } = this.props
    if (HeaderView) {
      return HeaderView()
    }
    return null
  }

  _ListFooterComponent = () => {
    const { initialNumToRender } = this.props
    const { paginationStatus } = this.state
    if (paginationStatus === PaginationStatus.WAITING) {
      /** 等待上拉加载 */
      return this.PaginationBtnView()
    }
    if (paginationStatus === PaginationStatus.IN_LOADED) {
      if (initialNumToRender && initialNumToRender > 0) {
        if (this.getRows().length < initialNumToRender) {
          return this.PaginationAllLoadedView()
        }
      }
      /** 上拉加载中 */
      return this.PaginationWaitingView()
    }
    if (
      /** 上拉加载完成 / 没有更多数据 */
      this.getRows().length !== 0 && paginationStatus === PaginationStatus.ALL_LOADED
    ) {
      return this.PaginationAllLoadedView()
    }
    return null
  }

  _ListEmptyComponent = () => {
    const { EmptyView, EmptyViewText } = this.props
    const { paginationStatus } = this.state
    if (paginationStatus !== PaginationStatus.NO_DATA) {
      return null
    }
    if (EmptyView) {
      return EmptyView()
    }
    return (
      <View style={styles.emptyView}>
        <Text style={styles.emptyViewTxt}>{EmptyViewText}</Text>
      </View>
    )
  }

  /** 自定义分割线 */
  renderItemSeparatorComponent = ({ highlighted }) => <View style={styles.line} />

  /** 下拉组件 */
  renderRefreshControl = () => {
    const {
      refreshable,
      refreshableColors,
      refreshableProgressBackgroundColor,
      refreshableSize,
      refreshableTintColor,
      refreshableTitle
    } = this.props
    const { isRefreshing } = this.state
    if (refreshable) {
      return (
        <RefreshControl
          colors={refreshableColors}
          onRefresh={this.onRefresh}
          progressBackgroundColor={refreshableProgressBackgroundColor}
          refreshing={isRefreshing}
          size={refreshableSize}
          tintColor={refreshableTintColor}
          title={refreshableTitle}
        />
      )
    }
    return null
  }

  _keyExtractor = (item, index) => `RenderItemKey-${index}`

  render () {
    const { keyIdx, numColumns } = this.props
    const { dataSource } = this.state
    return (
      <FlatList
        ItemSeparatorComponent={this.renderItemSeparatorComponent}
        keyExtractor={this._keyExtractor}
        numColumns={numColumns}
        onEndReachedThreshold={0.1}
        {...this.props}
        key={keyIdx}
        ref={ref => {
          this._flatList = ref
        }}
        data={dataSource}
        ListEmptyComponent={this._ListEmptyComponent}
        ListFooterComponent={this._ListFooterComponent}
        ListHeaderComponent={this._ListHeaderComponent}
        onEndReached={this.onEndReached}
        refreshControl={this.renderRefreshControl()}
      />
    )
  }
}

OrzhtmlListView.defaultProps = {
  initialNumToRender: 10,
  numColumns: 1,
  refreshable: true,
  keyIdx: 'OrzhtmlListViewKey',
  // refreshing func
  setRefreshing: null,
  setRefresh: null,
  setEndReached: null,
  notRefresh: false,
  renderItem: null,
  // Custom View
  PaginationBtnView: null,
  paginationFetchingView: null,
  paginationAllLoadedView: null,
  paginationWaitingView: null,
  EmptyView: null,
  HeaderView: null,
  // RefreshControl
  refreshableTitle: null,
  refreshableColors: ['dimgray', 'tomato', 'limegreen'],
  refreshableProgressBackgroundColor: '#fff',
  refreshableSize: undefined,
  refreshableTintColor: 'lightgray',
  customRefreshControl: null,
  // Pagination
  pagination: true,
  allLoadedText: 'End of List',
  // Spinner
  spinnerColor: undefined,
  waitingSpinnerSize: 'small',
  waitingSpinnerText: 'Loading...',
  // Pagination Button
  paginationBtnText: 'Load more...',
  EmptyViewText: '抱歉没有数据'
}

OrzhtmlListView.propTypes = {
  initialNumToRender: PropTypes.number,
  numColumns: PropTypes.number,
  refreshable: PropTypes.bool,
  keyIdx: PropTypes.string,
  renderItem: PropTypes.func,
  // refreshing func
  setRefreshing: PropTypes.func,
  setRefresh: PropTypes.func,
  setEndReached: PropTypes.func,
  notRefresh: PropTypes.bool,
  // Custom View
  PaginationBtnView: PropTypes.func,
  paginationFetchingView: PropTypes.func,
  paginationAllLoadedView: PropTypes.func,
  paginationWaitingView: PropTypes.func,
  EmptyView: PropTypes.func,
  HeaderView: PropTypes.func,
  // RefreshControl
  refreshableTitle: PropTypes.string,
  refreshableColors: PropTypes.array,
  refreshableProgressBackgroundColor: PropTypes.string,
  refreshableSize: PropTypes.string,
  refreshableTintColor: PropTypes.string,
  customRefreshControl: PropTypes.func,
  // Pagination
  pagination: PropTypes.bool,
  allLoadedText: PropTypes.string,
  // Spinner
  spinnerColor: PropTypes.string,
  waitingSpinnerSize: PropTypes.string,
  waitingSpinnerText: PropTypes.string,
  // Pagination Button
  paginationBtnText: PropTypes.string,
  EmptyViewText: PropTypes.string
}

export default OrzhtmlListView
