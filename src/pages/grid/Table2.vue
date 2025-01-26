<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-card
    class="background-layout"
    :style="'min-width: 60vw; max-width: 90vw;' + dialog.main.style"
  >
    <q-card-section
      class="q-pa-none header-main"
      :style="APP?.color?.header ? 'background: ' + APP.color.header + ' !important;' : ''"
      v-touch-pan.mouse="dialog.main.onDrag"
    >
      <q-item class="q-pr-none">
        <q-item-section>
          <q-item-label class="text-h6 text-white">{{
            template.title + ' - ' + definition.title
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            class="text-caption text-white q-pl-xs q-pr-xs q-mr-xs"
            flat
            round
            glossy
            icon="close"
            @click="on_close_click"
          >
            <q-tooltip>{{ $t('label.close') }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-card-section>
    <q-card-section v-if="labels?.length" class="q-pa-sm q-mt-xs">
      <q-chip
        v-for="(label, index) in labels"
        :key="index"
        :color="chips[index % chips.length]"
        text-color="white"
        class="ellipsis-text"
      >
        <strong
          ><span>{{ label.title }}:</span></strong
        >
        <span class="q-ml-sm">{{ label.value }}</span>
      </q-chip>
    </q-card-section>
    <q-card-section style="max-height: 80vh; overflow-y: scroll !important" class="q-pa-xs">
      <q-table
        class="table-sticky-header q-ma-sm"
        :rows="table.rows"
        :columns="table.columns"
        :visible-columns="table.visibles"
        :row-key="'_pk_'"
        :loading="table.loading"
        :selection="util.isObject(definition.table) ? definition.table.selection : 'single'"
        v-model:selected="table.selected"
        v-model:pagination="table.pagination"
        :dense="$q.screen.lt.md"
        :no-data-label="$t('error.data_not_available')"
        rows-per-page-label=" "
        :selected-rows-label="(selected) => {}"
        :rows-per-page-options="
          util.isObject(definition.table) && definition.table.page?.options
            ? definition.table.page.options
            : [10, 20, 30]
        "
        @request="do_request"
        binary-state-sort
        :separator="util.isObject(definition.table) ? definition.table.separator : 'cell'"
        bordered
        style="max-height: 72vh"
      >
        <template v-slot:top>
          <q-btn
            v-if="
              util.isObject(definition.table) &&
              'multiple' === definition.table.selection &&
              fxGrid.permission.deletes(permission) &&
              !onlyView
            "
            glossy
            round
            dense
            class="q-ma-none q-mr-md"
            color="negative"
            icon="delete"
            :disable="!table.selected.length"
            :loading="table.deleting"
            @click="on_delete_click"
          />
          <q-btn
            v-if="fxGrid.permission.add(permission) && !onlyView"
            glossy
            round
            dense
            class="q-ma-none q-mr-md"
            color="teal"
            icon="add"
            @click="on_add_click"
          />
          <q-space />
          <q-btn
            v-if="search.filters?.length"
            glossy
            round
            dense
            class="q-ma-none q-ml-md"
            color="deep-orange"
            icon="search"
            @click="on_search_click"
          >
            <q-badge v-if="!search.empty" class="led-green" floating></q-badge>
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
          />
        </template>

        <template v-slot:no-data="{ message }">
          <div class="full-width row flex-center text-accent q-gutter-sm">
            <q-icon size="2em" name="block" />
            <span class="text-subtitle2">{{ message }}</span>
          </div>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <template v-slot:header-selection="scope">
          <div
            v-if="
              util.isObject(definition.table) &&
              'multiple' === definition.table.selection &&
              fxGrid.permission.deletes(permission) &&
              !onlyView
            "
            class="text-left"
          >
            <q-checkbox
              dense
              color="primary"
              class="q-ma-none q-ml-sm q-mr-sm"
              v-model="scope.selected"
            />
          </div>
        </template>

        <template v-slot:body-selection="scope">
          <q-checkbox
            v-if="
              util.isObject(definition.table) &&
              'multiple' === definition.table.selection &&
              fxGrid.permission.deletes(permission) &&
              !onlyView
            "
            dense
            color="primary"
            class="q-ma-none q-ml-sm q-mr-sm"
            v-model="scope.selected"
          />
          <q-btn
            v-else-if="
              util.isObject(definition.table) && fxGrid.permission.delete(permission) && !onlyView
            "
            glossy
            round
            dense
            size="sm"
            class="q-ma-none q-ml-xs q-mr-sm"
            color="negative"
            icon="delete"
            @click="on_delete_click(scope)"
          />
          <q-btn
            v-if="fxGrid.permission.edit(permission) && !onlyView"
            glossy
            round
            dense
            size="sm"
            class="q-ma-none q-ml-xs q-mr-sm"
            color="primary"
            icon="drive_file_rename_outline"
            @click="on_edit_click(scope)"
          />
          <q-btn
            v-if="fxGrid.permission.view(permission)"
            glossy
            round
            dense
            size="sm"
            class="q-ma-none q-ml-xs q-mr-sm"
            color="deep-purple"
            icon="visibility"
            @click="on_view_click(scope)"
          />
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
            <template
              v-if="
                util.isObject(definition.table) && util.isObject(definition.table.page)
                  ? true === definition.table.page.count
                  : false
              "
              v-slot:append
            >
              <span class="text-caption"> / {{ scope.pagesNumber }}</span>
            </template>
          </q-input>
          <q-btn
            glossy
            size="sm"
            icon="chevron_right"
            color="grey-8"
            round
            dense
            flat
            :disable="scope.isLastPage"
            @click="scope.nextPage"
          />
          <q-btn
            v-if="scope.pagesNumber > 2"
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
    </q-card-section>
  </q-card>

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
    transition-show="slide-down"
    transition-hide="none"
    backdrop-filter="blur(1px)"
  >
    <View2 :parameters="dialog.view.parameters" />
  </q-dialog>

  <q-dialog
    v-model="dialog.edit.show"
    persistent
    transition-show="slide-down"
    transition-hide="none"
    backdrop-filter="blur(1px)"
  >
    <Edit2 :parameters="dialog.edit.parameters" @close="on_close_dialog_edit" />
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from 'vue'
import { APP } from 'src/scripts/static'
import { util } from 'src/scripts/util'
import { uix } from 'src/scripts/uix'
import { grid as fxGrid } from 'src/scripts/grid'
let self

export default {
  props: ['parameters'],
  emits: ['close'],
  components: {
    Search: defineAsyncComponent(() => import('src/pages/grid/Search.vue')),
    View2: defineAsyncComponent(() => import('src/pages/grid/View2.vue')),
    Edit2: defineAsyncComponent(() => import('src/pages/grid/Edit2.vue')),
  },

  setup() {
    return {
      APP,
      uix,
      util,
      fxGrid,

      template: ref({}),
      definition: ref({}),
      permission: ref({}),
      parentRow: ref({}),
      relations: ref([]),
      onlyView: ref(false),
      replica: ref(null),

      labels: ref([]),
      chips: [
        'red-10',
        'deep-purple-10',
        'light-blue-10',
        'brown-10',
        'deep-orange-10',
        'blue-grey-10',
      ],

      dialog: ref({
        main: uix.dialog.init(() => self.dialog.main),
        search: uix.dialog.init(() => self.dialog.search),
        view: uix.dialog.init(),
        edit: uix.dialog.init(),
      }),

      search: ref({
        filters: [],
        empty: true,
      }),

      table: ref({
        rows: [],
        columns: [],
        visibles: [],
        selected: [],
        pagination: {},
        loading: false,
        deleting: false,
        separator: 'none',
      }),
    }
  },

  created() {
    self = this
    let params = fxGrid.get.object(self.parameters)
    self.template = fxGrid.get.object(params.template)
    self.definition = fxGrid.get.object(params.definition)
    self.parentRow = fxGrid.get.object(params.parentRow)
    self.relations = fxGrid.get.array(params.relations)
    self.replica = fxGrid.get.number(params.replica, null)
    self.onlyView = true === params.onlyView
    self.permission = { actions: fxGrid.copy(self.template.actions) }
    let excludes = self.definition?.action?.exclude ? self.definition.action.exclude : []
    self.permission.actions = self.template.actions.filter((x) => !excludes.includes(x))

    self.search = {
      empty: true,
      filters: fxGrid.copy(fxGrid.get.array(self.definition.table.filters)),
    }
    self.table = {
      rows: [],
      columns: self.definition.table.columns,
      visibles: self.definition.table.visibles,
      selected: [],
      pagination: {
        page: 1,
        rowsPerPage: self.definition.table.page.default,
        sortBy: self.definition.table.order.field,
        descending: true === self.definition.table.order.descending,
      },
      loading: false,
      deleting: false,
      separator: util.isString(self.definition.table.separator)
        ? self.definition.table.separator
        : 'none',
    }
    self.labels = []
    if (util.isArray(self.definition.labels)) {
      for (const element of self.definition.labels) {
        let label = fxGrid.copy(element)
        if (util.isString(label.value)) {
          label.value = util.getFieldValue(label.value, self.parentRow)
          self.labels.push(label)
        }
      }
    }
    self.do_request({
      pagination: self.table.pagination,
    })
  },

  methods: {
    /*
     * REQUEST
     */
    do_request(props) {
      fxGrid.action.page({
        props: props,
        table: self.table,
        search: self.search,
        definition: self.definition,
        replica: true === self.definition.enableReplica ? self.replica : null,
        relations: self.relations,
      })
    },

    /*
     * CLOSE CLICK
     */
    on_close_click() {
      self.$emit('close')
    },

    /*
     * REFRESH CLICK
     */
    on_refresh_click() {
      self.do_request({
        pagination: self.table.pagination,
      })
    },

    /*
     * DELETE CLICK
     */
    on_delete_click(scope) {
      fxGrid.action.delete({
        row: scope.row,
        definition: self.definition,
        table: self.table,
        deleting: self.deleting,
        replica: self.replica,
        onSuccess: function () {
          self.do_request({
            pagination: self.table.pagination,
          })
        },
      })
    },

    /*
     * SEARCH CLICK
     */
    on_search_click() {
      uix.dialog.show(self.dialog.search, {
        filters: fxGrid.copy(self.search.filters),
        template: self.template,
      })
    },

    /*
     * CLOSE SEARCH DIALOG
     */
    on_close_dialog_search(filters) {
      if (util.isArray(filters)) {
        let search = self.search,
          v1,
          v2
        search.filters = filters
        search.empty = true
        for (const element of search.filters) {
          v1 = util.isDefined(element.value) ? element.value : ''
          v2 = util.isDefined(element.value2) ? element.value2 : ''
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
     * VIEW CLICK
     */
    on_view_click(scope) {
      uix.dialog.show(self.dialog.view, {
        parentRow: self.parentRow,
        row: scope.row,
        template: self.template,
        replica: self.replica,
        definition: self.definition,
      })
    },

    /*
     * EDIT CLICK
     */
    on_edit_click(scope) {
      uix.dialog.show(self.dialog.edit, {
        parentRow: self.parentRow,
        row: scope.row,
        template: self.template,
        replica: self.replica,
        definition: self.definition,
        index: scope.rowIndex,
        relations: self.relations,
      })
    },

    /*
     * ADD CLICK
     */
    on_add_click() {
      uix.dialog.show(self.dialog.edit, {
        parentRow: self.parentRow,
        template: self.template,
        replica: self.replica,
        definition: self.definition,
        relations: self.relations,
      })
    },

    /*
     * CLOSE EDIT DIALOG
     */
    on_close_dialog_edit(result) {
      let row = result.row
      if (row) {
        if (result.is_edit) {
          if (util.isDefined(row._pk_)) {
            self.table.rows[result.index] = row
          } else {
            uix.dialog.hide(self.dialog.edit)
            setTimeout(function () {
              uix.dialog.show(self.dialog.edit, {
                row: row,
                parentRow: self.parentRow,
                template: self.template,
                replica: self.replica,
                definition: self.definition,
                relations: self.relations,
              })
            }, 100)
            return
          }
        } else {
          self.do_request({
            pagination: self.table.pagination,
          })
        }
      }
      uix.dialog.hide(self.dialog.edit)
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
