<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-table
    class="table-sticky-header q-ma-sm"
    :rows="table.rows"
    :columns="columns"
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
      <div v-if="true === scope.row.canExecute">
        <q-btn
          glossy
          round
          dense
          size="sm"
          class="q-ma-none q-ml-xs q-mr-sm"
          color="lime-10"
          icon="account_tree"
          @click="on_client_click(scope)"
        >
          <q-tooltip>{{ $t("label.client") }}</q-tooltip>
        </q-btn>
        <q-btn
          glossy
          round
          dense
          size="sm"
          class="q-ma-none q-ml-xs q-mr-sm"
          color="teal-10"
          icon="lightbulb"
          @click="on_info_click(scope)"
        >
          <q-tooltip>{{ $t("label.properties") }}</q-tooltip>
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

  <!-- FLUSH -->
  <q-dialog v-model="flush.show" backdrop-filter="blur(1px)" persistent>
    <q-card>
      <q-card-section class="q-pa-xs q-pl-lg q-pr-lg text-center">
        {{ $t("label.flush_input_code") }}
      </q-card-section>
      <q-card-section
        class="q-pa-xs q-pl-lg q-pr-lg text-center text-weight-bold"
      >
        {{ flush.text }}
      </q-card-section>
      <q-card-section class="q-pa-sm">
        <q-input
          v-model="flush.code"
          type="text"
          filled
          dense
          input-class="text-center"
        >
        </q-input>
      </q-card-section>
      <q-card-actions class="row">
        <div class="col-6 text-left">
          <q-btn
            no-caps
            ripple
            glossy
            :label="$t('label.cancel')"
            color="negative"
            v-close-popup
          />
        </div>
        <div class="col-6 text-right">
          <q-btn
            no-caps
            ripple
            glossy
            :label="$t('label.continue')"
            color="positive"
            :loading="flush.loading"
            :disable="!flush.code"
            @click="on_flush_click"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- INFO -->
  <q-dialog
    v-model="info.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
    persistent
  >
    <KeyValue
      :parameters="info.parameters"
      :style="info.style"
      v-touch-pan.mouse="info.onDrag"
    />
  </q-dialog>

  <!-- VIEW -->
  <q-dialog
    v-model="view.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
    persistent
  >
    <KeyValue
      :parameters="view.parameters"
      :style="view.style"
      v-touch-pan.mouse="view.onDrag"
    />
  </q-dialog>

  <!-- CLIENT -->
  <q-dialog
    v-model="clients.show"
    persistent
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
  >
    <Clients :parameters="clients.parameters" />
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
    KeyValue: defineAsyncComponent(() => import("src/pages/KeyValue.vue")),
    Clients: defineAsyncComponent(() => import("src/pages/RedisClients.vue")),
  },
  setup() {
    return {
      util,
      type: ref(null),
      bean: ref(null),
      is_group: ref(false),
      columns: [],
      table: ref({
        rows: [],
        columns: [],
        loading: false,
        flushing: {
          all: {},
          db: {},
        },
        pagination: {
          page: 1,
          rowsPerPage: 10,
        },
      }),
      flush: ref({
        show: false,
        loading: false,
        name: null,
        type: null,
        text: null,
        code: null,
      }),
      info: ref(uix.dialog.init(() => self.info)),
      view: ref(uix.dialog.init(() => self.view)),
      clients: ref(uix.dialog.init()),
    };
  },

  created() {
    self = this;
    self.columns = [
      {
        name: "label",
        label: self.$t("label.name"),
        field: "label",
        align: "left",
        sortable: true,
      },
      {
        name: "keyType",
        label: self.$t("label.key_type"),
        field: "keyType",
        align: "left",
        sortable: true,
      },
      {
        name: "keySerializer",
        label: self.$t("label.key_serializer"),
        field: "keySerializer",
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
        name: "valueSerializer",
        label: self.$t("label.value_serializer"),
        field: "valueSerializer",
        align: "left",
        sortable: true,
      },
      {
        name: "hashKeyType",
        label: self.$t("label.hash_key_type"),
        field: "hashKeyType",
        align: "left",
        sortable: true,
      },
      {
        name: "hashKeySerializer",
        label: self.$t("label.hash_key_serializer"),
        field: "hashKeySerializer",
        align: "left",
        sortable: true,
      },
      {
        name: "hashValueType",
        label: self.$t("label.hash_value_type"),
        field: "hashValueType",
        align: "left",
        sortable: true,
      },
      {
        name: "hashValueSerializer",
        label: self.$t("label.hash_value_serializer"),
        field: "hashValueSerializer",
        align: "left",
        sortable: true,
      },
    ];
    self.do_request();
  },
  methods: {
    /*
     * REQUEST
     */
    do_request() {
      self.table.loading = true;
      api.call({
        path: "/redis/infos",
        onFinish() {
          self.table.loading = false;
        },
        onSuccess(data) {
          if (util.isArray(data)) {
            self.table.rows = data;
            for (const row of self.table.rows) {
              self.table.flushing.all[row.name] = false;
              self.table.flushing.db[row.name] = false;
            }
          }
        },
      });
    },

    /*
     * FLUSH CLICK
     */
    on_flush_click(type, scope) {
      if (util.isDefined(type) && util.isDefined(scope)) {
        uix.confirm(
          function () {
            self.table.flushing[type][scope.row.name] = true;
            api.call({
              path: "/redis/flush/" + type,
              params: {
                name: scope.row.name,
              },
              onFinish() {
                self.table.flushing[type][scope.row.name] = false;
              },
              onSuccess(data) {
                if (util.isString(data)) {
                  self.flush = {
                    show: true,
                    loading: false,
                    name: scope.row.name,
                    type: type,
                    text: data,
                    code: null,
                  };
                }
              },
            });
          },
          "confirm.flush_" + type,
          scope.row.label,
        );
      } else {
        self.flush.loading = true;
        api.call({
          path: "/redis/flush/" + self.flush.type,
          method: "post",
          params: {
            name: self.flush.name,
            code: self.flush.code,
          },
          onFinish() {
            self.flush.loading = false;
          },
          onSuccess() {
            self.flush.show = false;
          },
        });
      }
    },

    /*
     * CLIENT CLICK
     */
    on_client_click(scope) {
      let row = scope.row;
      uix.dialog.show(self.clients, {
        name: row.name,
        title: row.label,
        badge: row.isDefault,
      });
    },

    /*
     * INFO CLICK
     */
    on_info_click(scope) {
      uix.dialog.show(self.info, {
        title: scope.row.label,
        name: scope.row.name,
        badge: true === scope.row.isDefault,
        rows: [],
        onRefresh: self.get_info,
      });
    },
    get_info(i) {
      let p = util.isObject(i) ? i : {};
      util.apply(p.onStart);
      api.call({
        path: "/redis/properties",
        params: {
          name: p.parameters.name,
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
     * VIEW CLICK
     */
    on_view_click(scope) {
      let rows = [];
      for (const col of scope.cols) {
        rows.push({
          label: col.label,
          value: scope.row[col.field],
        });
      }
      uix.dialog.show(self.view, {
        title: scope.row.label,
        name: scope.row.name,
        badge: true === scope.row.isDefault,
        search: false,
        rows: rows,
        color: {
          close: "red",
        },
        actions: [
          {
            color: "deep-orange-10",
            icon: "delete_sweep",
            label: self.$t("label.flush_all"),
            click: () => self.on_flush_click("all", scope),
          },
          {
            color: "pink-10",
            icon: "delete",
            label: self.$t("label.flush_db"),
            click: () => self.on_flush_click("db", scope),
          },
        ],
      });
    },
  },
};
</script>
