import React, { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import ImageItem from './ImageItem'

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

const Row = (props) => {
  const {
    imageMargin,
    imagesPerRow,
    containerWidth,
    selectImage,
    rowData,
    isSelected,
    selectedMarker,
    videoMarker,
  } = props

  const renderImage = useCallback((item, selected) => {
    const { uri } = item.node.image
    return (
      <ImageItem
        key={uri}
        item={item}
        selected={selected}
        imageMargin={imageMargin}
        imagesPerRow={imagesPerRow}
        containerWidth={containerWidth}
        onClick={selectImage}
        selectedMarker={selectedMarker}
        videoMarker={videoMarker}
      />
    )
  }, [containerWidth, imageMargin, imagesPerRow, selectImage, selectedMarker])

  const items = useMemo(() => (
    rowData.map((item, index) => {
      if (item === null) {
        return null
      }
      return renderImage(item, isSelected[index])
    })
  ), [isSelected, renderImage, rowData])

  return (
    <View style={styles.row}>
      {items}
    </View>
  )
}

const propsAreEqual = (prevProps, props) => {
  return Object.is(prevProps.imageMargin, props.imageMargin)
    && Object.is(prevProps.selectedMarker, props.selectedMarker)
    && Object.is(prevProps.videoMarker, props.videoMarker)
    && Object.is(prevProps.imagesPerRow, props.imagesPerRow)
    && Object.is(prevProps.containerWidth, props.containerWidth)
    && Object.is(prevProps.selectImage, props.selectImage)
    && Object.is(JSON.stringify(prevProps.rowData), JSON.stringify(props.rowData))
    && Object.is(JSON.stringify(prevProps.isSelected), JSON.stringify(props.isSelected))
}
export default React.memo(Row, propsAreEqual)
