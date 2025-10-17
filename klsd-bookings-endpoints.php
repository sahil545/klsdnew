<?php
/**
 * Plugin Name: KLSD Bookings Endpoints
 * Description: Custom REST endpoints to expose WooCommerce Bookings availability, price calculation, order creation, and assigned staff lookup.
 * Author: KLSD
 * Version: 1.2.0
 */

if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', function () {
  register_rest_route('klsd/v1', '/bookings/availability', [
    'methods'  => 'GET',
    'permission_callback' => '__return_true',
    'callback' => 'klsd_bookings_availability',
    'args' => [
      'product_id' => ['required' => true, 'type' => 'integer'],
      'start'      => ['required' => true, 'type' => 'string'], // YYYY-MM-DD or ISO
      'end'        => ['required' => true, 'type' => 'string'], // YYYY-MM-DD or ISO
      'resource_id'=> ['required' => false, 'type' => 'integer'],
      'persons'    => ['required' => false], // persons[slug|id]=qty
    ]
  ]);

  register_rest_route('klsd/v1', '/bookings/price', [
    'methods'  => 'POST',
    'permission_callback' => '__return_true',
    'callback' => 'klsd_bookings_price',
  ]);

  register_rest_route('klsd/v1', '/bookings/create-order', [
    'methods'  => 'POST',
    'permission_callback' => '__return_true',
    'callback' => 'klsd_bookings_create_order',
  ]);

  // Assigned staff lookup
  register_rest_route('klsd/v1', '/bookings/assigned-staff', [
    'methods'  => 'GET',
    'permission_callback' => '__return_true',
    'callback' => 'klsd_bookings_assigned_staff',
    'args' => [
      'id'  => ['required' => false], // single booking id
      'ids' => ['required' => false], // CSV or repeated: ?ids=1,2,3
    ],
  ]);
});

// ---- Helpers ----
if (!function_exists('klsd_be_to_ts')) {
  function klsd_be_to_ts($val) {
    if (is_numeric($val)) return (int) $val;
    if (!is_string($val) || $val === '') return 0;
    $ts = strtotime($val);
    return $ts ? (int)$ts : 0;
  }
}

if (!function_exists('klsd_person_types_map')) {
  function klsd_person_types_map($product_id) {
    $cache_key = 'klsd_ptypes_' . (int)$product_id;
    $map = get_transient($cache_key);
    if (is_array($map)) return $map;

    $map = [];
    $product = wc_get_product($product_id);
    if ($product && method_exists($product, 'get_person_types')) {
      $types = $product->get_person_types();
      if (is_array($types)) {
        foreach ($types as $type) {
          if (is_object($type) && method_exists($type, 'get_id')) {
            $id = (int) $type->get_id();
            $name = method_exists($type, 'get_name') ? $type->get_name() : '';
            $slug = $name ? sanitize_title($name) : ('person_' . $id);
            $map[$slug] = $id;
          } elseif (is_array($type) && isset($type['id'])) {
            $id = (int)$type['id'];
            $name = isset($type['name']) ? $type['name'] : '';
            $slug = $name ? sanitize_title($name) : ('person_' . $id);
            $map[$slug] = $id;
          } elseif (is_object($type) && isset($type->ID)) { // WP_Post style
            $id = (int)$type->ID;
            $name = isset($type->post_title) ? $type->post_title : '';
            $slug = $name ? sanitize_title($name) : ('person_' . $id);
            $map[$slug] = $id;
          }
        }
      }
    }

    set_transient($cache_key, $map, 12 * HOUR_IN_SECONDS);
    return $map;
  }
}

if (!function_exists('klsd_be_persons_by_id')) {
  function klsd_be_persons_by_id($product_id, $persons_in) {
    $out = [];
    $map = klsd_person_types_map($product_id); // slug => id (0 allowed for single type)
    if (!is_array($persons_in)) $persons_in = [];

    foreach ($persons_in as $key => $qty) {
      $qty = (int)$qty;
      if ($qty <= 0) continue;

      if (is_numeric($key)) {
        $pid = (int)$key;
        $out[$pid] = ($out[$pid] ?? 0) + $qty;
      } else {
        $slug = sanitize_key($key);
        if (isset($map[$slug])) {
          $pid = (int)$map[$slug];
          $out[$pid] = ($out[$pid] ?? 0) + $qty;
        }
      }
    }
    return $out;
  }
}

if (!function_exists('klsd_be_proxy_wc_ajax')) {
  // Replace existing helper with this more flexible version
  function klsd_be_proxy_wc_ajax($action, $params = [], $method = 'POST') {
    $url = add_query_arg('wc-ajax', $action, home_url('/'));
    $args = [
      'timeout' => 20,
      'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
    ];
    if (strtoupper($method) === 'GET') {
      $url = add_query_arg($params, $url);
    } else {
      $args['body'] = $params;
    }
    $res = wp_remote_request($url, $args);
    if (is_wp_error($res)) return $res;
    $code = wp_remote_retrieve_response_code($res);
    $body = wp_remote_retrieve_body($res);
    if ($code !== 200) return new WP_Error('ajax_bad_status', 'Woo AJAX error', ['status'=>$code, 'body'=>$body]);
    $json = json_decode($body, true);
    return (json_last_error() === JSON_ERROR_NONE) ? $json : $body;
  }
}

// Resolve assigned instructor for a wc_booking
if (!function_exists('klsd_get_booking_instructor_user_id')) {
  function klsd_get_booking_instructor_user_id($booking_id) {
    $booking_id = (int)$booking_id;
    if ($booking_id <= 0) return 0;
    $post = get_post($booking_id);
    if (!$post || $post->post_type !== 'wc_booking') return 0;

    // 1) KLSD staff meta (array or CSV)
    $val = get_post_meta($booking_id, 'klsd_assigned_instructors', true);
    if (is_array($val)) {
      foreach ($val as $uid) { $uid = (int)$uid; if ($uid > 0) return $uid; }
    } elseif (is_string($val) && $val !== '') {
      foreach (preg_split('/[,\s]+/', $val) as $uid) { $uid = (int)$uid; if ($uid > 0) return $uid; }
    }

    // 2) Legacy woo-content-form meta
    $legacy = (int) get_post_meta($booking_id, '_wcf_instructor_id', true);
    if ($legacy > 0) return $legacy;

    // 3) Fallback to post_author
    $author = (int)$post->post_author;
    if ($author > 0) return $author;

    return 0;
  }
}

// ---- Endpoints ----
if (!function_exists('klsd_bookings_assigned_staff')) {
  function klsd_bookings_assigned_staff(\WP_REST_Request $req) {
    $ids = [];
    $single = $req->get_param('id');
    $multi  = $req->get_param('ids');

    if ($single !== null && $single !== '') $ids[] = (int)$single;
    if ($multi) {
      foreach (preg_split('/[,\s]+/', (string)$multi) as $id) {
        $id = (int)$id; if ($id > 0) $ids[] = $id;
      }
    }
    $ids = array_values(array_unique(array_filter($ids, function($v){ return (int)$v > 0; })));

    $results = [];
    foreach ($ids as $bid) {
      $uid = klsd_get_booking_instructor_user_id($bid);
      $source = 'none';
      if ($uid) {
        if (get_post_meta($bid, 'klsd_assigned_instructors', true)) {
          $source = 'klsd_assigned_instructors';
        } elseif (get_post_meta($bid, '_wcf_instructor_id', true)) {
          $source = '_wcf_instructor_id';
        } else {
          $source = 'post_author';
        }
      }
      $results[] = [
        'bookingId' => (int)$bid,
        'instructorUserId' => (int)$uid,
        'source' => $source,
      ];
    }

    return rest_ensure_response([ 'results' => $results ]);
  }
}

if (!function_exists('klsd_bookings_availability')) {
  function klsd_bookings_availability(\WP_REST_Request $req) {
    if (!class_exists('WC_Bookings')) {
      return new WP_Error('no_bookings', 'WooCommerce Bookings not active', ['status'=>500]);
    }

    $product_id  = (int) $req['product_id'];
    $start_ts    = klsd_be_to_ts($req['start']);
    $end_ts      = klsd_be_to_ts($req['end']);
    $resource_id = (int) ($req['resource_id'] ?? 0);
    $persons_qs  = (array) $req->get_param('persons'); // persons[adult]=2

    if (!$product_id || !$start_ts || !$end_ts) {
      return new WP_Error('bad_request', 'Missing required params', ['status' => 400]);
    }

    // Build persons by ID
    $by_id = [];
    if (!empty($persons_qs)) $by_id = klsd_be_persons_by_id($product_id, $persons_qs);

    // Default to min persons if required and none provided
    if (empty($by_id)) {
      $product = wc_get_product($product_id);
      if ($product && method_exists($product, 'has_persons') && $product->has_persons()) {
        $min_persons = method_exists($product, 'get_min_persons') ? (int)$product->get_min_persons() : 1;
        if ($min_persons <= 0) { $min_persons = 1; }
        $map = klsd_person_types_map($product_id);
        $first_id = (int) (array_values($map)[0] ?? 0);
        if ($first_id > 0) $by_id[$first_id] = $min_persons;
      }
    }

    // Mirror Woo frontend: wc_bookings_get_availability
    $params = [
      'product_id' => $product_id,
      'from'       => $start_ts,
      'to'         => $end_ts,
    ];
    if ($resource_id) $params['resource_id'] = $resource_id;
    foreach ($by_id as $pid => $qty) $params["persons[$pid]"] = (int)$qty;

    $json = klsd_be_proxy_wc_ajax('wc_bookings_get_availability', $params, 'POST');
    if (is_wp_error($json)) return $json;

    // Normalize response into slots[]
    $slots = [];
    $raw = [];
    if (is_array($json)) {
      if (!empty($json['availability']) && is_array($json['availability'])) {
        $raw = $json['availability'];
      } elseif (!empty($json['blocks']) && is_array($json['blocks'])) {
        $raw = $json['blocks'];
      }
    }
    foreach ($raw as $b) {
      $s = isset($b['start']) ? (int)$b['start'] : null;
      $e = isset($b['end'])   ? (int)$b['end']   : null;
      if ($s && $e) {
        $slots[] = [
          'start'       => date('c', $s),
          'end'         => date('c', $e),
          'remaining'   => (int)($b['available'] ?? $b['remaining'] ?? 0),
          'resource_id' => (int)($b['resource_id'] ?? 0),
        ];
      }
    }

    return rest_ensure_response([
      'product_id' => $product_id,
      'tz'         => wp_timezone_string(),
      'slots'      => $slots,
      'raw'        => is_array($json) ? $json : null,
    ]);
  }
}

if (!function_exists('klsd_bookings_price')) {
  function klsd_bookings_price(\WP_REST_Request $req) {
    if (!class_exists('WC_Bookings')) {
      return new WP_Error('no_bookings', 'WooCommerce Bookings not active', ['status'=>500]);
    }

    $b           = $req->get_json_params();
    $product_id  = (int)($b['product_id'] ?? 0);
    $start_ts    = klsd_be_to_ts($b['start'] ?? '');
    $end_ts      = klsd_be_to_ts($b['end'] ?? '');
    $resource_id = (int)($b['resource_id'] ?? 0);
    $persons_in  = (array)($b['persons'] ?? []);

    if (!$product_id || !$start_ts || !$end_ts) {
      return new WP_Error('bad_request', 'Missing required params', ['status' => 400]);
    }

    $by_id = klsd_be_persons_by_id($product_id, $persons_in);

    // Auto-fallback: if persons provided but unmapped, assign sum to first person type
    if (empty($by_id) && !empty($persons_in)) {
      $map = klsd_person_types_map($product_id);
      $first_id = (int) (array_values($map)[0] ?? 0);
      if ($first_id) {
        $sum = 0; foreach ($persons_in as $q) { $sum += (int)$q; }
        if ($sum > 0) $by_id[$first_id] = $sum;
      }
    }

    // If still empty and product requires persons, default to minimum persons
    if (empty($by_id)) {
      $product = wc_get_product($product_id);
      if ($product && method_exists($product, 'has_persons') && $product->has_persons()) {
        $min_persons = method_exists($product, 'get_min_persons') ? (int)$product->get_min_persons() : 1;
        if ($min_persons <= 0) { $min_persons = 1; }
        $map = klsd_person_types_map($product_id);
        $first_id = (int) (array_values($map)[0] ?? 0);
        if ($first_id > 0) $by_id[$first_id] = $min_persons;
      }
    }

    $subtotal = 0.0;
    $breakdown = [];

    // Preferred: native calculator
    try {
      if (class_exists('WC_Bookings_Cost_Calculation')) {
        $product = wc_get_product($product_id);
        if ($product) {
          $calc = new WC_Bookings_Cost_Calculation($product);
          $cost = $calc->calculate_cost([
            'start_date'  => $start_ts,
            'end_date'    => $end_ts,
            'resource_id' => $resource_id ?: null,
            'persons'     => $by_id,
          ]);
          $subtotal = (float)$cost;
          $breakdown[] = ['label' => 'Booking cost', 'amount' => $subtotal];
        }
      }
    } catch (Throwable $e) {}

    // Fallback: Woo AJAX calculator
    if ($subtotal <= 0) {
      $params = [
        'product_id'  => $product_id,
        'start_date'  => $start_ts,
        'end_date'    => $end_ts,
      ];
      if ($resource_id) $params['resource_id'] = $resource_id;
      foreach ($by_id as $pid => $qty) $params["persons[$pid]"] = (int)$qty;

      $json = klsd_be_proxy_wc_ajax('wc_bookings_calculate_costs', $params, 'POST');
      if (!is_wp_error($json) && is_array($json)) {
        if (isset($json['total'])) {
          $raw = is_string($json['total']) ? preg_replace('/[^\d\.]/','', $json['total']) : $json['total'];
          $subtotal = (float)$raw;
        } elseif (isset($json['cost'])) {
          $subtotal = (float)$json['cost'];
        }
        if ($subtotal > 0 && empty($breakdown)) $breakdown[] = ['label' => 'Booking cost', 'amount' => $subtotal];
      }
    }

    // Final fallback
    if ($subtotal <= 0) {
      $count = 0; foreach (($persons_in ?: []) as $v) { $count += (int)$v; }
      if ($count <= 0) $count = 1;
      $product = wc_get_product($product_id);
      $base = $product ? (float)$product->get_price() : 0.0;
      $subtotal = $count * $base;
      $breakdown[] = ['label' => 'Base price fallback', 'amount' => $subtotal];
    }

    $tax = 0.0; // tax at checkout
    $total = $subtotal + $tax;

    return rest_ensure_response([
      'currency'  => get_woocommerce_currency(),
      'subtotal'  => (float) $subtotal,
      'tax'       => (float) $tax,
      'total'     => (float) $total,
      'breakdown' => $breakdown,
    ]);
  }
}

if (!function_exists('klsd_bookings_create_order')) {
  function klsd_bookings_create_order(\WP_REST_Request $req) {
    $b = $req->get_json_params();
    $product_id  = (int) ($b['product_id'] ?? 0);
    $start       = sanitize_text_field($b['start'] ?? '');
    $end         = sanitize_text_field($b['end'] ?? '');
    $resource_id = (int) ($b['resource_id'] ?? 0);
    $persons     = (array) ($b['persons'] ?? []);
    $customer    = (array) ($b['customer'] ?? []);

    if (!$product_id || !$start || !$end) {
      return new WP_Error('bad_request', 'Missing required params', ['status' => 400]);
    }

    $product = wc_get_product($product_id);
    if (!$product) return new WP_Error('not_found', 'Product not found', ['status' => 404]);

    // Re-validate capacity using availability (same day window)
    $dateOnly = substr($start, 0, 10);
    $timeOnly = substr($start, 11, 5);
    $avail_req = new WP_REST_Request('GET', '/klsd/v1/bookings/availability');
    $avail_req->set_param('product_id', $product_id);
    $avail_req->set_param('start', $dateOnly);
    $avail_req->set_param('end', $dateOnly);
    if ($resource_id) $avail_req->set_param('resource_id', $resource_id);
    if (!empty($persons)) $avail_req->set_param('persons', $persons);
    $avail_resp = rest_do_request($avail_req);
    $avail_data = $avail_resp instanceof WP_Error ? null : $avail_resp->get_data();

    $requested = 0; foreach ($persons as $v) { $requested += (int)$v; }
    if ($requested <= 0) $requested = 1;

    $remaining = 0;
    if (is_array($avail_data) && isset($avail_data['slots'])) {
      foreach ($avail_data['slots'] as $slot) {
        $datePart = isset($slot['start']) ? substr($slot['start'], 0, 10) : '';
        $timePart = isset($slot['start']) ? substr($slot['start'], 11, 5) : '';
        if ($datePart === $dateOnly && $timePart === $timeOnly) {
          $remaining = (int) ($slot['remaining'] ?? 0);
          break;
        }
      }
    }
    if ($remaining > 0 && $requested > $remaining) {
      return new WP_Error('SLOT_TAKEN', 'Requested capacity not available', ['status'=>409]);
    }

    // Create order & add product
    $order = wc_create_order();
    if (!empty($customer['email'])) $order->set_billing_email(sanitize_email($customer['email']));
    if (!empty($customer['first_name'])) $order->set_billing_first_name(sanitize_text_field($customer['first_name']));
    if (!empty($customer['last_name'])) $order->set_billing_last_name(sanitize_text_field($customer['last_name']));

    $item = new WC_Order_Item_Product();
    $item->set_product_id($product_id);
    $item->set_quantity(1);

    // Timestamps: convert to UTC unix timestamps
    $start_ts = strtotime($start);
    $end_ts   = strtotime($end);
    $item->add_meta_data('_booking_start', $start_ts);
    $item->add_meta_data('_booking_end', $end_ts);

    // Person type IDs
    $map = klsd_person_types_map($product_id);
    $by_id = [];
    foreach ($persons as $k=>$v) {
      $k2 = is_numeric($k) ? (int)$k : (isset($map[$k]) ? (int)$map[$k] : null);
      if ($k2 !== null) $by_id[$k2] = (int)$v;
    }
    if (empty($by_id)) { $by_id[0] = $requested; }
    $item->add_meta_data('_booking_persons', $by_id);

    if ($resource_id) $item->add_meta_data('_booking_resource_id', $resource_id);

    $order->add_item($item);
    $order->calculate_totals();
    $order->save();

    return rest_ensure_response([
      'order_id' => $order->get_id(),
      'pay_url'  => $order->get_checkout_payment_url(),
    ]);
  }
}
