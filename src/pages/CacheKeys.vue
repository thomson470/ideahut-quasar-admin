<template>
  <q-card
    :style="'width: ' + ($q.screen.lt.md ? '100%;' : '80%;') + dialog.style"
  >
    <q-card-section
      class="q-pa-none header-main"
      :style="
        APP?.color?.header
          ? 'background: ' + APP.color.header + ' !important;'
          : ''
      "
      v-touch-pan.mouse="dialog.onDrag"
    >
      <q-item class="q-pr-none">
        <q-item-section>
          <q-item-label class="text-h6 text-white">{{ title }}</q-item-label>
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
    <q-card-section style="max-height: 80vh" class="q-pa-xs q-pt-sm scroll">
      <q-table
        class="table-sticky-header q-ma-sm"
        :rows="table.rows"
        :columns="table.columns"
        :row-key="'key'"
        :loading="table.loading"
        :selection="'multiple'"
        v-model:selected="table.selected"
        v-model:pagination="table.pagination"
        :dense="$q.screen.lt.md"
        :no-data-label="$t('error.data_not_available')"
        rows-per-page-label=" "
        :rows-per-page-options="[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
        :selected-rows-label="(selected) => {}"
        @request="do_request"
        binary-state-sort
        :separator="'cell'"
        style="max-height: 70vh"
        bordered
      >
        <template v-slot:top>
          <q-btn
            glossy
            round
            dense
            class="q-ma-none q-pl-none q-mr-md"
            color="negative"
            icon="delete"
            :disable="!table.selected.length"
            :loading="table.deleting"
            @click="on_delete_click"
          >
            <q-tooltip>{{ $t("label.delete") }}</q-tooltip>
          </q-btn>
          <q-btn
            glossy
            round
            dense
            class="q-ma-none q-mr-md"
            color="deep-orange-10"
            icon="clear_all"
            :loading="table.clearing"
            @click="on_clear_click"
          >
            <q-tooltip>{{ $t("label.clear") }}</q-tooltip>
          </q-btn>
          <q-space />
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
            <span class="text-subtitle2">
              {{ message }}
            </span>
          </div>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <template v-slot:header-selection="scope">
          <div class="text-left">
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
            dense
            color="primary"
            class="q-ma-none q-ml-sm q-mr-sm"
            v-model="scope.selected"
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
            <template v-slot:append>
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
</template>

<script>
import { ref } from "vue";
import { APP } from "src/scripts/static";
import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";
let self;

export default {
  props: ["parameters"],
  setup() {
    return {
      APP,
      util,
      title: ref(null),
      name: ref(null),
      group: ref(null),
      table: ref({
        rows: [],
        selected: [],
        columns: [],
        loading: false,
        deleting: false,
        clearing: false,
        pagination: {
          page: 1,
          rowsPerPage: 30,
        },
      }),
      dialog: ref(uix.dialog.init(() => self.dialog)),
    };
  },

  created() {
    self = this;
    self.table.columns = [
      {
        name: "key",
        label: self.$t("label.key"),
        field: "key",
        align: "left",
        sortable: true,
      },
    ];
    let params = util.isObject(self.parameters) ? self.parameters : {};
    self.title = params.title;
    self.name = params.name;
    self.group = params.group;
    self.do_request({
      pagination: self.table.pagination,
    });
  },

  methods: {
    /*
     * REQUEST
     */
    do_request(props) {
      self.table.selected = [];
      let { page, rowsPerPage } = props?.pagination
        ? props.pagination
        : self.table.pagination;
      let body = {
        info: {
          name: self.name,
          group: self.group,
        },
        index: page,
        size: rowsPerPage,
      };
      self.table.loading = true;
      api.call({
        path: "/cache/keys",
        method: "post",
        data: body,
        onFinish() {
          self.table.loading = false;
        },
        onSuccess(page) {
          self.table.rows = [];
          if (util.isObject(page)) {
            if (util.isArray(page.data)) {
              for (const data of page.data) {
                self.table.rows.push({
                  key: data,
                });
              }
            }
            let pagination = self.table.pagination;
            pagination.page = page.index;
            pagination.rowsPerPage = page.size;
            pagination.rowsNumber = page.records;
          }
        },
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
    on_delete_click() {
      if (self.table.selected?.length) {
        let keys = [];
        for (const row of self.table.selected) {
          keys.push(row.key);
        }
        let body = {
          info: {
            name: self.name,
            group: self.group,
          },
          keys: keys,
        };
        self.table.deleting = true;
        api.call({
          path: "/cache/delete",
          method: "post",
          data: body,
          onSuccess() {
            setTimeout(function () {
              self.table.deleting = false;
              self.do_request({
                pagination: self.table.pagination,
              });
            }, 500);
          },
          onError() {
            self.table.deleting = false;
          },
          notify: true,
        });
      }
    },

    /*
     * CLEAR CLICK
     */
    on_clear_click() {
      uix.confirm(
        function () {
          let body = {
            info: {
              name: self.name,
              group: self.group,
            },
          };
          self.table.clearing = true;
          api.call({
            path: "/cache/clear",
            method: "post",
            data: body,
            onSuccess() {
              setTimeout(function () {
                self.table.clearing = false;
                self.table.pagination.page = 1;
                self.on_refresh_click();
              }, 500);
            },
            onError() {
              self.table.clearing = false;
            },
            notify: true,
          });
        },
        "confirm.clear",
        self.title,
      );
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
  },
};
</script>
