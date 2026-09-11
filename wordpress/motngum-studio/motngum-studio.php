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

function mn_add_catalog_meta_boxes() {
    add_meta_box('mn_package_details', 'Chi tiết gói', 'mn_render_package_fields', 'mn_package', 'normal', 'high');
    add_meta_box('mn_template_details', 'Chi tiết mẫu', 'mn_render_template_fields', 'mn_template', 'normal', 'high');
}
add_action('add_meta_boxes', 'mn_add_catalog_meta_boxes');

function mn_field($post, $key, $label, $type = 'text') {
    $value = get_post_meta($post->ID, $key, true);
    if ($type === 'textarea') {
        printf('<p><label for="mn_%1$s"><strong>%2$s</strong></label><br><textarea class="widefat" rows="6" id="mn_%1$s" name="mn_%1$s">%3$s</textarea></p>', esc_attr($key), esc_html($label), esc_textarea($value));
        return;
    }
    printf(
        '<p><label for="mn_%1$s"><strong>%2$s</strong></label><br><input class="widefat" id="mn_%1$s" name="mn_%1$s" type="%3$s" value="%4$s"></p>',
        esc_attr($key), esc_html($label), esc_attr($type), esc_attr($value)
    );
}

function mn_render_package_fields($post) {
    wp_nonce_field('mn_save_catalog', 'mn_catalog_nonce');
    mn_field($post, 'price', 'Giá website (VND)', 'number');
    mn_field($post, 'mail', 'Mail Pro đi kèm');
    mn_field($post, 'features', 'Tính năng (mỗi dòng một mục)', 'textarea');
}

function mn_render_template_fields($post) {
    wp_nonce_field('mn_save_catalog', 'mn_catalog_nonce');
    mn_field($post, 'category', 'Danh mục');
    mn_field($post, 'demo_url', 'Đường dẫn demo', 'url');
}

function mn_save_catalog_fields($post_id) {
    if (!isset($_POST['mn_catalog_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['mn_catalog_nonce'])), 'mn_save_catalog')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $text_fields = ['mail', 'features', 'category'];
    foreach ($text_fields as $key) {
        if (isset($_POST['mn_' . $key])) update_post_meta($post_id, $key, sanitize_textarea_field(wp_unslash($_POST['mn_' . $key])));
    }
    if (isset($_POST['mn_price'])) update_post_meta($post_id, 'price', absint($_POST['mn_price']));
    if (isset($_POST['mn_demo_url'])) update_post_meta($post_id, 'demo_url', esc_url_raw(wp_unslash($_POST['mn_demo_url'])));
}
add_action('save_post_mn_package', 'mn_save_catalog_fields');
add_action('save_post_mn_template', 'mn_save_catalog_fields');

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
        'features' => array_values(array_filter(array_map('sanitize_text_field', preg_split('/\R/', (string) get_post_meta($post->ID, 'features', true))))),
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
