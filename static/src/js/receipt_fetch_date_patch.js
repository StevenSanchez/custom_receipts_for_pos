/** @odoo-module **/
import { patch } from "@web/core/utils/patch";
import { ReceiptScreen } from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import { onMounted } from "@odoo/owl";

patch(ReceiptScreen.prototype, {
    setup() {
        this._super.apply(this, arguments);
        const self = this;
        onMounted(async function () {
            try {
                const receipt = self.props && self.props.receipt ? self.props.receipt : null;
                if (!receipt) { return; }
                if (receipt.date_original) { return; } // ya la tenemos

                // Usamos el nombre/pos_reference del recibo
                let ref = '';
                if (receipt.name) { ref = String(receipt.name).trim(); }
                if (!ref) { return; }

                const orm = self.env.services.orm;
                const d = await orm.call('pos.order', 'pos_get_order_date', [], { pos_reference: ref });
                if (d) {
                    receipt.date_original = String(d).replace('T',' ').replace('Z','');
                    self.render(true);   // refrescar el ticket
                }
            } catch (e) {
                // silencioso
            }
        });
    },
});
