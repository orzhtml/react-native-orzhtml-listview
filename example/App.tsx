import React, { useEffect, useRef } from 'react'
import { View, Text, StatusBar } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

import FlatListView, { OrzhtmlListHandlesRef } from './src'

interface ItemData {
  name: number;
}

const App = (): JSX.Element => {
  const textIndex = useRef<number>(0)
  const page = useRef<number>(0)
  const _flatList = useRef<OrzhtmlListHandlesRef>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const mock = <T extends any>(
    data: T,
    t?: number
  ): Promise<T> => {
    return new Promise((resolve) => {
      t = t || Math.random() * 1500
      setTimeout(resolve, t, data)
    })
  }
  const getData = (start = 0, end = 10): ItemData[] => {
    let list = []
    for (let i = start; i <= end; i++) {
      list.push({ name: i })
    }
    return list
  }

  const fetchData = async (): Promise<void> => {
    const res = await mock(getData())
    _flatList && _flatList.current?.firstAddData(res)
  }

  const _setRefresh = (startFetch, abortFetch) => {
    mock([]).then(res => {
      page.current = 0
      textIndex.current++
      startFetch(res)
    })
  }

  const _setEndReached = (startFetch, abortFetch) => {
    if (page.current === 1) {
      startFetch([])
      return false
    }
    mock(getData(11, 19)).then(res => {
      startFetch(res)
      page.current = 1
    })
  }

  const _renderItem = ({ item }) => {
    return (
      <View style={{ height: 80, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 15, color: 'black' }}>{item.name}</Text>
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <StatusBar barStyle={'dark-content'} />
        <FlatListView
          ref={_flatList}
          style={{ flex: 1 }}
          renderItem={_renderItem}
          setRefresh={_setRefresh}
          setEndReached={_setEndReached}
          ItemSeparatorComponent={null}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

export default App
