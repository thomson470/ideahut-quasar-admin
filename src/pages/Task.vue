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
    v-model="view.show"
    transition-show="scale"
    transition-hide="fade"
    backdrop-filter="blur(1px)"
  >
    <q-card
      :style="'min-width: 40vw;' + view.style"
      v-touch-pan.mouse="view.onDrag"
    >
      <q-card-section class="q-pa-none">
        <q-table
          class="table-sticky-header no-column"
          style="max-height: 70vh"
          :rows="view.rows"
          :separator="'cell'"
          :filter="view.filter"
          :rows-per-page-options="[0]"
          hide-bottom
          hide-header
          bordered
          dense
        >
          <template v-slot:top-left>
            <div class="text-h6">
              {{ view.title }}
              <q-badge
                v-if="true === view.isDefault"
                color="orange"
                rounded
                align="top"
                transparent
              />
            </div>
          </template>
          <template v-slot:top-right>
            <q-btn
              round
              glossy
              dense
              size="sm"
              icon="refresh"
              class="q-ml-lg"
              :loading="view.loading"
              @click="get_view"
            >
              <q-tooltip>{{ $t("label.refresh") }}</q-tooltip>
            </q-btn>
            <q-btn
              round
              glossy
              dense
              size="sm"
              icon="close"
              class="q-ml-sm"
              @click="view.show = false"
            >
              <q-tooltip>{{ $t("label.close") }}</q-tooltip>
            </q-btn>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from "vue";
import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";
let self;

export default {
  setup() {
    return {
      util,

      columns: [],
      table: ref({
        rows: [],
        columns: [],
        loading: false,
        pagination: {
          page: 1,
          rowsPerPage: 10,
        },
      }),
      view: ref({
        ...uix.dialog.init(() => self.view),
        loading: false,
        rows: [],
        name: null,
        title: null,
        isDefault: null,
      }),
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
        name: "threadNamePrefix",
        label: self.$t("label.thread_name_prefix"),
        field: "threadNamePrefix",
        align: "left",
        sortable: true,
      },
      {
        name: "activeCount",
        label: self.$t("label.active_count"),
        field: "activeCount",
        align: "right",
        sortable: true,
      },
      {
        name: "queueSize",
        label: self.$t("label.queue_size"),
        field: "queueSize",
        align: "right",
        sortable: true,
      },
      {
        name: "poolSize",
        label: self.$t("label.pool_size"),
        field: "poolSize",
        align: "right",
        sortable: true,
      },
      {
        name: "queueCapacity",
        label: self.$t("label.queue_capacity"),
        field: "queueCapacity",
        align: "right",
        sortable: true,
      },
      {
        name: "maxPoolSize",
        label: self.$t("label.max_pool_size"),
        field: "maxPoolSize",
        align: "right",
        sortable: true,
      },
      {
        name: "corePoolSize",
        label: self.$t("label.core_pool_size"),
        field: "corePoolSize",
        align: "right",
        sortable: true,
      },
      {
        name: "keepAliveSeconds",
        label: self.$t("label.keep_alive_seconds"),
        field: "keepAliveSeconds",
        align: "right",
        sortable: true,
      },
      {
        name: "threadPriority",
        label: self.$t("label.thread_priority"),
        field: "threadPriority",
        align: "right",
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
        path: "/task/infos",
        onFinish() {
          self.table.loading = false;
        },
        onSuccess(data) {
          self.table.rows = util.isArray(data) ? data : [];
        },
      });
    },

    /*
     * VIEW CLICK
     */
    on_view_click(scope) {
      let d = self.view;
      d.name = scope.row.name;
      d.title = scope.row.label;
      d.isDefault = scope.row.isDefault;
      uix.dialog.show(d);
      self.get_view();
    },
    get_view() {
      self.view.loading = true;
      api.call({
        path: "/task/info",
        params: {
          handler: self.view.name,
        },
        onFinish() {
          self.view.loading = false;
        },
        onSuccess(data) {
          if (util.isObject(data)) {
            self.view.rows = [
              {
                label: self.$t("label.name"),
                value: data.label,
              },
              {
                label: self.$t("label.thread_name_prefix"),
                value: data.threadNamePrefix,
              },
              {
                label: self.$t("label.active_count"),
                value: data.activeCount,
              },
              {
                label: self.$t("label.queue_size"),
                value: data.queueSize,
              },
              {
                label: self.$t("label.pool_size"),
                value: data.poolSize,
              },
              {
                label: self.$t("label.queue_capacity"),
                value: data.queueCapacity,
              },
              {
                label: self.$t("label.max_pool_size"),
                value: data.maxPoolSize,
              },
              {
                label: self.$t("label.core_pool_size"),
                value: data.corePoolSize,
              },
              {
                label: self.$t("label.keep_alive_seconds"),
                value: data.keepAliveSeconds,
              },
              {
                label: self.$t("label.thread_priority"),
                value: data.threadPriority,
              },
            ];
          } else {
            self.view.rows = [];
          }
        },
      });
    },
  },
};
</script>
