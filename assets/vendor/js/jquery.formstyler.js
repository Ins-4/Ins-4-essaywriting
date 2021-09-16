/*
 * jQuery Form Styler v2.0.0
 * https://github.com/Dimox/jQueryFormStyler
 *
 * Copyright 2012-2017 Dimox (http://dimox.name/)
 * Released under the MIT license.
 *
 * Date: 2017.05.08
 *
 */

;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory($ || require('jquery'));
    } else {
        factory(jQuery);
    }
}(function($) {

    'use strict';

    var pluginName = 'styler',
        defaults = {
            idSuffix: '-styler',
            selectPlaceholder: 'Select...',
            selectSearch: false,
            selectSearchLimit: 10,
            selectSearchNotFound: 'No matches found',
            selectSearchPlaceholder: 'Search...',
            selectVisibleOptions: 7,
            selectSmartPositioning: false,
            isDisabledInvisible: true,
            isCountryCodes: false,
            withNano: false,
            locale: 'en',
            locales: {},
            onSelectOpened: function() {},
            onSelectClosed: function() {},
            onFormStyled: function() {}
        };

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        var locale = this.options.locale;
        if (this.options.locales[locale] !== undefined) {
            $.extend(this.options, this.options.locales[locale]);
        }
        this.init();
    }

    Plugin.prototype = {

        // инициализация
        init: function() {

            var el = $(this.element);
            var opt = this.options;

            // var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/i) && !navigator.userAgent.match(/(Windows\sPhone)/i);
            // var Android = navigator.userAgent.match(/Android/i) && !navigator.userAgent.match(/(Windows\sPhone)/i);

            function Attributes() {
                if (el.attr('id') !== undefined && el.attr('id') !== '') {
                    this.id = el.attr('id') + opt.idSuffix;
                }
                this.title = el.attr('title');
                this.classes = el.attr('class');
                this.data = el.data();
            }

            // select
            if (el.is('select')) {
                var selectboxOutput = function() {

                    // запрещаем прокрутку страницы при прокрутке селекта
                    function preventScrolling(selector) {

                        var scrollDiff = selector.prop('scrollHeight') - selector.outerHeight(),
                            wheelDelta = null,
                            scrollTop = null;

                        selector.off('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', function(e) {

                            /**
                             * нормализация направления прокрутки
                             * (firefox < 0 || chrome etc... > 0)
                             * (e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0)
                             */
                            wheelDelta = (e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0) ? 1 : -1; // направление прокрутки (-1 вниз, 1 вверх)
                            scrollTop = selector.scrollTop(); // позиция скролла

                            if ((scrollTop >= scrollDiff && wheelDelta < 0) || (scrollTop <= 0 && wheelDelta > 0)) {
                                e.stopPropagation();
                                e.preventDefault();
                            }

                        });
                    }

                    var option = $('option', el);
                    var list = '';
                    // формируем список селекта
                    function makeList() {
                        for (var i = 0; i < option.length; i++) {
                            var op = option.eq(i);
                            var li = '',
                                liClass = '',
                                liClasses = '',
                                id = '',
                                title = '',
                                dataList = '',
                                optionClass = '',
                                optgroupClass = '',
                                dataJqfsClass = '';
                            var disabled = 'disabled';
                            var selDis = 'selected sel disabled';
                            if (op.prop('selected')) liClass = 'selected sel';
                            if (op.is(':disabled')) liClass = disabled;
                            if (op.is(':selected:disabled')) liClass = selDis;
                            if (op.attr('id') !== undefined && op.attr('id') !== '') id = ' id="' + op.attr('id') + opt.idSuffix + '"';
                            if (op.attr('title') !== undefined && option.attr('title') !== '') title = ' title="' + op.attr('title') + '"';
                            if (op.attr('class') !== undefined) {
                                optionClass = ' ' + op.attr('class');
                                dataJqfsClass = ' data-jqfs-class="' + op.attr('class') + '"';
                            }

                            var data = op.data();
                            for (var k in data) {
                                if (data[k] !== '') dataList += ' data-' + k + '="' + data[k] + '"';
                            }

                            if ( (liClass + optionClass) !== '' )   liClasses = ' class="' + liClass + optionClass + '"';
                            li = '<li' + dataJqfsClass + dataList + liClasses + title + id + '>'+ op.html() +'</li>';

                            // если есть optgroup
                            if (op.parent().is('optgroup')) {
                                if (op.parent().attr('class') !== undefined) optgroupClass = ' ' + op.parent().attr('class');
                                li = '<li' + dataJqfsClass + dataList + ' class="' + liClass + optionClass + ' option' + optgroupClass + '"' + title + id + '>'+ op.html() +'</li>';
                                if (op.is(':first-child')) {
                                    li = '<li class="optgroup' + optgroupClass + '">' + op.parent().attr('label') + '</li>' + li;
                                }
                            }

                            list += li;
                        }
                    } // end makeList()

                    // одиночный селект
                    function doSelect() {

                        var att = new Attributes();
                        var searchHTML = '';
                        var selectPlaceholder = el.data('placeholder');
                        var selectSearch = el.data('search');
                        var selectSearchLimit = el.data('search-limit');
                        var selectSearchNotFound = el.data('search-not-found');
                        var selectSearchPlaceholder = el.data('search-placeholder');
                        var selectSmartPositioning = el.data('smart-positioning');

                        if (selectPlaceholder === undefined) selectPlaceholder = opt.selectPlaceholder;
                        if (selectSearch === undefined || selectSearch === '') selectSearch = opt.selectSearch;
                        if (selectSearchLimit === undefined || selectSearchLimit === '') selectSearchLimit = opt.selectSearchLimit;
                        if (selectSearchNotFound === undefined || selectSearchNotFound === '') selectSearchNotFound = opt.selectSearchNotFound;
                        if (selectSearchPlaceholder === undefined) selectSearchPlaceholder = opt.selectSearchPlaceholder;
                        if (selectSmartPositioning === undefined || selectSmartPositioning === '') selectSmartPositioning = opt.selectSmartPositioning;

                        var selectbox =
                            $('<div class="jq-selectbox jqselect">' +
                                '<div class="jq-selectbox__select">' +
                                '<div class="jq-selectbox__select-text"></div>' +
                                '<div class="jq-selectbox__trigger">' +
                                '<div class="jq-selectbox__trigger-arrow"></div></div>' +
                                '</div>' +
                                '</div>')
                                .attr({
                                    id: att.id,
                                    title: att.title
                                })
                                .addClass(att.classes)
                                .data(att.data)
                        ;

                        el.after(selectbox).prependTo(selectbox);

                        var selectzIndex = selectbox.css('z-index');
                        selectzIndex = (selectzIndex > 0 ) ? selectzIndex : 1;
                        var divSelect = $('div.jq-selectbox__select', selectbox);
                        var divText = $('div.jq-selectbox__select-text', selectbox);
                        var optionSelected = option.filter(':selected');

                        makeList();

                        if (selectSearch) searchHTML =
                            '<div class="jq-selectbox__search"><input type="search" autocomplete="off" placeholder="' + selectSearchPlaceholder + '"></div>' +
                            '<div class="jq-selectbox__not-found">' + selectSearchNotFound + '</div>';
                        var dropdown =
                            $('<div class="jq-selectbox__dropdown '+ (opt.withNano ? 'nano' : '') +'">' +
                                searchHTML + '<ul class="'+ (opt.withNano ? 'nano-content' : '') +'">' + list + '</ul>' +
                                '</div>');
                        selectbox.append(dropdown);
                        var ul = $('ul', dropdown);
                        var li = $('li', dropdown);
                        var search = $('input', dropdown);
                        var notFound = $('div.jq-selectbox__not-found', dropdown).hide();
                        if (li.length < selectSearchLimit) search.parent().hide();

                        // показываем опцию по умолчанию
                        // если у 1-й опции нет текста, она выбрана по умолчанию и параметр selectPlaceholder не false, то показываем плейсхолдер
                        if (option.first().text() === '' && option.first().is(':selected') && selectPlaceholder !== false) {
                            divText.text(selectPlaceholder).addClass('placeholder');
                        } else {
                            divText.text(optionSelected.text());
                        }

                        // прячем 1-ю пустую опцию, если она есть и если атрибут data-placeholder не пустой
                        // если все же нужно, чтобы первая пустая опция отображалась, то указываем у селекта: data-placeholder=""
                        if (option.first().text() === '' && el.data('placeholder') !== '') {
                            li.first().hide();
                        }

                        var selectHeight = selectbox.outerHeight(true);
                        var searchHeight = search.parent().outerHeight(true) || 0;
                        var isMaxHeight = ul.css('max-height');
                        var liSelected = li.filter('.selected');
                        if (liSelected.length < 1) li.first().addClass('selected sel');
                        var position = dropdown.css('top');
                        if (dropdown.css('left') === 'auto') dropdown.css({left: 0});
                        if (dropdown.css('top') === 'auto') {
                            dropdown.css({top: selectHeight});
                            position = selectHeight;
                        }
                        dropdown.hide();

                        // если выбран не дефолтный пункт
                        if (liSelected.length) {
                            // добавляем класс, показывающий изменение селекта
                            if (option.first().text() !== optionSelected.text()) {
                                selectbox.addClass('changed');
                            }
                            // передаем селекту класс выбранного пункта
                            selectbox.data('jqfs-class', liSelected.data('jqfs-class'));
                            selectbox.addClass(liSelected.data('jqfs-class'));
                        }

                        // если селект неактивный
                        if (el.is(':disabled')) {
                            selectbox.addClass('disabled');
                            return false;
                        }

                        // при клике на псевдоселекте
                        divSelect.click(function() {

                            if (dropdown.is(':visible')) {
                                // if (search.length) search.val('').trigger('input');
                                dropdown.hide();
                                selectbox.removeClass('opened dropup dropdown');
                                // колбек при закрытии селекта
                                if ($('div.jq-selectbox').filter('.opened').length) {
                                    opt.onSelectClosed.call($('div.jq-selectbox').filter('.opened'));
                                }
                                return false;
                            }

                            el.focus();

                            // если iOS, то не показываем выпадающий список,
                            // т.к. отображается нативный и неизвестно, как его спрятать
                            // if (iOS) return;
                            $('div.jqselect').css({zIndex: (selectzIndex - 1)}).removeClass('opened');
                            if (search.length) search.val('').trigger('input');
                            // умное позиционирование
                            var win = $(window);
                            var liHeight = li.data('li-height') || 0;

                            // Recalculate li height if it wasn't calculated early
                            if(liHeight === 0 && dropdown.is(':hidden'))
                            {
                                dropdown.show();
                                liHeight = dropdown.find('ul > li:visible').outerHeight();
                                dropdown.hide();
                                li.data('li-height', liHeight);
                            }

                            var topOffset = selectbox.offset().top;
                            var bottomOffset = win.height() - selectHeight - (topOffset - win.scrollTop());
                            var visible = el.data('visible-options');
                            if (visible === undefined || visible === '') visible = opt.selectVisibleOptions;

                            // If disabled li is invisible and visible li count less then
                            if(opt.isDisabledInvisible)
                            {
                                var enabledLiCount = ul.find('li:not(.disabled)').length;
                                if (enabledLiCount < visible) visible = enabledLiCount;
                            }

                            var minHeight = liHeight * 5;
                            var listPadding = parseInt(dropdown.find('ul').css('padding-top')) + parseInt(dropdown.find('ul').css('padding-bottom'));
                            if(isNaN(listPadding)) {
                                listPadding = 0;
                            }
                            var newHeight = listPadding;
                            li.filter(':not(.disabled)').each(function (index) {
                                if (index < visible) {
                                    dropdown.show();
                                    newHeight += $(this).outerHeight();
                                    dropdown.hide();
                                } else {
                                    return false;
                                }
                            });
                            if (visible > 0 && visible < 6) minHeight = newHeight;
                            if (visible === 0) newHeight = 'auto';

                            var dropDown = function() {
                                dropdown.height('auto').css({bottom: 'auto', top: position});
                                var maxHeightBottom = function() {
                                    ul.css('max-height', Math.floor((bottomOffset - 20 - searchHeight) / liHeight) * liHeight);
                                };
                                maxHeightBottom();
                                ul.css('max-height', newHeight);
                                if (isMaxHeight !== 'none') {
                                    ul.css('max-height', isMaxHeight);
                                }
                                if (bottomOffset < (dropdown.outerHeight() + 20)) {
                                    maxHeightBottom();
                                }
                            };

                            var dropUp = function() {
                                dropdown.height('auto').css({top: 'auto', bottom: position});
                                var maxHeightTop = function() {
                                    ul.css('max-height', Math.floor((topOffset - win.scrollTop() - 20 - searchHeight) / liHeight) * liHeight);
                                };
                                maxHeightTop();
                                ul.css('max-height', newHeight);
                                if (isMaxHeight !== 'none') {
                                    ul.css('max-height', isMaxHeight);
                                }
                                if ((topOffset - win.scrollTop() - 20) < (dropdown.outerHeight() + 20)) {
                                    maxHeightTop();
                                }
                            };

                            if (selectSmartPositioning === true || selectSmartPositioning === 1) {
                                // раскрытие вниз
                                if (bottomOffset > (minHeight + searchHeight + 20)) {
                                    dropDown();
                                    selectbox.removeClass('dropup').addClass('dropdown');
                                    // раскрытие вверх
                                } else {
                                    dropUp();
                                    selectbox.removeClass('dropdown').addClass('dropup');
                                }
                            } else if (selectSmartPositioning === false || selectSmartPositioning === 0) {
                                // раскрытие вниз
                                if (bottomOffset > (minHeight + searchHeight + 20)) {
                                    dropDown();
                                    selectbox.removeClass('dropup').addClass('dropdown');
                                }
                            } else {
                                // если умное позиционирование отключено
                                dropdown.height('auto').css({bottom: 'auto', top: position});
                                ul.css('max-height', newHeight);
                                if (isMaxHeight !== 'none') {
                                    ul.css('max-height', isMaxHeight);
                                }
                            }

                            // если выпадающий список выходит за правый край окна браузера,
                            // то меняем позиционирование с левого на правое
                            if (selectbox.offset().left + dropdown.outerWidth() > win.width()) {
                                dropdown.css({left: 'auto', right: 0});
                            }
                            // конец умного позиционирования

                            selectbox.css({zIndex: selectzIndex});
                            if (dropdown.is(':hidden')) {
                                $('div.jq-selectbox__dropdown:visible').hide();
                                dropdown.show();
                                selectbox.addClass('opened focused');
                                // колбек при открытии селекта
                                opt.onSelectOpened.call(selectbox);

                                if(opt.withNano)
                                {
                                    var _ul = selectbox.find('.jq-selectbox__dropdown ul');
                                    var nano = selectbox.find(".nano");
                                    var height = _ul.css('max-height');

                                    _ul.css('height', height).css('max-height', 'none');
                                    nano.css('min-height', height);
                                    nano.nanoScroller({ iOSNativeScrolling: true, alwaysVisible: true });
                                }


                            } else {
                                dropdown.hide();
                                selectbox.removeClass('opened dropup dropdown');
                                // колбек при закрытии селекта
                                if ($('div.jq-selectbox').filter('.opened').length) {
                                    opt.onSelectClosed.call(selectbox);
                                }
                            }

                            // поисковое поле
                            if (search.length) {
                                if ($(window).width() >= 768) {
                                    search.val('').trigger('focus');
                                }
                                notFound.hide();
                                search.on('input', function() {
                                    var query = $(this).val().replace(/([.*+?^${}()|[\]\/\\])/g, '');
                                    var _height = searchHeight + parseInt(ul.css('padding-bottom'));
                                    li.each(function() {
                                        if (
                                            $(this).html().match(new RegExp('.*?' + query + '.*?', 'i')) ||
                                            (opt.isCountryCodes && ($(this).attr('class') || '').match(new RegExp('flag-' + query, 'i')))
                                        ){
                                            $(this).show();
                                            _height += this.offsetHeight;
                                        }
                                        else
                                        {
                                            $(this).hide();
                                        }
                                    });
                                    // прячем 1-ю пустую опцию
                                    if (option.first().text() === '' && el.data('placeholder') !== '') {
                                        li.first().hide();
                                    }
                                    if (li.filter(':visible').length < 1) {
                                        notFound.show();
                                    } else {
                                        notFound.hide();
                                    }

                                    // Пересчитываем минимальную высоту списка, если он должен быть меньше, чем сейчас
                                    if(opt.withNano)
                                    {
                                        var nano = selectbox.find(".nano");
                                        _height = _height < newHeight ? _height : newHeight;
                                        ul.css('height', _height);
                                        nano.css('min-height', _height);
                                        nano.nanoScroller();
                                    }

                                    if(opt.withNano)
                                    {
                                        var _ul = selectbox.find('.jq-selectbox__dropdown ul');
                                        var nano = selectbox.find(".nano");
                                        var height = _ul.css('max-height');

                                        _ul.css('height', height).css('max-height', 'none');
                                        nano.css('min-height', height);
                                        nano.nanoScroller({ iOSNativeScrolling: true, alwaysVisible: true });
                                    }
                                });
                            }

                            // прокручиваем до выбранного пункта при открытии списка
                            var selectedLi = li.filter('.selected:visible');
                            if (selectedLi.length > 0)
                            {
                                var scrollToLi = selectedLi;
                                // если выбран первый элемент или не выбрано вообще ничего - скролим в саммый верх
                                // if ((selectedLi.get(0) === li.get(0)) || el.val() === '') //https://netfix.atlassian.net/browse/RD-2154
                                // {
                                //     // Выбираем самый первый видимый элемент, чтобы к нему скролить
                                //     scrollToLi = li.filter(':not(.disabled):first');
                                // }

                                // если нечетное количество видимых пунктов,
                                // то высоту пункта делим пополам для последующего расчета
                                if ( (ul.innerHeight() / liHeight) % 2 !== 0 )
                                    liHeight = liHeight / 2;
                                ul.scrollTop(ul.scrollTop() + scrollToLi.position().top - ul.innerHeight() / 2 + liHeight);
                            }

                            preventScrolling(ul);

                        }); // end divSelect.click()

                        // при наведении курсора на пункт списка
                        li.hover(function() {
                            $(this).siblings().removeClass('selected');
                        });
                        var selectedText = li.filter('.selected').text();

                        // при клике на пункт списка
                        li.filter(':not(.disabled):not(.optgroup)').click(function() {
                            el.focus();
                            var t = $(this);
                            var liText = t.text();
                            if (!t.is('.selected')) {
                                var index = t.index();
                                index -= t.prevAll('.optgroup').length;
                                t.addClass('selected sel').siblings().removeClass('selected sel');
                                option.prop('selected', false).eq(index).prop('selected', true);
                                selectedText = liText;
                                divText.text(liText);

                                // передаем селекту класс выбранного пункта
                                if (selectbox.data('jqfs-class')) selectbox.removeClass(selectbox.data('jqfs-class'));
                                selectbox.data('jqfs-class', t.data('jqfs-class'));
                                selectbox.addClass(t.data('jqfs-class'));

                                el.change();
                            }
                            // if (search.length) search.val('').trigger('input');
                            dropdown.hide();
                            selectbox.removeClass('opened dropup dropdown');
                            // колбек при закрытии селекта
                            opt.onSelectClosed.call(selectbox);

                        });
                        dropdown.mouseout(function() {
                            $('li.sel', dropdown).addClass('selected');
                        });

                        // изменение селекта
                        el.on('change.styler', function() {
                            if (option.first().text() === '' && el[0].selectedIndex === 0 && selectPlaceholder !== false) {
                                divText.text(selectPlaceholder).addClass('placeholder');
                            } else {
                                divText.text(option.filter(':selected').text()).removeClass('placeholder');
                            }

                            li.removeClass('selected sel').not('.optgroup').eq(el[0].selectedIndex).addClass('selected sel');
                            // добавляем класс, показывающий изменение селекта
                            if (option.first().text() !== li.filter('.selected').text()) {
                                selectbox.addClass('changed');
                            } else {
                                selectbox.removeClass('changed');
                            }
                        })
                            .on('focus.styler', function() {
                                selectbox.addClass('focused');
                                $('div.jqselect').not('.focused').removeClass('opened dropup dropdown').find('div.jq-selectbox__dropdown').hide();
                            })
                            .on('blur.styler', function() {
                                selectbox.removeClass('focused');
                            })
                            // изменение селекта с клавиатуры
                            .on('keydown.styler keyup.styler', function(e) {
                                var liHeight = li.data('li-height');
                                if (el.val() === '') {
                                    divText.text(selectPlaceholder).addClass('placeholder');
                                } else {
                                    divText.text(option.filter(':selected').text());
                                }
                                li.removeClass('selected sel').not('.optgroup').eq(el[0].selectedIndex).addClass('selected sel');
                                // вверх, влево, Page Up, Home
                                if (e.which === 38 || e.which === 37 || e.which === 33 || e.which === 36) {
                                    if (el.val() === '') {
                                        ul.scrollTop(0);
                                    } else {
                                        ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top);
                                    }
                                }
                                // вниз, вправо, Page Down, End
                                if (e.which === 40 || e.which === 39 || e.which === 34 || e.which === 35) {
                                    ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - ul.innerHeight() + liHeight);
                                }
                                // закрываем выпадающий список при нажатии Enter
                                if (e.which === 13) {
                                    e.preventDefault();
                                    dropdown.hide();
                                    selectbox.removeClass('opened dropup dropdown');
                                    // колбек при закрытии селекта
                                    opt.onSelectClosed.call(selectbox);
                                }
                            }).on('keydown.styler', function(e) {
                            // открываем выпадающий список при нажатии Space
                            if (e.which === 32) {
                                e.preventDefault();
                                divSelect.click();
                            }
                        });

                        // прячем выпадающий список при клике за пределами селекта
                        if (!onDocumentClick.registered) {
                            $(document).on('click', onDocumentClick);
                            onDocumentClick.registered = true;
                        }

                    } // end doSelect()

                    doSelect();

                }; // end selectboxOutput()

                selectboxOutput();

                // обновление при динамическом изменении
                el.on('refresh', function() {
                    el.off('.styler').parent().before(el).remove();
                    selectboxOutput();
                });

                el.on('sync', function()
                {
                    // Set to first element (placeholder if exist) when selected is disabled
                    var option = $('option', el);
                    if(option.filter(':selected').is(':disabled'))
                    {
                        option.filter(':first').prop('selected', true);
                    }

                    el.trigger('change.styler');  // Sync selected value

                    // Hide disabled options
                    var liItems = el.parent().find('.jq-selectbox__dropdown li');
                    $('option', el).each(function(index, item)
                    {
                        var option = $(item);
                        var li = liItems.eq(index);
                        if(option.is(':disabled'))
                            li.addClass('disabled');
                        else
                            li.removeClass('disabled');
                    });
                });

                // end select

                // reset
            } else if (el.is(':reset')) {
                el.on('click', function() {
                    setTimeout(function() {
                        el.closest('form').find('select').trigger('refresh');
                    }, 1);
                });
            } // end reset

        }, // init: function()

        // деструктор
        destroy: function()
        {
            var el = $(this.element);
            el.removeData('_' + pluginName).off('.styler refresh').removeAttr('style').parent().before(el).remove();
        } // destroy: function()

    }; // Plugin.prototype

    $.fn[pluginName] = function(options) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            this.each(function() {
                if (!$.data(this, '_' + pluginName)) {
                    $.data(this, '_' + pluginName, new Plugin(this, options));
                }
            })
            // колбек после выполнения плагина
                .promise()
                .done(function() {
                    var opt = $(this[0]).data('_' + pluginName);
                    if (opt) opt.options.onFormStyled.call();
                });
            return this;
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            var returns;
            this.each(function() {
                var instance = $.data(this, '_' + pluginName);
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
            });
            return returns !== undefined ? returns : this;
        }
    };

    // прячем выпадающий список при клике за пределами селекта
    function onDocumentClick(e) {
        // e.target.nodeName != 'OPTION' - добавлено для обхода бага в Opera на движке Presto
        // (при изменении селекта с клавиатуры срабатывает событие onclick)
        if (!$(e.target).parents().hasClass('jq-selectbox') && e.target.nodeName !== 'OPTION') {
            if ($('div.jq-selectbox.opened').length) {
                var selectbox = $('div.jq-selectbox.opened'),
                    search = $('div.jq-selectbox__search input', selectbox),
                    dropdown = $('div.jq-selectbox__dropdown', selectbox),
                    opt = selectbox.find('select').data('_' + pluginName).options;

                // колбек при закрытии селекта
                opt.onSelectClosed.call(selectbox);

                // if (search.length) search.val('').trigger('input');
                dropdown.hide().find('li.sel').addClass('selected');
                selectbox.removeClass('focused opened dropup dropdown');
            }
        }
    }
    onDocumentClick.registered = false;

}));