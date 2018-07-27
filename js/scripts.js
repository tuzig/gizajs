/*jshint multistr: true */
jQuery(document).ready(function($){

var height_video = $(window).width();
var height_responsive = (height_video / 1.78011) + 1;
$('.video_slide').css("height",height_responsive);



$(window).resize(function() {

var height_video = $(window).width();
var height_responsive = (height_video / 1.78011) + 1;
$('.video_slide').css("height",height_responsive);

});
});


 
var   window_height = $(window).height(),
      testMobile,
	  loadingError = '<p class="error">The Content cannot be loaded.</p>',
	  nameError = '<div class="alert-message error">אנא הכניסו את שמכן.<span class="close" href="#">x</span></div>',
	  emailError = '<div class="alert-message error">אנא הכניסו כתובת דואל חוקית.<span class="close" href="#">x</span></div>',	  
	  mailSuccess = '<div class="alert-message success">הטופס נשלח בהצלחה, נחזור אליך בהקדם &#128591; <span class="close" href="#">x</span></div>', 
	  mailResult = $('#contact .result'),
      current,
	  next, 
	  prev,
	  target, 
	  hash,
	  url,
	  page,
	  title,	  	  	  
	  projectIndex,
	  scrollPostition,
	  projectLength,
	  ajaxLoading = false,
	  wrapperHeight,
	  pageRefresh = true,
	  content =false,
	  loader = $('div#loader'),
	  portfolioGrid = $('div#portfolio-wrap'),
	  projectContainer = $('div#ajax-content-inner'),
	  projectNav = $('#project-navigation ul'),
	  exitProject = $('div#closeProject a'),
	  easing = 'easeOutExpo',
	  folderName ='projects';	
	    
	  $.browser.safari = ($.browser.webkit && !(/chrome/.test(navigator.userAgent.toLowerCase())));	 	

	 
	 if ( !$.browser.safari ) {
		  $('.home-parallax').find('.home-text-wrapper').children('.container').addClass('no-safari');
	 }


	$('.home-slide').each(function(){
	    contentSize = $(this).find('.home-slide-content');  
        contentSize.fitText(1.2);			
	});

	


  jQuery(window).load(function(){   
  jQuery(document).ready(function($){     
// cache container
	var container = $('#portfolio-wrap');	
	

	container.isotope({
		animationEngine : 'best-available',
	  	animationOptions: {
	     	duration: 200,
	     	queue: false
	   	},
		layoutMode: 'fitRows'
	});	


	// filter items when filter link is clicked
	$('#filters a').click(function(){
		$('#filters a').removeClass('active');
		$(this).addClass('active');
		var selector = $(this).attr('data-filter');
	  	container.isotope({ filter: selector });
        setProjects();		
	  	return false;
	});
		
		
		function splitColumns() { 
			var winWidth = $(window).width(), 
				columnNumb = 1;
			
			
			if (winWidth > 1200) {
				columnNumb = 5;
			} else if (winWidth > 900) {
				columnNumb = 4;
			} else if (winWidth > 600) {
				columnNumb = 3;
			} else if (winWidth > 300) {
				columnNumb = 1;
			}
			
			return columnNumb;
		}		
		
		function setColumns() { 
			var winWidth = $(window).width(), 
				columnNumb = splitColumns(), 
				postWidth = Math.floor(winWidth / columnNumb);
			
			container.find('.portfolio-item').each(function () { 
				$(this).css( { 
					width : postWidth + 'px' 
				});
			});
		}		
		
		function setProjects() { 
			setColumns();
			container.isotope('reLayout');
		}		
		
		container.imagesLoaded(function () { 
			setColumns();
		});
		
	
		$(window).bind('resize', function () { 
			setProjects();			
		});

});
});



function home_parallax() {
	        $(window).scroll(function() {
	            var yPos = -($(window).scrollTop() / 2); 
         
	            // Put together our final background position
	            var coords = '50% '+ yPos + 'px';
	 
	            // Move the background
	            //$('.page-title-wrapper').css({ backgroundPosition: coords });
	            $('.home-parallax, .home-parallax2, .home-parallax3, .home-parallax4').css({ backgroundPosition: coords });
	        
	        }); 
}

 home_parallax();


/*----------------------------------------------------*/
/* MOBILE DETECT FUNCTION
/*----------------------------------------------------*/

	var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };	  
	  
	 	   



	 
/*----------------------------------------------------*/
// CONTACT FORM WIDGET
/*----------------------------------------------------*/

    $("#contact form").submit(function()
    {
        var email = this.email.value;
        var name = this.name.value;

        if (!( /(.+)@(.+){2,}\.(.+){2,}/.test(email)))
            mailResult.append(emailError);
        else if (name.length < 3)
            mailResult.append(nameError);
        else 
            firebase.database().ref('forms/register/').push().set({
                name: name,
                email: email,
                message: this.message.value
            }, function(data) {
                $('#contact form').slideUp().height('0');
                $('#contact .result').append(mailSuccess);
            });
});
	  
//BEGIN DOCUMENT.READY FUNCTION
$(document).ready(function() 
{ 
  $('nav').animate({'opacity': '1'}, 400);	   
  $(".home-quote h1").slabText({"viewportBreakpoint":300});
/*----------------------------------------------------*/
/* FULLSCREEN IMAGE HEIGHT
/*----------------------------------------------------*/	     
  $('#home, .background-video').css({height:window_height});
  rnr_shortcodes();
/* ------------------------------------------------------------------------ */
/* BACK TO TOP 
/* ------------------------------------------------------------------------ */
	$(window).scroll(function(){
		if($(window).scrollTop() > 200){
			$("#back-to-top").fadeIn(200);
		} else{
			$("#back-to-top").fadeOut(200);
		}
	});
	
	$('#back-to-top, .back-to-top').click(function() {
		  $('html, body').animate({ scrollTop:0 }, '800');
		  return false;
	});
/*----------------------------------------------------*/
// ADD PRETTYPHOTO
/*----------------------------------------------------*/
	$("a[data-rel^='prettyPhoto']").prettyPhoto();
/*----------------------------------------------------*/
// ADD VIDEOS TO FIT ANY SCREEN
/*----------------------------------------------------*/
	 $(".container").fitVids();	 		
/*----------------------------------------------------*/
// PRELOADER CALLING
/*----------------------------------------------------*/    
    $("body.onepage").queryLoader2({
        barColor: "#111111",
        backgroundColor: "#ffffff",
        percentage: true,
        barHeight: 3,
        completeAnimation: "fade",
        minimumTime: 200
    });  
/*----------------------------------------------------*/
// MENU SMOOTH SCROLLING
/*----------------------------------------------------*/  
    $(".main-menu a, .logo a, .home-logo-text a, .home-logo a, .scroll-to").bind('click',function(event){
		
		$(".main-menu a").removeClass('active');
		$(this).addClass('active');			
		var headerH = $('.navigation').outerHeight();
	
        $("html, body").animate({
            scrollTop: $($(this).attr("href")).offset().top - headerH + 'px'
        }, {
            duration: 1200,
            easing: "easeInOutExpo"
        });

		event.preventDefault();
    });	
/*----------------------------------------------------*/
// PARALLAX CALLING
/*----------------------------------------------------*/  
    testMobile = isMobile.any();
    
    if (testMobile == null)
    {
        $('.parallax .bg1').parallax("50%", 0.6);
        $('.parallax .bg2').parallax("50%", 0.6);
        $('.parallax .bg3').parallax("50%", 0.6);	
        $('.parallax .bg4').parallax("50%", 0.6);				
    } 
	
	jQuery('.milestone-counter').appear(function() {
		$('.milestone-counter').each(function(){
			dataperc = $(this).attr('data-perc'),
			$(this).find('.milestone-count').delay(6000).countTo({
            from: 0,
            to: dataperc,
            speed: 2000,
            refreshInterval: 100
        });
     });
 });	
    //img overlays
    $('.team-thumb').on('mouseover', function()
    {
        var overlay = $(this).find('.team-overlay');
        var content = $(this).find('.overlay-content');

        overlay.stop(true,true).fadeIn(600);
        content.stop().animate({'top': "40%",
			                     opacity:1 }, 600);
        
    }).on('mouseleave', function()
    {
        var overlay = $(this).find('.team-overlay');
        var content = $(this).find('.overlay-content');
        
        content.stop().animate({'top': "60%",
			                     opacity:0  }, 300, function(){
			content.css('top',"20%")});
			
        overlay.fadeOut(300);
		
    }); 	
  
    $('#team-container').html(Mustache.render(
            $('#member-template').html(),
        {member: [
            {name:'ד"ר הלית מעיין', role:'ממשקים', slug: 'hilit',
             image: '/images/team/hilit.jpg',
             profile: '<p>הלית היא מאפיינת מוצר בעלת ניסיון עשיר בהובלת תהליכי תכנון ועיצוב מערכות דיגיטליות מורכבות.  כבר מתחילת לימודיה האקדמאיים נמשכה הלית לקסם של הגישה הרב-תחומית בשילוב מדעי המחשב ומדעי הפסיכולוגיה. מאז הספיקה הלית לרכוש רקע עשיר בהנדסת גורמי אנוש, בפסיכולוגיה קוגניטיבית וביישומים בינתחומיים שמחייבים מעורבות ואיזון בין שתי המיספרות המוח.  הלית ייסדה, ניהלה והובילה צוותי עיצוב ופיתוח מוצר, בחברות שונות. בשנים האחרונות מתמקדת באסטרטגייה וחדשנות מוצרית ועובדת בעיקר עם Start-Ups כולל mentoring בנושאי חווית משתמש ואיפיון מוצר בתוכנית הLaunchpad  של גוגל.  את מילוי המצברים ממלא הלית בטיולים, בארץ ובעולם. יצא הגורל ובשנים האחרונות הלית גרה בסינגפור והתמחתה בטיולים במדינות מזרח אסיה. איזון לטיולים באזורים אחרים של העולם מבוצע כבר בימים אלו ולאחר שובה של הלית לחיים במזרח התיכון.  </p>'
            },
            {name:'בני דאון', role:'כלבויניק', slug: 'benny',
             image: '/images/team/daonb.jpg',
             profile: '<p>את מתנות בר-המצווה שלו המיר בני במחשב אטארי ולימד את עצמו לתכנת בבייסיק. בתיכון למד במגמת מחשבים והתגייס לקורס ממר"מ, אחריו שירת בחיל האוויר.  כשסיים את שירותו הצבאי הפליג ליוון והגיע להודו ברכבות ואוטובוסים.  כששב ארצה, השתלב בתחום פיתוח התוכנה, ויחד עם שותפים הקים את "שונרא", שזה חתול בארמית, יופי של להקת רוק, אבל גם חברת תוכנה שעסקה בפיתוח פתרונות המקטינים את הסיכון בהטמעת שירותי טכנולוגית מידע (IT) מתקדמים.</p> \
                 <p>לימים, לאחר שמכר את חלקו ב"שונרא", הלך בני אחר ליבו וחזר לתכנת ולפתח תוכנה בקוד פתוח. בני הקים את "כנסת פתוחה" ואת "הסדנא לידע ציבורי" - שני מיזמים שפועלים לקידום שקיפות שלטונית. </p> '
            },
            {name:'ד"ר צבי לניר', role:'הפתעות', slug: 'zvi',
             image: '/images/team/zvi.png',
             profile: '<p>איש רב פעלים, מייסד ונשיא חברת "פרקסיס", העוסקת בליווי פרויקטים של שינוי תפיסות ודרכי פעולה על מנת להתאים אותם למציאות המשתנה במהירות רבה. החברה מבצעת פרויקטים ממלכתיים וחברתיים ובפיתוח אזורים, ערים וקהילות, בגישה המדגישה יזמות ויצירתיות כבסיס לפיתוח כלכלי וחברתי ליצירת מציאות של איכות חיים טובה יותר.  לניר בעל תואר ראשון במדע המדינה, כלכלה וסוציולוגיה ותואר שני בהיסטוריה צבאית מאוניברסיטת תל-אביב.  הוא השלים את הדוקטורט באוניברסיטה העברית במסגרתו פיתח את תאוריית ההפתעה הבסיסית, לפיה, האמת גלומה בתפישה ולא במידע וכי עלינו לפתח תפישות ודרכי התמודדות חדשות עם שינויים במקום אלו המוכרות.  באחרונה, לניר חוקר את תקופת הבגרות המאוחרת בחיי האדם, עוסק בפיתוח אפשרויות אחרות של קריירה למבוגרים ושינוי תפישה מערכתי בנוגע להזדקנות.</p>'
 
            },
            {name:'הדסה גרינברג יעקב', role:'תקתוקים', slug: 'hadasa',
             image: '/images/team/hadasa.png',
             profile: '<p>הדסה צברה נסיון בתפקידי דוברות והסברה שונים לאורך השנים במשרד התקשורת, מרכז מורשת מנחם בגין ומשרד המדע, התרבות והספורט.  ניהלה את פרויקט ההקמה של מוזיאון הכנסת וכיום עצמאית בתחום הפקת תערוכות מוזיאליות, ניהול פרוייקטים מעניינים וייעוץ.  בעלת תואר ראשון ושני בגיאוגרפיה ותכנון ערים, תואר שני בלימודי משפט.  בעלת ניסיון מוכח בפענוח וכתיבת מכרזים ממשלתיים.  נשואה ליובל ואם לארבעה, תושבת מבשרת ציון.  סורגת שטיחים להנאתה.</p>'
 
            }
        ]}));
});
//END DOCUMENT.READY FUNCTION
			


// BEGIN WINDOW.LOAD FUNCTION		
$(window).load(function(){
	
	$('#load').fadeOut().remove();
	$(window).trigger( 'hashchange' );
	$(window).trigger( 'resize' );
  $('[data-spy="scroll"]').each(function () {
    var $spy = $(this).scrollspy('refresh');
	
  }); 	
 
/* ------------------------------------------------------------------------ */
/* TEXT FITTING FOR HOME STYLING 2 */
/* ------------------------------------------------------------------------ */ 	    
     $('.home-slide-content').fitText(1.2);
	  $('.fittext-content').fitText(2);
 
/* ------------------------------------------------------------------------ */
/* STICKY NAVIGATION */
/* ------------------------------------------------------------------------ */ 
 
	$("nav.sticky-nav").sticky({ topSpacing: 0, className: 'sticky', wrapperClassName: 'main-menu-wrapper' });
	

	if ($(window).scrollTop() > $(window).height()){
		$('nav.transparent').addClass('scroll');		
	} else {
		$('nav.transparent').removeClass('scroll');				
	}	
	
	$(window).on("scroll", function(){
		var winHeight = $(window).height();
		var windowWidth = $(window).width();
		var windowScroll = $(window).scrollTop();
		var home_height =  $('#home').outerHeight();

			if ($(window).scrollTop() > home_height){
				$('nav.transparent').addClass('scroll');										
			} else {
				$('nav.transparent').removeClass('scroll');									
			}

		
	  });

/* ------------------------------------------------------------------------ */
/* SELECTNAV - A DROPDOWN NAVIGATION FOR SMALL SCREENS */
/* ------------------------------------------------------------------------ */ 
	selectnav('nav', {
		nested: true,
		indent: '-'
	}); 
	
	
 
});
// END OF WINDOW.LOAD FUNCTION
	
  
 (function($) {
    $.fn.countTo = function(options) {
        // merge the default plugin settings with the custom options
        options = $.extend({}, $.fn.countTo.defaults, options || {});

        // how many times to update the value, and how much to increment the value on each update
        var loops = Math.ceil(options.speed / options.refreshInterval),
            increment = (options.to - options.from) / loops;

        return $(this).delay(1000).each(function() {
            var _this = this,
                loopCount = 0,
                value = options.from,
                interval = setInterval(updateTimer, options.refreshInterval);

            function updateTimer() {
                value += increment;
                loopCount++;
                $(_this).html(value.toFixed(options.decimals));

                if (typeof(options.onUpdate) == 'function') {
                    options.onUpdate.call(_this, value);
                }

                if (loopCount >= loops) {
                    clearInterval(interval);
                    value = options.to;

                    if (typeof(options.onComplete) == 'function') {
                        options.onComplete.call(_this, value);
                    }
                }
            }
        });
    };

    $.fn.countTo.defaults = {
        from: 0,  // the number the element should start at
        to: 100,  // the number the element should end at
        speed: 1000,  // how long it should take to count between the target numbers
        refreshInterval: 100,  // how often the element should be updated
        decimals: 0,  // the number of decimal places to show
        onUpdate: null,  // callback method for every time the element is updated,
        onComplete: null,  // callback method for when the element finishes updating
    };
})(jQuery);


	 
