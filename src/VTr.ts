import { computed, defineComponent, h, inject } from 'vue-demi'
import { storeKey } from './VTable'

export default defineComponent({
  name: 'VTr',
  props: {
    row: {
      type: Object,
      required: true
    }
  },
  setup(props: any, { slots }) {
    const store = inject(storeKey)!

    const isSelected = computed(() => store.state.selectedRows.find((it: any) => it === props.row))
    const rowClass = computed(() => isSelected.value ? store.state.selectedClass : '')
    const style = computed(() => ({ ...(!store.state.customSelection ? { cursor: 'pointer' } : {}) }))

    const handleRowSelected = (event: Event) => {
      if (store.state.customSelection) {
        return
      }

      const source = event.target as HTMLElement
      if (source && source.tagName.toLowerCase() === 'td') {
        if (isSelected.value) {
          store.deselectRow(props.row)
        } else {
          store.selectRow(props.row)
        }
      }
    }

    return () => {
      return h('tr', {
          class: rowClass.value,
          style: style.value,
          onClick: handleRowSelected,
          on: {
            click: handleRowSelected
          }
        },
        slots.default ? slots.default() : []
      )
    }
  }
})
