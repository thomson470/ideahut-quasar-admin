<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="q-ma-sm">
    <q-card v-if="beans?.length">
      <q-card-section class="q-pa-sm row">
        <div
          v-for="(bean, index) in beans"
          :key="index"
          class="col-lg-3 col-md-4 col-sm-6 col-xs-12 text-center q-pa-sm"
        >
          <q-btn
            glossy
            no-caps
            rounded
            ripple
            stack
            style="width: 100%"
            @click="on_reload_click(bean)"
            :loading="bean.loading"
          >
            <q-icon
              name="memory"
              :size="$q.screen.lt.md ? '6em' : '10em'"
              center
            ></q-icon>
            <span
              :class="$q.screen.lt.md ? 'text-h6' : 'text-h5'"
              style="overflow-wrap: anywhere"
            >
              {{ bean.title }}
            </span>
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" />
              <div :class="$q.screen.lt.md ? 'text-h6' : 'text-h5'">
                {{ bean.title }}
              </div>
            </template>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </div>
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
      beans: ref([]),
    };
  },

  created() {
    self = this;
    api.call({
      path: "/reload",
      onSuccess(datas) {
        if (util.isArray(datas)) {
          self.beans = [];
          for (const data of datas) {
            self.beans.push({
              title: data.substring(0, 1).toUpperCase() + data.substring(1),
              value: data,
              loading: false,
            });
          }
        }
      },
    });
  },
  methods: {
    on_reload_click: function (bean) {
      uix.confirm(
        function () {
          bean.loading = true;
          api.call({
            path: "/reload",
            params: {
              name: bean.value,
            },
            method: "post",
            onFinish() {
              bean.loading = false;
            },
            onSuccess(data) {
              if (false === data) {
                uix.alert("info.being_processed", bean.title);
              }
            },
          });
        },
        "confirm.reload",
        bean.title,
      );
    },
  },
};
</script>
