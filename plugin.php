<?php
/**
Plugin Name: W3 Ajax Comments
Version: 1.0.5
Author: W3Extensions
Description: Nested/threaded ajax comments for WordPress.
Contributors: bookbinder
Tags: social bookmarking, ajax, voting
Requires at least: 4.7
Tested up to: 5.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/
 
require_once('inc/comments.php');
require_once('inc/comment-walker.php');

function w3ac_get_plugin_directory(){
	$directory = array();
	
	$directory['path'] = trailingslashit( plugin_dir_path( __FILE__ ) );
	$directory['url'] = plugin_dir_url( __FILE__ );
	return $directory;
}

function w3ac_scripts() {
	$pluginDirectory = w3ac_get_plugin_directory();
	
	# CSS
	wp_register_style( 'w3ac',  $pluginDirectory['url'].'assets/css/app.css', array(), 1 );

	wp_enqueue_style('w3ac');

	# JS
	wp_register_script( "moment", $pluginDirectory['url'].'assets/js/moment.js', array(), null, true );
	wp_register_script( "livestamp", $pluginDirectory['url'].'assets/js/livestamp.min.js', array(), null, true );
	wp_register_script( "w3ac", $pluginDirectory['url'].'assets/js/app.js', array("jquery"), null, true );


	wp_enqueue_script('jquery-dropdown');	
	wp_enqueue_script('moment');	
	wp_enqueue_script('livestamp');	
	wp_enqueue_script('w3ac');
	
	wp_localize_script( 'w3ac', 'w3ac_ajax', array(
		'ajaxurl' => site_url() . '/wp-admin/admin-ajax.php',
		"wp_unfiltered_html_comment" => wp_create_nonce("_wp_unfiltered_html_comment")
	) );
}
add_action ('wp_enqueue_scripts', 'w3ac_scripts', 100);


/*
 * Switch default core markup for search form, comment form, and comments
 * to output valid HTML5.
 */
add_theme_support( 'html5', array(
	'comment-form',
	'comment-list',
) );

function w3ac_comment_template( $comment_template ) {
	return dirname(__FILE__) . '/inc/comment-form.php';
}

add_filter( "comments_template", "w3ac_comment_template" );
