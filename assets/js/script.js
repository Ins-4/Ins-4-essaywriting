var menuWrapper = document.querySelector('.heading-wrapper'),
    menuItem = document.querySelectorAll('.heading-menu>li'),
    hamburger = document.querySelector('#hamburger');

window.addEventListener('DOMContentLoaded', function(){


    hamburger.addEventListener('click', function(){
        hamburger.classList.toggle('active');
        menuWrapper.classList.toggle('active');
    });

    menuItem.forEach(function(item){
        item.addEventListener('click', function (){
            hamburger.classList.toggle('active');
            menuWrapper.classList.toggle('active');
        })
    })
})



function accordionInit() {
    $(" .accordion-label").on("click", function() {
        var e = $(this).closest(".accordion-item-container");
            e.find(".toggled-content").slideToggle();
            e.toggleClass("opened");
            e.siblings("").removeClass("opened");
            e.siblings("").find(".toggled-content").slideUp()
    })
}

if ($(".accordion-item-container").length){
    accordionInit()
}


if ($(".services-item").length){
    var accordionInitStat;
    $(window).on('load resize', function () {
        if(window.innerWidth <= 425){
            $(".services-list").addClass('accordion-item-container');
            $(".services-list > span").addClass('accordion-label');
            if(!accordionInitStat){
                accordionInit();
                accordionInitStat = 1;
            }
        } else {
            $(".services-list").removeClass('accordion-item-container');
            $(".services-list > span").removeClass('accordion-label');
        }
    });
}



function scrollHeader(){
    $('.heading-top').removeClass('heading-fixed');
    $('.heading-bottom').removeClass('heading-fixed');
    $('header').removeClass('scroll-active');

    var headBottomOffset = $('.heading-bottom').offset().top;

    var scrolled = $(this).scrollTop();
    if (scrolled > 0){
        $('.heading-top').addClass('heading-fixed');
    } else{
        $('.heading-top').removeClass('heading-fixed');
    }
    if (scrolled >= headBottomOffset-48){
        $('.heading-bottom').addClass('heading-fixed');
        $('header').addClass('scroll-active');
    } else {
        $('.heading-bottom').removeClass('heading-fixed');
        $('header').removeClass('scroll-active');

    }
}

scrollHeader()
window.addEventListener('resize', scrollHeader);
window.addEventListener('scroll', scrollHeader);

(function ($) {
    $('select:not([name=country])').styler();
    $('select[name=country]').styler({
        selectSearch: true,
        selectSearchPlaceholder: 'Enter your country'
    });





    var widget = $('.widget-discount-promo'),
        widgetTitle = $('.promo-title'),
        widgetContent = $('.promo-content'),
        closeBtn = $('.close');

    widgetTitle.click(function () {
        widgetContent.css({ display: 'block'})
    });
    closeBtn.click(function () {
        widget.css({ display : 'none'})

    });



    $(".go-to-top").click(function(){
        $('html, body').animate({scrollTop:0}, 'slow');
        return false;
    });

    if ($(".slider-wrapper").length){
        $('.slider-wrapper').slick({
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            cssEase: 'linear',
        });
    }

    if ($(".profile-slider-wrapper").length){
        $('.profile-slider-wrapper').slick({
            // adaptiveHeight: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            cssEase: 'linear',
            arrows:false,
            dots: false,
            draggable: false,
            autoplay: false,
            accessibility: false,
            speed: 300,
            adaptiveHeight: true,
            responsive:[
                {
                    breakpoint: 768,
                    settings: "unslick"
                }
            ]
        });
    }


    // $('a[data-slide]').click(function(e) {
    //     e.preventDefault();
    //     $('a[data-slide]').removeClass('active');
    //     var slideOn = $(this).addClass('active').data('slide');
    //     $('.profile-slider-wrapper').slick('slickGoTo', slideOn - 1);
    // });
})(jQuery);

