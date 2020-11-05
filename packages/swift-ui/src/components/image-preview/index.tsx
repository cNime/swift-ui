import classNames from 'classnames'
import { defineComponent, PropType, ref, computed, watch } from 'vue'
import Swiper from '../swiper'

export interface Point {
  index: number
  x: number
  y: number
}

const getLen = (points: Point[]) => {
  const len = Math.sqrt(
    Math.pow(points[0].x - points[1].x, 2) + Math.pow(points[0].y - points[1].y, 2)
  )
  return len
}

const threshold = 10
const maxScale = 3
const minScale = 1

const ImagePreview = defineComponent({
  name: 'ImagePreview',
  components: {
    Swiper
  },
  props: {
    className: {
      type: String,
      default: ''
    },
    images: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    show: {
      type: Boolean,
      default: false
    },
    startPosition: {
      type: Number,
      default: 0
    },
    paginationVisible: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close', 'open'],
  setup(props, { emit }) {
    const touchPoint = []
    let movePoint = []
    const scale = ref(minScale)
    const visible = ref(props.show)
    watch(
      () => props.show,
      (val) => {
        if (val !== visible.value) {
          visible.value = val
        }
      }
    )
    watch(
      () => visible.value,
      (val) => {
        if (!val) {
          emit('close')
        } else {
          emit('open')
        }
      }
    )
    const toggleVisible = () => {
      visible.value = !visible.value
    }
    const handleTouchstart = (event: TouchEvent) => {
      const touchList = [].slice.call(event.targetTouches)
      if (touchList.length > 1) {
        touchList.forEach((item: Touch, index: number) => {
          const point = {
            index: item.identifier,
            x: item.clientX,
            y: item.clientY
          }
          touchPoint[index] = point
        })
        movePoint = JSON.parse(JSON.stringify(touchPoint))
      }
    }
    const handleTouchmove = (event: TouchEvent) => {
      const touchList = [].slice.call(event.changedTouches)
      touchList.forEach((item: Touch, index: number) => {
        const point = {
          index: item.identifier,
          x: item.clientX,
          y: item.clientY
        }
        const matchPoint = movePoint.find((item) => item.index === point.index)
        if (matchPoint) {
          matchPoint.x = point.x
          matchPoint.y = point.y
        } else {
          movePoint[index] = point
        }
      })
      if (movePoint.length > 1) {
        const start = getLen(touchPoint)
        const end = getLen(movePoint)
        if (threshold < Math.abs(start - end)) {
          const temp = end / start
          if (temp > maxScale) {
            scale.value = maxScale
          } else if (temp < minScale) {
            scale.value = minScale
          } else {
            scale.value = temp
          }
        }
      }
    }
    const handleTouchend = (event: TouchEvent) => {
      const idx1 = touchPoint.findIndex((item) => item.index === event.changedTouches[0].identifier)
      touchPoint.splice(idx1, 1)
      const idx2 = movePoint.findIndex((item) => item.index === event.changedTouches[0].identifier)
      movePoint.splice(idx2, 1)
    }
    const scaleStyle = computed(() => {
      return {
        transform: `scale(${scale.value}, ${scale.value})`
      }
    })
    const handleDbClick = () => {
      if (scale.value > 1) {
        scale.value = 1
      } else {
        scale.value = 1.5
      }
    }

    return {
      handleTouchstart,
      handleTouchmove,
      handleTouchend,
      scaleStyle,
      handleDbClick,
      visible,
      toggleVisible
    }
  },
  render() {
    const { className, images, startPosition, paginationVisible } = this.$props
    const {
      handleTouchstart,
      handleTouchmove,
      handleTouchend,
      scaleStyle,
      handleDbClick,
      visible,
      toggleVisible
    } = this
    return (
      <div
        class={classNames('at-image-preview', className, { 'at-image-preview-active': visible })}
        onTouchstart={handleTouchstart}
        onTouchmove={handleTouchmove}
        onTouchend={handleTouchend}
        onDblclick={handleDbClick}>
        <div class="at-image-preview-mask" onClick={toggleVisible}></div>
        <Swiper
          swiperData={images}
          class="at-image-preview-content"
          style={scaleStyle}
          initPage={startPosition}
          paginationVisible={paginationVisible}>
          {images.map((item: string, index: number) => (
            <div key={index} class="at-swiper-slide">
              <img src={item} style="max-width: 100%" />
            </div>
          ))}
        </Swiper>
      </div>
    )
  }
})

export default ImagePreview