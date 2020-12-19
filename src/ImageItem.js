import React, { useCallback, useEffect, useState } from 'react'
import {
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native'

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
  const [imageSize, setImageSize] = useState(0)

  const {
    imageMargin,
    imagesPerRow,
    containerWidth,
    onClick,
    item,
    selectedMarker,
    selected,
    videoMarker,
  } = props
  const { image } = item.node

  useEffect(() => {
    const width = containerWidth || Dimensions.get('window').width
    setImageSize((width - (imagesPerRow) * imageMargin) / imagesPerRow)
  }, [containerWidth, imageMargin, imagesPerRow])

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
        style={{ height: imageSize, width: imageSize }}
      />
      {isVideo(image.uri) && React.cloneElement(videoMarker, { style: styles.videoMarker })}
      {selected && React.cloneElement(selectedMarker, { style: styles.selectedMarker })}
    </TouchableOpacity>
  )
}

ImageItem.defaultProps = {
  item: {},
  selected: false,
}

export default React.memo(ImageItem)
