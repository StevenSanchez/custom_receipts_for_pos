/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { Order } from "@point_of_sale/app/store/models";

// Guardamos el original
const _super_export_for_printing = Order.prototype.export_for_printing;

patch(Order.prototype, {
    export_for_printing() {
        // Llamamos al original para no romper nada del módulo
        const result = _super_export_for_printing.apply(this, arguments);

        // =====================
        //  MESA (RESTAURANTE)
        // =====================
        let table = null;

        // Según cómo venga en la sesión, probamos varias opciones
        if (this.table) {
            // Odoo suele guardar la mesa en this.table
            table = this.table;
        } else if (this.pos && this.pos.table) {
            // Fallback por si viene en this.pos.table
            table = this.pos.table;
        }

        if (table) {
            // Nombre de la mesa (ej: "Mesa 4", "Terraza 2", etc.)
            result.table_name = table.name || "";
        } else {
            result.table_name = "";
        }

        // Si quieres luego podemos añadir floor / comensales aquí

        return result;
    },
});
