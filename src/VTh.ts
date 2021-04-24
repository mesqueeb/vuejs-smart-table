import { uuid } from './table-utils'
import { computed, defineComponent, h, isVue2, nextTick, onMounted, PropType, ref, VNode, watch } from 'vue-demi'
import { CustomSort, SortKey, SortOrder } from './types'
import { useStore } from './use-store'

export default defineComponent({
  name: 'VTh',
  props: {
    sortKey: {
      type: [String, Function] as PropType<SortKey>,
      required: false,
      default: null
    },
    customSort: {
      type: [Function, Object] as PropType<CustomSort>,
      required: false,
      default: null
    },
    defaultSort: {
      type: String as PropType<'asc' | 'desc' | null>,
      required: false,
      validator: (value: any) => ['asc', 'desc', null].includes(value),
      default: null
    }
  },
  emits: ['defaultSort'],
  setup(props, { emit, slots }) {
    const { sortId, hideSortIcons, setSort } = useStore()

    if (!props.sortKey && !props.customSort) {
      throw new Error('Must provide the Sort Key value or a Custom Sort function.')
    }

    const id = uuid()
    const order = ref<SortOrder>(SortOrder.NONE)

    onMounted(() => {
      if (props.defaultSort) {
        order.value = props.defaultSort === 'desc' ? -1 : 1
        setSort({
          sortOrder: order.value,
          sortKey: props.sortKey,
          customSort: props.customSort,
          sortId: id
        })
        nextTick(() => {
          emit('defaultSort')
        })
      }
    })

    const createSortIcon = (d: string) => {
      const svgProps = () => {
        const props = {
          width: 16,
          height: 16,
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 320 512'
        }

        return isVue2 ? { attrs: props } : props
      }

      const pathProps = () => {
        const props = {
          fill: 'currentColor',
          d
        }

        return isVue2 ? { attrs: props } : props
      }

      return h('svg', svgProps(), [
        h('path', pathProps())
      ])
    }

    const sortIcon = computed(() => {
      if (hideSortIcons.value) {
        return
      }

      switch (order.value) {
        case SortOrder.DESC:
          return createSortIcon('M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z')
        case SortOrder.ASC:
          return createSortIcon('M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z')
        default:
          return createSortIcon('M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z')
      }
    })

    watch(sortId, () => {
      if (sortId.value !== id && order.value !== 0) {
        order.value = 0
      }
    })

    const sort = () => {
      if ([SortOrder.DESC, SortOrder.NONE].includes(order.value)) {
        order.value = SortOrder.ASC
      } else {
        order.value = SortOrder.DESC
      }

      setSort({
        sortOrder: order.value,
        sortKey: props.sortKey,
        customSort: props.customSort,
        sortId: id
      })
    }

    const children = computed(() => {
      const children: any = []
      if (!hideSortIcons.value) {
        children.push(sortIcon.value)
      }

      if (slots.default) {
        children.push(slots.default({ sortOrder: order.value }))
      }

      return children
    })

    return () => {
      return h('th', {
        ...(isVue2 ? {
          on: {
            click: sort
          }
        } : {
          onClick: sort
        })
      }, [
        h('div', children.value)
      ])
    }
  }
})