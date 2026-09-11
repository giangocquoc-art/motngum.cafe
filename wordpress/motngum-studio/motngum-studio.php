<?php
/**
 * Plugin Name: Một Ngụm Studio Catalog
 * Description: Quản lý gói website, mẫu website và cấu hình báo giá cho motngum.cafe.
 * Version: 0.1.0
 * License: GPL-2.0-or-later
 */

if (!defined('ABSPATH')) exit;

function mn_register_catalog_types() {
    register_post_type('mn_package', [
        'labels' => ['name' => 'Gói website', 'singular_name' => 'Gói website'],
        'public' => false, 'show_ui' => true, 'show_in_rest' => true,
        'menu_icon' => 'dashicons-layout', 'supports' => ['title', 'editor', 'custom-fields'],
    ]);
    register_post_type('mn_template', [
        'labels' => ['name' => 'Mẫu website', 'singular_name' => 'Mẫu website'],
        'public' => false, 'show_ui' => true, 'show_in_rest' => true,
        'menu_icon' => 'dashicons-format-gallery', 'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
    ]);
}
add_action('init', 'mn_register_catalog_types');

function mn_register_settings() {
    register_setting('mn_studio', 'mn_domain_markup', [
        'type' => 'integer', 'default' => 100000,
        'sanitize_callback' => fn($value) => max(0, absint($value)),
    ]);
}
add_action('admin_init', 'mn_register_settings');
add_action('admin_menu', function () {
    add_options_page('Một Ngụm Studio', 'Một Ngụm Studio', 'manage_options', 'mn-studio', 'mn_render_settings');
});

function mn_render_settings() {
    if (!current_user_can('manage_options')) return;
    ?>
    <div class="wrap"><h1>Một Ngụm Studio</h1><form method="post" action="options.php">
        <?php settings_fields('mn_studio'); ?>
        <table class="form-table"><tr><th><label for="mn_domain_markup">Phí hỗ trợ domain (VND)</label></th>
        <td><input id="mn_domain_markup" name="mn_domain_markup" type="number" min="0" step="1000" value="<?php echo esc_attr(get_option('mn_domain_markup', 100000)); ?>"></td></tr></table>
        <?php submit_button(); ?>
    </form></div>
    <?php
}

function mn_catalog_item($post) {
    return [
        'id' => $post->ID,
        'slug' => $post->post_name,
        'name' => get_the_title($post),
        'description' => apply_filters('the_content', $post->post_content),
        'price' => absint(get_post_meta($post->ID, 'price', true)),
        'category' => sanitize_text_field(get_post_meta($post->ID, 'category', true)),
        'mail' => sanitize_text_field(get_post_meta($post->ID, 'mail', true)),
        'demoUrl' => esc_url_raw(get_post_meta($post->ID, 'demo_url', true)),
        'image' => esc_url_raw(get_the_post_thumbnail_url($post, 'large') ?: ''),
    ];
}

function mn_catalog_response() {
    $query = fn($type) => array_map('mn_catalog_item', get_posts([
        'post_type' => $type, 'post_status' => 'publish', 'numberposts' => 100, 'orderby' => 'menu_order title', 'order' => 'ASC'
    ]));
    return rest_ensure_response([
        'domainMarkup' => absint(get_option('mn_domain_markup', 100000)),
        'packages' => $query('mn_package'),
        'templates' => $query('mn_template'),
    ]);
}

add_action('rest_api_init', function () {
    register_rest_route('motngum/v1', '/catalog', [
        'methods' => 'GET', 'callback' => 'mn_catalog_response', 'permission_callback' => '__return_true',
    ]);
});
