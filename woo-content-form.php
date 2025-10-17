<?php
/**
 * Plugin Name: Woo Content Form
 * Plugin URI: https://keylargoscubadiving.com
 * Description: Professional custom fields for the Snorkeling Tours template with a clear, tabbed admin UI. Includes Hero, Experience, Journey, Marine Life, Trust, Booking, and Final CTA.
 * Version: 1.0.0
 * Author: Key Largo Scuba Diving
 * License: GPLv2 or later
 * Text Domain: woo-content-form
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add the Woo Content Form metabox for WooCommerce products in the snorkeling-trips category
 */
function wcf_add_metabox() {
    global $post;

    if (!isset($post) || get_post_type($post) !== 'product') {
        return;
    }

    $product_cats = wp_get_post_terms($post->ID, 'product_cat', array('fields' => 'slugs'));
    $eligible_slugs = array('snorkeling-trips', 'certification-courses');
    $eligible = false;
    foreach ($eligible_slugs as $slug) {
        if (in_array($slug, $product_cats, true)) { $eligible = true; break; }
    }
    if (!$eligible) {
        return;
    }

    add_meta_box(
        'wcf_template_fields',
        'Woo Content Form — Product Template Fields',
        'wcf_render_metabox',
        'product',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'wcf_add_metabox');

/**
 * Render the metabox content
 */
function wcf_render_metabox($post) {
    wp_nonce_field('wcf_save_fields', 'wcf_nonce');

    // Base defaults and reads
    $hero_headline      = get_post_meta($post->ID, '_wcf_hero_headline', true) ?: (get_the_title($post) ?: 'Christ of the Abyss Snorkeling Tour');
    $hero_subheadline   = get_post_meta($post->ID, '_wcf_hero_subheadline', true) ?: 'Famous 9-foot bronze Christ statue in crystal-clear water';
    $hero_bg_image      = get_post_meta($post->ID, '_wcf_hero_bg_image', true);
    $badge_1            = get_post_meta($post->ID, '_wcf_hero_badge_1', true) ?: '⭐ Best of Florida Keys';
    $badge_2            = get_post_meta($post->ID, '_wcf_hero_badge_2', true) ?: '🏆 #1 Rated Tour';
    $badge_3            = get_post_meta($post->ID, '_wcf_hero_badge_3', true) ?: '✓ No Booking Fees';
    $breadcrumb_label   = get_post_meta($post->ID, '_wcf_breadcrumb_label', true) ?: 'Tours';
    $rating             = get_post_meta($post->ID, '_wcf_rating', true) ?: '4.9';
    $review_count       = get_post_meta($post->ID, '_wcf_review_count', true) ?: '487';
    $duration           = get_post_meta($post->ID, '_wcf_duration', true) ?: '4 Hours';
    $group_size         = get_post_meta($post->ID, '_wcf_group_size', true) ?: '25 Max';
    $location           = get_post_meta($post->ID, '_wcf_location', true) ?: 'Key Largo';
    $gear_included      = get_post_meta($post->ID, '_wcf_gear_included', true) === '0' ? '0' : '1';
    $highlights         = get_post_meta($post->ID, '_wcf_highlights', true);
    if (is_string($highlights)) $highlights = array_filter(array_map('trim', explode("\n", $highlights)));
    if (empty($highlights)) $highlights = [
        'Famous 9-foot bronze Christ statue in crystal-clear water',
        'All snorkeling equipment included',
        'PADI certified guides',
        'Small group experience',
    ];
    $cta_label          = get_post_meta($post->ID, '_wcf_cta_label', true) ?: 'Book Your Adventure Now';
    $cta_link           = get_post_meta($post->ID, '_wcf_cta_link', true) ?: '#booking-section';

    // Experience & Included
    $exp_title          = get_post_meta($post->ID, '_wcf_exp_title', true) ?: 'What Makes This Experience Special';
    $exp_desc           = get_post_meta($post->ID, '_wcf_exp_desc', true) ?: 'Discover the world-famous Christ of the Abyss statue in the pristine waters of John Pennekamp Coral Reef State Park';
    $exp_features       = get_post_meta($post->ID, '_wcf_exp_features', true);
    if (!is_array($exp_features) || empty($exp_features)) {
        $exp_features = [
            ['icon' => 'Fish',  'title' => 'Iconic Underwater Statue',   'description' => 'Visit the famous 9-foot bronze Christ of the Abyss statue, standing majestically in 25 feet of crystal-clear water as a beacon of peace and wonder.'],
            ['icon' => 'Waves', 'title' => 'Pristine Marine Sanctuary', 'description' => 'Snorkel through vibrant coral gardens teeming with tropical fish in America\'s first underwater park, protected since 1963.'],
            ['icon' => 'Shield','title' => 'Expert Guidance',            'description' => 'Our PADI certified dive masters provide comprehensive safety briefings and marine life education throughout your journey.'],
        ];
    }
    $inc_title          = get_post_meta($post->ID, '_wcf_inc_title', true) ?: "What's Included";
    $inc_items          = get_post_meta($post->ID, '_wcf_inc_items', true);
    if (is_string($inc_items)) $inc_items = array_filter(array_map('trim', explode("\n", $inc_items)));
    if (empty($inc_items)) $inc_items = [
        'Professional snorkeling equipment',
        'PADI certified dive guide',
        'John Pennekamp park entrance',
        'Marine life identification guide',
        'Safety equipment & briefing',
        'Free parking',
    ];
    $inc_award          = get_post_meta($post->ID, '_wcf_inc_award', true) ?: 'Florida Keys Excellence Award Winner';

    // Journey
    $journey_title      = get_post_meta($post->ID, '_wcf_journey_title', true) ?: 'Your 4-Hour Journey';
    $journey_desc       = get_post_meta($post->ID, '_wcf_journey_desc', true) ?: 'From arrival to unforgettable memories';
    $journey_steps      = get_post_meta($post->ID, '_wcf_journey_steps', true);
    if (!is_array($journey_steps) || empty($journey_steps)) {
        $journey_steps = [
            ['title' => 'Welcome & Preparation', 'description' => 'Meet our team at John Pennekamp State Park for equipment fitting and comprehensive safety briefing.', 'time' => '8:00 AM - 30 minutes', 'color' => 'blue'],
            ['title' => 'Scenic Boat Journey',   'description' => 'Cruise through crystal-clear waters to the statue location while learning about the area\'s history.', 'time' => '8:30 AM - 30 minutes', 'color' => 'teal'],
            ['title' => 'Underwater Adventure',  'description' => 'Snorkel around the iconic Christ statue and explore the vibrant coral reef ecosystem.', 'time' => '9:00 AM - 2.5 hours', 'color' => 'orange'],
            ['title' => 'Return & Reflection',   'description' => 'Relax on the return journey while sharing your experience and planning future adventures.', 'time' => '11:30 AM - 30 minutes', 'color' => 'green'],
        ];
    }

    // Marine Life
    $marine_title       = get_post_meta($post->ID, '_wcf_marine_title', true) ?: 'Discover Incredible Marine Life';
    $marine_desc        = get_post_meta($post->ID, '_wcf_marine_desc', true) ?: 'John Pennekamp Coral Reef State Park hosts over 65 species of tropical fish and 40 species of coral in this protected underwater sanctuary.';
    $marine_categories  = get_post_meta($post->ID, '_wcf_marine_categories', true);
    if (!is_array($marine_categories) || empty($marine_categories)) {
        $marine_categories = [
            ['title' => 'Tropical Fish Paradise', 'description' => 'Swim alongside vibrant parrotfish, graceful angelfish, curious sergeant majors, and over 60 other colorful species that call these reefs home.', 'color' => 'blue', 'features' => ['Queen Angelfish', 'Stoplight Parrotfish', 'Yellowtail Snapper']],
            ['title' => 'Living Coral Gardens',   'description' => 'Explore thriving coral formations including massive brain corals, delicate sea fans, and the iconic elkhorn coral structures.', 'color' => 'teal', 'features' => ['Brain Coral Colonies', 'Sea Fan Gardens', 'Staghorn Formations']],
            ['title' => 'Underwater Photography', 'description' => 'Capture stunning images of the Christ statue surrounded by marine life with crystal-clear 60-80 foot visibility perfect for photography.', 'color' => 'orange', 'features' => ['Professional Photo Tips', 'Camera Rental Available', 'Perfect Lighting Conditions']],
        ];
    }

    // Trust
    $trust_title        = get_post_meta($post->ID, '_wcf_trust_title', true) ?: 'Why Key Largo Scuba Diving';
    $trust_subtitle     = get_post_meta($post->ID, '_wcf_trust_subtitle', true) ?: "The Florida Keys' most trusted diving experience";
    $trust_stats        = get_post_meta($post->ID, '_wcf_trust_stats', true);
    if (!is_array($trust_stats) || empty($trust_stats)) {
        $trust_stats = [
            ['value' => '25+',     'label' => 'Years Experience'],
            ['value' => '50,000+', 'label' => 'Happy Guests'],
            ['value' => '4.9/5',   'label' => 'Average Rating'],
            ['value' => '100%',    'label' => 'Safety Record'],
        ];
    }

    // Pricing / Booking
    $pricing_base       = get_post_meta($post->ID, '_wcf_pricing_base', true);
    if ($pricing_base === '') $pricing_base = '70';
    $pricing_tax        = get_post_meta($post->ID, '_wcf_pricing_tax', true);
    if ($pricing_tax === '') $pricing_tax = '0.07';
    $pricing_currency   = get_post_meta($post->ID, '_wcf_pricing_currency', true) ?: 'USD';

    // Final CTA
    $final_title        = get_post_meta($post->ID, '_wcf_final_title', true) ?: 'Ready for Your Underwater Adventure?';
    $final_desc         = get_post_meta($post->ID, '_wcf_final_desc', true) ?: 'Book your Christ of the Abyss experience today and create memories that will last a lifetime.';
    $final_phone        = get_post_meta($post->ID, '_wcf_final_phone', true) ?: '(305) 391-4040';
    $final_benefits     = get_post_meta($post->ID, '_wcf_final_benefits', true);
    if (is_string($final_benefits)) $final_benefits = array_filter(array_map('trim', explode("\n", $final_benefits)));
    if (empty($final_benefits)) $final_benefits = ['Instant confirmation', 'Free cancellation', 'Best price guarantee'];

    // Status / Overrides
    $nextjs_override    = get_post_meta($post->ID, '_wcf_nextjs_override', true) === '1' ? '1' : '0';
    $nextjs_base_url    = get_option('wcf_nextjs_base_url');

    ?>
    <style>
        .wcf-tabs { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .wcf-tab { padding: 8px 12px; border: 1px solid #d0d7de; background: #f6f8fa; border-radius: 6px; font-weight: 600; cursor: pointer; }
        .wcf-tab.active { background: #0969da; color: #fff; border-color: #0969da; }
        .wcf-card { background: #fff; border: 1px solid #d0d7de; border-radius: 8px; }
        .wcf-table { width: 100%; border-collapse: collapse; }
        .wcf-table th { text-align: left; padding: 14px 10px; width: 240px; vertical-align: top; font-weight: 600; background: #f6f8fa; border-bottom: 1px solid #eaeef2; }
        .wcf-table td { padding: 14px 10px; border-bottom: 1px solid #eaeef2; }
        .wcf-input, .wcf-textarea, .wcf-select { width: 100%; padding: 8px; border: 1px solid #d0d7de; border-radius: 6px; }
        .wcf-textarea { min-height: 90px; }
        .wcf-help { color: #57606a; font-size: 12px; margin-top: 6px; font-style: italic; }
        .wcf-section-title { font-size: 14px; font-weight: 700; margin: 0; }
        .wcf-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; }
        .wcf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .wcf-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
        .wcf-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .wcf-section { display: none; }
        .wcf-section.active { display: block; }
        .wcf-hint { background: #f0f7ff; border: 1px solid #cfe3ff; padding: 10px; border-radius: 6px; }
        .wcf-subtle { color: #6b7280; font-size: 12px; }
    </style>
    <script>
    document.addEventListener('DOMContentLoaded', function(){
        const tabs = document.querySelectorAll('.wcf-tab');
        const sections = document.querySelectorAll('.wcf-section');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');
                tabs.forEach(t => t.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                tab.classList.add('active');
                const el = document.querySelector('.wcf-section[data-section="' + target + '"]');
                if (el) el.classList.add('active');
            });
        });
        const firstActive = document.querySelector('.wcf-tab.active');
        if (!firstActive && tabs[0]) tabs[0].click();
    });
    </script>

    <div class="wcf-tabs">
        <div class="wcf-tab active" data-tab="hero">Hero</div>
        <div class="wcf-tab" data-tab="experience">Experience</div>
        <div class="wcf-tab" data-tab="journey">Journey</div>
        <div class="wcf-tab" data-tab="marine">Marine Life</div>
        <div class="wcf-tab" data-tab="trust">Trust</div>
        <div class="wcf-tab" data-tab="booking">Booking</div>
        <div class="wcf-tab" data-tab="final">Final CTA</div>
        <div class="wcf-tab" data-tab="status">Status</div>
    </div>

    <!-- HERO -->
    <div class="wcf-section active" data-section="hero">
      <div class="wcf-card">
        <table class="wcf-table">
          <tr>
            <th>
              <div class="wcf-section-title">Page Mapping</div>
              <div class="wcf-help">These fields power the Hero section</div>
            </th>
            <td class="wcf-mono">app/snorkeling-tours-template/sections/HeroSection.tsx</td>
          </tr>
          <tr>
            <th><label for="wcf_hero_headline">Hero Headline</label></th>
            <td><input type="text" id="wcf_hero_headline" name="wcf_hero_headline" value="<?php echo esc_attr($hero_headline); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label for="wcf_hero_subheadline">Hero Subheadline</label></th>
            <td><input type="text" id="wcf_hero_subheadline" name="wcf_hero_subheadline" value="<?php echo esc_attr($hero_subheadline); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label for="wcf_hero_bg_image">Background Image URL</label></th>
            <td><input type="url" id="wcf_hero_bg_image" name="wcf_hero_bg_image" value="<?php echo esc_attr($hero_bg_image); ?>" placeholder="If left empty, the product image will be used by default" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label>Trust Badges</label></th>
            <td class="wcf-grid-3">
              <input type="text" name="wcf_hero_badge_1" value="<?php echo esc_attr($badge_1); ?>" class="wcf-input" />
              <input type="text" name="wcf_hero_badge_2" value="<?php echo esc_attr($badge_2); ?>" class="wcf-input" />
              <input type="text" name="wcf_hero_badge_3" value="<?php echo esc_attr($badge_3); ?>" class="wcf-input" />
            </td>
          </tr>
          <tr>
            <th><label for="wcf_breadcrumb_label">Breadcrumb Label</label></th>
            <td><input type="text" id="wcf_breadcrumb_label" name="wcf_breadcrumb_label" value="<?php echo esc_attr($breadcrumb_label); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label>Quick Info</label></th>
            <td class="wcf-grid-4">
              <input type="text" placeholder="Duration" name="wcf_duration" value="<?php echo esc_attr($duration); ?>" class="wcf-input" />
              <input type="text" placeholder="Group Size" name="wcf_group_size" value="<?php echo esc_attr($group_size); ?>" class="wcf-input" />
              <input type="text" placeholder="Location" name="wcf_location" value="<?php echo esc_attr($location); ?>" class="wcf-input" />
              <select name="wcf_gear_included" class="wcf-select">
                <option value="1" <?php selected($gear_included, '1'); ?>>Gear Included</option>
                <option value="0" <?php selected($gear_included, '0'); ?>>Gear Not Included</option>
              </select>
            </td>
          </tr>
          <tr>
            <th><label>Star Rating</label></th>
            <td class="wcf-grid-2">
              <input type="number" step="0.1" min="0" max="5" name="wcf_rating" value="<?php echo esc_attr($rating); ?>" class="wcf-input" />
              <input type="number" min="0" name="wcf_review_count" value="<?php echo esc_attr($review_count); ?>" class="wcf-input" />
            </td>
          </tr>
          <tr>
            <th><label for="wcf_highlights">Key Selling Points</label></th>
            <td>
              <textarea id="wcf_highlights" name="wcf_highlights" class="wcf-textarea"><?php echo esc_textarea(is_array($highlights) ? implode("\n", $highlights) : $highlights); ?></textarea>
              <div class="wcf-help">One item per line. Shown as checkmarked bullet points.</div>
            </td>
          </tr>
          <tr>
            <th><label>Primary CTA</label></th>
            <td class="wcf-grid-2">
              <input type="text" name="wcf_cta_label" value="<?php echo esc_attr($cta_label); ?>" class="wcf-input" />
              <input type="text" name="wcf_cta_link" value="<?php echo esc_attr($cta_link); ?>" class="wcf-input" />
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- EXPERIENCE -->
    <div class="wcf-section" data-section="experience">
      <div class="wcf-card">
        <table class="wcf-table">
          <tr>
            <th><div class="wcf-section-title">Page Mapping</div><div class="wcf-help">Experience + Included</div></th>
            <td class="wcf-mono">app/snorkeling-tours-template/sections/ExperienceSection.tsx</td>
          </tr>
          <tr>
            <th><label for="wcf_exp_title">Section Title</label></th>
            <td><input type="text" id="wcf_exp_title" name="wcf_exp_title" value="<?php echo esc_attr($exp_title); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label for="wcf_exp_desc">Section Description</label></th>
            <td><input type="text" id="wcf_exp_desc" name="wcf_exp_desc" value="<?php echo esc_attr($exp_desc); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label>Key Features (3)</label></th>
            <td>
              <?php for ($i=0; $i<3; $i++): $f = $exp_features[$i] ?? ['icon'=>'Fish','title'=>'','description'=>'']; ?>
              <div class="wcf-grid-3" style="margin-bottom:8px;">
                <select name="wcf_exp_feature_icon[]" class="wcf-select">
                  <option value="Fish" <?php selected($f['icon'],'Fish'); ?>>Fish</option>
                  <option value="Waves" <?php selected($f['icon'],'Waves'); ?>>Waves</option>
                  <option value="Shield" <?php selected($f['icon'],'Shield'); ?>>Shield</option>
                </select>
                <input type="text" name="wcf_exp_feature_title[]" value="<?php echo esc_attr($f['title']); ?>" placeholder="Title" class="wcf-input" />
                <input type="text" name="wcf_exp_feature_desc[]" value="<?php echo esc_attr($f['description']); ?>" placeholder="Description" class="wcf-input" />
              </div>
              <?php endfor; ?>
              <div class="wcf-hint wcf-subtle">Icons support: Fish, Waves, Shield</div>
            </td>
          </tr>
          <tr>
            <th><label for="wcf_inc_title">Included Title</label></th>
            <td><input type="text" id="wcf_inc_title" name="wcf_inc_title" value="<?php echo esc_attr($inc_title); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label for="wcf_inc_items">Included Items</label></th>
            <td>
              <textarea id="wcf_inc_items" name="wcf_inc_items" class="wcf-textarea"><?php echo esc_textarea(is_array($inc_items) ? implode("\n", $inc_items) : $inc_items); ?></textarea>
              <div class="wcf-help">One per line</div>
            </td>
          </tr>
          <tr>
            <th><label for="wcf_inc_award">Award (optional)</label></th>
            <td><input type="text" id="wcf_inc_award" name="wcf_inc_award" value="<?php echo esc_attr($inc_award); ?>" class="wcf-input" /></td>
          </tr>
        </table>
      </div>
    </div>

    <!-- JOURNEY -->
    <div class="wcf-section" data-section="journey">
      <div class="wcf-card">
        <table class="wcf-table">
          <tr>
            <th><div class="wcf-section-title">Page Mapping</div><div class="wcf-help">Itinerary steps</div></th>
            <td class="wcf-mono">app/snorkeling-tours-template/sections/JourneySection.tsx</td>
          </tr>
          <tr>
            <th><label for="wcf_journey_title">Section Title</label></th>
            <td><input type="text" id="wcf_journey_title" name="wcf_journey_title" value="<?php echo esc_attr($journey_title); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label for="wcf_journey_desc">Section Description</label></th>
            <td><input type="text" id="wcf_journey_desc" name="wcf_journey_desc" value="<?php echo esc_attr($journey_desc); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label>Steps (up to 6)</label></th>
            <td>
              <?php for ($i=0; $i<6; $i++): $s = $journey_steps[$i] ?? ['title'=>'','description'=>'','time'=>'','color'=>'blue']; ?>
              <div class="wcf-grid-4" style="margin-bottom:8px;">
                <input type="text" name="wcf_journey_step_title[]" value="<?php echo esc_attr($s['title']); ?>" placeholder="Title" class="wcf-input" />
                <input type="text" name="wcf_journey_step_desc[]" value="<?php echo esc_attr($s['description']); ?>" placeholder="Description" class="wcf-input" />
                <input type="text" name="wcf_journey_step_time[]" value="<?php echo esc_attr($s['time']); ?>" placeholder="Time (e.g., 8:00 AM - 30 min)" class="wcf-input" />
                <select name="wcf_journey_step_color[]" class="wcf-select">
                  <option value="blue" <?php selected($s['color'],'blue'); ?>>blue</option>
                  <option value="teal" <?php selected($s['color'],'teal'); ?>>teal</option>
                  <option value="orange" <?php selected($s['color'],'orange'); ?>>orange</option>
                  <option value="green" <?php selected($s['color'],'green'); ?>>green</option>
                </select>
              </div>
              <?php endfor; ?>
              <div class="wcf-hint wcf-subtle">Leave unused rows blank</div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- MARINE LIFE -->
    <div class="wcf-section" data-section="marine">
      <div class="wcf-card">
        <table class="wcf-table">
          <tr>
            <th><div class="wcf-section-title">Page Mapping</div><div class="wcf-help">Categories with features</div></th>
            <td class="wcf-mono">app/snorkeling-tours-template/sections/MarineLifeSection.tsx</td>
          </tr>
          <tr>
            <th><label for="wcf_marine_title">Section Title</label></th>
            <td><input type="text" id="wcf_marine_title" name="wcf_marine_title" value="<?php echo esc_attr($marine_title); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label for="wcf_marine_desc">Section Description</label></th>
            <td><input type="text" id="wcf_marine_desc" name="wcf_marine_desc" value="<?php echo esc_attr($marine_desc); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label>Categories (3)</label></th>
            <td>
              <?php for ($i=0; $i<3; $i++): $c = $marine_categories[$i] ?? ['title'=>'','description'=>'','color'=>'blue','features'=>[]]; ?>
              <div class="wcf-grid-3" style="margin-bottom:8px;">
                <input type="text" name="wcf_marine_cat_title[]" value="<?php echo esc_attr($c['title']); ?>" placeholder="Category Title" class="wcf-input" />
                <input type="text" name="wcf_marine_cat_desc[]" value="<?php echo esc_attr($c['description']); ?>" placeholder="Short Description" class="wcf-input" />
                <select name="wcf_marine_cat_color[]" class="wcf-select">
                  <option value="blue" <?php selected($c['color'],'blue'); ?>>blue</option>
                  <option value="teal" <?php selected($c['color'],'teal'); ?>>teal</option>
                  <option value="orange" <?php selected($c['color'],'orange'); ?>>orange</option>
                </select>
              </div>
              <div style="margin-bottom:12px;">
                <textarea name="wcf_marine_cat_features_text[]" class="wcf-textarea" placeholder="One feature per line"><?php echo esc_textarea(is_array($c['features']) ? implode("\n", $c['features']) : ''); ?></textarea>
              </div>
              <?php endfor; ?>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- TRUST -->
    <div class="wcf-section" data-section="trust">
      <div class="wcf-card">
        <table class="wcf-table">
          <tr>
            <th><div class="wcf-section-title">Page Mapping</div></th>
            <td class="wcf-mono">app/snorkeling-tours-template/sections/TrustSection.tsx</td>
          </tr>
          <tr>
            <th><label for="wcf_trust_title">Section Title</label></th>
            <td><input type="text" id="wcf_trust_title" name="wcf_trust_title" value="<?php echo esc_attr($trust_title); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label for="wcf_trust_subtitle">Subtitle</label></th>
            <td><input type="text" id="wcf_trust_subtitle" name="wcf_trust_subtitle" value="<?php echo esc_attr($trust_subtitle); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label>Stats (4)</label></th>
            <td>
              <?php for ($i=0; $i<4; $i++): $st = $trust_stats[$i] ?? ['value'=>'','label'=>'']; ?>
              <div class="wcf-grid-2" style="margin-bottom:8px;">
                <input type="text" name="wcf_trust_stat_value[]" value="<?php echo esc_attr($st['value']); ?>" placeholder="Value (e.g., 25+)" class="wcf-input" />
                <input type="text" name="wcf_trust_stat_label[]" value="<?php echo esc_attr($st['label']); ?>" placeholder="Label (e.g., Years Experience)" class="wcf-input" />
              </div>
              <?php endfor; ?>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- BOOKING / PRICING -->
    <div class="wcf-section" data-section="booking">
      <div class="wcf-card">
        <table class="wcf-table">
          <tr>
            <th><div class="wcf-section-title">Page Mapping</div></th>
            <td class="wcf-mono">app/snorkeling-tours-template/sections/BookingSection.tsx</td>
          </tr>
          <tr>
            <th><label>Pricing</label></th>
            <td class="wcf-grid-3">
              <input type="number" step="0.01" min="0" name="wcf_pricing_base" value="<?php echo esc_attr($pricing_base); ?>" placeholder="Base Price per Person" class="wcf-input" />
              <input type="number" step="0.0001" min="0" max="1" name="wcf_pricing_tax" value="<?php echo esc_attr($pricing_tax); ?>" placeholder="Tax Rate (e.g., 0.07)" class="wcf-input" />
              <input type="text" name="wcf_pricing_currency" value="<?php echo esc_attr($pricing_currency); ?>" placeholder="Currency (e.g., USD)" class="wcf-input" />
            </td>
          </tr>
          <tr>
            <th><label>Helpful Notes</label></th>
            <td><div class="wcf-hint wcf-subtle">Live WooCommerce pricing still applies at checkout; this controls on-page display and totals.</div></td>
          </tr>
        </table>
      </div>
    </div>

    <!-- FINAL CTA -->
    <div class="wcf-section" data-section="final">
      <div class="wcf-card">
        <table class="wcf-table">
          <tr>
            <th><div class="wcf-section-title">Page Mapping</div></th>
            <td class="wcf-mono">app/snorkeling-tours-template/sections/FinalCTASection.tsx</td>
          </tr>
          <tr>
            <th><label for="wcf_final_title">CTA Title</label></th>
            <td><input type="text" id="wcf_final_title" name="wcf_final_title" value="<?php echo esc_attr($final_title); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label for="wcf_final_desc">CTA Description</label></th>
            <td><input type="text" id="wcf_final_desc" name="wcf_final_desc" value="<?php echo esc_attr($final_desc); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label for="wcf_final_phone">Phone</label></th>
            <td><input type="text" id="wcf_final_phone" name="wcf_final_phone" value="<?php echo esc_attr($final_phone); ?>" class="wcf-input" /></td>
          </tr>
          <tr>
            <th><label for="wcf_final_benefits">Benefits</label></th>
            <td>
              <textarea id="wcf_final_benefits" name="wcf_final_benefits" class="wcf-textarea"><?php echo esc_textarea(is_array($final_benefits) ? implode("\n", $final_benefits) : $final_benefits); ?></textarea>
              <div class="wcf-help">One per line</div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- STATUS -->
    <div class="wcf-section" data-section="status">
      <div class="wcf-card">
        <table class="wcf-table">
          <tr>
            <th><div class="wcf-section-title">Template Override</div></th>
            <td>
              <label style="display:flex;align-items:center;gap:8px;">
                <input type="checkbox" name="wcf_nextjs_override" value="1" <?php checked($nextjs_override, '1'); ?> />
                <strong>Enable Next.js Template Override</strong>
              </label>
              <div class="wcf-help">When enabled, the WooCommerce product body will display your Next.js template. WordPress/Woo headers and footers remain.</div>
            </td>
          </tr>
          <tr>
            <th><label for="wcf_nextjs_base_url">Next.js Base URL (optional)</label></th>
            <td>
              <input type="url" id="wcf_nextjs_base_url" name="wcf_nextjs_base_url" value="<?php echo esc_attr($nextjs_base_url !== '' ? $nextjs_base_url : wcf_get_next_base_url()); ?>" class="wcf-input" placeholder="https://your-next-site.com" />
              <div class="wcf-help">If empty, defaults to this site URL. Full page path will be resolved automatically to <code>/product/{slug}</code>.</div>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <?php
}

/**
 * Save handler for Woo Content Form
 */
function wcf_save_fields($post_id) {
    if (!isset($_POST['wcf_nonce']) || !wp_verify_nonce($_POST['wcf_nonce'], 'wcf_save_fields')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;
    if (get_post_type($post_id) !== 'product') return;

    $product_cats = wp_get_post_terms($post_id, 'product_cat', array('fields' => 'slugs'));
    $eligible_slugs = array('snorkeling-trips', 'certification-courses');
    $eligible = false;
    foreach ($eligible_slugs as $slug) { if (in_array($slug, $product_cats, true)) { $eligible = true; break; } }
    if (!$eligible) return;

    // Simple text/meta fields map
    $text_fields = [
        'wcf_hero_headline'    => '_wcf_hero_headline',
        'wcf_hero_subheadline' => '_wcf_hero_subheadline',
        'wcf_hero_bg_image'    => '_wcf_hero_bg_image',
        'wcf_hero_badge_1'     => '_wcf_hero_badge_1',
        'wcf_hero_badge_2'     => '_wcf_hero_badge_2',
        'wcf_hero_badge_3'     => '_wcf_hero_badge_3',
        'wcf_breadcrumb_label' => '_wcf_breadcrumb_label',
        'wcf_duration'         => '_wcf_duration',
        'wcf_group_size'       => '_wcf_group_size',
        'wcf_location'         => '_wcf_location',
        'wcf_cta_label'        => '_wcf_cta_label',
        'wcf_cta_link'         => '_wcf_cta_link',
        'wcf_exp_title'        => '_wcf_exp_title',
        'wcf_exp_desc'         => '_wcf_exp_desc',
        'wcf_inc_title'        => '_wcf_inc_title',
        'wcf_inc_award'        => '_wcf_inc_award',
        'wcf_journey_title'    => '_wcf_journey_title',
        'wcf_journey_desc'     => '_wcf_journey_desc',
        'wcf_marine_title'     => '_wcf_marine_title',
        'wcf_marine_desc'      => '_wcf_marine_desc',
        'wcf_trust_title'      => '_wcf_trust_title',
        'wcf_trust_subtitle'   => '_wcf_trust_subtitle',
        'wcf_pricing_currency' => '_wcf_pricing_currency',
        'wcf_final_title'      => '_wcf_final_title',
        'wcf_final_desc'       => '_wcf_final_desc',
        'wcf_final_phone'      => '_wcf_final_phone',
    ];
    foreach ($text_fields as $post_key => $meta_key) {
        if (isset($_POST[$post_key])) update_post_meta($post_id, $meta_key, sanitize_text_field(wp_unslash($_POST[$post_key])));
    }

    // Booleans / numbers
    if (isset($_POST['wcf_gear_included'])) update_post_meta($post_id, '_wcf_gear_included', $_POST['wcf_gear_included'] === '1' ? '1' : '0');
    if (isset($_POST['wcf_rating'])) update_post_meta($post_id, '_wcf_rating', floatval($_POST['wcf_rating']));
    if (isset($_POST['wcf_review_count'])) update_post_meta($post_id, '_wcf_review_count', intval($_POST['wcf_review_count']));
    if (isset($_POST['wcf_pricing_base'])) update_post_meta($post_id, '_wcf_pricing_base', floatval($_POST['wcf_pricing_base']));
    if (isset($_POST['wcf_pricing_tax'])) update_post_meta($post_id, '_wcf_pricing_tax', floatval($_POST['wcf_pricing_tax']));

    // Status / Overrides
    $override_on = isset($_POST['wcf_nextjs_override']) && $_POST['wcf_nextjs_override'] === '1' ? '1' : '0';
    update_post_meta($post_id, '_wcf_nextjs_override', $override_on);
    if (isset($_POST['wcf_nextjs_base_url'])) update_option('wcf_nextjs_base_url', esc_url_raw($_POST['wcf_nextjs_base_url']));

    // Highlights
    if (isset($_POST['wcf_highlights'])) {
        $items = array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', wp_unslash($_POST['wcf_highlights']))));
        $items = array_map('sanitize_text_field', $items);
        update_post_meta($post_id, '_wcf_highlights', $items);
    }

    // Included items
    if (isset($_POST['wcf_inc_items'])) {
        $items = array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', wp_unslash($_POST['wcf_inc_items']))));
        $items = array_map('sanitize_text_field', $items);
        update_post_meta($post_id, '_wcf_inc_items', $items);
    }

    // Experience features arrays
    $icons  = isset($_POST['wcf_exp_feature_icon'])  ? array_map('sanitize_text_field', (array) $_POST['wcf_exp_feature_icon'])  : [];
    $titles = isset($_POST['wcf_exp_feature_title']) ? array_map('sanitize_text_field', (array) $_POST['wcf_exp_feature_title']) : [];
    $descs  = isset($_POST['wcf_exp_feature_desc'])  ? array_map('sanitize_text_field', (array) $_POST['wcf_exp_feature_desc'])  : [];
    $features = [];
    $max = max(count($icons), count($titles), count($descs));
    for ($i=0; $i<$max; $i++) {
        $t = $titles[$i] ?? '';
        $d = $descs[$i] ?? '';
        $ic= $icons[$i] ?? 'Fish';
        if (trim($t) !== '' || trim($d) !== '') $features[] = ['icon'=>$ic,'title'=>$t,'description'=>$d];
    }
    update_post_meta($post_id, '_wcf_exp_features', $features);

    // Journey steps arrays
    $st_titles = isset($_POST['wcf_journey_step_title']) ? array_map('sanitize_text_field', (array) $_POST['wcf_journey_step_title']) : [];
    $st_descs  = isset($_POST['wcf_journey_step_desc'])  ? array_map('sanitize_text_field', (array) $_POST['wcf_journey_step_desc'])  : [];
    $st_times  = isset($_POST['wcf_journey_step_time'])  ? array_map('sanitize_text_field', (array) $_POST['wcf_journey_step_time'])  : [];
    $st_colors = isset($_POST['wcf_journey_step_color']) ? array_map('sanitize_text_field', (array) $_POST['wcf_journey_step_color']) : [];
    $steps = [];
    $maxs = max(count($st_titles), count($st_descs), count($st_times), count($st_colors));
    for ($i=0; $i<$maxs; $i++) {
        $tt = $st_titles[$i] ?? '';
        $dd = $st_descs[$i] ?? '';
        $tm = $st_times[$i] ?? '';
        $cc = $st_colors[$i] ?? 'blue';
        if (trim($tt) !== '' || trim($dd) !== '' || trim($tm) !== '') $steps[] = ['title'=>$tt,'description'=>$dd,'time'=>$tm,'color'=>$cc];
    }
    update_post_meta($post_id, '_wcf_journey_steps', $steps);

    // Marine categories arrays
    $mc_titles = isset($_POST['wcf_marine_cat_title']) ? array_map('sanitize_text_field', (array) $_POST['wcf_marine_cat_title']) : [];
    $mc_descs  = isset($_POST['wcf_marine_cat_desc'])  ? array_map('sanitize_text_field', (array) $_POST['wcf_marine_cat_desc'])  : [];
    $mc_colors = isset($_POST['wcf_marine_cat_color']) ? array_map('sanitize_text_field', (array) $_POST['wcf_marine_cat_color']) : [];
    $mc_featsT = isset($_POST['wcf_marine_cat_features_text']) ? (array) $_POST['wcf_marine_cat_features_text'] : [];
    $cats = [];
    $maxc = max(count($mc_titles), count($mc_descs), count($mc_colors), count($mc_featsT));
    for ($i=0; $i<$maxc; $i++) {
        $t = $mc_titles[$i] ?? '';
        $d = $mc_descs[$i] ?? '';
        $c = $mc_colors[$i] ?? 'blue';
        $ft = $mc_featsT[$i] ?? '';
        $features = array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', wp_unslash($ft))));
        $features = array_map('sanitize_text_field', $features);
        if (trim($t) !== '' || trim($d) !== '') $cats[] = ['title'=>$t,'description'=>$d,'color'=>$c,'features'=>$features];
    }
    update_post_meta($post_id, '_wcf_marine_categories', $cats);

    // Trust stats arrays
    $ts_vals = isset($_POST['wcf_trust_stat_value']) ? array_map('sanitize_text_field', (array) $_POST['wcf_trust_stat_value']) : [];
    $ts_lbls = isset($_POST['wcf_trust_stat_label']) ? array_map('sanitize_text_field', (array) $_POST['wcf_trust_stat_label']) : [];
    $stats = [];
    $maxst = max(count($ts_vals), count($ts_lbls));
    for ($i=0; $i<$maxst; $i++) {
        $v = $ts_vals[$i] ?? '';
        $l = $ts_lbls[$i] ?? '';
        if (trim($v) !== '' || trim($l) !== '') $stats[] = ['value'=>$v,'label'=>$l];
    }
    update_post_meta($post_id, '_wcf_trust_stats', $stats);

    // Final benefits
    if (isset($_POST['wcf_final_benefits'])) {
        $items = array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', wp_unslash($_POST['wcf_final_benefits']))));
        $items = array_map('sanitize_text_field', $items);
        update_post_meta($post_id, '_wcf_final_benefits', $items);
    }
}
add_action('save_post', 'wcf_save_fields');

/**
 * Helper: Build full TourData structure for frontend consumption
 */
function wcf_get_full_tour_data($product_id) {
    $name = get_post_meta($product_id, '_wcf_hero_headline', true) ?: get_the_title($product_id);
    $description = get_post_meta($product_id, '_wcf_hero_subheadline', true) ?: '';

    // Images
    $hero = get_post_meta($product_id, '_wcf_hero_bg_image', true);
    if (!$hero) {
        $hero = get_the_post_thumbnail_url($product_id, 'full');
    }
    $gallery = [];
    $product = wc_get_product($product_id);
    if ($product) {
        $image_ids = $product->get_gallery_image_ids();
        if ($product->get_image_id()) array_unshift($image_ids, $product->get_image_id());
        foreach ($image_ids as $img_id) {
            $url = wp_get_attachment_image_url($img_id, 'full');
            if ($url) $gallery[] = $url;
        }
    }

    $data = array(
        'name' => $name,
        'description' => $description,
        'images' => array(
            'hero' => $hero,
            'gallery' => $gallery,
        ),
        'categories' => array(get_post_meta($product_id, '_wcf_breadcrumb_label', true) ?: 'Tours'),
        'details' => array(
            'duration' => get_post_meta($product_id, '_wcf_duration', true),
            'groupSize' => get_post_meta($product_id, '_wcf_group_size', true),
            'location' => get_post_meta($product_id, '_wcf_location', true),
            'gearIncluded' => get_post_meta($product_id, '_wcf_gear_included', true) === '1',
            'rating' => floatval(get_post_meta($product_id, '_wcf_rating', true)),
            'reviewCount' => intval(get_post_meta($product_id, '_wcf_review_count', true)),
        ),
        'highlights' => get_post_meta($product_id, '_wcf_highlights', true) ?: array(),
        'pricing' => array(
            'basePrice' => floatval(get_post_meta($product_id, '_wcf_pricing_base', true) ?: 70),
            'taxRate' => floatval(get_post_meta($product_id, '_wcf_pricing_tax', true) ?: 0.07),
            'currency' => get_post_meta($product_id, '_wcf_pricing_currency', true) ?: 'USD',
        ),
        'experience' => array(
            'title' => get_post_meta($product_id, '_wcf_exp_title', true) ?: '',
            'description' => get_post_meta($product_id, '_wcf_exp_desc', true) ?: '',
            'features' => get_post_meta($product_id, '_wcf_exp_features', true) ?: array(),
        ),
        'included' => array(
            'title' => get_post_meta($product_id, '_wcf_inc_title', true) ?: "What's Included",
            'items' => get_post_meta($product_id, '_wcf_inc_items', true) ?: array(),
            'award' => get_post_meta($product_id, '_wcf_inc_award', true) ?: '',
        ),
        'journey' => array(
            'title' => get_post_meta($product_id, '_wcf_journey_title', true) ?: '',
            'description' => get_post_meta($product_id, '_wcf_journey_desc', true) ?: '',
            'steps' => array_map(function($i, $step){ return array(
                'step' => $i + 1,
                'title' => isset($step['title']) ? $step['title'] : '',
                'description' => isset($step['description']) ? $step['description'] : '',
                'time' => isset($step['time']) ? $step['time'] : '',
                'color' => isset($step['color']) ? $step['color'] : 'blue',
            ); }, array_keys((array) get_post_meta($product_id, '_wcf_journey_steps', true)), (array) get_post_meta($product_id, '_wcf_journey_steps', true)),
        ),
        'marineLife' => array(
            'title' => get_post_meta($product_id, '_wcf_marine_title', true) ?: '',
            'description' => get_post_meta($product_id, '_wcf_marine_desc', true) ?: '',
            'categories' => get_post_meta($product_id, '_wcf_marine_categories', true) ?: array(),
        ),
        'trustIndicators' => array(
            'title' => get_post_meta($product_id, '_wcf_trust_title', true) ?: '',
            'subtitle' => get_post_meta($product_id, '_wcf_trust_subtitle', true) ?: '',
            'stats' => get_post_meta($product_id, '_wcf_trust_stats', true) ?: array(),
        ),
        'finalCTA' => array(
            'title' => get_post_meta($product_id, '_wcf_final_title', true) ?: '',
            'description' => get_post_meta($product_id, '_wcf_final_desc', true) ?: '',
            'phone' => get_post_meta($product_id, '_wcf_final_phone', true) ?: '',
            'benefits' => get_post_meta($product_id, '_wcf_final_benefits', true) ?: array(),
        ),
    );

    return $data;
}

/**
 * Expose Woo Content Form data in WooCommerce REST product responses
 */
add_filter('woocommerce_rest_prepare_product_object', function($response, $object, $request){
    $product_id = $object->get_id();
    $response->data['wcf_tour_data'] = wcf_get_full_tour_data($product_id);
    return $response;
}, 10, 3);

/**
 * Optional admin notice to help locate fields
 */
function wcf_admin_notice() {
    $screen = get_current_screen();
    if ($screen && $screen->post_type === 'product') {
        echo '<div class="notice notice-info is-dismissible"><p><strong>Woo Content Form:</strong> Add your product to the <code>snorkeling-trips</code> or <code>certification-courses</code> category to configure template sections.</p></div>';
    }
}
add_action('admin_notices', 'wcf_admin_notice');

/**
 * Helper: Resolve Next.js Base URL with site-wide default
 */
function wcf_get_next_base_url() {
    $url = trim((string) get_option('wcf_nextjs_base_url'));
    if ($url === '') {
        $url = 'https://livewsnklsdlaucnh.netlify.app/';
    }
    $url = trailingslashit($url);
    return apply_filters('wcf_next_base_url', $url);
}

// Removed head-level CSS injection to avoid affecting non-product pages

/**
 * Frontend: Replace WooCommerce product content with Next.js template when override is ON (SSR fetch)
 */
add_filter('the_content', function($content){
    try {
    // Only run on the actual single product page main content (avoid loops, homepage)
    if (is_admin() || is_front_page() || is_home()) return $content;
    if (!is_singular('product') || !in_the_loop() || !is_main_query()) return $content;
    global $post;
    if (!$post) return $content;
    if ((int) get_queried_object_id() !== (int) $post->ID) return $content;

    // Limit to eligible categories
    $cats = wp_get_post_terms($post->ID, 'product_cat', array('fields' => 'slugs'));
    $eligible_slugs = array('snorkeling-trips', 'certification-courses');
    $eligible = false;
    foreach ($eligible_slugs as $slug) { if (in_array($slug, (array) $cats, true)) { $eligible = true; break; } }
    if (!$eligible) return $content;

    $override = get_post_meta($post->ID, '_wcf_nextjs_override', true) === '1';
    if (!$override) return $content;

    $diagnostic = array();

    // Resolve Next.js Base URL (site-wide default if option not set)
    $base = wcf_get_next_base_url();

    // Validate and normalize base URL
    $parsed = wp_parse_url($base);
    if (empty($parsed['scheme']) || empty($parsed['host'])) {
        if (current_user_can('manage_options')) {
            return $content . '<!-- WCF: Invalid Next.js Base URL -->';
        }
        return $content;
    }
    $current = wp_parse_url(home_url('/'));
    if (!empty($current['host']) && strtolower($parsed['host']) === strtolower($current['host'])) {
        // Prevent fetching from same WP host to avoid recursion/lockups
        if (current_user_can('manage_options')) {
            return $content . '<!-- WCF: Blocked same-host fetch to prevent recursion -->';
        }
        return $content;
    }

    // Build Next.js route using product slug
    $slug = $post->post_name;
    $base = trailingslashit($base);
    $url = $base . 'product/' . rawurlencode($slug) . '/';
    $url_fallback = $base . 'snorkeling-trips/' . rawurlencode($slug) . '/?embed=1';

    // Cache to reduce latency (also cache failures briefly)
    $cache_key = 'wcf_next_embed_' . md5($base . '::' . $slug);
    $cached = get_transient($cache_key);
    if ($cached !== false && trim((string) $cached) !== '') return $cached;

    // Fetch server-side with tight timeouts to protect WP performance
    $resp = wp_remote_get($url, array(
        'timeout' => 6,
        'redirection' => 2,
        'headers' => array(
            'Accept' => 'text/html',
            'User-Agent' => 'WCF-SSR-Fetch/1.0; ' . home_url('/'),
        ),
    ));

    if (is_wp_error($resp)) {
        // Try fallback route
        $resp = wp_remote_get($url_fallback, array(
            'timeout' => 6,
            'redirection' => 2,
            'headers' => array(
                'Accept' => 'text/html',
                'User-Agent' => 'WCF-SSR-Fetch/1.0; ' . home_url('/'),
            ),
        ));
        if (is_wp_error($resp)) {
            if (current_user_can('manage_options')) {
                return $content . '<!-- WCF: Fetch error ' . esc_html($resp->get_error_message()) . ' | URL tried: ' . esc_url($url) . ' and ' . esc_url($url_fallback) . ' -->';
            }
            set_transient($cache_key, $content, 2 * MINUTE_IN_SECONDS);
            return $content;
        }
    }

    $code = wp_remote_retrieve_response_code($resp);
    $ctype = wp_remote_retrieve_header($resp, 'content-type');
    $html = wp_remote_retrieve_body($resp);
    if ($code !== 200 || !$html || (is_string($ctype) && stripos($ctype, 'text/html') === false)) {
        // Try fallback route
        $resp = wp_remote_get($url_fallback, array(
            'timeout' => 6,
            'redirection' => 2,
            'headers' => array(
                'Accept' => 'text/html',
                'User-Agent' => 'WCF-SSR-Fetch/1.0; ' . home_url('/'),
            ),
        ));
        if (!is_wp_error($resp)) {
            $code = wp_remote_retrieve_response_code($resp);
            $ctype = wp_remote_retrieve_header($resp, 'content-type');
            $html = wp_remote_retrieve_body($resp);
        }
        if ($code !== 200 || !$html || (is_string($ctype) && stripos($ctype, 'text/html') === false)) {
            if (current_user_can('manage_options')) {
                return $content . '<!-- WCF: Bad response after fallback code ' . intval($code) . ' type ' . (is_string($ctype) ? esc_html($ctype) : '') . ' | URLs tried: ' . esc_url($url) . ' and ' . esc_url($url_fallback) . ' -->';
            }
            set_transient($cache_key, $content, 2 * MINUTE_IN_SECONDS);
            return $content;
        }
    }

    // Extract embed root and collect CSS assets
    $extracted = '';
    $styles = '';
    if (class_exists('DOMDocument') && class_exists('DOMXPath')) {
        libxml_use_internal_errors(true);
        $dom = new DOMDocument();
        $dom->loadHTML($html);
        $xpath = new DOMXPath($dom);

        // Collect CSS links from <head> (disabled for now to avoid leaking styles globally)
        $cssHrefs = array();
        $origin = (isset($parsed['scheme']) && isset($parsed['host'])) ? ($parsed['scheme'] . '://' . $parsed['host']) : '';
        $linkNodes = $xpath->query('//head//link[@rel="stylesheet" or (@rel="preload" and translate(@as, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz")="style")]');
        if ($linkNodes && $linkNodes->length > 0) {
            foreach ($linkNodes as $ln) {
                $href = $ln->getAttribute('href');
                if (!$href) continue;
                if (strpos($href, '//') === 0) {
                    $href = 'https:' . $href;
                } elseif (strpos($href, '/') === 0 && $origin) {
                    $href = rtrim($origin, '/') . $href;
                }
                $cssHrefs[$href] = true;
            }
        }
        if (!empty($cssHrefs)) {
            set_transient('wcf_next_embed_css_' . md5($base . '::' . $slug), wp_json_encode(array_keys($cssHrefs)), 10 * MINUTE_IN_SECONDS);
        }
        // Include inline <style> from head if any
        $styleNodes = $xpath->query('//head//style');
        if ($styleNodes && $styleNodes->length > 0) {
            foreach ($styleNodes as $sn) {
                $styles .= $dom->saveHTML($sn);
            }
        }

        // Extract body content root
        $nodes = $xpath->query('//*[@id="wcf-embed-root" or @data-wcf-embed-root]');
        if ($nodes && $nodes->length > 0) {
            $node = $nodes->item(0);
            $inner = '';
            foreach ($node->childNodes as $child) {
                $inner .= $dom->saveHTML($child);
            }
            $extracted = $inner;
        }
        libxml_clear_errors();
    }

    if ($extracted === '') {
        // Strict mode: only inject when explicit embed root is present
        if (current_user_can('manage_options')) {
            return $content . '<!-- WCF: Skipped inject (no embed root present) | URL: ' . esc_url($url) . ' -->';
        }
        set_transient($cache_key, $content, 5 * MINUTE_IN_SECONDS);
        return $content;
    }

    // Require meaningful content (not just whitespace)
    $has_structure = (bool) preg_match('/<(section|div|article|header|main)[^>]*>/i', $extracted);
    $extracted_text = function_exists('wp_strip_all_tags') ? wp_strip_all_tags($extracted) : trim(strip_tags($extracted));
    $is_meaningful = $has_structure && strlen(trim((string)$extracted_text)) > 40;

    // Wrap for styling isolation opportunity (optional)
    if ($is_meaningful) {
        $out = '<div class="wcf-nextjs-override-ssr">' . $extracted . '</div>';
        set_transient($cache_key, $out, 10 * MINUTE_IN_SECONDS);
        return $out;
    }

    // Fallback to WordPress content if nothing meaningful extracted
    set_transient($cache_key, $content, 5 * MINUTE_IN_SECONDS);
    return $content;
    } catch (Throwable $e) {
        return $content;
    }
}, 20);

/**
 * Enqueue Next CSS assets for the current product override page
 */
add_action('wp_enqueue_scripts', function(){
    if (is_admin() || is_front_page() || is_home() || !is_singular('product')) return;
    global $post;
    if (!$post) return;
    $cats = wp_get_post_terms($post->ID, 'product_cat', array('fields' => 'slugs'));
    $eligible_slugs = array('snorkeling-trips', 'certification-courses');
    $eligible = false;
    foreach ($eligible_slugs as $slug) { if (in_array($slug, (array) $cats, true)) { $eligible = true; break; } }
    if (!$eligible) return;
    $override = get_post_meta($post->ID, '_wcf_nextjs_override', true) === '1';
    if (!$override) return;

    $base = wcf_get_next_base_url();
    $slug = $post->post_name;
    $key = 'wcf_next_embed_css_' . md5($base . '::' . $slug);
    $json = get_transient($key);
    if (!$json) return;
    $hrefs = json_decode($json, true);
    if (!is_array($hrefs) || empty($hrefs)) return;

    $i = 0;
    foreach ($hrefs as $href) {
        $handle = 'wcf-nextcss-' . (++$i);
        wp_enqueue_style($handle, esc_url_raw($href), array(), null);
    }
}, 30);

/**
 * Admin: Assign Instructor to Booking (wc_booking)
 * Shows a selector of users with role "instructor" on booking edit screen.
 */
add_action('add_meta_boxes', function(){
    // Only add on WooCommerce Bookings post type
    if (!post_type_exists('wc_booking')) return;
    add_meta_box(
        'wcf_booking_instructor',
        __('Assigned Instructor', 'woo-content-form'),
        'wcf_render_booking_instructor_metabox',
        'wc_booking',
        'side',
        'high'
    );
});

function wcf_render_booking_instructor_metabox($post){
    wp_nonce_field('wcf_booking_instructor_save', 'wcf_booking_instructor_nonce');
    $current = (int) get_post_meta($post->ID, '_wcf_instructor_id', true);

    // Fetch only Instructor role users (role slug may be 'instructor')
    $instructors = get_users(array(
        'role__in' => array('instructor', 'Instructor'),
        'orderby'  => 'display_name',
        'order'    => 'ASC',
        'fields'   => array('ID', 'display_name', 'user_email'),
        'number'   => 300,
    ));

    echo '<p class="howto">Select the Instructor responsible for this booking.</p>';
    echo '<select name="wcf_instructor_id" id="wcf_instructor_id" style="width:100%">';
    echo '<option value="">'.esc_html__('— None —','woo-content-form').'</option>';
    foreach ($instructors as $u) {
        $label = $u->display_name ? $u->display_name : $u->user_email;
        printf('<option value="%d" %s>%s</option>', (int)$u->ID, selected($current, (int)$u->ID, false), esc_html($label));
    }
    echo '</select>';

    if (empty($instructors)) {
        echo '<p class="description">'.esc_html__('No users with role Instructor were found.','woo-content-form').'</p>';
    }
}

add_action('save_post_wc_booking', 'wcf_save_booking_instructor_meta', 10, 1);
function wcf_save_booking_instructor_meta($post_id){
    if (!isset($_POST['wcf_booking_instructor_nonce']) || !wp_verify_nonce($_POST['wcf_booking_instructor_nonce'], 'wcf_booking_instructor_save')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $uid = isset($_POST['wcf_instructor_id']) ? (int) $_POST['wcf_instructor_id'] : 0;
    $current = (int) get_post_meta($post_id, '_wcf_instructor_id', true);

    if ($uid > 0) {
        if ($current !== $uid) update_post_meta($post_id, '_wcf_instructor_id', $uid);
    } else {
        if ($current) delete_post_meta($post_id, '_wcf_instructor_id');
    }

    // Update post author only when valid and changed; guard against recursion
    if ($uid > 0 && get_user_by('id', $uid)) {
        $post = get_post($post_id);
        if ($post && (int)$post->post_author !== $uid) {
            remove_action('save_post_wc_booking', 'wcf_save_booking_instructor_meta', 10);
            wp_update_post(array('ID' => $post_id, 'post_author' => $uid));
            add_action('save_post_wc_booking', 'wcf_save_booking_instructor_meta', 10, 1);
        }
    }
}

// Show Instructor column in Bookings list
add_filter('manage_edit-wc_booking_columns', function($cols){
    $new = array();
    foreach ($cols as $k=>$v) {
        $new[$k] = $v;
        if ($k === 'status') { $new['wcf_instructor'] = __('Instructor','woo-content-form'); }
    }
    if (!isset($new['wcf_instructor'])) $new['wcf_instructor'] = __('Instructor','woo-content-form');
    return $new;
});

add_action('manage_wc_booking_posts_custom_column', function($col, $post_id){
    if ($col !== 'wcf_instructor') return;
    $uid = (int) get_post_meta($post_id, '_wcf_instructor_id', true);
    if ($uid) {
        $u = get_user_by('id', $uid);
        echo esc_html($u ? ($u->display_name ?: $u->user_email) : ('#'.$uid));
    } else {
        echo '—';
    }
}, 10, 2);
