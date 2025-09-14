import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";
import { APP } from "src/scripts/static";

const F = eval;

const crud = {
  /*
   * ID
   */
  id: {
    fromPk(idInfo, pk) {
      if (util.isDefined(pk)) {
        return "STANDARD" === idInfo.type ? pk : JSON.parse(pk);
      }
      return undefined;
    },
    toPk(idInfo, object) {
      let pk;
      if ("COMPOSITE" === idInfo.type) {
        pk = {};
        for (const field of idInfo.fields) {
          pk[field] = object[field];
        }
        pk = JSON.stringify(pk);
      } else if ("EMBEDDED" === idInfo.type) {
        pk = JSON.stringify(object[idInfo.fields[0]]);
      } else if ("STANDARD" === idInfo.type) {
        pk = object[idInfo.fields[0]];
      }
      return pk;
    },
  },

  /*
   * PREPARE
   */
  prepare: {
    toFunction(elements) {
      if (util.isArray(elements)) {
        for (const element of elements) {
          let format = element.format;
          if (util.isString(format) && format.startsWith("function")) {
            format = F("(" + format + ")");
            element.format = format;
          } else {
            delete element.format;
          }
          let toValue = element.toValue;
          if (util.isString(toValue) && toValue.startsWith("function")) {
            toValue = F("(" + toValue + ")");
            element.toValue = toValue;
          } else {
            delete element.toValue;
          }
          let nullValue = element.nullValue;
          if (util.isString(nullValue) && nullValue.startsWith("function")) {
            nullValue = F("(" + nullValue + ")");
            element.nullValue = nullValue;
          } else {
            delete element.nullValue;
          }
          let rowToValue = element.rowToValue;
          if (util.isString(rowToValue) && rowToValue.startsWith("function")) {
            rowToValue = F("(" + rowToValue + ")");
            element.rowToValue = rowToValue;
          } else {
            delete element.rowToValue;
          }
        }
      }
    },
    options(options) {
      if (util.isObject(options)) {
        Object.keys(options).forEach((key) => {
          let items = crud.get.array(options[key]);
          for (const item of items) {
            if (!util.isDefined(item.value) || null === item.value) {
              item.value = undefined;
            }
          }
          options[key] = items;
        });
      }
    },
    children(children) {
      if (util.isArray(children)) {
        for (const child of children) {
          crud.prepare.children(child.children);
          let fields = crud.get.array(child.fields);
          crud.prepare.toFunction(fields);
          child.fields = fields;
          let table = crud.get.object(child.table);
          crud.prepare.toFunction(table.columns);
          child.table = table;
        }
      }
    },
    forms(forms) {
      if (util.isArray(forms)) {
        for (const form of forms) {
          let fields = crud.get.array(form.fields);
          crud.prepare.toFunction(fields);
          form.fields = fields;
        }
      }
    },
    picks(picks) {
      if (util.isObject(picks)) {
        Object.keys(picks).forEach((key) => {
          let pick = crud.get.object(picks[key]);
          let table = crud.get.object(pick.table);
          crud.prepare.toFunction(table.columns);
          pick.table = table;
          picks[key] = pick;
        });
      }
    },
  },

  /*
   * INJECT
   */
  inject: {
    pkAndGridId(idInfo, value, gridId) {
      if (util.isArray(value)) {
        let pk;
        if ("COMPOSITE" === idInfo.type) {
          for (const data of value) {
            pk = {};
            for (const field of idInfo.fields) {
              pk[field] = data[field];
            }
            if (Object.keys(pk).length === 0) {
              pk = undefined;
            } else {
              pk = JSON.stringify(pk);
            }
            data._pk_ = pk;
            data._grid_id_ = gridId;
          }
        } else if ("EMBEDDED" === idInfo.type) {
          for (const data of value) {
            pk = data[idInfo.fields[0]];
            if (util.isObject(pk) && Object.keys(pk).length !== 0) {
              pk = JSON.stringify(pk);
            } else {
              pk = undefined;
            }
            data._pk_ = pk;
            data._grid_id_ = gridId;
          }
        } else if ("STANDARD" === idInfo.type) {
          for (const data of value) {
            data._pk_ = data[idInfo.fields[0]];
            data._grid_id_ = gridId;
          }
        }
      } else if (util.isObject(value)) {
        let pk;
        if ("COMPOSITE" === idInfo.type) {
          pk = {};
          for (const field of idInfo.fields) {
            pk[field] = value[field];
          }
          if (Object.keys(pk).length === 0) {
            pk = undefined;
          } else {
            pk = JSON.stringify(pk);
          }
        } else if ("EMBEDDED" === idInfo.type) {
          pk = value[idInfo.fields[0]];
          if (util.isObject(pk) && Object.keys(pk).length !== 0) {
            pk = JSON.stringify(pk);
          } else {
            pk = undefined;
          }
        } else if ("STANDARD" === idInfo.type) {
          pk = value[idInfo.fields[0]];
        }
        value._pk_ = pk;
        value._grid_id_ = gridId;
      }
    },
  },

  /*
   * UPDATE
   */
  update: {
    page(pagination, data, length) {
      pagination.page = data.index;
      pagination.rowsPerPage = data.size;
      if (util.isNumber(data.records)) {
        pagination.rowsNumber = data.records;
      } else {
        let rowsNumber = data.index * data.size;
        if (length !== data.size) {
          pagination.rowsNumber = rowsNumber;
        } else {
          pagination.rowsNumber = rowsNumber + 1;
        }
      }
    },
  },

  /*
   * GET
   */
  get: {
    string(value, defval) {
      return util.isString(value) ? value : defval;
    },
    number(value, defval) {
      return util.isNumber(value) ? value : defval;
    },
    object(value) {
      return util.isObject(value) ? value : {};
    },
    array(value) {
      return util.isArray(value) ? value : [];
    },
    firstArray(value) {
      if (util.isArray(value) && value.length > 0) {
        return value[0];
      }
      return undefined;
    },
    pagination(props, table) {
      let pagination = props?.pagination ? props.pagination : table.pagination;
      if (pagination) {
        table.pagination = pagination;
        return pagination;
      }
      return table.pagination;
    },
  },

  /*
   * COPY
   */
  copy(value) {
    return JSON.parse(JSON.stringify(value));
  },

  /*
   * CLONE
   */
  clone: {
    field(obj) {
      let field = crud.copy(obj);
      field.format = obj.format;
      field.toValue = obj.toValue;
      field.nullValue = obj.nullValue;
      field.rowToValue = obj.rowToValue;
      return field;
    },
  },

  /*
   * VALIDATION
   */
  validation: {
    label: (field) =>
      util.isString(field.hint) && "" !== field.hint ? field.hint : field.label,
    field(field) {
      let validations = field.validations;
      if (util.isString(validations)) {
        validations = [validations];
      }
      if (!util.isArray(validations) || !validations.length) {
        return true;
      }
      let label = crud.validation.label;
      let value =
        util.isDefined(field.value) && field.value != null
          ? field.value + ""
          : "";
      let type;
      for (const validation of validations) {
        type = validation.trim().toLowerCase();
        if ("required" === type) {
          if (!value.trim().length) {
            uix.error("error.required", label(field));
            return false;
          }
        } else if ("number" === type) {
          let number = +value;
          if (isNaN(number)) {
            uix.error("error.fill_with_numbers", label(field));
            return false;
          }
        } else if ("email" === type) {
          value = value.trim();
          if (!util.isEmail(value)) {
            uix.error("error.fill_with_email", label(field));
            return false;
          }
          field.value = value;
        } else if (type.startsWith("length:")) {
          let length = +type.substring(7).trim();
          if (!isNaN(length) && value.length !== length) {
            uix.error("error.fill_with_length", label(field), length);
            return false;
          }
        } else if (type.startsWith("maxlength:")) {
          let maxlength = +type.substring(10).trim();
          if (!isNaN(maxlength) && value.length > maxlength) {
            uix.error("error.fill_with_maxlength", label(field), maxlength);
            return false;
          }
        } else if (type.startsWith("minlength:")) {
          let minlength = +type.substring(10).trim();
          if (!isNaN(minlength) && value.length < minlength) {
            uix.error("error.fill_with_minlength", label(field), minlength);
            return false;
          }
        }
      }
      return true;
    },
  },

  /*
   * ACTION
   */
  action: {
    page(input) {
      let props = input.props;
      let table = input.table;
      let { page, rowsPerPage, sortBy, descending } = crud.get.pagination(
        props,
        table,
      );
      let filters = [];
      let search = input.search;
      if (!search.empty) {
        let v1, v2;
        for (const filter of search.filters) {
          v1 = util.isDefined(filter.value) ? filter.value : "";
          if ("" === v1) {
            continue;
          }
          if ("BETWEEN" === filter.condition) {
            v2 = util.isDefined(filter.value2) ? filter.value2 : "";
            if ("" !== v2) {
              if ("datetime" === filter.type && "epoch" === filter.converter) {
                v1 = util.parse.epoch(v1, { format: filter.pattern || null });
                v2 = util.parse.epoch(v2, { format: filter.pattern || null });
              }
              filters.push({
                field: filter.name,
                condition: filter.condition,
                values: [v1, v2],
              });
            }
          } else {
            if ("datetime" === filter.type && "epoch" === filter.converter) {
              v1 = util.parse.epoch(v1, { format: filter.pattern || null });
            }
            let or = filter.or;
            if (util.isString(or)) {
              or = [or];
            }
            or = util.isArray(or) ? or : [];
            if (or.length) {
              let qor = { logical: "and", filters: [] };
              for (let j = 0; j < or.length; j++) {
                qor.filters.push({
                  field: or[j],
                  logical: j === 0 ? "and" : "or",
                  condition: filter.condition,
                  value: v1,
                });
              }
              filters.push(qor);
            } else {
              filters.push({
                field: filter.name,
                condition: filter.condition,
                value: v1,
              });
            }
          }
        }
      }
      let relations = input.relations;
      if (util.isArray(relations)) {
        for (const relation of relations) {
          filters.push({
            field: relation.target,
            condition: "EQUAL",
            value: relation.value,
          });
        }
      }
      let definition = input.definition;
      let replica = input.replica;
      let body = crud.copy(definition.crud);
      body.replica = util.callIf(
        util.isNumber(replica) && replica > -1,
        () => replica,
      );
      if (util.isArray(body.joins)) {
        for (const join of body.joins) {
          if (true === join.enableReplica) {
            join.replica = util.isString(join.replica)
              ? util.getFieldValue(join.replica, input.parentRow)
              : body.replica;
          }
          if (util.isArray(join?.relations)) {
            for (const relation of join.relations) {
              if (util.isString(relation.value)) {
                let rval = util.getFieldValue(relation.value, input.parentRow);
                if (rval) {
                  relation.value = rval;
                }
              }
            }
          }
        }
      }
      body.page = {
        index: page,
        size: rowsPerPage,
        count: true === definition.table.page.count,
      };
      body.filters = util.isArray(body.filters) ? body.filters : [];
      body.filters = body.filters.concat(filters);
      if (sortBy) {
        body.orders = [(descending ? "-" : "") + sortBy];
      }
      table.loading = true;
      table.selected = [];
      api.call({
        path: "/crud/page",
        method: "post",
        data: body,
        onFinish() {
          table.loading = false;
        },
        onSuccess(data) {
          if (util.isObject(data)) {
            table.rows = crud.get.array(data.data);
            crud.inject.pkAndGridId(
              definition.id,
              table.rows,
              definition._grid_id_,
            );
            crud.update.page(table.pagination, data, table.rows.length);
            table.pagination.sortBy = sortBy;
            table.pagination.descending = descending;
            /*
              // LAZY LOAD
              if (util.isObject(self.crud.lazy)) {
                let lazy = JSON.parse(JSON.stringify(self.crud.lazy));
                for (const element of self.rows) {
                    Object.keys(lazy).forEach((key) => {
                    if (!util.isArray(lazy[key].members)) {
                        lazy[key].members = [];
                    }
                    let value = util.getFieldValue(
                        key + "." + lazy[key].id,
                        element
                    );
                    if (util.isDefined(value)) {
                        lazy[key].members.push(value);
                    }
                    });
                }
                Object.keys(lazy).forEach((key) => {
                    lazy[key].members = [...new Set(lazy[key].members)];
                    if (lazy[key].members.length) {
                    api.call({
                        path: "/crud/map",
                        method: "post",
                        data: {
                        name: lazy[key].entity,
                        ids: lazy[key].members,
                        },
                        onSuccess(map) {
                        for (const element of self.rows) {
                            let value = util.getFieldValue(
                            key + "." + lazy[key].id,
                            element
                            );
                            if (util.isDefined(value) && util.isDefined(map[value])) {
                            element[key] = map[value];
                            }
                        }
                        },
                    });
                    }
                });
              }
            */
          }
        },
      });
    },
    delete(input) {
      let ids = [];
      if (input?.row) {
        ids.push(crud.id.fromPk(input.definition.id, input.row._pk_));
      } else {
        for (const element of input.table.selected) {
          ids.push(crud.id.fromPk(input.definition.id, element._pk_));
        }
      }
      if (!ids.length) {
        return;
      }
      uix.confirm(function () {
        let body = crud.copy(input.definition.crud);
        let path = "/crud/delete";
        if (ids.length === 1) {
          body.id = ids[0];
        } else {
          body.ids = ids;
          path += "s";
        }
        let replica = input.replica;
        if (util.isNumber(replica) && replica > -1) {
          body.replica = replica;
        }
        util.runIf(util.isFunction(input.onProgress), () =>
          input.onProgress(true),
        );
        api.call({
          path: path,
          method: "post",
          data: body,
          onFinish() {
            util.runIf(util.isFunction(input.onProgress), () =>
              input.onProgress(false),
            );
          },
          onSuccess(data) {
            util.runIf(util.isFunction(input.onSuccess), () =>
              input.onSuccess(data),
            );
          },
        });
      }, "confirm.delete");
    },
    save(input) {
      let value = {};
      for (const field of input.fields) {
        if (!crud.validation.field(field)) {
          return;
        }
        if ("datetime" === field.type && "epoch" === field.converter) {
          value[field.name] = util.parse.epoch(field.value, {
            format: field.pattern || null,
          });
        } else if ("pick" === field.type) {
          if (undefined === field.value && field.nullable) {
            if (util.isFunction(field.nullValue)) {
              let nval = field.nullValue();
              if (util.isObject(nval)) {
                Object.keys(nval).forEach((key) => {
                  value[key] = nval[key];
                });
              } else {
                value[field.name] = nval;
              }
            } else {
              value[field.name] = null;
            }
          } else {
            if (util.isFunction(field.toValue) && util.isObject(field.value)) {
              let oval = field.toValue(field.value);
              Object.keys(oval).forEach((key) => {
                value[key] = oval[key];
              });
            } else {
              value[field.name] = field.value;
            }
          }
        } else {
          if (undefined === field.value && field.nullable) {
            if (util.isFunction(field.nullValue)) {
              value[field.name] = field.nullValue();
            } else {
              value[field.name] = true === field.nullEmpty ? "" : null;
            }
          } else {
            value[field.name] = field.value;
          }
        }
      }
      let relations = input.relations;
      if (util.isArray(relations)) {
        for (const relation of relations) {
          value[relation.target] = relation.value;
        }
      }
      // Ubah key yang mengandung dot menjadi object
      let newValue = {};
      Object.keys(value).forEach((key) => {
        let tval = value[key];
        let split = key.split(".");
        let tmpValue = newValue;
        for (let i = 0; i < split.length; i++) {
          tmpValue = tmpValue[split[i]] =
            i == split.length - 1
              ? tval
              : util.isObject(tmpValue[split[i]])
                ? tmpValue[split[i]]
                : {};
        }
      });
      let definition = input.definition;
      let body = crud.copy(definition.crud);
      body.value = newValue;
      let replica = input.replica;
      if (util.isNumber(replica) && replica > -1) {
        body.replica = replica;
      }
      let path;
      if (true === input.is_edit) {
        body.id = input.id;
        path = "/crud/update";
      } else {
        path = "/crud/create";
      }
      delete body.joins;
      util.runIf(util.isFunction(input.onProgress), () =>
        input.onProgress(true),
      );
      api.call({
        path: path,
        method: "post",
        data: body,
        onFinish() {
          util.runIf(util.isFunction(input.onProgress), () =>
            input.onProgress(false),
          );
        },
        onSuccess(data) {
          data = crud.get.object(data);
          crud.inject.pkAndGridId(definition.id, data, definition._grid_id_);
          body = crud.copy(definition.crud);
          let refresh =
            true === input.is_edit &&
            (body?.joins?.length || body?.loads?.length);
          if (refresh) {
            body.id = crud.copy(input.id);
            body.replica = input.replica;
            if (util.isArray(body.joins)) {
              for (const join of body.joins) {
                if (true === join.enableReplica) {
                  join.replica = util.isString(join.replica)
                    ? util.getFieldValue(join.replica, input.parentRow)
                    : body.replica;
                }
                if (util.isArray(join?.relations)) {
                  for (const relation of join.relations) {
                    if (util.isString(relation.value)) {
                      let rval = util.getFieldValue(
                        relation.value,
                        input.parentRow,
                      );
                      if (rval) {
                        relation.value = rval;
                      }
                    }
                  }
                }
              }
            }

            util.runIf(util.isFunction(input.onProgress), () =>
              input.onProgress(true),
            );
            api.call({
              path: "/crud/single",
              method: "post",
              data: body,
              onFinish() {
                util.runIf(util.isFunction(input.onProgress), () =>
                  input.onProgress(false),
                );
              },
              onSuccess(object) {
                crud.inject.pkAndGridId(
                  definition.id,
                  object,
                  definition._grid_id_,
                );
                util.runIf(util.isFunction(input.onSuccess), () =>
                  input.onSuccess(object),
                );
              },
            });
          } else {
            util.runIf(util.isFunction(input.onSuccess), () =>
              input.onSuccess(data),
            );
          }
        },
      });
    },
  },

  /*
   * PERMISSION
   */
  permission: {
    view(definition) {
      let d = util.isObject(definition) ? definition : {};
      return util.isArray(d.actions) && d.actions.includes("PAGE");
    },
    add(definition) {
      let d = util.isObject(definition) ? definition : {};
      return util.isArray(d.actions) && d.actions.includes("CREATE");
    },
    edit(definition) {
      let d = util.isObject(definition) ? definition : {};
      return util.isArray(d.actions) && d.actions.includes("UPDATE");
    },
    delete(definition) {
      let d = util.isObject(definition) ? definition : {};
      return util.isArray(d.actions) && d.actions.includes("DELETE");
    },
    deletes(definition) {
      let d = util.isObject(definition) ? definition : {};
      return util.isArray(d.actions) && d.actions.includes("DELETES");
    },
  },

  /*
   * API
   */
  api: api,

  /*
   * CONFIG
   */
  config: APP,

  /*
   * UTIL
   */
  callIf: util.callIf,
  runIf: util.runIf,
  isFunction: util.isFunction,
  isObject: util.isObject,
  isDefined: util.isDefined,
  isBoolean: util.isBoolean,
  isString: util.isString,
  isNumber: util.isNumber,
  isInteger: util.isInteger,
  isArray: util.isArray,
  isEmail: util.isEmail,
  uuid: util.uuid,
  log: util.log,
  format: util.format,
  getFieldValue: util.getFieldValue,

  /*
   * UIX
   */
  dialog: uix.dialog,
  error: uix.error,
  calendar: uix.calendar,

  /*
   * SHARE
   */
  $h: {
    isFunction: util.isFunction,
    isObject: util.isObject,
    isDefined: util.isDefined,
    isBoolean: util.isBoolean,
    isString: util.isString,
    isNumber: util.isNumber,
    isInteger: util.isInteger,
    isArray: util.isArray,
    isEmail: util.isEmail,
    uuid: util.uuid,
    log: util.log,
    format: util.format,
    grid: {
      field(val, name) {
        try {
          return val[name];
        } catch {
          return val;
        }
      },
      option(val, row, name, key) {
        try {
          let g = window["$g"];
          let v = util.isString(key) && "" !== key ? val[key] : val;
          return g[row._grid_id_].options[name].find(
            (x) => x.value + "" === v + "",
          ).label;
        } catch {
          return val;
        }
      },
      date(val, row, format) {
        try {
          let g = window["$g"];
          return util.format.date(val, {
            format: format || "YYYY-MM-DD HH:mm:ss",
            months: g[row._grid_id_].additionals.MONTHS,
            days: g[row._grid_id_].additionals.DAYS,
          });
        } catch {
          return val;
        }
      },
    },
  },
};
export { crud };
