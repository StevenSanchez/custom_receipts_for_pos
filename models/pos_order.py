from odoo import api, fields, models

class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.model
    def pos_get_order_date(self, pos_reference):
        order = self.search([('pos_reference', '=', pos_reference)], limit=1)
        return order and fields.Datetime.to_string(order.date_order) or ''
