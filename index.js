/**
 * 上拉下拉
 */
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

const { width } = Dimensions.get('window');

const PaginationStatus = {
  FIRST_LOAD: 0, // 第一次加载
  WAITING: 1, // 等待加载
  IN_LOADED: 2, // 加载中
  ALL_LOADED: 3, // 加载完成
  NO_DATA: 5, // 一个数据都没有
};

class FlatListView extends React.Component {
  constructor(props) {
    super(props);
    this.rows = [];
    this.refreshing = true;
    this.state = {
      dataSource: [],
      isRefreshing: false,
      paginationStatus: PaginationStatus.FIRST_LOAD,
    };
    console.log('constructor TableList');
  }

  componentDidMount() {
    this.mounted = true;
    console.log('componentDidMount TableList');
  }

  componentWillUnmount() {
    this.mounted = false;
    console.log('componentWillUnmount TableList');
  }
  /** 刷新 */
  onRefresh = () => {
    console.log('onRefresh TableList');
    let { setRefreshing, setRefresh } = this.props;
    if (this.mounted) {
      setRefreshing && setRefreshing(true);
      this.onRefreshing(true);
      this.setState({
        isRefreshing: true,
      });
      setRefresh && setRefresh(this.postRefresh, this.endFetch);
    }
  };
  /** 刷新处理数据 */
  postRefresh = (rows = []) => {
    let { notRefresh, initialNumToRender } = this.props;
    if (this.mounted) {
      let paginationStatus = PaginationStatus.WAITING;
      let mergedRows = [];
      if (notRefresh) {
        mergedRows = rows;
      } else {
        mergedRows = rows.concat(this.getRows());
      }
      if (rows.length < initialNumToRender) {
        paginationStatus = PaginationStatus.ALL_LOADED;
      }
      this.updateRows(mergedRows, paginationStatus);
    }
  };
  /** 执行上拉加载动作 */
  onEndReached = () => {
    console.log('onEndReached TableList');
    let { pagination } = this.props;
    let { paginationStatus, isRefreshing } = this.state;
    if (this.refreshing) {
      return false;
    }
    if (
      !isRefreshing &&
      pagination &&
      paginationStatus === PaginationStatus.WAITING
    ) {
      console.log('onEndReached');
      this.onPaginate();
    }
  };
  /** 上拉加载方法 */
  onPaginate = () => {
    console.log('onPaginate TableList');
    let { setEndReached } = this.props;
    let { paginationStatus } = this.state;
    if (paginationStatus !== PaginationStatus.ALL_LOADED) {
      console.log('onPaginate');
      if (this.loadingMore) {
        return false;
      }
      this.loadingMore = true;
      this.setState({
        paginationStatus: PaginationStatus.IN_LOADED,
      });
      setEndReached && setEndReached(this.postPaginate, this.endFetch);
    }
  };
  /** 下一页 */
  postPaginate = (rows = []) => {
    console.log('postPaginate TableList');
    let mergedRows = [];
    let paginationStatus;
    if (rows.length === 0) {
      paginationStatus = PaginationStatus.ALL_LOADED;
    } else {
      mergedRows = this.getRows().concat(rows);
      paginationStatus = PaginationStatus.WAITING;
    }
    this.loadingMore = false;
    this.updateRows(mergedRows, paginationStatus);
  };
  /** 更新数据 */
  updateRows = (rows, paginationStatus) => {
    let { setRefreshing } = this.props;
    let mergedRows = rows;
    if (rows.length) {
      console.log('updateRows A');
      this.setRows(rows);
    } else {
      console.log('updateRows B');
      mergedRows = this.getRows().slice();
    }
    setRefreshing && setRefreshing(false);
    this.setState({
      dataSource: mergedRows,
      isRefreshing: false,
      paginationStatus,
    });
    this.refreshing = false;
  };
  /** 手动刷新 */
  refresh = () => {
    console.log('refresh TableList');
    this.onRefresh();
  };
  /** 手动更新数据 */
  updateDataSource = (rows = []) => {
    console.log('updateDataSource');
    let { initialNumToRender } = this.props;
    let paginationStatus = PaginationStatus.WAITING
    if (rows.length === 0) {
      paginationStatus = PaginationStatus.NO_DATA
    } else if (rows.length < initialNumToRender) {
      paginationStatus = PaginationStatus.ALL_LOADED;
    }

    this.setRows(rows);
    this.setState({
      dataSource: rows,
      paginationStatus
    });
  };
  /** 第一次数据加载 */
  firstAddData = (rows = []) => {
    console.log('firstAddData');
    this.updateDataSource(rows)
    this.onRefreshing(false);
  };
  /** 上拉加载结束 */
  endFetch = () => {
    console.log('endFetch');
    if (this.mounted) {
      this.setState({
        isRefreshing: false,
      });
    }
  };

  onRefreshing = refreshing => {
    console.log('onRefreshing');
    this.refreshing = refreshing;
  };

  setRows = rows => (this.rows = rows);

  getRows = () => this.rows;

  scrollToEnd = params => {
    console.log('scrollToEnd TableList', params);
    if (this._flatList) {
      this._flatList.scrollToEnd(params);
    }
  };

  scrollToIndex = params => {
    console.log('scrollToIndex TableList', params);
    if (this._flatList) {
      this._flatList.scrollToIndex(params);
    }
  };

  scrollToItem = params => {
    console.log('scrollToItem TableList', params);
    if (this._flatList) {
      this._flatList.scrollToItem(params);
    }
  };

  scrollToOffset = params => {
    console.log('scrollToOffset TableList', params);
    if (this._flatList) {
      this._flatList.scrollToOffset(params);
    }
  };
  /** 上拉等待加载 */
  PaginationBtnView = () => {
    console.log('PaginationBtnView');
    let { pagination, PaginationBtnView, paginationBtnText } = this.props;
    if (pagination) {
      if (PaginationBtnView) {
        return PaginationBtnView();
      }
      return (
        <View style={[styles.fetchingView]}>
          <Text style={styles.paginationViewText}>{paginationBtnText}</Text>
        </View>
      );
    }
    return null;
  };
  /** 上拉加载完成，没有更多数据 */
  PaginationAllLoadedView = () => {
    console.log('PaginationAllLoadedView');
    let { pagination, PaginationAllLoadedView, allLoadedText } = this.props;
    if (pagination) {
      if (PaginationAllLoadedView) {
        return PaginationAllLoadedView();
      }
      return (
        <View style={[styles.paginationView]}>
          <Text style={styles.allLoadedText}>{allLoadedText}</Text>
        </View>
      );
    }
    return null;
  };
  /** 上拉加载中 */
  PaginationWaitingView = () => {
    console.log('PaginationWaitingView');
    let {
      pagination,
      PaginationWaitingView,
      spinnerColor,
      waitingSpinnerSize,
      waitingSpinnerText,
    } = this.props;
    if (pagination) {
      if (PaginationWaitingView) {
        return PaginationWaitingView();
      }
      return (
        <View style={[styles.paginationView]}>
          <ActivityIndicator color={spinnerColor} size={waitingSpinnerSize} />
          <Text style={[styles.paginationViewText, styles.ml5]}>
            {waitingSpinnerText}
          </Text>
        </View>
      );
    }
    return null;
  };

  _ListHeaderComponent = () => {
    console.log('_ListHeaderComponent');
    let { HeaderView } = this.props;
    if (HeaderView) {
      return HeaderView();
    }
    return null;
  };

  _ListFooterComponent = () => {
    let { initialNumToRender } = this.props;
    let { paginationStatus } = this.state;
    console.log('_ListFooterComponent paginationStatus: ', paginationStatus);
    if (paginationStatus === PaginationStatus.WAITING) {
      /** 等待上拉加载 */
      console.log('等待上拉加载');
      return this.PaginationBtnView();
    } else if (paginationStatus === PaginationStatus.IN_LOADED) {
      if (initialNumToRender && initialNumToRender > 0) {
        console.log('上拉加载中1');
        if (this.getRows().length < initialNumToRender) {
          console.log('没有更多了');
          return this.PaginationAllLoadedView();
        }
      }
      console.log('上拉加载中');
      /** 上拉加载中 */
      return this.PaginationWaitingView();
    } else if (
      /** 上拉加载完成 / 没有更多数据 */
      this.getRows().length !== 0 &&
      paginationStatus === PaginationStatus.ALL_LOADED
    ) {
      console.log('上拉加载完成 / 没有更多数据');
      return this.PaginationAllLoadedView();
    }
    return null;
  };

  _ListEmptyComponent = () => {
    let { EmptyView, EmptyViewText } = this.props;
    let { paginationStatus } = this.state;
    if (paginationStatus !== PaginationStatus.NO_DATA) {
      return null;
    }
    if (EmptyView) {
      return EmptyView();
    }
    return (
      <View style={styles.emptyView}>
        <Text style={styles.emptyViewTxt}>{EmptyViewText}</Text>
      </View>
    );
  };
  /** 自定义分割线 */
  renderItemSeparatorComponent = ({ highlighted }) => {
    return <View style={styles.line} />;
  };
  /** 下拉组件 */
  renderRefreshControl = () => {
    console.log('renderRefreshControl');
    let {
      refreshable,
      refreshableColors,
      refreshableProgressBackgroundColor,
      refreshableSize,
      refreshableTintColor,
      refreshableTitle,
    } = this.props;
    let { isRefreshing } = this.state;
    if (refreshable) {
      return (
        <RefreshControl
          onRefresh={this.onRefresh}
          refreshing={isRefreshing}
          colors={refreshableColors}
          progressBackgroundColor={refreshableProgressBackgroundColor}
          size={refreshableSize}
          tintColor={refreshableTintColor}
          title={refreshableTitle}
        />
      );
    }
    return null;
  };

  _keyExtractor = (item, index) => 'RenderItemKey-' + index;

  render() {
    const { keyIdx, numColumns } = this.props;
    const { dataSource } = this.state;
    return (
      <FlatList
        onEndReachedThreshold={0.1}
        ItemSeparatorComponent={this.renderItemSeparatorComponent}
        numColumns={numColumns}
        keyExtractor={this._keyExtractor}
        {...this.props}
        key={keyIdx}
        ref={ref => (this._flatList = ref)}
        data={dataSource}
        ListHeaderComponent={this._ListHeaderComponent}
        ListFooterComponent={this._ListFooterComponent}
        ListEmptyComponent={this._ListEmptyComponent}
        onEndReached={this.onEndReached}
        refreshControl={this.renderRefreshControl()}
      />
    );
  }
}

FlatListView.defaultProps = {
  initialNumToRender: 10,
  numColumns: 1,
  refreshable: true,
  keyIdx: 'FlatListViewKey',
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
  EmptyViewText: '抱歉没有数据',
};

FlatListView.propTypes = {
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
  EmptyViewText: PropTypes.string,
};

const styles = StyleSheet.create({
  fetchingView: {
    width,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationView: {
    flex: 0,
    width,
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationViewText: {
    fontSize: 16,
  },
  paginationViewSpinner: {
    marginRight: 5,
  },
  paginationBtn: {
    backgroundColor: 'tomato',
    margin: 10,
    borderRadius: 20,
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationBtnText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  separator: {
    height: 0.5,
    marginLeft: 15,
    marginRight: 15,
    backgroundColor: 'lightgray',
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allLoadedText: {
    alignSelf: 'center',
    color: '#bfbfbf',
  },
  gridItem: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  line: {
    backgroundColor: '#E7E7E7',
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 10,
  },
  emptyView: {
    alignItems: 'center',
  },
  emptyViewTxt: {
    lineHeight: 80,
  },
  ml5: {
    marginLeft: 5,
  },
});

export default FlatListView;
