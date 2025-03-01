<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-table
    class="table-sticky-header q-ma-sm"
    :rows="table.rows"
    :columns="table.columns"
    :visible-columns="table.visibles"
    :loading="table.loading"
    :selection="'single'"
    v-model:pagination="table.pagination"
    :dense="$q.screen.lt.md"
    :no-data-label="$t('error.data_not_available')"
    rows-per-page-label=" "
    :selected-rows-label="(selected) => {}"
    :rows-per-page-options="[20, 40, 60, 80, 100, 120, 140, 160, 180, 200]"
    binary-state-sort
    :separator="'cell'"
    @request="do_request"
    bordered
  >
    <template v-slot:top>
      <q-space />
      <q-btn
        glossy
        round
        dense
        class="q-ma-none q-ml-md"
        color="deep-orange"
        icon="search"
        @click="on_search_click"
      >
        <q-badge v-if="!search.empty" class="led-green" floating></q-badge>
        <q-tooltip>{{ $t('label.search') }}</q-tooltip>
      </q-btn>
      <q-btn
        glossy
        round
        dense
        class="q-ma-none q-ml-md"
        color="indigo"
        icon="refresh"
        :loading="table.loading"
        @click="on_refresh_click"
      >
        <q-tooltip>{{ $t('label.refresh') }}</q-tooltip>
      </q-btn>
    </template>

    <template v-slot:no-data="{ message }">
      <div class="full-width row flex-center text-accent q-gutter-sm">
        <q-icon size="2em" name="block" />
        <span class="text-subtitle2">
          {{ message }}
        </span>
      </div>
    </template>

    <template v-slot:loading>
      <q-inner-loading showing color="primary" />
    </template>

    <template v-slot:body-selection="scope">
      <q-btn
        glossy
        round
        dense
        size="sm"
        class="q-ma-none q-ml-xs q-mr-sm"
        color="deep-purple"
        icon="visibility"
        @click="on_view_click(scope)"
      >
        <q-tooltip>{{ $t('label.view') }}</q-tooltip>
      </q-btn>
    </template>
    <template v-slot:pagination="scope">
      <q-btn
        v-if="scope.pagesNumber > 2"
        glossy
        size="sm"
        icon="first_page"
        color="grey-8"
        round
        dense
        flat
        :disable="scope.isFirstPage"
        @click="scope.firstPage"
      />
      <q-btn
        glossy
        size="sm"
        icon="chevron_left"
        color="grey-8"
        class="q-ml-sm q-mr-xs"
        round
        dense
        flat
        :disable="scope.isFirstPage"
        @click="scope.prevPage"
      />
      <q-input
        dense
        borderless
        type="number"
        input-class="text-center q-ml-xs q-mr-xs"
        input-style="max-width: 60px;"
        v-model="table.pagination.page"
        @update:model-value="on_page_changed"
      >
        <template v-if="true === table.pagination.count" v-slot:append>
          <span class="text-caption"> / {{ scope.pagesNumber }}</span>
        </template>
      </q-input>
      <q-btn
        glossy
        size="sm"
        icon="chevron_right"
        color="grey-8"
        class="q-ml-sm q-mr-sm"
        round
        dense
        flat
        :disable="scope.isLastPage"
        @click="scope.nextPage"
      />
      <q-btn
        v-if="scope.pagesNumber > 2 && true === table.pagination.count"
        glossy
        size="sm"
        icon="last_page"
        color="grey-8"
        round
        dense
        flat
        :disable="scope.isLastPage"
        @click="scope.lastPage"
      />
    </template>
  </q-table>

  <q-dialog
    v-model="dialog.search.show"
    persistent
    transition-show="slide-down"
    transition-hide="none"
    backdrop-filter="blur(1px)"
  >
    <Search
      :parameters="dialog.search.parameters"
      @close="on_close_dialog_search"
      :style="dialog.search.style"
      v-touch-pan.mouse="dialog.search.onDrag"
    />
  </q-dialog>

  <q-dialog
    v-model="dialog.view.show"
    persistent
    transition-show="slide-down"
    transition-hide="none"
    backdrop-filter="blur(1px)"
  >
    <View
      :parameters="dialog.view.parameters"
      :style="dialog.view.style"
      v-touch-pan.mouse="dialog.view.onDrag"
    />
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from 'vue'
import { util } from 'src/scripts/util'
import { uix } from 'src/scripts/uix'
import { api } from 'src/scripts/api'
let self

export default {
  components: {
    Search: defineAsyncComponent(() => import('src/pages/AuditSearch.vue')),
    // eslint-disable-next-line vue/no-reserved-component-names
    View: defineAsyncComponent(() => import('src/pages/TableView.vue')),
  },
  setup() {
    return {
      util,
      handler: ref(null),
      manager: ref(null),
      type: ref(null),
      info: ref({}),
      definition: {
        default: {
          visibles: [],
          columns: [],
        },
        entity: {
          visibles: [],
          columns: [],
        },
      },
      table: ref({
        rows: [],
        visibles: [],
        columns: [],
        pagination: {
          page: 1,
          rowsPerPage: 20,
          sortBy: 'entry',
          descending: true,
          count: false,
        },
        loading: false,
      }),
      search: ref({
        filters: [],
        empty: true,
      }),
      dialog: ref({
        search: uix.dialog.init(() => self.dialog.search),
        view: uix.dialog.init(() => self.dialog.view),
      }),
    }
  },

  created() {
    self = this
    self.definition.default = {
      visibles: ['id', 'action', 'replica', 'auditor', 'info', 'type', 'content', 'entry'],
      columns: [
        {
          name: 'entry',
          label: self.$t('label.entry'),
          field: 'entry',
          align: 'left',
          timestamp: true,
          pattern: 'YYYY-MM-DD HH:mm:ss',
          sortable: true,
          format: function (val, row) {
            return util.format.date(util.getFieldValue('entry', row), {
              format: 'YYYY-MM-DD HH:mm:ss',
            })
          },
        },
        {
          name: 'id',
          label: self.$t('label.id'),
          field: 'id',
          align: 'left',
          type: 'java.lang.String',
          sortable: true,
        },
        {
          name: 'action',
          label: self.$t('label.action'),
          field: 'action',
          align: 'left',
          type: 'java.lang.String',
          sortable: true,
        },
        {
          name: 'replica',
          label: self.$t('label.replica'),
          field: 'replica',
          align: 'left',
          type: 'java.lang.Integer',
          sortable: true,
        },
        {
          name: 'auditor',
          label: self.$t('label.auditor'),
          field: 'auditor',
          align: 'left',
          type: 'java.lang.String',
          sortable: true,
        },
        {
          name: 'info',
          label: self.$t('label.info'),
          field: 'info',
          align: 'left',
          type: 'java.lang.String',
          sortable: true,
        },
        {
          name: 'type',
          label: self.$t('label.type'),
          field: 'type',
          align: 'left',
          type: 'java.lang.String',
          sortable: true,
        },
        {
          name: 'content',
          label: self.$t('label.content'),
          field: 'content',
          align: 'left',
          type: 'java.lang.String',
          sortable: true,
        },
      ],
    }
    self.definition.entity = {
      visibles: ['action', 'replica', 'auditor', 'entry'],
      columns: [
        {
          name: 'entry',
          label: self.$t('label.entry'),
          field: 'entry',
          align: 'left',
          timestamp: true,
          pattern: 'YYYY-MM-DD HH:mm:ss',
          sortable: true,
          format: function (val, row) {
            return util.format.date(util.getFieldValue('entry', row), {
              format: 'YYYY-MM-DD HH:mm:ss',
            })
          },
        },
        {
          name: 'action',
          label: self.$t('label.action'),
          field: 'action',
          align: 'left',
          type: 'java.lang.String',
          sortable: true,
        },
        {
          name: 'replica',
          label: self.$t('label.replica'),
          field: 'replica',
          align: 'left',
          type: 'java.lang.Integer',
          sortable: true,
        },
        {
          name: 'auditor',
          label: self.$t('label.auditor'),
          field: 'auditor',
          align: 'left',
          type: 'java.lang.String',
          sortable: true,
        },
        {
          name: 'info',
          label: self.$t('label.info'),
          field: 'info',
          align: 'left',
          type: 'java.lang.String',
          sortable: true,
        },
      ],
    }
    self.do_init()
  },
  beforeUpdate() {
    this.do_init()
  },
  methods: {
    /*
     * GET PAGINATION
     */
    get_pagination(props) {
      let pagination = props?.pagination ? props.pagination : self.table.pagination
      if (pagination) {
        self.table.pagination = pagination
        return pagination
      }
      return self.table.pagination
    },

    /*
     * IS FIELD VISIBLE
     */
    is_field_visible(field) {
      if ('[B' === field.type) {
        return false
      } else if (true === field.lob) {
        return false
      } else if ('java.lang.String' === field.type) {
        return field.length <= 255
      }
      return true
    },

    /*
     * CREATE SEARCH FILTERS
     */
    create_search_filters() {
      let columns = self.table.columns
      let visibles = self.table.visibles
      self.search = {
        filters: [],
        empty: true,
      }
      for (const column of columns) {
        if (visibles.includes(column.name)) {
          let is_push = true
          let filter = {
            name: column.name,
            label: column.label,
            timestamp: column.timestamp,
            pattern: column.pattern,
          }
          if (true === column.timestamp) {
            filter.type = 'datetime'
            filter.condition = 'BETWEEN'
            if (util.isString(column.format)) {
              filter.pattern = column.format
            }
          } else if ('java.lang.String' === column.type) {
            filter.type = column.length > 100 ? 'words' : 'text'
            filter.condition = 'ANY_LIKE'
          } else if ('java.lang.Character' === column.type) {
            filter.type = 'text'
            filter.condition = 'EQUAL'
          } else if ('java.time.LocalDateTime' === column.type) {
            filter.type = 'datetime'
            filter.pattern = column.format
            filter.condition = 'BETWEEN'
          } else if ('java.lang.Integer' === column.type || 'java.lang.Long' === column.type) {
            filter.type = 'number'
            filter.condition = 'EQUAL'
          } else {
            is_push = false
          }
          if (is_push) {
            self.search.filters.push(filter)
          }
        }
      }
    },

    /*
     * INIT
     */
    do_init() {
      let handler = self.$route.query.handler
      let manager = self.$route.query.manager
      let type = self.$route.query.type
      if (handler === self.handler && manager === self.manager && type === self.type) {
        return
      }
      let dateFormat = 'YYYY-MM-DD HH:mm:ss'
      self.handler = handler
      self.manager = manager
      self.type = type
      if ('_' !== self.type) {
        self.table.columns = [...self.definition.entity.columns]
        self.table.visibles = [...self.definition.entity.visibles]
        api.call({
          path: '/audit/info',
          params: {
            handler: self.handler,
            type: self.type,
            manager: self.manager,
          },
          onSuccess(data) {
            if (util.isObject(data)) {
              self.info = data
              for (const field of self.info.fields) {
                if (self.is_field_visible(field)) {
                  self.table.visibles.push('content.' + field.name)
                }
                let is_push = true
                let column = {
                  name: 'content.' + field.name,
                  label: field.label,
                  field: 'content',
                  align: 'left',
                  type: field.type,
                  sortable: true,
                  format: function (data) {
                    let value = util.isObject(data) ? util.getFieldValue(field.name, data) : data
                    value = util.isObject(value) ? JSON.stringify(value) : value
                    return value
                  },
                }
                if (util.isString(field.format)) {
                  column.pattern = field.format
                }
                if (true === self.info.isSoftDelete && 'deletedOn' === field.name) {
                  column.timestamp = true
                  column.pattern = util.isString(field.format) ? field.format : dateFormat
                  column.format = function (val) {
                    try {
                      return util.format.date(util.getFieldValue('deletedOn', val), {
                        format: dateFormat,
                      })
                    } catch {
                      return val
                    }
                  }
                } else if (true === self.info.isAuditEntity) {
                  if ('createdOn' === field.name) {
                    column.timestamp = true
                    column.pattern = util.isString(field.format) ? field.format : dateFormat
                    column.format = function (val) {
                      try {
                        return util.format.date(util.getFieldValue('createdOn', val), {
                          format: dateFormat,
                        })
                      } catch {
                        return val
                      }
                    }
                  } else if ('updatedOn' === field.name) {
                    column.timestamp = true
                    column.pattern = util.isString(field.format) ? field.format : dateFormat
                    column.format = function (val) {
                      try {
                        return util.format.date(util.getFieldValue('updatedOn', val), {
                          format: dateFormat,
                        })
                      } catch {
                        return val
                      }
                    }
                  } else if ('createdBy' === field.name || 'updatedBy' === field.name) {
                    is_push = false
                  }
                }
                if (is_push) {
                  self.table.columns.push(column)
                }
              }
              self.create_search_filters()
              self.do_request()
            }
          },
        })
      } else {
        self.table.columns = [...self.definition.default.columns]
        self.table.visibles = [...self.definition.default.visibles]
        self.create_search_filters()
        self.do_request()
      }
    },

    /*
     * REQUEST
     */
    do_request(props) {
      let { page, rowsPerPage, sortBy, descending } = self.get_pagination(props)
      let filters = []
      let search = self.search
      if (!search.empty) {
        let v1, v2
        for (const filter of search.filters) {
          v1 = util.isDefined(filter.value) ? filter.value : ''
          if ('' === v1) {
            continue
          }
          if ('BETWEEN' === filter.condition) {
            v2 = util.isDefined(filter.value2) ? filter.value2 : ''
            if ('' !== v2) {
              if ('datetime' === filter.type && true === filter.timestamp) {
                v1 = util.parse.epoch(v1, { format: filter.pattern || null })
                v2 = util.parse.epoch(v2, { format: filter.pattern || null })
              }
              filters.push({
                field: filter.name,
                condition: filter.condition,
                values: [v1, v2],
              })
            }
          } else {
            if ('datetime' === filter.type && true === filter.timestamp) {
              v1 = util.parse.epoch(v1, { format: filter.pattern || null })
            }
            let or = filter.or
            if (util.isString[or]) {
              or = [or]
            }
            or = util.isArray(or) ? or : []
            if (or.length) {
              let qor = { logical: 'and', filters: [] }
              for (let j = 0; j < or.length; j++) {
                qor.filters.push({
                  field: or[j],
                  logical: j === 0 ? 'and' : 'or',
                  condition: filter.condition,
                  value: v1,
                })
              }
              filters.push(qor)
            } else {
              filters.push({
                field: filter.name,
                condition: filter.condition,
                value: v1,
              })
            }
          }
        }
      }
      let body = {
        page: {
          index: page,
          size: rowsPerPage,
          count: true === self.table.pagination.count,
        },
        filters: filters,
        manager: self.manager,
      }
      if ('_' !== self.type) {
        body.entity = self.type
      }
      if (sortBy) {
        body.orders = [(descending ? '-' : '') + sortBy]
      }
      self.table.loading = true
      api.call({
        path: '/audit/list',
        method: 'post',
        params: {
          handler: self.handler,
        },
        data: body,
        onFinish() {
          self.table.loading = false
        },
        onSuccess(data) {
          if (util.isObject(data)) {
            self.table.rows = util.isArray(data.data) ? data.data : []
            let pagination = self.table.pagination
            pagination.page = data.index
            pagination.rowsPerPage = data.size
            if (util.isNumber(data.records)) {
              pagination.rowsNumber = data.records
            } else {
              let rowsNumber = data.index * data.size
              if (self.table.rows.length !== data.size) {
                pagination.rowsNumber = rowsNumber
              } else {
                pagination.rowsNumber = rowsNumber + 1
              }
            }
          }
        },
      })
    },

    /*
     * SEARCH CLICK
     */
    on_search_click() {
      uix.dialog.show(self.dialog.search, {
        filters: self.search.filters,
      })
    },

    /*
     * CLOSE SEARCH DIALOG
     */
    on_close_dialog_search(filters) {
      if (util.isArray(filters)) {
        let search = self.search
        search.filters = filters
        search.empty = true
        for (const filter of search.filters) {
          let v1 = util.isDefined(filter.value) ? filter.value : ''
          let v2 = util.isDefined(filter.value2) ? filter.value2 : ''
          if ('' !== v1 || '' !== v2) {
            search.empty = false
            break
          }
        }
        uix.dialog.hide(self.dialog.search)
        self.table.pagination.page = 1
        self.do_request({
          pagination: self.table.pagination,
        })
      }
    },

    /*
     * REFRESH CLICK
     */
    on_refresh_click() {
      if (!self.table.rows?.length) {
        if (self.table.pagination.page > 1) {
          self.table.pagination.page = 1
        }
      }
      self.do_request({
        pagination: self.table.pagination,
      })
    },

    /*
     * VIEW CLICK
     */
    on_view_click(scope) {
      uix.dialog.show(self.dialog.view, {
        scope: scope,
        columns: self.table.columns,
      })
    },

    /*
     * PAGE CHANGED
     */
    on_page_changed() {
      let page = +self.table.pagination.page
      if (!isNaN(page) && page > 0) {
        self.do_request({
          pagination: self.table.pagination,
        })
      }
    },
  },
}
</script>
