/**
 * jQuery Plugin offbeatSlider
 *
 * Version 0.9.2
 *
 * @author Dominik Grzelak
 * @since 2017-03-26
 */
(function ($) {

    var DATA_PARAM_INDEX = "slider-index";
    var DATA_PARAM_ANIMATION_RIGHT = "animation-right";
    var DATA_PARAM_ANIMATION_LEFT = "animation-left";

    var sessionObject = {};

    function createID() {
        return Math.ceil((Math.random()) * 0x100000).toString();
    }

    $.fn.offbeatSlider = function (options) {
        this.filter(".ofp-slider").each(function () {
            var sliderContainer = $(this);
            var uid = createID();
            var settings = $.extend({}, $.fn.offbeatSlider.settingsDefault, options);

            var tmpIx = sliderContainer.data(DATA_PARAM_INDEX);
            if (tmpIx !== undefined) {
                settings.slideStartIndex = tmpIx;
            }
            var animR = sliderContainer.data(DATA_PARAM_ANIMATION_RIGHT);
            var animL = sliderContainer.data(DATA_PARAM_ANIMATION_LEFT);
            if (animR !== undefined && animL !== undefined) {
                settings.animationRight = animR;
                settings.animationLeft = animL;
            }

            sessionObject[uid] = {
                "sliderContainer": sliderContainer,
                "settings": settings
            };
            init(uid);
        });
    };

    function init(uid) {
        var sliderContainer = sessionObject[uid].sliderContainer;
        var settings = sessionObject[uid].settings;
        var dots = sliderContainer.find(".ofp-slider-dots");
        var slides = sliderContainer.find(".ofp-slides");

        sessionObject[uid].stopCarousel = false;
        sessionObject[uid]["dots"] = dots;
        sessionObject[uid]["slides"] = slides;
        sessionObject[uid]["numSlides"] = slides.length;
        sessionObject[uid]["currentIndex"] = settings.slideStartIndex;

        for (var i = 0; i < dots.length; i++) {
            $(dots[i]).removeClass("ofp-slider-dots-active");
            $(dots[i]).click({uid: uid, index: i + 1}, clLis);
        }

        var left = sliderContainer.find(".ofp-arrow-left");
        var right = sliderContainer.find(".ofp-arrow-right");
        left.click({uid: uid}, clLis);
        right.click({uid: uid}, clLis);

        if (slides.length === 0) {
            return;
        }

        if (settings.carousel) {
            $(sliderContainer).mouseover(function () {
                sessionObject[uid].stopCarousel = true;
                clearTimeout(sessionObject[uid].carouselTimer);
            });
            $(sliderContainer).mouseout(function () {
                sessionObject[uid].stopCarousel = false;
                carousel(uid);
            });
            showNextSlide(uid);
            carousel(uid);
        } else {
            showNextSlide(uid);
        }
    }

    var clLis = function (event) {
        var uid = event.data.uid;
        var sliderContainer = sessionObject[uid].sliderContainer;
        var index = 0;
        if (event.data.index !== undefined) {
            index = event.data.index;
        } else {
            index = sliderContainer.data("slider-index");
        }

        sessionObject[uid].prevIndex = index;

        if (!$(event.target).hasClass("ofp-slider-dots")) {
            if ($(event.target).hasClass("ofp-arrow-left")) {
                index += -1;
            } else {
                index += 1;
            }
        }

        sessionObject[uid].currentIndex = index;
        showNextSlide(uid);
    };

    function carousel(uid) {
        if (sessionObject[uid].stopCarousel) {
            clearTimeout(sessionObject[uid].carouselTimer);
        }
        var settings = sessionObject[uid].settings;
        var carouselTimer = setTimeout(function () {
            var index = sessionObject[uid].currentIndex;
            var numSlides = sessionObject[uid].numSlides;
            index = checkSlideIndex(index + 1, numSlides);
            sessionObject[uid].currentIndex = index;
            showNextSlide(uid);
            carousel(uid);
        }, settings.carouselDelay);
        sessionObject[uid].carouselTimer = carouselTimer;
    }

    function checkSlideIndex(index, maximum) {
        if (index === undefined || index > maximum) index = 1;
        if (index < 1) {
            index = maximum;
        }
        return index;
    }

    function showNextSlide(uid) {
        var settings = sessionObject[uid].settings;
        var sliderContainer = sessionObject[uid]["sliderContainer"];
        var numSlides = sessionObject[uid]["numSlides"];
        var slides = sessionObject[uid]["slides"];
        var dots = sessionObject[uid]["dots"];
        var index = sessionObject[uid]["currentIndex"];
        var prevIndex = sessionObject[uid]["prevIndex"];
        var oldIndex = index;
        index = checkSlideIndex(index, numSlides);

        sliderContainer.data("slider-index", index);
        sessionObject[uid].currentIndex = index;
        for (var i = 0; i < slides.length; i++) {
            $(dots[i]).removeClass("ofp-slider-dots-active");
            $(slides[i]).addClass("slide-invisible");
            $(slides[i]).removeClass("slide-visible");
            $(slides[i]).removeClass(settings.animation);
            $(slides[i]).removeClass(settings.animationRight);
            $(slides[i]).removeClass(settings.animationLeft);
        }

        if (settings.animate) {
            $(slides[index - 1]).removeClass("slide-invisible");
            if (settings.animation === "normal") {
                $(slides[index - 1]).css("opacity", 0.19);
                $(dots[index - 1]).addClass("ofp-slider-dots-active");
                $(slides[index - 1]).animate({
                    opacity: 1
                }, settings.duration, settings.easing, function () {
                    $(slides[index - 1]).addClass("slide-visible");
                });
            } else if (settings.animation === "css") {
                $(dots[index - 1]).addClass("ofp-slider-dots-active");
                if (prevIndex < oldIndex)
                    $(slides[index - 1]).addClass(settings.animationRight);
                else
                    $(slides[index - 1]).addClass(settings.animationLeft);
            }
        } else {
            $(dots[index - 1]).addClass("ofp-slider-dots-active");
            $(slides[index - 1]).removeClass("slide-invisible");
            $(slides[index - 1]).addClass("slide-visible");
        }
    }

    $.fn.offbeatSlider.settingsDefault = {
        slideStartIndex: 1,
        animate: true,
        animation: "normal",
        animationLeft: "",
        animationRight: "",
        duration: 1000,
        easing: "linear", //easein, linear, ...
        carousel: false, //auto-animate ?
        carouselDelay: 3000
    };

})(jQuery);
