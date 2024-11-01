<?php

global $post;

if(is_singular() && $post->comment_status == 'open') {
	comment_form();
}

echo '<div class="w3ac-comments" data-id="'.$post->ID.'"></div>';

