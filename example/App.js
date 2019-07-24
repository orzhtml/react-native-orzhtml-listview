import React from 'react'
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native'
import { Promise } from 'es6-promise'
import { getStatusBarHeight } from 'react-native-status-bar-height'

import FlatListView from 'react-native-orzhtml-listview'

const ios = Platform.OS === 'ios'
const statusHeight = ios ? getStatusBarHeight() : StatusBar.currentHeight
const sw = Dimensions.get('window').width

class Example extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      headerText: '最新推荐成功',
      refreshing: false
    }
    this.textIndex = 0
  }

  componentDidMount () {
    this.mounted = true
    this.fetchData()
    this.page = 0
  }

  mock = (data, t) => {
    return new Promise((resolve, reject) => {
      t = t || Math.random() * 1500
      setTimeout(resolve, t, data)
    })
  }

  fetchData = async () => {
    const res = await this.mock([
      { name: '01', id: '101' },
      { name: '02', id: '102' },
      { name: '03', id: '103' },
      { name: '04', id: '104' },
      { name: '05', id: '105' },
      { name: '06', id: '106' },
      { name: '07', id: '107' },
      { name: '08', id: '108' }
    ])
    this._flatList && this._flatList.firstAddData(res)
  }

  _setRefresh = (startFetch, abortFetch) => {
    this.setState({
      refreshing: true
    })
    this.mock([
      { name: '01', id: '101' },
      { name: '02', id: '102' },
      { name: '03', id: '103' },
      { name: '04', id: '104' },
      { name: '05', id: '105' },
      { name: '06', id: '106' },
      { name: '07', id: '107' },
      { name: '08', id: '108' },
      { name: '09', id: '109' },
      { name: '10', id: '110' },
      { name: '11', id: '111' },
      { name: '12', id: '112' }
    ])
      .then(res => {
        this.setState({
          headerText: `本次推荐 ${res.length} 条更新 - ${this.textIndex}`,
          refreshing: false
        })
        this.page = 0
        this.textIndex++
        startFetch(res)
      })
      .catch(e => {
        console.log(e)
        abortFetch()
      })
  }

  _setEndReached = (startFetch, abortFetch) => {
    if (this.page === 1) {
      startFetch([])
      return false
    }
    this.mock([
      { name: '13', id: '113' },
      { name: '14', id: '114' },
      { name: '15', id: '115' },
      { name: '16', id: '116' },
      { name: '17', id: '117' }
    ])
      .then(res => {
        startFetch(res)
        this.page = 1
      })
      .catch(e => {
        console.log(e)
        abortFetch()
      })
  }

  _renderItem = ({ item, index }) => {
    const key = '_renderItem-' + index
    return <RenderItems key={key} data={item} />
  }

  _AnimatedHeaderView = () => {
    const { headerText, refreshing } = this.state
    return (
      <AnimatedHeaderView headerText={headerText} refreshing={refreshing} />
    )
  }

  render () {
    return (
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: '#ffffff',
            height: statusHeight
          }}
        >
          <StatusBar translucent backgroundColor={'#ffffff'} />
        </View>
        <FlatListView
          style={styles.container}
          initialNumToRender={12}
          // ItemSeparatorComponent={null}
          ref={ref => (this._flatList = ref)}
          renderItem={this._renderItem}
          // notRefresh={true}
          HeaderView={this._AnimatedHeaderView}
          refreshable={true}
          setRefresh={this._setRefresh}
          setEndReached={this._setEndReached}
          refreshableTitle="下拉刷新"
          allLoadedText="没有更多数据"
          waitingSpinnerText="加载中..."
          paginationBtnText="加载更多..."
        />
      </View>
    )
  }
}

class RenderItems extends React.PureComponent {
  render () {
    const { data } = this.props
    return (
      <View
        style={{ height: 60, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontSize: 15, color: 'black' }}>{data.name}</Text>
      </View>
    )
  }
}

class AnimatedHeaderView extends React.PureComponent {
  constructor (props) {
    super(props)
    this.spinWidthValue = new Animated.Value(0)
    this.spinHeightValue = new Animated.Value(0)
    this.timer = null
    this.state = {
      height: 0
    }
  }

  componentWillReceiveProps (nextProps) {
    const { refreshing } = this.props
    if (refreshing === nextProps.refreshing) {
      return false
    }
    if (!nextProps.refreshing) {
      this._start()
    }
  }

  componentWillUnmount () {
    this._stopTimer()
  }

  _start = () => {
    this.spinWidthValue.setValue(0)
    this.spinHeightValue.setValue(0)
    this._stopTimer()

    this.setState(
      {
        height: 34
      },
      () => {
        Animated.timing(this.spinWidthValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.linear)
        }).start(() => {
          this.timer = setTimeout(() => {
            Animated.timing(this.spinHeightValue, {
              toValue: 1,
              duration: 200,
              easing: Easing.inOut(Easing.linear)
            }).start()
            this.setState({
              height: this.spinHeightValue.interpolate({
                inputRange: [0, 1],
                outputRange: [34, 0]
              })
            })
          }, 1000)
        })
      }
    )
  }

  _stopTimer = () => {
    this.timer && clearTimeout(this.timer)
    this.timer = null
  }

  render () {
    const { headerText } = this.props
    const { height } = this.state

    const width = this.spinWidthValue.interpolate({
      inputRange: [0, 1],
      outputRange: [100, sw]
    })

    return (
      <Animated.View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          height
        }}
      >
        <Animated.View
          style={{
            backgroundColor: '#d6e9f7',
            justifyContent: 'center',
            alignItems: 'center',
            height: 34,
            width
          }}
        >
          <Text style={{ fontSize: 12, color: '#3289bf' }}>{headerText}</Text>
        </Animated.View>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default Example
