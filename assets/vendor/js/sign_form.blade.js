function SignForm()
{
    this.container = $('div.sign_form');

    /*
    * 0 - form doesn't exist, user is logged in
    * 1 - registration form is active
    * 2 - login form is active
    * 3 - remind password form is active
    * */
    this.mode = 0;
    if(this.container.length === 0)
        return;

    this.tabs = {
        buttons: this.container.find('.tabs li'),
        new_customer: this.container.find('#new_customer'),
        old_customer: this.container.find('#returning_customer'),
        login: this.container.find('#login-form'),
        remind: this.container.find('#remind-form')
    };
    this.fields = {
        new_customer: {
            name: this.tabs.new_customer.find('input[name=name]'),
            email: this.tabs.new_customer.find('input[name=email]'),
            country: this.tabs.new_customer.find('select[name=country]'),
            phone_code: this.tabs.new_customer.find('input[name=phone_code]'),
            state_code: this.tabs.new_customer.find('input[name=state_code]'),
            phone_number: this.tabs.new_customer.find('input[name=phone_number]'),
            password: this.tabs.new_customer.find('input[name=password]'),
            password_confirmation: this.tabs.new_customer.find('input[name=password_confirmation]'),
            flag: this.tabs.new_customer.find('span.flag.country_flag')
        },
        old_customer: {
            email: this.tabs.old_customer.find('#sign_in_email'),
            password: this.tabs.old_customer.find('#sign_in_password'),
            remind_email: this.tabs.old_customer.find('#remind_email')
        }
    };

    this.fields.new_customer.country.styler({ selectSearch: true });
    this.InitEvents();
    this.onModeChanged();
}

SignForm.prototype.InitEvents = function()
{
    this.fields.new_customer.country.change($.proxy(this.onCountryChanged, this)).trigger('change');
    this.tabs.buttons.click($.proxy(this.onTabClick, this));
    this.tabs.old_customer.find('a.forgot, a#button-login').click($.proxy(this.onReminderToggleClick, this));
    this.tabs.old_customer.find('input[name=email]').change($.proxy(this.onSyncEmails, this));
    this.tabs.old_customer.find('button.restore').click($.proxy(this.onRemindPasswordClick, this));
    this.container.find('input, select').focus($.proxy(this.removeError, this));
};

SignForm.prototype.onModeChanged = function()
{
    if(this.tabs.login.is(':visible'))
    {
        this.mode = 2;
    }
    else
    {
        if(this.tabs.remind.is(':visible'))
        {
            this.mode = 3;
        }
        else
        {
            this.mode = 1;
        }
    }
};

SignForm.prototype.getClientData = function()
{
    switch (this.mode)
    {
        case 1: return {
            mode: 1,
            name: this.fields.new_customer.name.val(),
            email: this.fields.new_customer.email.val(),
            country: this.fields.new_customer.country.val(),
            phone_code: this.fields.new_customer.phone_code.val(),
            state_code: this.fields.new_customer.state_code.val(),
            phone_number: this.fields.new_customer.phone_number.val(),
            password: this.fields.new_customer.password.val(),
            password_confirmation: this.fields.new_customer.password_confirmation.val()
        };

        case 2: return {
            mode: 2,
            email: this.fields.old_customer.email.val(),
            password: this.fields.old_customer.password.val()
        };

        case 3:
            this.tabs.old_customer.find('button.restore').click();
            return false;

        default: return {};
    }
};

SignForm.prototype.onCountryChanged = function(event)
{
    var code = event.target.value;
    var phone_code = code.replace( /-.*/g, "" );
    this.fields.new_customer.phone_code.val(phone_code);
    this.fields.new_customer.flag.attr("class", "flag country_flag flag-" + code);
};

SignForm.prototype.onTabClick = function(event)
{
    var tab = $(event.currentTarget);
    var id = tab.data('tabs');
    this.tabs.buttons.removeClass('active');
    tab.addClass('active');

    this.container.find('.tabs_content').removeClass('current');
    this.container.find('#' + id).addClass('current');
    this.onModeChanged();
};

SignForm.prototype.onReminderToggleClick = function(event)
{
    event.preventDefault();
    var id = $(event.currentTarget).attr('href');
    this.tabs.old_customer.find('> div').removeClass('active');
    this.container.find(id).addClass('active');
    this.removeTip();
    this.onModeChanged();
};

SignForm.prototype.onSyncEmails = function(event)
{
    this.fields.old_customer.email.val(event.target.value);
    this.fields.old_customer.remind_email.val(event.target.value);
};

SignForm.prototype.onRemindPasswordClick = function(event)
{
    this.clearErrors();
    var buttons = $(event.target).closest('.buttons');
    var email = this.fields.old_customer.remind_email;
    var $this = this;
    buttons.hide();
    email.prop('disabled', true);

    $.post('/account/password/restore', { email: email.val() }, function(message)
    {
        email.prop('disabled', false);
        buttons.show();
        $this.tabs.old_customer.find('#button-login').click();
        $this.addTip(message);
    }).fail(function(data)
    {
        $this.addErrors(data.responseJSON);
        email.prop('disabled', false);
        buttons.show();
    });
};

SignForm.prototype.addTip = function(message)
{
    this.removeTip();
    var tip = $('<div class="tip"><a class="tip_close"></a><p>'+ message +'</p></div>');
    tip.find('.tip_close').click(function(){ $(this).parent().remove() });
    this.tabs.old_customer.prepend(tip);
};

SignForm.prototype.removeTip = function()
{
    this.tabs.old_customer.find('> div.tip').remove();
};

SignForm.prototype.addErrors = function(errors)
{
    var form = this.tabs.new_customer;
    switch (this.mode)
    {
        case 2:
            form = this.tabs.login;
            break;
        case 3:
            form = this.tabs.remind;
            break;
    }

    for(var name in errors)
    {
        var field = name.replace(/client\./i, '');
        var message = (errors[name][0]).replace(/client\./i, '');
        var input = form.find('[name='+ field +']');

        var div = input.is('select') ? input.closest('.form_group') : input.parent();
        div.addClass('error');
        div.find('span.error').remove();
        div.append('<span class="error">' + message + '</span>');
    }
};

SignForm.prototype.removeError = function(event)
{
    var div = $(event.target).parent();
    div.removeClass('error');
    div.find('span.error').remove();
};

SignForm.prototype.clearErrors = function()
{
    this.container.find('span.error').remove();
    this.container.find('.error').removeClass('error');
};
