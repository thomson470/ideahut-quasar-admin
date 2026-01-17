// diisi / direplace di sisi server
const STATIC = {
  __admin__: {
    id: "",
    title: "",
    //web: "",
    //api: "http://localhost:5402/_/api",
    web: "/__admin__",
    api: "/_/api",
    timeout: 60,
    language: "en",
    debug: true,
    //color: {
    //  header: 'linear-gradient(180deg, rgb(188, 14, 49) 0%, rgba(15, 142, 231, 1) 100%)',
    //  title: 'gold',
    //},
    //menuTitle: {
    //  parentMenu: true,
    //  separator: " &rarr; "
    //},
  },
};
const APP = STATIC["__admin__"];
export { APP };
