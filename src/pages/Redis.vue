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
    :dense="$q.screen.lt.md"
    :no-data-label="$t('error.data_not_available')"
    rows-per-page-label=" "
    :selected-rows-label="(selected) => {}"
    binary-state-sort
    :separator="'cell'"
    hide-bottom
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
          color="pink-10"
          icon="delete"
          :loading="table.flushing.db[scope.row.name]"
          @click="on_flush_click('db', scope)"
        >
          <q-tooltip>{{ $t("label.flush_db") }}</q-tooltip>
        </q-btn>
        <q-btn
          glossy
          round
          dense
          size="sm"
          class="q-ma-none q-ml-xs q-mr-sm"
          color="deep-orange-10"
          icon="delete_sweep"
          :loading="table.flushing.all[scope.row.name]"
          @click="on_flush_click('all', scope)"
        >
          <q-tooltip>{{ $t("label.flush_all") }}</q-tooltip>
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
          <q-tooltip>{{ $t("label.info") }}</q-tooltip>
        </q-btn>
      </div>
    </template>
  </q-table>

  <q-dialog v-model="flush.show" persistent>
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

  <q-dialog
    v-model="info.show"
    transition-show="scale"
    transition-hide="fade"
    persistent
  >
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section class="q-pa-none">
        <q-table
          class="table-sticky-header no-column"
          style="max-height: 70vh"
          :rows="info.rows"
          :separator="'cell'"
          :filter="info.filter"
          :rows-per-page-options="[0]"
          hide-bottom
          hide-header
          bordered
          dense
        >
          <template v-slot:top-left>
            <div class="text-h6">{{ info.title }}</div>
          </template>
          <template v-slot:top-right>
            <q-input
              borderless
              dense
              v-model="info.filter"
              :placeholder="$t('label.search')"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn
              round
              glossy
              dense
              size="sm"
              icon="refresh"
              class="q-ml-lg"
              :loading="info.loading"
              @click="get_properties"
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
              @click="info.show = false"
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

export default {
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
      }),

      flush: ref({
        show: false,
        loading: false,
        name: null,
        type: null,
        text: null,
        code: null,
      }),

      info: ref({
        show: false,
        loading: false,
        rows: [],
        name: null,
        title: null,
        filter: null,
      }),
    };
  },

  created() {
    let self = this;
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
        label: self.$t("label.key"),
        field: "keyType",
        align: "left",
        sortable: true,
      },
      {
        name: "valueType",
        label: self.$t("label.value"),
        field: "valueType",
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
      let self = this;
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
      let self = this;
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
          scope.row.label
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
          onSuccess(data) {
            self.flush.show = false;
          },
        });
      }
    },

    /*
     * INFO CLICK
     */
    on_info_click(scope) {
      let self = this;
      self.info.show = true;
      self.info.name = scope.row.name;
      self.info.title = scope.row.label;
      self.get_properties();
    },

    /*
     * GET PROPERTIES
     */
    get_properties() {
      let self = this;
      self.info.loading = true;
      api.call({
        path: "/redis/properties",
        params: {
          name: self.info.name,
        },
        onFinish() {
          self.info.loading = false;
        },
        onSuccess(data) {
          if (util.isObject(data)) {
            self.info.rows = [];
            Object.keys(data).forEach((key) => {
              self.info.rows.push({
                label: key,
                value: data[key],
              });
            });
            self.info.rows.sort((a, b) => {
              const la = a.label.toUpperCase();
              const lb = b.label.toUpperCase();
              if (la < lb) {
                return -1;
              }
              if (la > lb) {
                return 1;
              }
              return 0;
            });
          }
        },
        onError() {
          self.info.show = false;
        },
        notify: true,
      });
    },
  },
};
</script>
