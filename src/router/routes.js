import { util } from "src/scripts/util";
import { storage } from "src/scripts/storage";

const validation = async (to, from, next) => {
  let auth = storage.auth();
  if (!(util.isString(auth.token) && "" !== auth.token)) {
    next({
      path: "/login",
    });
  } else {
    next();
  }
};

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    beforeEnter: validation,
    children: [
      {
        path: "/",
        component: () => import("pages/Index.vue"),
      },
      {
        path: "/grid",
        component: () => import("pages/grid/Index.vue"),
      },
      {
        path: "/cache",
        component: () => import("pages/Cache.vue"),
      },
      {
        path: "/reload",
        component: () => import("pages/Reload.vue"),
      },
      {
        path: "/redis",
        component: () => import("pages/Redis.vue"),
      },
      {
        path: "/audit",
        component: () => import("pages/Audit.vue"),
      },
      {
        path: "/entity",
        component: () => import("pages/Entity.vue"),
      },
      {
        path: "/scheduler",
        component: () => import("pages/Scheduler.vue"),
      },
      {
        path: "/request",
        component: () => import("pages/Request.vue"),
      },
      {
        path: "/task",
        component: () => import("pages/Task.vue"),
      },
      {
        path: "/kafka/sender",
        component: () => import("pages/KafkaSender.vue"),
      },
      {
        path: "/kafka/container",
        component: () => import("pages/KafkaContainer.vue"),
      },
      {
        path: "/kafka/producer",
        component: () => import("pages/KafkaProducer.vue"),
      },
      {
        path: "/kafka/consumer",
        component: () => import("pages/KafkaConsumer.vue"),
      },
      {
        path: "/:catchAll(.*)*",
        component: () => import("pages/ErrorNotFound.vue"),
      },
    ],
  },
  {
    path: "/",
    component: () => import("layouts/PublicLayout.vue"),
    children: [
      {
        path: "/login",
        component: () => import("pages/Login.vue"),
      },
      {
        path: "/blank",
        component: () => import("pages/Blank.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
