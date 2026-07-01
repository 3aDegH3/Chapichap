class NotificationEvent:
    ORDER_REGISTERED = "order_registered"
    PAYMENT_SUCCESSFUL = "payment_successful"
    PAYMENT_FAILED = "payment_failed"
    ORDER_STATUS_CHANGED = "order_status_changed"
    DESIGN_REQUEST_RECEIVED = "design_request_received"
    DESIGN_REQUEST_ADMIN_REPLY = "design_request_admin_reply"
    CONTACT_MESSAGE_CREATED = "contact_message_created"
    TICKET_CREATED = "ticket_created"
    TICKET_CLOSED = "ticket_closed"
    SUPPORT_REPLY = "support_reply"


CUSTOMER_EVENTS = {
    NotificationEvent.ORDER_REGISTERED,
    NotificationEvent.PAYMENT_SUCCESSFUL,
    NotificationEvent.PAYMENT_FAILED,
    NotificationEvent.ORDER_STATUS_CHANGED,
    NotificationEvent.DESIGN_REQUEST_RECEIVED,
    NotificationEvent.DESIGN_REQUEST_ADMIN_REPLY,
    NotificationEvent.TICKET_CREATED,
    NotificationEvent.TICKET_CLOSED,
    NotificationEvent.SUPPORT_REPLY,
}


STAFF_EVENTS = {
    NotificationEvent.DESIGN_REQUEST_RECEIVED,
    NotificationEvent.CONTACT_MESSAGE_CREATED,
}
