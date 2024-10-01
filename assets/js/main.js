(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main = $('#main'),
		$main_articles = $main.children('article');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Fix: Flexbox min-height bug on IE.
		if (browser.name == 'ie') {

			var flexboxFixTimeoutId;

			$window.on('resize.flexbox-fix', function() {

				clearTimeout(flexboxFixTimeoutId);

				flexboxFixTimeoutId = setTimeout(function() {

					if ($wrapper.prop('scrollHeight') > $window.height())
						$wrapper.css('height', 'auto');
					else
						$wrapper.css('height', '100vh');

				}, 250);

			}).triggerHandler('resize.flexbox-fix');

		}

	// Nav.
		var $nav = $header.children('nav'),
			$nav_li = $nav.find('li');

		// Add "middle" alignment classes if we're dealing with an even number of items.
			if ($nav_li.length % 2 == 0) {

				$nav.addClass('use-middle');
				$nav_li.eq( ($nav_li.length / 2) ).addClass('is-middle');

			}

	// Main.
		var	delay = 325,
			locked = false;

		// Methods.
			$main._show = function(id, initial) {

				var $article = $main_articles.filter('#' + id);

				// No such article? Bail.
					if ($article.length == 0)
						return;

				// Handle lock.

					// Already locked? Speed through "show" steps w/o delays.
						if (locked || (typeof initial != 'undefined' && initial === true)) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Mark as visible.
								$body.addClass('is-article-visible');

							// Deactivate all articles (just in case one's already active).
								$main_articles.removeClass('active');

							// Hide header, footer.
								$header.hide();
								$footer.hide();

							// Show main, article.
								$main.show();
								$article.show();

							// Activate article.
								$article.addClass('active');

							// Unlock.
								locked = false;

							// Unmark as switching.
								setTimeout(function() {
									$body.removeClass('is-switching');
								}, (initial ? 1000 : 0));

							return;

						}

					// Lock.
						locked = true;

				// Article already visible? Just swap articles.
					if ($body.hasClass('is-article-visible')) {

						// Deactivate current article.
							var $currentArticle = $main_articles.filter('.active');

							$currentArticle.removeClass('active');

						// Show article.
							setTimeout(function() {

								// Hide current article.
									$currentArticle.hide();

								// Show article.
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

				// Otherwise, handle as normal.
					else {

						// Mark as visible.
							$body
								.addClass('is-article-visible');

						// Show article.
							setTimeout(function() {

								// Hide header, footer.
									$header.hide();
									$footer.hide();

								// Show main, article.
									$main.show();
									$article.show();

								// Activate article.
									setTimeout(function() {

										$article.addClass('active');

										// Window stuff.
											$window
												.scrollTop(0)
												.triggerHandler('resize.flexbox-fix');

										// Unlock.
											setTimeout(function() {
												locked = false;
											}, delay);

									}, 25);

							}, delay);

					}

			};

			$main._hide = function(addState) {

				var $article = $main_articles.filter('.active');

				// Article not visible? Bail.
					if (!$body.hasClass('is-article-visible'))
						return;

				// Add state?
					if (typeof addState != 'undefined'
					&&	addState === true)
						history.pushState(null, null, '#');

				// Handle lock.

					// Already locked? Speed through "hide" steps w/o delays.
						if (locked) {

							// Mark as switching.
								$body.addClass('is-switching');

							// Deactivate article.
								$article.removeClass('active');

							// Hide article, main.
								$article.hide();
								$main.hide();

							// Show footer, header.
								$footer.show();
								$header.show();

							// Unmark as visible.
								$body.removeClass('is-article-visible');

							// Unlock.
								locked = false;

							// Unmark as switching.
								$body.removeClass('is-switching');

							// Window stuff.
								$window
									.scrollTop(0)
									.triggerHandler('resize.flexbox-fix');

							return;

						}

					// Lock.
						locked = true;

				// Deactivate article.
					$article.removeClass('active');

				// Hide article.
					setTimeout(function() {

						// Hide article, main.
							$article.hide();
							$main.hide();

						// Show footer, header.
							$footer.show();
							$header.show();

						// Unmark as visible.
							setTimeout(function() {

								$body.removeClass('is-article-visible');

								// Window stuff.
									$window
										.scrollTop(0)
										.triggerHandler('resize.flexbox-fix');

								// Unlock.
									setTimeout(function() {
										locked = false;
									}, delay);

							}, 25);

					}, delay);


			};

		// Articles.
			$main_articles.each(function() {

				var $this = $(this);

				// Close.
					$('<div class="close">Close</div>')
						.appendTo($this)
						.on('click', function() {
							location.hash = '';
						});

				// Prevent clicks from inside article from bubbling.
					$this.on('click', function(event) {
						event.stopPropagation();
					});

			});

		// Events.
			$body.on('click', function(event) {

				// Article visible? Hide.
					if ($body.hasClass('is-article-visible'))
						$main._hide(true);

			});

			$window.on('keyup', function(event) {

				switch (event.keyCode) {

					case 27:

						// Article visible? Hide.
							if ($body.hasClass('is-article-visible'))
								$main._hide(true);

						break;

					default:
						break;

				}

			});

			$window.on('hashchange', function(event) {

				// Empty hash?
					if (location.hash == ''
					||	location.hash == '#') {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Hide.
							$main._hide();

					}

				// Otherwise, check for a matching article.
					else if ($main_articles.filter(location.hash).length > 0) {

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Show article.
							$main._show(location.hash.substr(1));

					}

			});

		// Scroll restoration.
		// This prevents the page from scrolling back to the top on a hashchange.
			if ('scrollRestoration' in history)
				history.scrollRestoration = 'manual';
			else {

				var	oldScrollPos = 0,
					scrollPos = 0,
					$htmlbody = $('html,body');

				$window
					.on('scroll', function() {

						oldScrollPos = scrollPos;
						scrollPos = $htmlbody.scrollTop();

					})
					.on('hashchange', function() {
						$window.scrollTop(oldScrollPos);
					});

			}

		// Initialize.

			// Hide main, articles.
				$main.hide();
				$main_articles.hide();

			// Initial article.
				if (location.hash != ''
				&&	location.hash != '#')
					$window.on('load', function() {
						$main._show(location.hash.substr(1), true);
					});

})(jQuery);

$(document).ready(function(){
    let userResponses = {};

    $('#start-button').on('click', function(){
        $(this).hide();
        $('#questionnaire-wrapper').fadeIn();
        $('.question-slide').removeClass('active').hide();
        $('.question-slide[data-question="1"]').addClass('active').fadeIn();
    });

    // 옵션 클릭 시 선택 상태 적용 및 다음 버튼 활성화 (복수 선택 가능)
    $('.selectable-option').on('click', function(){		
        $(this).toggleClass('selected'); // 선택된 옵션 토글

        var question = $(this).closest('.question-slide').data('question');
        var selectedOptions = $(this).closest('.options').find('.selectable-option.selected').map(function(){
            return $(this).data('value');
        }).get();

        userResponses[question] = selectedOptions;

        // 선택된 옵션이 하나라도 있으면 다음 버튼 활성화
        var nextButton = $(this).closest('.question-slide').find('.next-button');

        if (selectedOptions.length > 0) {
            nextButton.prop('disabled', false); // 하나 이상 선택되면 활성화
        } else {
            nextButton.prop('disabled', true);  // 선택된 항목이 없으면 비활성화
        }
    });

    $('.next-button').on('click', function(){
        var currentSlide = $(this).closest('.question-slide');
        var selectedValues = currentSlide.find('.selectable-option.selected').map(function(){
            return $(this).data('value');
        }).get();

        // 예시 로직: 선택된 값에 따라 다음 슬라이드를 결정
        // 여기서는 첫 번째 선택된 값을 기준으로 합니다.
        var selectedValue = selectedValues[0];

        if (selectedValue === 'park') {
            navigateToSlide(currentSlide, '6');
        } 
        else if (selectedValue === 'arcade') {
            navigateToSlide(currentSlide, '2');
            // 아케이드 종류 선택 후 질문 6으로 이동
            $('.question-slide[data-question="2"] .next-button').off('click').on('click', function() {
                navigateToSlide($(this).closest('.question-slide'), '6');
            });
        } 
        else if (selectedValue === 'cafe') {
            navigateToSlide(currentSlide, '3');
        }	
        else {
            var nextQuestion = parseInt(currentSlide.data('question')) + 1;
            navigateToSlide(currentSlide, nextQuestion.toString());
        }
    });

    // 슬라이드 이동 함수
    function navigateToSlide(currentSlide, nextQuestion) {
        currentSlide.removeClass('active').fadeOut();
        var nextSlide = $('.question-slide[data-question="' + nextQuestion + '"]');
        nextSlide.addClass('active').fadeIn();
    }

    const playlists = {
        park: [
            { src: "park_playlist/Classic 1.mp3", title: "Classic 1", artist: "Suno AI", cover: "images/cover1.jpg" },
            { src: "park_playlist/Classic 2.mp3", title: "Classic 2", artist: "Suno AI", cover: "images/cover2.jpg" },
			{ src: "park_playlist/Classic 3.mp3", title: "Classic 3", artist: "Suno AI", cover: "images/cover3.jpg" },
            { src: "park_playlist/Classic 4.mp3", title: "Classic 4", artist: "Suno AI", cover: "images/cover4.jpg" },
			{ src: "park_playlist/Classic 5.mp3", title: "Classic 5", artist: "Suno AI", cover: "images/cover5.jpg" },
			{ src: "park_playlist/Classic 6.mp3", title: "Classic 6", artist: "Suno AI", cover: "images/cover6.jpg" },
			{ src: "park_playlist/Classic 7.mp3", title: "Classic 7", artist: "Suno AI", cover: "images/cover7.jpg" },
			{ src: "park_playlist/Classic 8.mp3", title: "Classic 8", artist: "Suno AI", cover: "images/cover8.jpg" },
			{ src: "park_playlist/Classic 9.mp3", title: "Classic 9", artist: "Suno AI", cover: "images/cover9.jpg" },
        ],
        arcade_sports: [
            { src: "sports_playlist/HipHop 1.mp3", title: "HipHop 1", artist: "Suno AI", cover: "images/kpop_cover1.jpg" },
            { src: "sports_playlist/HipHop 2.mp3", title: "HipHop 2", artist: "Suno AI", cover: "images/kpop_cover2.jpg" },
            { src: "sports_playlist/Kpop 3.mp3", title: "Kpop 3",     artist: "Suno AI", cover: "images/kpop_cover3.jpg" },
			{ src: "sports_playlist/HipHop 4.mp3", title: "HipHop 4", artist: "Suno AI", cover: "images/kpop_cover4.jpg" },
			{ src: "sports_playlist/HipHop 5.mp3", title: "HipHop 5", artist: "Suno AI", cover: "images/kpop_cover5.jpg" },
			{ src: "sports_playlist/Kpop 6.mp3", title: "Kpop 6",     artist: "Suno AI", cover: "images/kpop_cover6.jpg" },
			{ src: "sports_playlist/Kpop 7.mp3", title: "Kpop 7",     artist: "Suno AI", cover: "images/kpop_cover7.jpg" },
			{ src: "sports_playlist/Kpop 8.mp3", title: "Kpop 8",     artist: "Suno AI", cover: "images/kpop_cover8.jpg" },
			{ src: "sports_playlist/EDM 9.mp3", title: "EDM 9",       artist: "Suno AI", cover: "images/kpop_cover9.jpg" },
			{ src: "sports_playlist/EDM 10.mp3", title: "EDM 10",     artist: "Suno AI", cover: "images/kpop_cover3.jpg" },
        ],
        arcade_game: [
            { src: "game_playlist/EDM 1.mp3", title: "EDM 1",   artist: "Suno AI", cover: "images/game_cover1.jpg" },
            { src: "game_playlist/EDM 2.mp3", title: "EDM 2",   artist: "Suno AI", cover: "images/game_cover2.jpg" },
			{ src: "game_playlist/Rock 3.mp3", title: "Rock 3", artist: "Suno AI", cover: "images/game_cover3.jpg" },
			{ src: "game_playlist/Rock 4.mp3", title: "Rock 4", artist: "Suno AI", cover: "images/game_cover4.jpg" },
			{ src: "game_playlist/EDM 5.mp3", title: "EDM 5",   artist: "Suno AI", cover: "images/game_cover5.jpg" },
			{ src: "game_playlist/EDM 6.mp3", title: "EDM 6",   artist: "Suno AI", cover: "images/game_cover6.jpg" },
			{ src: "game_playlist/EDM 7.mp3", title: "EDM 7",   artist: "Suno AI", cover: "images/game_cover7.jpg" },
			{ src: "game_playlist/EDM 8.mp3", title: "EDM 8",   artist: "Suno AI", cover: "images/game_cover8.jpg" },
			{ src: "game_playlist/Rock 9.mp3", title: "Rock 9", artist: "Suno AI", cover: "images/game_cover9.jpg" },
			{ src: "game_playlist/Tropical 10.mp3", title: "Tropical 10", artist: "Suno AI", cover: "images/game_cover3.jpg" },
        ],
		arcade_karaoke: [
            { src: "karaoke_playlist/Ballade 1.mp3", title: "Ballade 1", artist: "MUSIA ONE", cover: "images/karaoke_cover1.jpg" },
            { src: "karaoke_playlist/Ballade 2.mp3", title: "Ballade 2", artist: "MUSIA ONE", cover: "images/karaoke_cover2.jpg" },
			{ src: "karaoke_playlist/Ballade 3.mp3", title: "Ballade 3", artist: "MUSIA ONE", cover: "images/karaoke_cover3.jpg" },
			{ src: "karaoke_playlist/Ballade 4.mp3", title: "Ballade 4", artist: "MUSIA ONE", cover: "images/karaoke_cover4.jpg" },
			{ src: "karaoke_playlist/Ballade 5.mp3", title: "Ballade 5", artist: "MUSIA ONE", cover: "images/karaoke_cover5.jpg" },
			{ src: "karaoke_playlist/Rock 6.mp3", title: "Rock 6",       artist: "MUSIA ONE", cover: "images/game_cover2.jpg" },
			{ src: "karaoke_playlist/Ballade 7.mp3", title: "Ballade 7", artist: "MUSIA ONE", cover: "images/karaoke_cover7.jpg" },
			{ src: "karaoke_playlist/Hiphop 8.mp3", title: "Hiphop 8",   artist: "MUSIA ONE", cover: "images/game_cover9.jpg" },
			{ src: "karaoke_playlist/Pop 9.mp3", title: "Pop 9",         artist: "MUSIA ONE", cover: "images/game_cover5.jpg" },
			{ src: "karaoke_playlist/Kpop 10.mp3", title: "Kpop 10",     artist: "MUSIA ONE", cover: "images/kpop_cover1.jpg" },
        ],
		simple: [
            { src: "simple_playlist/Electronic 1.mp3", title: "Electronic 1", artist: "MUSIA ONE", cover: "images/game_cover1.jpg" },
            { src: "simple_playlist/Pop 2_잔잔, 모던.mp3", title: "Pop 2", artist: "MUSIA ONE", cover: "images/kpop_cover2.jpg" },
			{ src: "simple_playlist/Pop 3_잔잔, 모던.mp3", title: "Pop 3", artist: "MUSIA ONE", cover: "images/karaoke_cover3.jpg" },
			{ src: "simple_playlist/R&B 4_밝으면서 잔잔한.mp3", title: "R&B 4", artist: "MUSIA ONE", cover: "images/karaoke_cover4.jpg" },
			{ src: "simple_playlist/R&B 5_밝으면서 잔잔한.mp3", title: "R&B 5", artist: "MUSIA ONE", cover: "images/kpop_cover5.jpg" },
			{ src: "simple_playlist/R&B 6_밝으면서 잔잔한.mp3", title: "R&B 6", artist: "MUSIA ONE", cover: "images/game_cover2.jpg" },
			{ src: "simple_playlist/R&B 7_밝으면서 잔잔한.mp3", title: "R&B 7", artist: "MUSIA ONE", cover: "images/game_cover7.jpg" },
			{ src: "simple_playlist/R&B 8_밝으면서 잔잔한.mp3", title: "R&B 8", artist: "MUSIA ONE", cover: "images/kpop_cover9.jpg" },
			{ src: "simple_playlist/R&B 9_밝으면서 모던한.mp3", title: "R&B 9", artist: "MUSIA ONE", cover: "images/game_cover5.jpg" },
			{ src: "simple_playlist/R&B 10_밝으면서 모던한.mp3", title: "R&B 10", artist: "MUSIA ONE", cover: "images/kpop_cover1.jpg" },
        ],
		uk: [
			{ src: "uk_playlist/Emotional_pop_1.mp3", title: "Emotional_pop_1", artist: "MUSIA ONE", cover: "images/kpop_cover1.jpg" },
            { src: "uk_playlist/Emotional_pop_2.mp3", title: "Emotional_pop_2", artist: "MUSIA ONE", cover: "images/karaoke_cover2.jpg" },
			{ src: "uk_playlist/Guitar_Bass_heartfelt 1.mp3", title: "Guitar_Bass_heartfelt 1", artist: "MUSIA ONE", cover: "images/karaoke_cover3.jpg" },
			{ src: "uk_playlist/Guitar_Bass_heartfelt 2.mp3", title: "Guitar_Bass_heartfelt 2", artist: "MUSIA ONE", cover: "images/karaoke_cover4.jpg" },
			{ src: "uk_playlist/Hiphop 1 잔잔하면서 활기찬.mp3", title: "Hiphop 1 잔잔하면서 활기찬", artist: "MUSIA ONE", cover: "images/kpop_cover5.jpg" },
			{ src: "uk_playlist/Pop_guitar_slow 1.mp3", title: "Pop_guitar_slow 1", artist: "MUSIA ONE", cover: "images/game_cover2.jpg" },
			{ src: "simple_playlist/R&B 7_밝으면서 잔잔한.mp3", title: "R&B 7", artist: "MUSIA ONE", cover: "images/game_cover7.jpg" },
			{ src: "simple_playlist/R&B 8_밝으면서 잔잔한.mp3", title: "R&B 8", artist: "MUSIA ONE", cover: "images/kpop_cover9.jpg" },
			{ src: "simple_playlist/R&B 9_밝으면서 모던한.mp3", title: "R&B 9", artist: "MUSIA ONE", cover: "images/game_cover5.jpg" },
			{ src: "simple_playlist/R&B 10_밝으면서 모던한.mp3", title: "R&B 10", artist: "MUSIA ONE", cover: "images/kpop_cover1.jpg" },
		],
		mini: [
			{ src: "mini_playlist/Classic 1(잔잔하고 조용한).mp3", title: "Classic 1(잔잔하고 조용한)", artist: "MUSIA ONE", cover: "images/cover1.jpg" },
            { src: "mini_playlist/Classic 2(잔잔하고 조용한).mp3", title: "Classic 2(잔잔하고 조용한)", artist: "MUSIA ONE", cover: "images/cover2.jpg" },
			{ src: "mini_playlist/Classic_Piano_slow 1.mp3", title: "Classic_Piano_slow 1", artist: "MUSIA ONE", cover: "images/karaoke_cover3.jpg" },
			{ src: "mini_playlist/Classic_Piano_slow 2.mp3", title: "Classic_Piano_slow 2", artist: "MUSIA ONE", cover: "images/karaoke_cover4.jpg" },
			{ src: "mini_playlist/카페(잔잔한 느낌) (Classic, R&B).mp3", title: "카페(잔잔한 느낌) (Classic, R&B)", artist: "MUSIA ONE", cover: "images/classic_cover5.jpg" },
			{ src: "mini_playlist/Pop_guitar_slow 1.mp3", title: "Pop_guitar_slow 1", artist: "MUSIA ONE", cover: "images/game_cover2.jpg" },
			{ src: "park_playlist/Classic 7.mp3", title: "Classic 7", artist: "Suno AI", cover: "images/cover7.jpg" },
			{ src: "park_playlist/Classic 8.mp3", title: "Classic 8", artist: "Suno AI", cover: "images/cover8.jpg" },
			{ src: "park_playlist/Classic 9.mp3", title: "Classic 9", artist: "Suno AI", cover: "images/cover9.jpg" },
		],
		retro: [
			{ src: "retro_playlist/Pop_guitar_slow.mp3", title: "Pop_guitar_slow", artist: "MUSIA ONE", cover: "images/classic_cover1.jpg" },
            { src: "retro_playlist/Romantic_Accoustic pop 1.mp3", title: "Romantic_Accoustic pop 1", artist: "MUSIA ONE", cover: "images/classic_cover2.jpg" },
			{ src: "retro_playlist/Romantic_Accoustic pop 2.mp3", title: "Romantic_Accoustic pop 2", artist: "MUSIA ONE", cover: "images/karaoke_cover3.jpg" },
			{ src: "retro_playlist/Romantic_Ballad 1.mp3", title: "Romantic_Ballad 1", artist: "MUSIA ONE", cover: "images/karaoke_cover4.jpg" },
			{ src: "retro_playlist/Romantic_Ballad 2.mp3", title: "Romantic_Ballad 2", artist: "MUSIA ONE", cover: "images/classic_cover5.jpg" },
			{ src: "simple_playlist/R&B 6_밝으면서 잔잔한.mp3", title: "R&B 6", artist: "MUSIA ONE", cover: "images/game_cover2.jpg" },
			{ src: "simple_playlist/R&B 7_밝으면서 잔잔한.mp3", title: "R&B 7", artist: "MUSIA ONE", cover: "images/game_cover7.jpg" },
			{ src: "simple_playlist/R&B 8_밝으면서 잔잔한.mp3", title: "R&B 8", artist: "MUSIA ONE", cover: "images/kpop_cover9.jpg" },
			{ src: "simple_playlist/R&B 9_밝으면서 모던한.mp3", title: "R&B 9", artist: "MUSIA ONE", cover: "images/game_cover5.jpg" },
			{ src: "simple_playlist/R&B 10_밝으면서 모던한.mp3", title: "R&B 10", artist: "MUSIA ONE", cover: "images/kpop_cover1.jpg" },
		],
        default: [
            { src: "default_playlist/Default 1.mp3", title: "SASA", artist: "SASA", cover: "images/default-cover.jpg" },
        ]
    };

    // 현재 재생 중인 트랙 인덱스
    let currentTrackIndex = 0;
    let isPlaying = false;

    const audioPlayer = $('#audio-player')[0];

    // 플레이리스트 보기 버튼 클릭 시 플레이리스트 표시
    $('.show-playlist-button').on('click', function(){
        $('#questionnaire-wrapper').fadeOut();
        $('#playlist-container').fadeIn();

        // 플레이리스트 초기화 (중복 추가 방지)
        $('#playlist').empty();

        // 사용자 응답 기반으로 플레이리스트 선택
        let selectedCategory = determinePlaylistCategory();

        let selectedPlaylist = playlists[selectedCategory] || playlists['default'];

        // 선택된 플레이리스트 추가
        selectedPlaylist.forEach(function(track){
            $('#playlist').append(
                `<li data-src="${track.src}" data-title="${track.title}" data-artist="${track.artist}" data-cover="${track.cover}">${track.title}</li>`
            );
        });

        // 오디오 플레이어 숨기기 및 초기화
        $('#audio-player').hide();
        resetPlayerUI();
    });

    // 플레이리스트 항목 클릭 시 음악 재생
    $('#playlist').on('click', 'li', function(){
        var index = $(this).index();
        loadTrack(index);
    });

    // 재생/일시정지 버튼 클릭
    $('#play-pause-button').on('click', function(){
        if(audioPlayer.src === ""){
            alert("먼저 플레이리스트에서 트랙을 선택해주세요.");
            return;
        }

        if(audioPlayer.paused){
            audioPlayer.play();
            isPlaying = true;
            $(this).html('<i class="fas fa-pause"></i>');
        } else {
            audioPlayer.pause();
            isPlaying = false;
            $(this).html('<i class="fas fa-play"></i>');
        }
    });

    // 다음 트랙 버튼 클릭
    $('#next-button').on('click', function(){
        var current = $('#playlist li.active');
        var next = current.next('li');
        if(next.length === 0){
            next = $('#playlist li').first();
        }
        loadTrack(next.index());
    });

    // 이전 트랙 버튼 클릭
    $('#prev-button').on('click', function(){
        var current = $('#playlist li.active');
        var prev = current.prev('li');
        if(prev.length === 0){
            prev = $('#playlist li').last();
        }
        loadTrack(prev.index());
    });

    // 오디오 재생 시 진행 바 및 시간 업데이트
    $('#audio-player').on('timeupdate', function(){
        var audio = this;
        var progress = (audio.currentTime / audio.duration) * 100;
        $('#progress-bar').val(progress);

        // 현재 시간과 전체 시간 표시
        $('#current-time').text(formatTime(audio.currentTime));
        $('#duration').text(formatTime(audio.duration));
    });

    // 진행 바 조절 시 트랙 위치 변경
    $('#progress-bar').on('input change', function(){
        var audio = $('#audio-player')[0];
        var seekTime = (audio.duration / 100) * $(this).val();
        audio.currentTime = seekTime;
    });

    // 볼륨 조절
    $('#volume-bar').on('input change', function(){
        var audio = $('#audio-player')[0];
        audio.volume = $(this).val() / 100;
    });

    // 트랙이 끝났을 때 다음 트랙 자동 재생
    $('#audio-player').on('ended', function(){
        $('#next-button').click();
    });

    $('#reset-button').on('click', function(){
        // 플레이리스트 컨테이너 숨기기 및 시작 버튼 표시
        $('#playlist-container').fadeOut();
        $('#start-button').show();

        // 선택된 옵션 초기화
        $('.selectable-option').removeClass('selected');

        // 다음 버튼 비활성화
        $('.next-button').prop('disabled', true);

        // 질문 슬라이드 초기화
        $('.question-slide').removeClass('active').hide();
        $('.question-slide[data-question="1"]').addClass('active').fadeIn();

        // 플레이리스트 초기화
        $('#playlist').empty();
        audioPlayer.src = "";
        audioPlayer.pause();
        $('#audio-player').hide();
        resetPlayerUI();

        // 사용자 응답 초기화
        userResponses = {};
    });

    // 사용자 응답을 기반으로 플레이리스트 카테고리 결정
    function determinePlaylistCategory(){
        if(userResponses["1"] && userResponses["1"].includes("park")){
            return "park";
        }
        if(userResponses["2"] && userResponses["2"].includes("sports")){
            return "arcade_sports";
        }
        if(userResponses["2"] && userResponses["2"].includes("game")){
            return "arcade_game";
        }
		if(userResponses["2"] && userResponses["2"].includes("karaoke")){
            return "arcade_karaoke";
        }
		if(userResponses["4"] && userResponses["4"].includes("simple")){
            return "simple";
        }
		if(userResponses["4"] && userResponses["4"].includes("uk")){
            return "uk";
        }
		if(userResponses["4"] && userResponses["4"].includes("mini")){
            return "mini";
        }
		if(userResponses["4"] && userResponses["4"].includes("retro")){
            return "retro";
        }
        else {
            return "default";
        }
    }

    // 트랙 진행 시간을 포맷팅하는 함수
    function formatTime(seconds){
        if(isNaN(seconds)){
            return '0:00';
        }
        var mins = Math.floor(seconds / 60);
        var secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' + secs : secs);
    }

    // 플레이어 UI 초기화 함수
    function resetPlayerUI(){
        $('#cover-image').attr('src', 'images/default-cover.jpg');
        $('#track-title').text('제목');
        $('#track-artist').text('아티스트');
        $('#play-pause-button').html('<i class="fas fa-play"></i>');
        $('#progress-bar').val(0);
        $('#current-time').text('0:00');
        $('#duration').text('0:00');
    }

    // 트랙 로드 및 재생 함수
    function loadTrack(index){
        const track = $('#playlist li').eq(index);
        const src = track.data('src');
        const title = track.data('title');
        const artist = track.data('artist');
        const cover = track.data('cover');

        if(!src){
            alert("오디오 파일이 존재하지 않습니다.");
            return;
        }

        // 현재 트랙 하이라이트
        $('#playlist li').removeClass('active');
        track.addClass('active');

        // 트랙 정보 업데이트
        $('#cover-image').attr('src', cover || 'images/default-cover.jpg');
        $('#track-title').text(title || '제목');
        $('#track-artist').text(artist || '아티스트');

		$('#cover-image').off('error').on('error', function(){
			$(this).hide();
		});

        // 오디오 소스 설정 및 재생
        audioPlayer.src = src;
        audioPlayer.play();
        isPlaying = true;

        // 재생 버튼 아이콘 변경
        $('#play-pause-button').html('<i class="fas fa-pause"></i>');
    }
});
