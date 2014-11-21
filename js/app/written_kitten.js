/*
 Copyright (c) 2011 Alex "Skud" Bayley and Emily Turner All rights reserved.

 Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 # Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

 # Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * This piece of software was gotten from https://github.com/Skud/writtenkitten
 * Please, visit the site http://writtenkitten.net/
 */
var search_for = 'kitten';
var valid_licenses="4,5,7";
/*
4 - Attribution License (http://creativecommons.org/licenses/by/2.0/)
5 - Attribution-ShareAlike License (http://creativecommons.org/licenses/by-sa/2.0/)
7 - No known copyright restrictions (http://flickr.com/commons/usage/)
*/
var warning;
if (typeof localStorage == "undefined") warning = "#warning-no-ls"
else warning = "#warning-ls";
var next_kitten = {
	img_url: '',
	page_url: '',
	alt: ''
};
//Get license info
var license_url = "https://api.flickr.com/services/rest/?format=json&method=flickr.photos.licenses.getInfo&api_key=5dfc80756edad8d0566cf40f0909324e&jsoncallback=?";
var custom_shorts = {"No known copyright restrictions": "Flickr Commons"};
var license_list = [];
$.getJSON(license_url, function(data) {
	if (data.stat == "ok") {
		$.each(data.licenses.license,function(idx,el) {
			licdata = {"name": el.name,"url": el.url};
			//Assign short
			if(shortcc = licdata.url.match(/creativecommons\.org\/licenses\/([^\/]+)\//)) {
				licdata["shortname"] = 'CC-' + shortcc[1].toUpperCase();
			} else if(custshort = custom_shorts[licdata.name]) {
				licdata["shortname"] = custshort;
			} else {
				licdata["shortname"] = licdata.name;
			}
			license_list[el.id] = licdata;
		});
	}
});
function word_count(text, wc) {
	if (typeof localStorage != "undefined") localStorage.text = text;
	if (current_word_count >= 10 && warning_shown == false) {
		show_warning();
	}
	text = text.replace(/^\s*|\s*$/g,''); //removes whitespace from front and end
	text = text.replace(/\s+/g,' '); // collapse multiple consecutive spaces
	var words = text.split(" ");
	wc.value = words.length;
	current_word_count = wc.value = words.length;
	$("#displayWords").html(wc.value);
	kittens_earned = current_word_count / words_for_reward;
	if (kittens_earned >= kittens_shown+1) {
		show_kitten();
	}
}
function show_warning() {
	$(warning).fadeIn("slow");
}
function hide_warning(immediate) {
	if (immediate == true) {
		$(warning).hide();
	} else {
		$(warning).fadeOut("slow");
	}
	warning_shown = true;
}
function show_kitten() {
	hide_warning(true);
	kittens_shown++;
	$("#kittenFrame").css("background-image", "url(" + next_kitten.img_url + ")");
	$("#kittenCredit").html("<a href='" + next_kitten.page_url + "'>" + next_kitten.alt + "</a>");
	fetch_next_kitten();
}
function fetch_next_kitten() {
	console.debug("entered");
	if (getParameterByName("search")) {
		// if they are using a URL param, take them very literally. They
		// generally know what they're doing.
		flickr_search_term = search_for;
	} else {
		// add "cute" to search if item is selected from dropdown. it just
		// works better that way.
		flickr_search_term = search_for + ",cute";
	}
	var flickr_url = "https://api.flickr.com/services/rest/?format=json&sort=interestingness-desc&method=flickr.photos.search&license=" + valid_licenses + "&extras=owner_name,license&tags=" + flickr_search_term + "&tag_mode=all&api_key=5dfc80756edad8d0566cf40f0909324e&jsoncallback=?";
	$.getJSON(flickr_url, function(data) {
		console.debug("JSON data stat: " + data.stat);
		if (data.stat == "ok") {
			var i = Math.ceil(Math.random() * data.photos.photo.length);
			var photo = data.photos.photo[i];
			var attrib = "";
			if (license = license_list[photo.license]) {
				if (license.url) {
					attrib = " (<a href=\"" + license.url + "\">" + license.shortname + "</a>)";
				} else {
					attrib = " (" + license.shortname + ")";
				}
			}
			next_kitten.img_url = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_z.jpg";
			next_kitten.page_url = "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
			next_kitten.alt = photo.title + " by " + photo.ownername + attrib;
			kitten_obj_target.css("background-image", "url(" + next_kitten.img_url + ")");
			$("#nextKitten").attr("src", next_kitten.img_url);
		}
	});
}
function set_reward(howmany) {
	words_for_reward = howmany;
	kittens_earned = current_word_count / howmany;
	kittens_shown = parseInt(kittens_earned);
}
function set_search(search) {
	if (tmp = getParameterByName("search")) {
		tmp.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // sanitize
		search_for = tmp;
	} else {
		search_for = search;
	}
	set_title();
}
function set_title() {
	if (search_for != "kitten") {
		$("#titleKitten").html("<strike>Kitten!</strike>");
		$("#titleSearch").html("&nbsp;" + search_for + "!");
	}
}
function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results == null)
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}

fetch_next_kitten();
