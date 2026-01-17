<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-table
    class="table-sticky-header q-ma-sm"
    :rows="table.rows"
    :columns="table.columns"
    :loading="table.loading"
    :selection="'single'"
    :dense="$q.screen.lt.md"
    :no-data-label="$t('error.data_not_available')"
    rows-per-page-label=" "
    :rows-per-page-options="[10, 20, 30, 40, 50]"
    binary-state-sort
    :separator="'cell'"
    v-model:pagination="table.pagination"
    @request="do_request"
    bordered
  >
    <template v-slot:top-right>
      <q-btn
        glossy
        round
        dense
        class="q-ma-none q-ml-md"
        color="deep-orange"
        icon="search"
        @click="on_search_dialog_click"
      >
        <q-badge
          v-if="Object.keys(table.filters).length"
          class="led-green"
          floating
        ></q-badge>
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

    <template v-slot:body-selection="scope">
      <q-btn
        glossy
        round
        dense
        size="sm"
        class="q-ma-none q-ml-xs q-mr-sm"
        color="lime-10"
        icon="dns"
        @click="on_listener_click(scope)"
      >
        <q-tooltip>{{ $t("label.listener") }}</q-tooltip>
      </q-btn>
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
        <q-tooltip>{{ $t("label.view") }}</q-tooltip>
      </q-btn>
    </template>
  </q-table>

  <!-- VIEW DIALOG -->
  <q-dialog
    v-model="dialog.view.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
  >
    <KeyValue
      :parameters="dialog.view.parameters"
      :style="dialog.view.style"
      v-touch-pan.mouse="dialog.view.onDrag"
    />
  </q-dialog>

  <!-- PROPERTIES DIALOG -->
  <q-dialog
    v-model="dialog.properties.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
  >
    <KeyValue
      :parameters="dialog.properties.parameters"
      :style="dialog.properties.style"
      v-touch-pan.mouse="dialog.properties.onDrag"
    />
  </q-dialog>

  <!-- LISTENER -->
  <q-dialog
    v-model="dialog.listener.show"
    persistent
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
  >
    <Listener :parameters="dialog.listener.parameters" />
  </q-dialog>

  <!-- SEARCH DIALOG -->
  <q-dialog
    v-model="dialog.search.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
    persistent
  >
    <q-card
      :style="
        'width: ' + ($q.screen.lt.md ? '100%;' : '50%;') + dialog.search.style
      "
    >
      <q-card-section
        class="q-pa-none header-main"
        :style="
          APP?.color?.header
            ? 'background: ' + APP.color.header + ' !important;'
            : ''
        "
        v-touch-pan.mouse="dialog.search.onDrag"
      >
        <q-item class="q-pr-none">
          <q-item-section>
            <q-item-label class="text-h6 text-white">{{
              $t("label.search")
            }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              class="text-caption text-white q-pl-xs q-pr-xs q-mr-xs"
              flat
              round
              glossy
              icon="close"
              v-close-popup
            >
              <q-tooltip>{{ $t("label.close") }}</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-section style="max-height: 70vh" class="q-pa-xs q-mt-xs scroll">
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.groupId"
            type="text"
            :label="$t('label.group_id')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.topicName"
            type="text"
            :label="$t('label.topic')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.keyType"
            type="text"
            :label="$t('label.key_type')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.keyDeserializer"
            type="text"
            :label="$t('label.key_deserializer')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.valueType"
            type="text"
            :label="$t('label.value_type')"
            filled
            class="q-mb-xs"
          />
        </q-form>
        <q-form @submit="on_search_filter_click" @reset="on_search_reset_click">
          <q-input
            v-model="table.filters.valueDeserializer"
            type="text"
            :label="$t('label.value_deserializer')"
            filled
            class="q-mb-xs"
          />
        </q-form>
      </q-card-section>
      <q-separator />
      <q-card-actions class="row">
        <div class="col-6 q-pr-xs text-left">
          <q-btn
            :label="$t('label.reset')"
            color="orange"
            no-caps
            glossy
            @click="on_search_reset_click"
          />
        </div>
        <div class="col-6 q-pl-xs text-right">
          <q-btn
            :label="$t('label.filter')"
            color="purple"
            no-caps
            glossy
            @click="on_search_filter_click"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineAsyncComponent } from "vue";
import { APP } from "src/scripts/static";
import { util } from "src/scripts/util";
import { api } from "src/scripts/api";
import { uix } from "src/scripts/uix";
let self;

export default {
  components: {
    KeyValue: defineAsyncComponent(() => import("src/pages/KeyValue.vue")),
    Listener: defineAsyncComponent(() => import("src/pages/KafkaListener.vue")),
  },
  setup() {
    return {
      APP,
      util,
      handler: ref(null),
      table: ref({
        rows: [],
        filters: {},
        columns: [],
        loading: false,
        pagination: {
          page: 1,
          rowsPerPage: 30,
          sortBy: "groupId",
          descending: false,
          count: true,
        },
      }),
      dialog: ref({
        view: uix.dialog.init(() => self.dialog.view),
        properties: uix.dialog.init(() => self.dialog.properties),
        listener: uix.dialog.init(),
        search: uix.dialog.init(() => self.dialog.search),
      }),
    };
  },

  created() {
    self = this;
    self.handler = self.$route.query.handler;
    self.table.columns = [
      {
        name: "groupId",
        label: self.$t("label.group_id"),
        field: "groupId",
        align: "left",
        sortable: true,
      },
      {
        name: "phase",
        label: self.$t("label.phase"),
        field: "phase",
        align: "left",
      },
      {
        name: "keyType",
        label: self.$t("label.key_type"),
        field: "keyType",
        align: "left",
        sortable: true,
      },
      {
        name: "keyDeserializer",
        label: self.$t("label.key_deserializer"),
        field: "keyDeserializer",
        align: "left",
        sortable: true,
      },
      {
        name: "valueType",
        label: self.$t("label.value_type"),
        field: "valueType",
        align: "left",
        sortable: true,
      },
      {
        name: "valueDeserializer",
        label: self.$t("label.value_deserializer"),
        field: "valueDeserializer",
        align: "left",
        sortable: true,
      },
      {
        name: "topics",
        label: self.$t("label.topics"),
        field: "topics",
        align: "left",
        format: (val) => {
          return util.isObject(val) ? JSON.stringify(val) : val;
        },
      },
    ];
    self.on_refresh_click();
  },
  methods: {
    /*
     * REQUEST
     */
    do_request(props) {
      let { page, rowsPerPage, sortBy, descending } =
        self.get_pagination(props);
      let params = {
        name: self.handler,
        index: page,
        size: rowsPerPage,
        order: (descending ? "-" : "") + sortBy,
      };
      Object.keys(self.table.filters).forEach((key) => {
        if (self.table.filters[key]) {
          params[key] = encodeURIComponent(self.table.filters[key]);
        }
      });
      self.table.loading = true;
      api.call({
        path: "/kafka/containers",
        params: params,
        onFinish() {
          self.table.loading = false;
        },
        onSuccess(data) {
          if (util.isObject(data)) {
            self.table.rows = util.isArray(data.data) ? data.data : [];
            let pagination = self.table.pagination;
            pagination.page = data.index;
            pagination.rowsPerPage = data.size;
            if (util.isNumber(data.records)) {
              pagination.rowsNumber = data.records;
            } else {
              let rowsNumber = data.index * data.size;
              if (self.table.rows.length !== data.size) {
                pagination.rowsNumber = rowsNumber;
              } else {
                pagination.rowsNumber = rowsNumber + 1;
              }
            }
          }
        },
      });
    },

    /*
     * GET PAGINATION
     */
    get_pagination(props) {
      let pagination = props?.pagination
        ? props.pagination
        : self.table.pagination;
      if (pagination) {
        self.table.pagination = pagination;
        return pagination;
      }
      return self.table.pagination;
    },

    /*
     * REFRESH CLICK
     */
    on_refresh_click() {
      if (!self.table.rows?.length) {
        if (self.table.pagination.page > 1) {
          self.table.pagination.page = 1;
        }
      }
      self.do_request({
        pagination: self.table.pagination,
      });
    },

    /*
     * VIEW CLICK
     */
    on_view_click(scope) {
      let rows = [];
      for (const col of scope.cols) {
        rows.push({
          label: col.label,
          value: util.isFunction(col.format)
            ? col.format(scope.row[col.field], scope.row)
            : scope.row[col.field],
        });
      }
      uix.dialog.show(self.dialog.view, {
        search: false,
        rows: rows,
        color: {
          close: "red",
        },
        actions: [
          {
            icon: scope.row.isRunning ? "stop" : "play_arrow",
            label: self.$t(scope.row.isRunning ? "label.stop" : "label.start"),
            color: scope.row.isRunning ? "pink-10" : "purple-10",
            click: () => self.on_start_stop_click(scope),
          },
          {
            icon: "lightbulb",
            color: "teal-10",
            label: self.$t("label.properties"),
            click: () => self.on_properties_click(scope),
          },
        ],
      });
    },

    /*
     * PROPERTIES CLICK
     */
    on_properties_click(scope) {
      uix.dialog.show(self.dialog.properties, {
        title: self.$t("label.properties"),
        name: self.handler,
        containerId: scope.row.containerId,
        rows: [],
        onRefresh: self.get_properties,
      });
    },
    get_properties(i) {
      let p = util.isObject(i) ? i : {};
      util.apply(p.onStart);
      api.call({
        path: "/kafka/container/properties",
        params: {
          name: p.parameters.name,
          containerId: p.parameters.containerId,
        },
        onFinish() {
          util.apply(p.onFinish);
        },
        onSuccess(data) {
          if (util.isObject(data)) {
            let rows = [];
            Object.keys(data).forEach((key) => {
              rows.push({
                label: key,
                value: data[key],
              });
            });
            util.sort.array(rows, "label");
            util.apply(p.onData, rows);
          }
        },
        notify: true,
      });
    },

    /*
     * START / STOP CLICK
     */
    on_start_stop_click(scope) {
      let row = scope.row;
      let btn = self.dialog.view.parameters.actions[0];
      uix.confirm(
        function () {
          btn.loading = true;
          api.call({
            path: "/kafka/container/" + (row.isRunning ? "stop" : "start"),
            method: "post",
            params: {
              name: self.handler,
              containerId: row.containerId,
            },
            onFinish() {
              btn.loading = false;
            },
            onSuccess() {
              row.isRunning = !row.isRunning;
              btn.icon = row.isRunning ? "stop" : "play_arrow";
              btn.label = self.$t(row.isRunning ? "label.stop" : "label.start");
              btn.color = row.isRunning ? "pink-10" : "purple-10";
            },
          });
        },
        "confirm." + (row.isRunning ? "stop" : "start"),
      );
    },

    /*
     * LISTENER CLICK
     */
    on_listener_click(scope) {
      let row = scope.row;
      uix.dialog.show(self.dialog.listener, {
        name: self.handler,
        containerId: row.containerId,
        title: row.groupId,
      });
    },

    /*
     * SEARCH RESET CLICK
     */
    on_search_reset_click() {
      self.table.filters = {};
    },

    /*
     * SEARCH FILTER CLICK
     */
    on_search_filter_click() {
      let filters = self.table.filters;
      if (!(util.isString(filters.containerId) && "" !== filters.containerId)) {
        delete filters.containerId;
      }
      if (!(util.isString(filters.groupId) && "" !== filters.groupId)) {
        delete filters.groupId;
      }
      if (!(util.isString(filters.topicName) && "" !== filters.topicName)) {
        delete filters.topicName;
      }
      if (!(util.isString(filters.keyType) && "" !== filters.keyType)) {
        delete filters.keyType;
      }
      if (
        !(
          util.isString(filters.keyDeserializer) &&
          "" !== filters.keyDeserializer
        )
      ) {
        delete filters.keyDeserializer;
      }
      if (!(util.isString(filters.valueType) && "" !== filters.valueType)) {
        delete filters.valueType;
      }
      if (
        !(
          util.isString(filters.valueDeserializer) &&
          "" !== filters.valueDeserializer
        )
      ) {
        delete filters.valueDeserializer;
      }
      self.do_request({
        pagination: self.table.pagination,
      });
      uix.dialog.hide(self.dialog.search);
    },

    /*
     * SEARCH DIALOG CLICK
     */
    on_search_dialog_click() {
      uix.dialog.show(self.dialog.search);
    },
  },
};
</script>
