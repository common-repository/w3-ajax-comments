/*
 * https://rudrastyh.com/wordpressajax-comments.html
 * Let's begin with validation functions
 */
 jQuery.extend(jQuery.fn, {
	/*
	 * check if field value length more than 3 symbols ( for name and comment ) 
	 */
	validate: function () {
		if (jQuery(this).val().length < 3) {jQuery(this).addClass('error');return false} else {jQuery(this).removeClass('error');return true}
	},
	/*
	 * check if email is correct
	 * add to your CSS the styles of .error field, for example border-color:red;
	 */
	validateEmail: function () {
		var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
		    emailToValidate = jQuery(this).val();
		if (!emailReg.test( emailToValidate ) || emailToValidate == "") {
			jQuery(this).addClass('error');return false
		} else {
			jQuery(this).removeClass('error');return true
		}
	},
});

jQuery( document ).ready(function($) {



	if($(".w3ac-comments").length !== 0){
		display_w3ac_comments();
	}

	function display_w3ac_comments(page = 1){
		pid = $(".w3ac-comments").data("id");
		
		if(typeof pid !== "undefined"){
			$.ajax({
				url: w3ac_ajax.ajaxurl,
				type: "POST",
				data: {
					action: 'w3ac_display_comments',
					pid: pid,
					page: page					
				},
				success: function ( result ) {
					$(".w3ac-comments").html(result);
					
					$ids = [];
					$(document).find('.vote-buttons-wrapper.comment-vote').each(function(){	
						$ids.push($(this).data("id"));
					});
					
					if(typeof generate_w3vx_vote_buttons === "function"){
						generate_w3vx_vote_buttons($ids, "comment");
					}
					
				}
			});
		}
	}

	$(document).on('click', '.w3ac-pagination a', function (e) {
		page = $(this).data("id");
		display_w3ac_comments(page);
	});	
	
	
	// responsive menu
	/*
	 * On comment form submit
	 */
	$( '#commentform' ).submit(function(){
 
		// define some vars
		var button = $('#submit'), // submit button
		    respond = $('#respond'), // comment form container
		    commentlist = $('.commentlist'), // comment list container
		    cancelreplylink = $('#cancel-comment-reply-link');
 
		// if user is logged in, do not validate author and email fields
		if( $( '#author' ).length )
			$( '#author' ).validate();
 
		if( $( '#email' ).length )
			$( '#email' ).validateEmail();
 
		// validate comment in any case
		$( '#comment' ).validate();
 
		// if comment form isn't in process, submit it
		if ( !button.hasClass( 'loadingform' ) && !$( '#author' ).hasClass( 'error' ) && !$( '#email' ).hasClass( 'error' ) && !$( '#comment' ).hasClass( 'error' ) ){
 
			// ajax request
			$.ajax({
				type : 'POST',
				url : w3ac_ajax.ajaxurl, // admin-ajax.php URL
				data: $(this).serialize() + '&action=ajaxcomments', // send form data + action parameter
				dataType: "json",			
				beforeSend: function(xhr){
					// what to do just after the form has been submitted
					button.addClass('loadingform').val('Loading...');
				},
				error: function (request, status, error) {
					if( status == 500 ){
						alert( 'Error while adding comment' );
					} else if( status == 'timeout' ){
						alert('Error: Server doesn\'t respond.');
					} else {
						// process WordPress errors
						var wpErrorHtml = request.responseText.split("<p>"),
							wpErrorStr = wpErrorHtml[1].split("</p>");
 
						alert( wpErrorStr[0] );
					}
				},
				success: function ( result ) {
 
					// if this post already has comments
					if( commentlist.length > 0 ){
 
						// if in reply to another comment
						if( respond.parent().hasClass( 'comment' ) ){
 
							// if the other replies exist
							if( respond.parent().children( '.children' ).length ){	
								respond.parent().children( '.children' ).prepend( result.html );
							} else {
								// if no replies, add <ol class="children">
								result.html = '<ol class="children">' + result.html + '</ol>';
								respond.parent().append( result.html );
							}
							// close respond form
							cancelreplylink.trigger("click");
						} else {
							// simple comment
							commentlist.prepend( result.html );
						}
						
						
					}else{
						// if no comments yet
						result.html = '<ol class="comment-list">' + result.html + '</ol>';
						respond.after( $(result.html) );
					}

					if(typeof generate_w3vx_vote_buttons === "function"){
						generate_w3vx_vote_buttons(result["id"], "comment");					
					}
					
					// clear textarea field
					$('#comment').val('');
				},
				complete: function(){
					// what to do after a comment has been added
					button.removeClass( 'loadingform' ).val( 'Post Comment' );
				}
			});
		}
		return false;
	});
	
	
	/* EDIT COMMENT */
	$(document).on( 'click', '.comment-edit-link', function(e) {
		e.preventDefault();
		commentID = $(this).data("cid");

		$.ajax({
			url: w3ac_ajax.ajaxurl,
			type: "POST",
			data: {
				action: 'w3ac_get_comment_content',
				cid: commentID
			},
			dataType: "json",			
			success: function ( result ) {
				var commentForm = $("<div class='commentEditForm'><p><textarea class='form-control'>"+ result.html +"</textarea></p> <p class='text-right'><button type='button' class='w3ac-btn w3ac-btn-secondary closeCommentTextarea' data-id='"+commentID+"'>Close</button> <button type='button' class='w3ac-btn w3ac-btn-primary submitCommentForm' data-id='"+commentID+"'>Save</button></p></div>");
				
				$("#comment-" + commentID + " > article .rightCommentDiv").append(commentForm);
				
				$("#comment-" + commentID + " > article .commentContentWrapper").hide();				
			}
		});	
	});
	
	
	$(document).on( 'click', '.closeCommentTextarea', function(e) {
		commentID = $(this).data("id");
		$("#comment-" + commentID + " .commentEditForm").hide();
		$("#comment-" + commentID + " .commentContentWrapper").show();
	});
	
	
	/* UPDATE COMMENT */
	$(document).on( 'click', '.submitCommentForm', function(e) {
		e.preventDefault();
		commentID = $(this).data("id");
		content = $("#comment-" + commentID + " .commentEditForm textarea").val();
		$.ajax({
			url: w3ac_ajax.ajaxurl,
			type: "POST",
			data: {
				action: 'w3ac_update_comment_content',
				cid: commentID,
				content: content
			},
			dataType: "json",			
			success: function ( result ) {	
				$("#comment-" + commentID + " > article .comment-content").html(result.content);
				$("#comment-" + commentID + " > article .commentEditForm").hide();
				$("#comment-" + commentID + " > article .commentContentWrapper").show();
				
				if(typeof generate_w3vx_vote_buttons == "function"){
					generate_w3vx_vote_buttons(commentID, "comment");					
				}				
				
			}
		});	
	});	
	

	/* COMMENT REPLY */
	$(document).on( 'click', '.comment-reply-button', function(e) {
		e.preventDefault();
		commentID = $(this).data("cid");
		postID = $(this).data("pid");
		
		if($("#comment-" + commentID + " .comment-reply-form").length == 0 ){ // the user may have entered text they would like to return to...even after the close the reply form.
			var commentForm = $("<div class='comment-reply-form'><p><textarea class='form-control'></textarea></p> <p class='text-right'><button type='button' class='w3ac-btn w3ac-btn-secondary comment-reply-close-button' data-cid='"+commentID+"'>Close</button> <button type='button' class='w3ac-btn w3ac-btn-primary comment-save-button' data-cid='"+commentID+"' data-pid='"+postID+"'>Save</button></p></div>");
			$("#comment-" + commentID + " > article").after(commentForm);
		} else {
			$("#comment-" + commentID + " .comment-reply-form").show();
		}
		
		$(this).hide();
	});	
	
	
	$(document).on( 'click', '.comment-save-button', function(e) {
		// this function does not support guest users.
		
		parentCommentID = $(this).data("cid");
		commentPostID = $(this).closest(".w3ac-comments").data("id");
		content = $("#comment-" + parentCommentID + " .comment-reply-form textarea").val();
		nonce = w3ac_ajax.wp_unfiltered_html_comment;

		$.ajax({
			url: w3ac_ajax.ajaxurl,
			type: "POST",
			data: {
				action: 'ajaxcomments',
				comment_post_ID: commentPostID,
				comment: content,
				comment_parent: parentCommentID,
				_wp_unfiltered_html_comment: nonce,
			},
			dataType: "json",			
			success: function ( result ) {
			// remember: we're not using ">" since .children is an adjacement element, also "+" won't work because there are other elements that between article and children. So we need to specifically look for the first instance of .children within a comment item/wrapper.
			// I tried doing this using css rules (.children:nth-child(1)), but couldn't get it work work.
				parent = $("#comment-" + parentCommentID).find(".children").eq(0);
				
				if(parent.length == 0){
					$("#comment-" + parentCommentID + " > article").after("<ul class='children'></ul>");
				}
				
				$("#comment-" + parentCommentID).find(".children").eq(0).prepend(result.html);
				
				$("#comment-" + parentCommentID + " .comment-reply-button").show();
				
				$("#comment-" + parentCommentID + " .comment-reply-form").hide();
			}
		});	
	});
	
	
	// Close Comment Reply Form
	
	$(document).on( 'click', '.comment-reply-close-button', function(e) {
		commentID = $(this).data("cid");
		
		$("#comment-" + commentID + " .comment-reply-button").show();	
		$("#comment-" + commentID + " .comment-reply-form").hide();
	});
	
	/* COMMENT REPLY */
	$('#w3acCommentsForm').on('submit', function(e) {
		e.preventDefault();
		var $form = $(this);
 
		$.post($form.attr('action'), $form.serialize(), function(data) {
			if (data.status == "success") {
				var commentHTML = data.html;
				$('#w3acCommentFormContent').val("");
				$("#w3acCommentsList").prepend($(commentHTML).animate({backgroundColor: '#ff0033'}, 1000).animate({backgroundColor: '#fff'}, 1000));
				
			}
		}, 'json');
	});
});