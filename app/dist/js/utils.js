$(document).ready(function() {


    $("ul.nav-tabs a").click(function(e) {
        e.preventDefault();
        $(this).tab('show');
    });


    // $('[data-toggle="tooltip"]').tooltip();
    var redirection_chain = '';
    $('#toggle-malicious').change(function() {
        if ($(this).prop('checked')) {
            $('.r-malicious').show();
        } else {
            $('.r-malicious').hide();
        }
    });

    $('#toggle-clean').change(function() {
        if ($(this).prop('checked')) {
            $('.r-clean').show();
        } else {
            $('.r-clean').hide();
        }
    });

    $('#toggle-unrated').change(function() {
        if ($(this).prop('checked')) {
            $('.r-unrated').show();
        } else {
            $('.r-unrated').hide();
        }
    });

    $('#toggle-suspicious').change(function() {
        if ($(this).prop('checked')) {
            $('.r-suspicious').show();
        } else {
            $('.r-suspicious').hide();
        }
    });



    $.ajax({
        url: "api/report?url=" + $('#url').val(),
        // dataType: 'json',
        type: 'get',
        contentType: 'application/json',
        success: function(data, textStatus, jQxhr) {

            updateScanresults(data.data.attributes.last_analysis_stats);
            setData(epochtodate(data.data.attributes.last_analysis_date), 'last_analysis_date');
            setData(epochtodate(data.data.attributes.first_submission_date), 'first_submission_date');
            setData(epochtodate(data.data.attributes.last_submission_date), 'last_submission_date');
            setData(data.data.attributes.times_submitted, 'times_submitted');
            setData(data.data.attributes.reputation, 'reputation');
            setData(data.data.attributes.title, 'page_title');
            setData(decodeURI(data.data.attributes.last_final_url), 'last_final_url');
            showResults(data.data.attributes.last_analysis_results);
            $('#loader-wrapper').hide();
            if(ipinfo_enabled)
            {
                showIpInfo();
            }

            if ('redirection_chain' in data.data.attributes) {
                redirection_chain = data.data.attributes.redirection_chain;
                $('#redirects').text(data.data.attributes.redirection_chain.length);
                $('#urlchain').show();
            }

            if ('outgoing_links' in data.data.attributes) {
                showExtraData(data.data.attributes.outgoing_links, 'outgoing_links');
            }

            if ('last_http_response_headers' in data.data.attributes) {
                showExtraData(data.data.attributes.last_http_response_headers, 'headers');
            }


            if ('html_meta' in data.data.attributes) {
                showExtraData(data.data.attributes.html_meta, 'html_meta');
            }

            if ('trackers' in data.data.attributes) {
                showTrackers(data.data.attributes.trackers, 'trackers');
            }


        },
        error: function(jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);

        }
    });


    $.ajax({
        url: "api/preview?url=" + $('#url').val(),
        type: 'get',
        contentType: 'application/json',
        success: function(data, textStatus, jQxhr) {
            data = JSON.parse(data);
            $('#preview').attr('src', 'preview/' + data.image_url);
            $('#preview-tab').show();
        },
        error: function(jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);

        }
    });


    


    $('#urlchain').click(function() {

        Swal.fire({
            title: "<span id='chain-popup-title'><a class='header'>Redirection Chain</a></span>",
            html: "<span id='chain-popup-message' class='post'></span>",
            confirmButtonColor: "#1a7bb9",
            confirmButtonText: "Ok",
            allowOutsideClick: false
        })
        var redirect_list = "<ul>";
        $.each(redirection_chain, function(i, item) {
            redirect_list = redirect_list + "<li style='text-align:left;'>" + redirection_chain[i] + "</li>";
        });
        var redirect_list = redirect_list + "</ul>";

        $('#chain-popup-message').html(redirect_list);
    });




});


function setData(data, element) {
    $('#' + element).text(data);

}

function updateScanresults(data) {
    $('#harmless').text(data.harmless);
    $('.harmless').addClass("ok");
    $('#toggele-clean').show();


    $('#malicious').text(data.malicious);
    if (parseInt(data.malicious) > 0) {
        $('.malicious').addClass("error");
        $('#toggele-malicious').show();
    } else {
        $('.malicious').addClass("ok");
        $('#toggele-malicious').hide();
    }

    $('#suspicious').text(data.suspicious);
    if (parseInt(data.suspicious) > 0) {
        $('.suspicious').addClass("warning");
        $('#toggele-show').hide();
    } else {
        $('.suspicious').addClass("ok");
        $('#toggele-suspicious').hide();
    }


    $('#undetected').text(data.undetected);
    if (parseInt(data.undetected) > 0) {
        $('.undetected').addClass("info");

    }
    $('#toggele-unrated').show();


    $('#timeout').text(data.timeout);
    $('.timeout').addClass("info");


}

function epochtodate(epoch) {
    var dateVal = "/Date(" + epoch * 1000 + ")/";
    var date = new Date(parseFloat(dateVal.substr(6)));
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

}


function showResults(results) {
    element = '';
    $.each(results, function() {

        if (this.result == 'clean') {
            element = '<div class="alert alert-success alert-dismissible col-sm-3 alert-sacn r-clean">';
            element = element + '<h6><i class="icon fas fa-check"></i> ' + this.result + '</h6>';
        } else if (this.result == 'malicious' || this.result == 'phishing' || this.result == 'malware') {
            element = '<div class="alert alert-danger alert-dismissible col-sm-3 alert-sacn r-malicious">';
            element = element + '<h6><i class="icon fas fa-ban"></i> ' + this.result + '</h6>';
        } else if (this.result == 'unrated' || this.result == 'undetected') {
            element = '<div class="alert alert-info alert-dismissible col-sm-3 alert-sacn r-unrated">';
            element = element + '<h6><i class="icon fas fa-info"></i> ' + this.result + '</h6>';
        } else if (this.result == 'suspicious') {
            element = '<div class="alert alert-warning alert-dismissible col-sm-3 alert-sacn r-suspicious">';
            element = element + '<h6><i class="icon fas fa-exclamation-triangle"></i> ' + this.result + '</h6>';
        } else {
            element = '<div class="alert alert-info alert-dismissible col-sm-3 alert-sacn r-unrated">';
            element = element + '<h6><i class="icon fas fa-info"></i> ' + this.result + '</h6>';
        }
        element = element + 'Engine: ' + this.engine_name + '<br/>';
        element = element + 'Category: ' + this.category + '<br/>';
        element = element + 'Method: ' + this.method + '<br/>';
        element = element + '</div>';
        $('#results').append(element);
    });
}

function showExtraData(data, element) {
    if (element == 'outgoing_links') {
        html = '<div class="card card-info"><div class="card-body"><ul>';
        $.each(data, function(i, item) {
            html = html + "<li style='text-align:left;'>" + data[i] + "</li>";
        });
        html = html + '</ul></div></div>';
        $('#' + element).html(html);
    } else {
        html = '<div class="card card-info"><div class="card-body">';
        $.each(data, function(key, value) {
            html = html + '<strong>' + key + ' :</strong>';
            html = html + '<p class="text-muted">' + value + '</p>';
            html = html + '<hr>';
        });
        html = html + '</div></div>';
        $('#' + element).html(html);
    }
}

function showTrackers(data, element) {
    html = '<div class="card card-info"><div class="card-body">';
    $.each(data, function(key) {
        html = html + '<strong>' + key + ' :</strong>';
        html + '<p class="text-muted"><ul>'
        $.each(data[key], function(i, item) {
            $.each(item, function(k, v) {
                // console.log(k + ': ' + v);
                html = html + '<li>' + k + ': ' + v + '</li>'
            });

        });
        html = html + '</ul></p><hr>';
    });
    html = html + '</div></div>';
    $('#' + element).html(html);
}

function sortResults(data, prop, asc) {
    data.sort(function(a, b) {
        if (asc) {
            return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        } else {
            return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
        }
    });

}

function showIpInfo()
{
    
    
        $.ajax({
            url: "api/ipinfo?url=" + $('#last_final_url').text(),
            type: 'get',
            contentType: 'application/json',
            success: function(data, textStatus, jQxhr) {
                // data = JSON.parse(data);
                showExtraData(data, 'ipinfo')
              
            },
            error: function(jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
    
            }
        });

    $('#ipinfo-tab').show();
    
}