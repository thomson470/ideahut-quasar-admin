<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-table
    class="table-sticky-header q-ma-sm"
    :rows="table.rows"
    :columns="table.columns"
    :row-key="'name'"
    :loading="table.loading"
    :selection="'single'"
    v-model:selected="table.selected"
    v-model:pagination="table.pagination"
    :dense="$q.screen.lt.md"
    :no-data-label="$t('error.data_not_available')"
    rows-per-page-label=" "
    :selected-rows-label="(selected) => {}"
    binary-state-sort
    :separator="'cell'"
    bordered
  >
    <template v-slot:top>
      <q-space />
      <q-btn
        glossy
        round
        dense
        class="q-ma-none q-ml-md"
        color="indigo"
        icon="refresh"
        :loading="table.loading"
        @click="do_request"
      >
        <q-tooltip>{{ $t("label.refresh") }}</q-tooltip>
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
      <div v-if="0 !== scope.row.limit">
        <q-btn
          glossy
          round
          dense
          size="sm"
          class="q-ma-none q-ml-xs q-mr-sm"
          color="deep-orange-10"
          icon="clear_all"
          :loading="table.clearing[scope.row.name]"
          @click="on_clear_click(scope)"
        >
          <q-tooltip>{{ $t("label.clear") }}</q-tooltip>
        </q-btn>
        <q-btn
          glossy
          round
          dense
          size="sm"
          class="q-ma-none q-ml-xs q-mr-sm"
          color="primary"
          icon="list_alt"
          @click="on_keys_click(scope)"
        >
          <q-tooltip>{{ $t("label.keys") }}</q-tooltip>
        </q-btn>
      </div>
    </template>

    <template v-slot:body-cell="props">
      <q-td :props="props">
        <span>
          {{ props.value }}
          <q-badge
            v-if="'label' === props.col.name && true === props.row.isDefault"
            color="orange"
            rounded
            align="top"
            transparent
          />
        </span>
      </q-td>
    </template>
  </q-table>

  <q-dialog
    v-model="dialog.keys.show"
    persistent
    transition-show="slide-down"
    transition-hide="none"
    backdrop-filter="blur(1px)"
  >
    <Keys :parameters="dialog.keys.parameters" />
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";
let self;

export default {
  components: {
    Keys: defineAsyncComponent(() => import("src/pages/CacheKeys.vue")),
  },
  setup() {
    return {
      util,
      type: ref(null),
      handler: ref(null),
      columns: {
        single: [],
        group: [],
      },

      table: ref({
        rows: [],
        columns: [],
        loading: false,
        clearing: {},
        pagination: {
          page: 1,
          rowsPerPage: 10,
        },
      }),

      dialog: ref({
        keys: uix.dialog.init(),
      }),
    };
  },

  created() {
    self = this;
    (self.columns = {
      single: [
        {
          name: "label",
          label: self.$t("label.name"),
          field: "label",
          align: "left",
          sortable: true,
        },
        {
          name: "limit",
          label: self.$t("label.limit"),
          field: "limit",
          align: "left",
          sortable: true,
        },
        {
          name: "nullable",
          label: self.$t("label.nullable"),
          field: "nullable",
          align: "left",
          sortable: true,
        },
      ],
      group: [
        {
          name: "label",
          label: self.$t("label.group"),
          field: "label",
          align: "left",
          sortable: true,
        },
        {
          name: "limit",
          label: self.$t("label.limit"),
          field: "limit",
          align: "left",
          sortable: true,
        },
        {
          name: "nullable",
          label: self.$t("label.nullable"),
          field: "nullable",
          align: "left",
          sortable: true,
        },
        {
          name: "expiry",
          label: self.$t("label.expiry"),
          field: "expiry",
          align: "left",
          sortable: true,
        },
      ],
    }),
      self.do_init();
  },
  beforeUpdate() {
    this.do_init();
  },
  methods: {
    /*
     * INIT
     */
    do_init() {
      let type = self.$route.query.type;
      let handler = self.$route.query.handler;
      if (type === self.type && handler === self.handler) {
        return;
      }
      self.type = type;
      self.handler = handler;
      self.do_request();
    },

    /*
     * REQUEST
     */
    do_request() {
      self.table.loading = true;
      api.call({
        path: "/cache/info",
        params: {
          type: self.type,
          handler: self.handler,
        },
        onFinish() {
          self.table.loading = false;
        },
        onSuccess(data, info) {
          info = util.isObject(info) ? info : {};
          if ("group" === info.type) {
            data = util.isObject(data) ? data : {};
            let groups = util.isObject(data.groups) ? data.groups : {};
            self.table.columns = self.columns.group;
            self.table.columns[1].format = (val) => {
              return 0 === val ? self.$t("label.unlimited") : val;
            };
            self.table.columns[3].format = (val) => {
              return val?.value && val.value > 0
                ? val.value + "  (" + val.unit + ")"
                : self.$t("label.never_expire");
            };
            self.table.rows = [];
            Object.keys(groups).forEach((key) => {
              let group = groups[key];
              self.table.rows.push({
                name: group.name,
                label: group.name,
                limit: group.limit,
                nullable: group.nullable,
                expiry: group.expiry,
                is_group: true,
              });
              self.table.clearing[group.name] = false;
            });
          } else if ("single" == info.type) {
            self.table.columns = self.columns.single;
            self.table.columns[1].format = (val) => {
              return 0 === val ? self.$t("label.unlimited") : val;
            };
            self.table.rows = util.isArray(data) ? data : [];
            for (const row of self.table.rows) {
              self.table.clearing[row.name] = false;
              row.is_group = false;
            }
          }
        },
      });
    },

    /*
     * CLEAR
     */
    on_clear_click(scope) {
      uix.confirm(
        function () {
          let info;
          if (scope.row.is_group) {
            info = {
              name: self.handler,
              group: scope.row.name,
            };
          } else {
            info = {
              name: scope.row.name,
            };
          }
          self.table.clearing[scope.row.name] = true;
          api.call({
            path: "/cache/clear",
            method: "post",
            data: {
              info: info,
            },
            onSuccess() {
              setTimeout(function () {
                self.table.clearing[scope.row.name] = false;
                self.do_request();
              }, 500);
            },
            onError() {
              self.table.clearing[scope.row.name] = false;
            },
            notify: true,
          });
        },
        "confirm.clear",
        scope.row.label,
      );
    },

    /*
     * KEYS CLICK
     */
    on_keys_click(scope) {
      uix.dialog.show(self.dialog.keys, {
        title: scope.row.label,
        name: scope.row.is_group ? self.handler : scope.row.name,
        group: scope.row.is_group ? scope.row.name : null,
      });
    },
  },
};
</script>
