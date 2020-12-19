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

const isVideo = (filename) => {
  const extension = filename.split('.').pop()
  const videoExtensions = ['m4v', 'avi', 'mpg', 'mp4']
  return videoExtensions.includes(extension)
}

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
  const { image } = item.node

  const onPress = useCallback(() => {
    onClick(item.node.image)
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
      {isVideo(image.uri) && videoMarker && React.cloneElement(videoMarker, { style: styles.videoMarker })}
      {selected && selectedMarker && React.cloneElement(selectedMarker, { style: styles.selectedMarker })}
    </TouchableOpacity>
  )
}

ImageItem.defaultProps = {
  item: {},
  selected: false,
}

export default React.memo(ImageItem)
