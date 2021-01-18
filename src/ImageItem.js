import React, { useCallback } from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'

const styles = StyleSheet.create({
  selectedMarker: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  videoMarker: {
    position: 'absolute',
    bottom: 5,
    left: 5,
  },
})

const isVideo = (type) => type.startsWith('video')

const ImageItem = (props) => {
  const {
    imageMargin,
    onClick,
    item,
    selectedMarker,
    selected,
    videoMarker,
    itemSize,
  } = props
  const { image, type } = item.node

  const onPress = useCallback(() => {
    onClick({ ...image, type })
  }, [item, onClick])

  return (
    <TouchableOpacity
      style={{ marginBottom: imageMargin }}
      onPress={onPress}
    >
      <Image
        source={{ uri: image.uri }}
        style={{ height: itemSize, width: itemSize }}
      />
      {isVideo(type) && videoMarker && React.cloneElement(videoMarker, { style: styles.videoMarker })}
      {selected && selectedMarker && React.cloneElement(selectedMarker, { style: styles.selectedMarker })}
    </TouchableOpacity>
  )
}

ImageItem.defaultProps = {
  item: {},
  selected: false,
}

export default React.memo(ImageItem)
