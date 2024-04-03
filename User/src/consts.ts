export const IS_LOCAL = false;
export const JWT_SECRET = process.env.JWT_SECRET || "secret";

/* USER/AUTH ROUTES */
export const USER_SERVER_URL = "https://events-system-users.onrender.com";
export const LOGIN_PATH = "/api/login";
export const LOGOUT_PATH = "/api/logout";
export const SIGNUP_PATH = "/api/signup";
export const USERNAME_PATH = "/api/username";
export const NEXT_EVENT_PATH = "/api/next_event";
export const COUPONS_PATH = "/api/coupons";
export const PERMISSION_PATH = "/api/permission";

/* EVENT ROUTES */
export const EVENT_SERVER_URL = "https://events-system-event.onrender.com";
export const GET_EVENT_PATH = "/api/event/:id";
export const GET_ALL_EVENTS_PATH = "/api/event";
export const CREATE_EVENT_PATH = "/api/event";
export const UPDATE_EVENT_DATE_PATH = "/api/event/:id/date";
export const UPDATE_EVENT_TICKET_PATH = "/api/event/:id/ticket";

/* ORDER ROUTES */
export const ORDERS_SERVER_URL = "https://events-system-order.onrender.com";
export const CREATE_ORDER_PATH = "/api/order";
export const GET_USER_ORDERS_PATH = "/api/order";
export const GET_USERS_BY_EVENT_PATH = "/api/order/users/:eventId";

/* COMMENT ROUTES */
export const COMMENTS_SERVER_URL =
  "https://events-system-comments.onrender.com";
export const CREATE_COMMENT = "/api/comment";
export const GET_COMMENTS_BY_EVENT = "/api/comment/:eventId/:page";
export const GET_NUM_OF_COMMENTS_BY_EVENT = "/api/comment/:eventId/num";
export const GET_EVENTS_BY_USER_PATH = "/api/order/events/:username";

/* PAYMENT ROUTES */
export const PAYMENT_SERVER_URL = "https://events-system-payment.onrender.com";
export const CREATE_COUPON_PATH = "/api/payment/coupon";
export const GET_COUPON_PATH = "/api/payment/coupon/:code";
export const BUY_PATH = "/api/payment/buy";
