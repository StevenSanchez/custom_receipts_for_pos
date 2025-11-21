/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { Order } from "@point_of_sale/app/store/models";

// Guarda referencia al método original
const _super_export_for_printing = Order.prototype.export_for_printing;

function _formatDateToString(d) {
    if (!d) { return ""; }
    try {
        if (typeof d === "string") {
            // si viene "2025-11-04T16:24:00Z" déjalo legible
            return d.replace("T", " ").replace("Z", "");
        }
        if (typeof d === "number") {
            d = new Date(d);
        }
        if (!(d instanceof Date)) { return ""; }
        var yyyy = String(d.getFullYear());
        var mm = String(d.getMonth() + 1); if (mm.length === 1) { mm = "0" + mm; }
        var dd = String(d.getDate());      if (dd.length === 1) { dd = "0" + dd; }
        var hh = String(d.getHours());     if (hh.length === 1) { hh = "0" + hh; }
        var mi = String(d.getMinutes());   if (mi.length === 1) { mi = "0" + mi; }
        var ss = String(d.getSeconds());   if (ss.length === 1) { ss = "0" + ss; }
        return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + mi + ":" + ss;
    } catch (_e) {
        return "";
    }
}

patch(Order.prototype, {
    export_for_printing: function () {
        // Llama al original
        var result = _super_export_for_printing.apply(this, arguments);

        // ---- Cliente ----
        try {
            var partner = null;
            if (this.get_partner) {
                partner = this.get_partner();
            }
            if (partner) {
                result.client = {
                    id: partner.id,
                    name: partner.name || "",
                    phone: partner.phone || partner.mobile || ""
                };
                // string simple por si lo usas en el XML
                result.customer = partner.name || "";
            }
        } catch (_e1) {}

        // ---- Mesa (POS Restaurante) ----
        try {
            if (this.table) {
                // Nombre de la mesa directo en el resultado
                result.table_name = this.table.name;

                // Y también dentro de headerData, por si lo quieres ahí
                if (!result.headerData) {
                    result.headerData = {};
                }
                result.headerData.table_name = this.table.name;
            }
        } catch (_e_table) {}

        // ---- Fecha/hora original de la venta ----
        try {
            var d = null;
            if (this.date_order) { d = this.date_order; }
            else if (this.validation_date) { d = this.validation_date; }
            else if (this.creationDate) { d = this.creationDate; }
            else if (this.date) { d = this.date; }
            var fmt = _formatDateToString(d);
            if (fmt) {
                // esto es lo que leerá tu XML como "Fecha"
                result.date = fmt;
            }
        } catch (_e2) {}

        // Sonda opcional para verificar que cargó el patch
        result._patch_probe = "OK";

        return result;
    },
});
