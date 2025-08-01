<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div v-if="is_show_login" class="flex flex-center q-mt-xl">
    <div class="login-form text-center">
      <q-form class="q-mt-lg" @submit="on_login_click">
        <q-input
          v-model="username"
          class="q-mb-md"
          type="text"
          :placeholder="$t('label.username')"
          rounded
          outlined
        >
          <template v-slot:prepend>
            <q-icon name="account_box" />
          </template>
        </q-input>
      </q-form>
      <q-form @submit="on_login_click">
        <q-input
          v-model="password"
          class="q-mb-md"
          :type="is_show_password ? 'text' : 'password'"
          :placeholder="$t('label.password')"
          rounded
          outlined
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="is_show_password ? 'visibility' : 'visibility_off'"
              @click="is_show_password = !is_show_password"
            />
          </template>
        </q-input>
      </q-form>
      <q-btn
        no-caps
        ripple
        color="primary"
        @click="on_login_click"
        :loading="is_in_progress"
        :label="$t('label.login')"
      />
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";
import { storage } from "src/scripts/storage";
let self;

export default {
  setup() {
    return {
      util,
      uix,
      username: ref(null),
      password: ref(null),
      is_show_login: ref(false),
      is_in_progress: ref(false),
      is_show_password: ref(false),
      is_basic_auth: ref(false),
    };
  },
  beforeCreate() {
    self = this;
    api.send({
      path: "/check",
      onSuccess(response) {
        let headers = response?.headers ? response.headers : {};
        if (util.isString(headers["auth-token"])) {
          let auth = {
            token: atob(headers["auth-token"]),
            persistent: true,
            logout: false,
          };
          storage.auth(auth);
          self.$router.push({ path: "/" });
        } else {
          self.is_show_login = true;
        }
      },
      onError(error) {
        let response = error?.response ? error.response : {};
        if (401 === response.status) {
          let headers = response?.headers ? response.headers : {};
          if (util.isString(headers["www-authenticate"])) {
            let wa = headers["www-authenticate"];
            let lt = wa.toLowerCase();
            let idx = lt.indexOf(" ");
            let type = "";
            if (idx != -1) {
              type = lt.substring(0, idx);
            }
            if ("basic" === type) {
              self.is_show_login = true;
              self.is_basic_auth = true;
            } else {
              uix.notify(
                self.$t("error.unsupported_authentication_type"),
                wa,
                false,
              );
            }
          } else {
            self.is_show_login = true;
          }
        } else {
          self.is_show_login = true;
        }
      },
    });
  },
  methods: {
    on_login_click() {
      let username = self.username;
      if (!(username && username.length > 0)) {
        uix.error("error.required", "label.username");
        return false;
      }
      let password = self.password;
      if (!(password && password.length > 0)) {
        uix.error("error.required", "label.password");
        return false;
      }
      self.is_in_progress = true;
      if (self.is_basic_auth) {
        let userpass = username + ":" + password;
        let auth = {
          token: "Basic " + btoa(userpass),
          persistent: true,
          logout: true,
        };
        storage.auth(auth);
        api.send({
          path: "/check",
          onFinish() {
            self.is_in_progress = false;
          },
          onSuccess() {
            self.$router.push({ path: "/" });
          },
          onError() {
            uix.error("error.invalid_authentication");
          },
        });
      } else {
        api.call({
          path: "/login",
          method: "post",
          params: {
            username: username,
            password: password,
          },
          onFinish() {
            self.is_in_progress = false;
          },
          onSuccess(data) {
            if (util.isString(data) && "" !== data) {
              storage.auth({
                token: data,
                persistent: false,
                logout: true,
              });
              storage.menu(null);
              self.$router.push({ path: "/" });
            }
          },
        });
      }
    },
  },
};
</script>
