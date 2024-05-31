import { util } from "src/scripts/util";
import { uix } from "src/scripts/uix";
import { api } from "src/scripts/api";

const grid = {

    /*
    * ID
    */
    id: {
        fromPk: function (idInfo, pk) {
            if (util.isDefined(pk)) {
                return "STANDARD" === idInfo.type ? pk : JSON.parse(pk);
            }
            return undefined;
        },
        toPk: function (idInfo, object) {
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
        toFunction: function (elements) {
            if (util.isArray(elements)) {
                for (const element of elements) {
                    let format = element.format;
                    if (util.isString(format) && format.startsWith("function")) {
                        format = eval("(" + format + ")");
                        element.format = format;
                    } else {
                        delete element.format;
                    }
                    let toValue = element.toValue;
                    if (util.isString(toValue) && toValue.startsWith("function")) {
                        toValue = eval("(" + toValue + ")");
                        element.toValue = toValue;
                    } else {
                        delete element.toValue;
                    }
                    let nullValue = element.nullValue;
                    if (util.isString(nullValue) && nullValue.startsWith("function")) {
                        nullValue = eval("(" + nullValue + ")");
                        element.nullValue = nullValue;
                    } else {
                        delete element.nullValue;
                    }
                    let rowToValue = element.rowToValue;
                    if (util.isString(rowToValue) && rowToValue.startsWith("function")) {
                        rowToValue = eval("(" + rowToValue + ")");
                        element.rowToValue = rowToValue;
                    } else {
                        delete element.rowToValue;
                    }
                }
            }
        },
        options: function(options) {
            if (util.isObject(options)) {
                Object.keys(options).forEach((key) => {
                    let items = grid.get.array(options[key]);
                    for (const item of items) {
                        if (!util.isDefined(item.value) || null === item.value) {
                            item.value = undefined;
                        }
                    }
                    options[key] = items;
                });
            }
        },
        children: function(children) {
            if (util.isArray(children)) {
                for (const child of children) {
                    let fields = grid.get.array(child.fields);
                    grid.prepare.toFunction(fields);
                    child.fields = fields;
                    let table = grid.get.object(child.table);
                    grid.prepare.toFunction(table.columns);
                    child.table = table;
                }
            }
        },
        forms: function(forms) {
            if (util.isArray(forms)) {
                for (const form of forms) {
                    let fields = grid.get.array(form.fields);
                    grid.prepare.toFunction(fields);
                    form.fields = fields;
                }
            }
        },
        picks: function(picks) {
            if (util.isObject(picks)) {
                Object.keys(picks).forEach((key) => {
                    let pick = grid.get.object(picks[key]);
                    let table = grid.get.object(pick.table);
                    grid.prepare.toFunction(table.columns);
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
        pkAndGridId: function (idInfo, value, gridId) {
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
                        if (Object.keys(pk).length === 0) {
                            pk = undefined;
                        } else {
                            pk = JSON.stringify(pk);
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
                }
                else if ("EMBEDDED" === idInfo.type) {
                    pk = value[idInfo.fields[0]];
                    if (Object.keys(pk).length === 0) {
                        pk = undefined;
                    } else {
                        pk = JSON.stringify(pk);
                    }
                }
                else if ("STANDARD" === idInfo.type) {
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
        page: function (pagination, data, length) {
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
        string: function (value, defval) {
            return util.isString(value) ? value : defval;
        },
        number: function (value, defval) {
            return util.isNumber(value) ? value : defval;
        },
        object: function (value) {
            return util.isObject(value) ? value : {};
        },
        array: function (value) {
            return util.isArray(value) ? value : [];
        },
        firstArray: function (value) {
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
    copy: function (value) {
        return JSON.parse(JSON.stringify(value));
    },

    /*
    * CLONE
    */
    clone: {
        field: function(obj) {
            let field = grid.copy(obj);
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
        field: function(field) {
            let validations = field.validations;
            if (util.isString(validations)) {
                validations = [validations];
            }
            if (!util.isArray(validations) || !validations.length) {
                return true;
            }
            let value = util.isDefined(field.value) ? field.value + "" : "";
            let type;
            for (const validation of validations) {
                type = validation.trim().toLowerCase();
                if ("required" === type) {
                    if (!value.trim().length) {
                        uix.error("error.required", field.label);
                        return false;
                    }
                } else if ("number" === type) {
                    let number = +value;
                    if (isNaN(number)) {
                        uix.error("error.fill_with_numbers", field.label);
                        return false;
                    }
                } else if ("email" === type) {
                    value = value.trim();
                    if (!util.isEmail(value)) {
                        uix.error("error.fill_with_email", field.label);
                        return false;
                    }
                    field.value = value;
                } else if (type.startsWith("length:")) {
                    let length = +type.substring(7).trim();
                    if (!isNaN(length) && value.length !== length) {
                        uix.error("error.fill_with_length", field.label, length);
                        return false;
                    }
                } else if (type.startsWith("maxlength:")) {
                    let maxlength = +type.substring(10).trim();
                    if (!isNaN(maxlength) && value.length > maxlength) {
                        uix.error("error.fill_with_maxlength", field.label, maxlength);
                        return false;
                    }
                } else if (type.startsWith("minlength:")) {
                    let minlength = +type.substring(10).trim();
                    if (!isNaN(minlength) && value.length < minlength) {
                        uix.error("error.fill_with_minlength", field.label, minlength);
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
        page: function(input) {
            let props = input.props;
            let table = input.table;
            let { page, rowsPerPage, sortBy, descending } = grid.get.pagination(props, table);
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
                        if (util.isString[or]) {
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
            let body = grid.copy(definition.crud);
            if (util.isNumber(replica) && replica > -1) {
                body.replica = replica;
                let allUseSameReplica = true === input.allUseSameReplica;
                if (allUseSameReplica) {
                    if (util.isArray(body.joins)) {
                        for (const join of body.joins) {
                            join.replica = body.replica;
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
                        table.rows = grid.get.array(data.data);
                        grid.inject.pkAndGridId(definition.id, table.rows, definition._grid_id_);
                        grid.update.page(table.pagination, data, table.rows.length);
                        table.pagination.sortBy = sortBy;
                        table.pagination.descending = descending;
                        /*
                        // LAZY LOAD
                        if (util.isObject(self.grid.lazy)) {
                        let lazy = JSON.parse(JSON.stringify(self.grid.lazy));
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
        delete: function(input) {
            let ids = [];
            if (input?.row) {
                ids.push(grid.id.fromPk(input.definition.id, input.row._pk_));
            } else {
                for (const element of input.table.selected) {
                    ids.push(grid.id.fromPk(input.definition.id, element._pk_));
                }
            }
            if (!ids.length) {
                return;
            }
            input.deleting = false;
            uix.confirm(function() {
                let body = grid.copy(input.definition.crud);
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
                input.deleting = true;
                api.call({
                    path:  path,
                    method: "post",
                    data: body,
                    onFinish() {
                        input.deleting = false;
                    },
                    onSuccess(data) {
                        if (util.isFunction(input.onSuccess)) {
                            input.onSuccess();
                        }
                    },
                });
            }, "confirm.delete");
        },
        save: function(input) {
            let value = {};
            for (const field of input.fields) {
                if (!grid.validation.field(field)) {
                    return;
                }
                if ("datetime" === field.type && "epoch" === field.converter) {
                    value[field.name] = util.parse.epoch(field.value, {
                        format: field.pattern || null,
                    });
                } else if ("pick" === field.type) {
                    if (undefined === field.value && field.nullable) {
                        if (util.isFunction(field.nullValue)) {
                            value[field.name] = field.nullValue();
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
                    tmpValue = (tmpValue[split[i]] = (i == split.length - 1 ? tval : (util.isObject(tmpValue[split[i]]) ? tmpValue[split[i]] : {})))
                }
                /*
                if (split.length === 1) {
                    newValue[split[0]] = tval;
                } else {
                    if (!util.isObject(newValue[split[0]])) {
                        newValue[split[0]] = {};
                    }
                    let tmpValue = newValue[split[0]];
                    for (let i = 1; i < split.length; i++) {
                        tmpValue = (tmpValue[split[i]] = (i == split.length - 1 ? tval : (util.isObject(tmpValue[split[i]]) ? tmpValue[split[i]] : {})))
                    }
                }
                */
            });
            let definition = input.definition;
            let body = grid.copy(definition.crud);
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
            input.saving = true;
            api.call({
                path: path,
                method: "post",
                data: body,
                onFinish() {
                    input.saving = false;
                },
                onSuccess(data) {
                    data = grid.get.object(data);
                    grid.inject.pkAndGridId(definition.id, data, definition._grid_id_);
                    if (util.isFunction(input.onSuccess)) {
                        input.onSuccess(data);
                    }
                },
            });
        },
    },

    /*
     * PERMISSION
     */
    permission: {
        view: function(definition) {
            let d = util.isObject(definition) ? definition : {};
            return util.isArray(d.actions) && d.actions.includes('PAGE');
        },
        add: function(definition) {
            let d = util.isObject(definition) ? definition : {};
            return util.isArray(d.actions) && d.actions.includes('CREATE');
        },
        edit: function(definition) {
            let d = util.isObject(definition) ? definition : {};
            return util.isArray(d.actions) && d.actions.includes('UPDATE');
        },
        delete: function(definition) {
            let d = util.isObject(definition) ? definition : {};
            return util.isArray(d.actions) && d.actions.includes('DELETE');
        },
        deletes: function(definition) {
            let d = util.isObject(definition) ? definition : {};
            return util.isArray(d.actions) && d.actions.includes('DELETES');
        },
    },

};
export { grid };
