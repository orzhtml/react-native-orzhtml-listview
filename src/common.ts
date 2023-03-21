import { ListRenderItem, RefreshControlProps, StyleProp, TextStyle, ViewStyle } from 'react-native'

export interface PaginationStatusProps {
    FIRST_LOAD: number,
    WAITING: number,
    IN_LOADED: number,
    ALL_LOADED: number,
    NO_DATA: number,
}

export const PaginationStatus: PaginationStatusProps = {
    FIRST_LOAD: 0, // 第一次加载
    WAITING: 1, // 等待加载
    IN_LOADED: 2, // 加载中
    ALL_LOADED: 3, // 加载完成
    NO_DATA: 5, // 一个数据都没有
}

export interface OrzhtmlListHandles {
    /** 手动刷新 */
    refresh: () => void,
    /** 手动更新数据 */
    updateDataSource: (rows: any[]) => void,
    /** 第一次数据加载 */
    firstAddData: (rows: any[]) => void,
    /** 获取已存的所有数据 */
    getRows: () => void,
    scrollToEnd: (params: ScrollToEndTypes) => void,
    scrollToIndex: (params: ScrollToIndexTypes) => void,
    scrollToItem: (params: ScrollToItemTypes) => void,
    scrollToOffset: (params: ScrollToOffsetTypes) => void,
}

export interface OrzhtmlListProps {
    initialNumToRender: number,
    numColumns: number,
    refreshable: boolean,
    keyIdx: string,
    // refreshing func
    setRefreshing?: (refreshing: boolean) => void,
    setRefresh?: (postRefresh: (rows: any[]) => void, endFetch: () => void) => void,
    setEndReached?: (postPaginate: (rows: any[]) => void, endFetch: () => void) => void,
    noRefresh?: boolean,
    // Custom View
    ItemSeparatorComponent?: React.ComponentType<any> | null,
    renderItem: ListRenderItem<any> | null | undefined,
    PaginationBtnView?: React.ComponentType<any> | React.ReactElement | null,
    PaginationFetchingView?: React.ComponentType<any> | React.ReactElement | null,
    PaginationAllLoadedView?: React.ComponentType<any> | React.ReactElement | null,
    PaginationWaitingView?: React.ComponentType<any> | React.ReactElement | null,
    EmptyView?: React.ComponentType<any> | React.ReactElement | null,
    HeaderView?: React.ComponentType<any> | React.ReactElement | null,
    // RefreshControl
    customRefreshControl?: React.ReactElement<RefreshControlProps> | undefined,
    refreshableTitle?: string,
    refreshableColors?: string[],
    refreshableProgressBackgroundColor?: string,
    refreshableSize?: number,
    refreshableTintColor?: string,
    // Pagination
    pagination?: boolean,
    allLoadedText?: string,
    // Spinner
    spinnerColor?: string,
    waitingSpinnerSize?: 'small' | 'large',
    waitingSpinnerText?: string,
    // Pagination Button
    paginationBtnText?: string,
    emptyViewText?: string,
    style?: StyleProp<ViewStyle>,
    containerStyle?: StyleProp<ViewStyle>,
    paginationBtnStyle?: StyleProp<ViewStyle>,
    paginationBtnTextStyle?: StyleProp<TextStyle>,
    waitingSpinnerTextStyle?: StyleProp<TextStyle>,
}

export interface OrzhtmlListViewProps extends OrzhtmlListProps {
    refInstance: React.ForwardedRef<any>,
}

export interface ScrollToEndTypes { animated?: boolean | null }

export interface ScrollToIndexTypes { animated?: boolean | null, index: number, viewOffset?: number, viewPosition?: number }

export interface ScrollToItemTypes { animated?: boolean | null, item: any, viewOffset?: number, viewPosition?: number }

export interface ScrollToOffsetTypes { animated?: boolean | null, offset: number }

export interface MergedRowsParams {
    rows: any[]
    paginationStatus: number,
    isRefresh?: boolean
}