import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Platform,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Dimensions,
} from 'react-native'
import Ionicon from 'react-native-vector-icons/Ionicons'
import CameraRoll from '@react-native-community/cameraroll'

import Row from './Row'

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
  },
  flatlist: {
    flex: 1,
  },
  loader: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

// helper functions
const arrayObjectIndexOf = (array, property, value) => array.map((o) => o[property]).indexOf(value)

const groupByEveryN = (arrayArg, n) => {
  const array = [...arrayArg]
  const result = []
  while (array.length > 0) {
    const groupByNumber = array.length >= n ? n : array.length
    result.push(array.splice(0, groupByNumber))
  }
  return result
}

const CameraRollPicker = (props) => {
  const {
    initialNumToRender,
    imageMargin,
    backgroundColor,
    emptyText,
    emptyTextStyle,
    loader,
    imagesPerRow,
    selected: propsSelected,
    maximum,
    callback,
    selectSingleItem,
    selectedMarker,
    videoMarker,
    containerWidth,
    groupTypes,
    groupName,
    assetType,
    loaderColor,
    loaderSize,
    checkPermissions,
  } = props

  const [images, setImages] = useState([])
  const [selected, setSelected] = useState(propsSelected)
  const [lastCursor, setLastCursor] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [noMore, setNoMore] = useState(false)
  const [data, setData] = useState([])
  const [seen, setSeen] = useState(new Set())
  const itemSize = (Dimensions.get('window').width - (imagesPerRow) * imageMargin) / imagesPerRow

  const appendImages = useCallback((image) => {
    const assets = image.edges
    setLoadingMore(false)
    setInitialLoading(false)

    if (!image.page_info.has_next_page) {
      setNoMore(true)
    }

    if (assets.length > 0) {
      setLastCursor(image.page_info.end_cursor)
      const newSeen = new Set(seen)

      // Unique assets efficiently
      // Checks new pages against seen objects
      const uniqAssets = []
      for (let index = 0; index < assets.length; index++) {
        const asset = assets[index]
        const value = asset.node.image.uri
        if (newSeen.has(value)) continue
        newSeen.add(value)
        uniqAssets.push(asset)
      }

      const newImages = images.concat(uniqAssets)
      setImages(newImages)
      setData(groupByEveryN(newImages, imagesPerRow))
      setSeen(newSeen)
    }
  }, [images, imagesPerRow, seen])

  const doFetch = useCallback(async () => {
    const granted = await checkPermissions()
    if (!granted) {
      console.log('Access to assets was denied!')
      return
    }

    const fetchParams = {
      first: 100,
      groupTypes,
      groupName,
      assetType,
    }

    if (lastCursor) {
      fetchParams.after = lastCursor
    }

    const photos = await CameraRoll.getPhotos(fetchParams)
    appendImages(photos)
  }, [appendImages, assetType, checkPermissions, groupName, groupTypes, lastCursor])

  const fetch = useCallback(() => {
    if (!loadingMore) {
      setLoadingMore(true)
      doFetch()
    }
  }, [doFetch, loadingMore])

  const selectImage = useCallback((image) => {
    const index = arrayObjectIndexOf(selected, 'uri', image.uri)

    if (index >= 0) {
      selected.splice(index, 1)
    } else {
      if (selectSingleItem) {
        selected.splice(0, selected.length)
      }
      if (selected.length < maximum) {
        selected.push(image)
      }
    }

    setSelected(selected)
    setData(groupByEveryN(images, imagesPerRow))

    callback(selected, image)
  }, [callback, images, imagesPerRow, maximum, selectSingleItem, selected])

  const renderRow = useCallback((item) => {
    const isSelected = item.map((imageItem) => {
      if (!imageItem) return false
      const { uri } = imageItem.node.image
      return arrayObjectIndexOf(selected, 'uri', uri) >= 0
    })

    return (
      <Row
        rowData={item}
        isSelected={isSelected}
        selectImage={selectImage}
        imagesPerRow={imagesPerRow}
        containerWidth={containerWidth}
        imageMargin={imageMargin}
        selectedMarker={selectedMarker}
        videoMarker={videoMarker}
        itemSize={itemSize}
      />
    )
  }, [containerWidth, imageMargin, imagesPerRow, selectImage, selected, selectedMarker])

  const onEndReached = useCallback(() => {
    if (!noMore) fetch()
  }, [fetch, noMore])

  const renderFooterSpinner = useCallback(() => {
    if (!noMore) {
      return <ActivityIndicator color={loaderColor} size={loaderSize} />
    }
    return null
  }, [loaderColor, loaderSize, noMore])

  const keyExtractor = useCallback((item, index) => item[0].node.image.uri + index, [])

  const renderItem = useCallback(({ item }) => renderRow(item), [renderRow])

  const getEmojiItemsLayout = useCallback((_, index) => ({
    length: itemSize, offset: itemSize * index, index,
  }), [])

  const renderFlatlistOrEmpty = useMemo(() => {
    if (data.length > 0) {
      return (
        <FlatList
          data={data}
          removeClippedSubviews
          style={styles.flatlist}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={onEndReached}
          getItemLayout={getEmojiItemsLayout}
          initialNumToRender={initialNumToRender}
          ListFooterComponent={renderFooterSpinner}
        />
      )
    }
    return <Text style={[{ textAlign: 'center' }, emptyTextStyle]}>{emptyText}</Text>
  }, [data, emptyText, emptyTextStyle, initialNumToRender, keyExtractor, onEndReached, renderFooterSpinner, renderItem])

  // fetch on mount
  useEffect(() => {
    fetch()
  }, [])

  // refresh selected items
  useEffect(() => {
    setSelected(propsSelected)
  }, [propsSelected])

  if (initialLoading) {
    return (
      <View style={[styles.loader, { backgroundColor }]}>
        {loader || <ActivityIndicator color={loaderColor} size={loaderSize} />}
      </View>
    )
  }

  return (
    <View style={[styles.wrapper, { paddingRight: 0, backgroundColor }]}>
      {renderFlatlistOrEmpty}
    </View>
  )
}

CameraRollPicker.defaultProps = {
  initialNumToRender: 5,
  groupTypes: 'Album',
  maximum: 15,
  imagesPerRow: 3,
  imageMargin: 2,
  selectSingleItem: false,
  assetType: 'Photos',
  backgroundColor: 'white',
  selected: [],
  callback: (selectedImages, currentImage) => {
    console.log(currentImage)
    console.log(selectedImages)
  },
  emptyText: 'No photos.',
  loaderColor: 'white',
  loaderSize: 25,
  checkPermissions: async () => {
    if (Platform.OS === 'ios') return Promise.resolve(true)
    const result = await PermissionsAndroid.request('android.permission.READ_EXTERNAL_STORAGE')
    return Promise.resolve(result === 'granted')
  },
  selectedMarker: (
    <Ionicon
      name={Platform.select({ android: 'md-checkmark-circle', ios: 'ios-checkmark-circle' })}
      size={25}
    />
  ),
  videoMarker: (
    <Ionicon
      name={Platform.select({ android: 'md-videocam', ios: 'md-videocam' })}
      size={15}
      color="white"
    />
  ),
}

export default React.memo(CameraRollPicker)
