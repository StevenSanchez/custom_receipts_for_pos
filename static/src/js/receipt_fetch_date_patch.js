/** @odoo-module **/
import { patch } from "@web/core/utils/patch";
import { ReceiptScreen } from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import { onMounted } from "@odoo/owl";

// Guardamos el setup original de la ReceiptScreen
const _superSetup = ReceiptScreen.prototype.setup;

patch(ReceiptScreen.prototype, {
    setup() {
        // Llamamos al setup original de forma segura
        if (_superSetup) {
            _superSetup.apply(this, arguments);
        }

        const self = this;

        onMounted(async function () {
            try {
                const receipt =
                    self.props && self.props.receipt ? self.props.receipt : null;
                if (!receipt) { return; }
                if (receipt.date_original) { return; } // ya la tenemos

                // Usamos el nombre/pos_reference del recibo
                let ref = null;

                if (receipt.name) {
                    ref = receipt.name;
                }
                if (!ref && receipt.headerData && receipt.headerData.name) {
                    ref = receipt.headerData.name;
                }
                if (!ref && receipt.pos_reference) {
                    ref = receipt.pos_reference;
                }
                if (!ref && receipt.order_reference) {
                    ref = receipt.order_reference;
                }
                if (!ref && receipt.uid) {
                    ref = receipt.uid;
                }
                if (!ref) { return; }

                const orm = self.env.services.orm;
                const d = await orm.call(
                    "pos.order",
                    "pos_get_order_date",
                    [],
                    { pos_reference: ref }
                );

                if (d) {
                    receipt.date_original = String(d)
                        .replace("T", " ")
                        .replace("Z", "");
                    self.render(true); // refrescar el ticket
                }
            } catch (e) {
                // silencioso para no romper el POS
            }
        });
    },
});
