import { defineComponent, watch, toRef, PropType, h, provide, InjectionKey } from 'vue-demi'
import { Filters, SelectionMode, TableState } from './types'
import { Store } from './Store'

export const storeKey: InjectionKey<Store> = Symbol('store-key')

export default defineComponent({
  name: 'VTable',
  props: {
    data: {
      type: Array,
      required: true
    },
    filters: {
      type: Object as PropType<Filters>,
      required: false,
      default: () => ({})
    },
    currentPage: {
      type: Number,
      required: false,
      default: undefined
    },
    pageSize: {
      type: Number,
      required: false,
      default: undefined
    },
    selectionMode: {
      type: String as PropType<SelectionMode>,
      required: false,
      default: 'single',
      validator: (val: string) => ['single', 'multiple'].includes(val)
    },
    selectedClass: {
      required: false,
      type: String,
      default: 'vt-selected'
    },
    customSelection: {
      required: false,
      type: Boolean,
      default: false
    },
    hideSortIcons: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  emits: {
    stateChanged: (state: TableState) => true
  },
  setup (props, ctx) {
    // @ts-ignore
    const store = new Store(ctx.emit)
    provide(storeKey, store)

    store.syncProp('data', toRef(props, 'data'))
    store.syncProp('filters', toRef(props, 'filters'), true)
    store.syncProp('currentPage', toRef(props, 'currentPage'))
    store.syncProp('pageSize', toRef(props, 'pageSize'))
    store.syncProp('selectionMode', toRef(props, 'selectionMode'))
    store.syncProp('selectedClass', toRef(props, 'selectedClass'))
    store.syncProp('customSelection', toRef(props, 'customSelection'))
    store.syncProp('hideSortIcons', toRef(props, 'hideSortIcons'))

    return {
      store: store,
      tableState: store.tableState,
      selectAll: () => store.selectAll(),
      deselectAll: () => store.deselectAll(),
      selectRows: (rows: any[]) => store.selectRows(rows),
      selectRow: (row: any) => store.selectRow(row),
      deselectRows: (rows: any[]) => store.deselectRows(rows),
      deselectRow: (row: any) => store.deselectRow(row),
      revealItem: (item: any | ((item: any) => boolean)) => store.revealItem(item)
    }
  },
  render () {
    return h('table', [
      h('thead', this.$slots.head ? this.$slots.head() : undefined),
      h('tbody', this.$slots.body? this.$slots.body({ rows: this.tableState.rows }) : undefined)
    ])
  }
})
