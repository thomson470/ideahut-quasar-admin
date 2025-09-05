<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-table
    class="table-sticky-header q-ma-sm"
    :rows="table.rows"
    :columns="table.columns"
    :visible-columns="table.visibles"
    :row-key="'_pk_'"
    :loading="table.loading"
    :selection="
      crud.isObject(template.table) ? template.table.selection : 'single'
    "
    v-model:selected="table.selected"
    v-model:pagination="table.pagination"
    :dense="$q.screen.lt.md"
    :no-data-label="$t('error.data_not_available')"
    rows-per-page-label=" "
    :selected-rows-label="(selected) => {}"
    :rows-per-page-options="
      crud.isObject(template.table) && template.table.page?.options
        ? template.table.page.options
        : [10, 20, 30]
    "
    @request="do_request"
    binary-state-sort
    :separator="
      crud.isObject(template.table) ? template.table.separator : 'cell'
    "
    bordered
  >
    <template v-slot:top>
      <q-btn
        v-if="
          crud.isObject(template.table) &&
          'multiple' === template.table.selection &&
          crud.permission.delete(permission)
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
      >
        <q-tooltip>{{ $t("label.delete") }}</q-tooltip>
      </q-btn>
      <q-btn
        v-if="crud.permission.add(permission)"
        glossy
        round
        dense
        class="q-ma-none q-mr-md"
        color="teal"
        icon="add"
        @click="on_add_click"
      >
        <q-tooltip>{{ $t("label.new") }}</q-tooltip>
      </q-btn>
      <q-space />
      <q-select
        v-if="template.replicas?.length"
        v-model="replica"
        :options="template.replicas"
        borderless
        class="text-h6"
        dense
        @update:model-value="on_replica_changed"
      >
        <template v-slot:prepend>
          <q-icon name="storage" class="q-mr-sm" />
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label class="text-h6">{{ scope.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
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
        <q-tooltip>{{ $t("label.search") }}</q-tooltip>
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
        <q-tooltip>{{ $t("label.refresh") }}</q-tooltip>
      </q-btn>
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
          crud.isObject(template.table) &&
          'multiple' === template.table.selection &&
          crud.permission.deletes(permission)
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
          crud.isObject(template.table) &&
          'multiple' === template.table.selection &&
          crud.permission.deletes(permission)
        "
        dense
        color="primary"
        class="q-ma-none q-ml-sm q-mr-sm"
        v-model="scope.selected"
      />
      <q-btn
        v-else-if="
          crud.isObject(template.table) && crud.permission.delete(permission)
        "
        glossy
        round
        dense
        size="sm"
        class="q-ma-none q-ml-xs q-mr-sm"
        color="negative"
        icon="delete"
        @click="on_delete_click(scope)"
      >
        <q-tooltip>{{ $t("label.delete") }}</q-tooltip>
      </q-btn>
      <q-btn
        v-if="crud.permission.edit(permission)"
        glossy
        round
        dense
        size="sm"
        class="q-ma-none q-ml-xs q-mr-sm"
        color="primary"
        icon="drive_file_rename_outline"
        @click="on_edit_click(scope)"
      >
        <q-tooltip>{{ $t("label.edit") }}</q-tooltip>
      </q-btn>
      <q-btn
        v-if="crud.permission.view(permission)"
        glossy
        round
        dense
        size="sm"
        class="q-ma-none q-ml-xs q-mr-sm"
        color="deep-purple"
        icon="visibility"
        @click="on_view_click(scope)"
      >
        <q-tooltip>{{ $t("label.view") }}</q-tooltip>
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
            crud.isObject(template.table) && crud.isObject(template.table.page)
              ? true === template.table.page.count
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

  <q-inner-loading :showing="is_template_loading">
    <q-spinner-gears size="80px" color="primary" />
  </q-inner-loading>

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
    <View :parameters="dialog.view.parameters" />
  </q-dialog>

  <q-dialog
    v-model="dialog.edit.show"
    persistent
    transition-show="slide-down"
    transition-hide="none"
    backdrop-filter="blur(1px)"
  >
    <Edit :parameters="dialog.edit.parameters" @close="on_close_dialog_edit" />
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
import { crud } from "src/pages/grid/Crud";
let self;
const PREFIX = crud.uuid();
window.$h = crud.$h;
window.$g = {};
window.$k = [];

const addGrid = (id, template) => {
  window.$k.push(id);
  window.$g[id] = template;
  let diff = window.$k.length - 10;
  if (diff > 0) {
    const keys = window.$k.splice(0, diff);
    for (const key of keys) {
      delete window.$g[key];
    }
  }
};

export default {
  components: {
    Search: defineAsyncComponent(() => import("src/pages/grid/Search.vue")),
    // eslint-disable-next-line vue/no-reserved-component-names
    View: defineAsyncComponent(() => import("src/pages/grid/View.vue")),
    Edit: defineAsyncComponent(() => import("src/pages/grid/Edit.vue")),
  },

  setup() {
    return {
      crud,
      is_template_loading: ref(false),
      template: ref({}),
      permission: ref({}),
      parent: ref(null),
      name: ref(null),
      replica: ref(null),
      replica_changed: ref(false),
      dialog: ref({
        search: crud.dialog.init(() => self.dialog.search),
        view: crud.dialog.init(),
        edit: crud.dialog.init(),
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
      }),
    };
  },
  created() {
    self = this;
    self.do_load_grid();
  },
  beforeUpdate() {
    this.do_load_grid();
  },

  methods: {
    /*
     * LOAD GRID
     */
    do_load_grid() {
      if (!crud.isObject(window.$g)) {
        window.$g = {};
      }
      let parent = crud.get.string(self.$route.query.parent, "_");
      let name = crud.get.string(self.$route.query.name, "");
      if (parent === self.parent && name === self.name) {
        return;
      }
      self.parent = parent;
      self.name = name;
      self.replica = null;
      let id = PREFIX + "_" + parent + "_" + name;
      if (!window.$g[id]) {
        if (!self.is_template_loading) {
          self.is_template_loading = true;
          crud.api.call({
            path: "/grid",
            params: {
              name: name,
              parent: parent,
            },
            onSuccess(data) {
              try {
                let template = crud.get.object(data);
                template._grid_id_ = id;

                // table
                let table = crud.get.object(template.table);
                crud.prepare.toFunction(table.columns);
                template.table = table;

                // fields
                let fields = crud.get.array(template.fields);
                crud.prepare.toFunction(fields);
                template.fields = fields;

                // children
                let children = crud.get.array(template.children);
                crud.prepare.children(children);
                template.children = children;

                // enums
                let enums = crud.get.object(template.enums);
                crud.prepare.options(enums);
                template.enums = enums;

                // options
                let options = crud.get.object(template.options);
                crud.prepare.options(options);
                template.options = options;

                // forms
                let forms = crud.get.array(template.forms);
                crud.prepare.forms(forms);
                template.forms = forms;

                // picks
                let picks = crud.get.object(template.picks);
                crud.prepare.picks(picks);
                template.picks = picks;

                // simpan grid ke window.$g
                addGrid(id, template);
                self.template = window.$g[id];
                self.replica = crud.get.firstArray(self.template.replicas);
                self.replica_changed = false;
                self.permission = self.get_permission();
                self.do_load_data();
              } catch (e) {
                crud.log("<<get-grid-1::" + id + ">>", e);
              }
              self.is_template_loading = false;
            },
            notify: true,
            onError() {
              self.is_template_loading = false;
            },
          });
        }
      } else {
        self.template = window.$g[id];
        self.replica = crud.get.firstArray(self.template.replicas);
        self.replica_changed = false;
        self.permission = self.get_permission();
        try {
          self.do_load_data();
        } catch (e) {
          crud.log("<<get-grid-2::" + id + ">>", e);
        }
      }
    },

    /*
     * GET PERMISSION
     */
    get_permission() {
      let template = self.template;
      let table = crud.get.object(template.table);
      let permission = { actions: crud.copy(template.actions) };
      let excludes = table?.action?.exclude ? table.action.exclude : [];
      permission.actions = template.actions.filter(
        (x) => !excludes.includes(x),
      );
      return permission;
    },

    /*
     * LOAD DATA
     */
    do_load_data() {
      self.table = {
        rows: [],
        columns: [{ name: "_pk_" }],
        visibles: ["_pk_"],
        selected: [],
        pagination: {},
        loading: false,
        deleting: false,
      };
      let template = self.template;
      let table = crud.get.object(template.table);
      let page = crud.get.object(table.page);
      let order = crud.get.object(table.order);
      if (true !== self.replica_changed) {
        self.search = {
          empty: true,
          filters: crud.copy(crud.get.array(table.filters)),
        };
      }
      self.table.pagination = {
        page: 1,
        rowsPerPage: page.default,
        sortBy: order.field,
        descending: true === order.descending,
      };
      self.table.columns = table.columns;
      self.table.visibles = table.visibles;
      self.do_request({
        pagination: self.table.pagination,
      });
    },

    /*
     * REQUEST
     */
    do_request(props) {
      crud.action.page({
        props: props,
        table: self.table,
        search: self.search,
        definition: self.template,
        replica: self.replica,
      });
    },

    /*
     * REFRESH CLICK
     */
    on_refresh_click() {
      self.do_request({
        pagination: self.table.pagination,
      });
    },

    /*
     * DELETE CLICK
     */
    on_delete_click(scope) {
      crud.action.delete({
        row: scope.row,
        definition: self.template,
        table: self.table,
        replica: self.replica,
        onSuccess: function () {
          self.do_request({
            pagination: self.table.pagination,
          });
        },
        onProgress: (deleting) => (self.table.deleting = deleting),
      });
    },

    /*
     * SEARCH CLICK
     */
    on_search_click() {
      crud.dialog.show(self.dialog.search, {
        filters: crud.copy(self.search.filters),
        template: self.template,
      });
    },

    /*
     * CLOSE SEARCH DIALOG
     */
    on_close_dialog_search(filters) {
      if (crud.isArray(filters)) {
        let search = self.search,
          v1,
          v2;
        search.filters = filters;
        search.empty = true;
        for (const element of search.filters) {
          v1 = crud.isDefined(element.value) ? element.value : "";
          v2 = crud.isDefined(element.value2) ? element.value2 : "";
          if ("" !== v1 || "" !== v2) {
            search.empty = false;
            break;
          }
        }
        crud.dialog.hide(self.dialog.search);
        self.table.pagination.page = 1;
        self.do_request({
          pagination: self.table.pagination,
        });
      }
    },

    /*
     * VIEW CLICK
     */
    on_view_click(scope) {
      crud.dialog.show(self.dialog.view, {
        template: self.template,
        replica: self.replica,
        row: scope.row,
      });
    },

    /*
     * EDIT CLICK
     */
    on_edit_click(scope) {
      crud.dialog.show(self.dialog.edit, {
        template: self.template,
        replica: self.replica,
        row: scope.row,
        index: scope.rowIndex,
      });
    },

    /*
     * ADD CLICK
     */
    on_add_click() {
      crud.dialog.show(self.dialog.edit, {
        template: self.template,
        replica: self.replica,
      });
    },

    /*
     * CLOSE EDIT DIALOG
     */
    on_close_dialog_edit(result) {
      let row = result?.row;
      if (row) {
        if (result.is_edit) {
          if (crud.isDefined(row._pk_)) {
            self.table.rows[result.index] = row;
          } else {
            crud.dialog.hide(self.dialog.edit);
            setTimeout(function () {
              crud.dialog.show(self.dialog.edit, {
                template: self.template,
                replica: self.replica,
                row: row,
              });
            }, 100);
            return;
          }
        } else {
          self.do_request({
            pagination: self.table.pagination,
          });
        }
      }
      crud.dialog.hide(self.dialog.edit);
    },

    /*
     * PAGE CHANGED
     */
    on_page_changed() {
      let page = +self.table.pagination.page;
      if (!isNaN(page) && page > 0) {
        self.do_request({
          pagination: self.table.pagination,
        });
      }
    },

    /*
     * REPLICA CHANGED
     */
    on_replica_changed() {
      self.replica_changed = true;
      self.do_load_data();
    },
  },
};
</script>
