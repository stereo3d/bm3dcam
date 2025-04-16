///////////////////////////////////////////////////////////////////////////////
var Upload = function (file) {
    this.file = file;
};

Upload.prototype.getType = function() {
    return this.file.type;
};
Upload.prototype.getSize = function() {
    return this.file.size;
};
Upload.prototype.getName = function() {
    return this.file.name;
};
Upload.prototype.doUpload = function (args) {
    var that = this;
    var formData = new FormData();

    // add assoc key values, this will be posts values
    formData.append("file", this.file, this.getName());
    // formData.append("upload_file", true);

    $.ajax({
        type: "POST",
        url: "/uploadfirmware",
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress', /*that.progressHandling*/function (event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }

                    args.progress(percent)

                }, false);
            }
            return myXhr;
        },
        success: function (data) {
            // your callback here
            args.done();
        },
        error: function (error) {
            // handle error
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 60000
    });
};

function confirmUpgrade()
{
    $("#upgrade_confirm-dialog").dialog({
        buttons: {
        "Upgrade": function() {
            $.getJSON("/ctrl/upgrade?action=run", function(response) {
            });

            $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
        }
    });
    $( "#upgrade_confirm-dialog" ).dialog( "open" );
}

function uploadAndUpgrade(file, ui_check)
{
    var upload = new Upload(file);

    upload.doUpload({
        progress: function(percent) {
            $( "#progressbar").progressbar('value', percent);
        },
        done: function(){
            $( "#progressbar").progressbar().hide();
            $.getJSON("/ctrl/upgrade?action=fw_check", function(response) {
                if (response.code == 0) {
                    if (ui_check) {
                        $.getJSON("/ctrl/upgrade?action=ui_check", function(response) {

                        });
                    } else {
                        confirmUpgrade();
                    }
                } else {
                    $( "#fw_err-dialog" ).dialog( "open" );
                }
            });
        }
    });
    $( "#progressbar").progressbar().show();
}

function showUpgradeDialog(ui_check)
{
    $("#upgrade-dialog").dialog({
        buttons: {
        "Upload": function() {
            var upgradeDialog = $(this);
            var form = $("#upgrade-form")
            var file = form[0][0].files[0]
            var upload = new Upload(file);

            upload.doUpload({
                progress: function(percent) {
                    $( "#progressbar").progressbar('value', percent);
                },
                done: function(){
                    $.getJSON("/ctrl/upgrade?action=fw_check", function(response) {
                        $( "#progressbar").progressbar().hide();

                        upgradeDialog.dialog( "close" );

                        if (response.code == 0) {
                            if (ui_check) {
                                $.getJSON("/ctrl/upgrade?action=ui_check", function(response) {

                                });
                            } else {
                                confirmUpgrade();
                            }
                        } else {
                            $( "#fw_err-dialog" ).dialog( "open" );
                        }
                    });
                }
            });
            $( "#progressbar").progressbar().show();
        }
        }
    });

    $( "#upgrade-dialog" ).dialog( "open" );
}
////////////////////////////////////////////////////////////////////////////////

function Camera() {
    this.recording = false;
    this.rtmp_index = "index0";
    this.srt_index = "index0";
}

var camera = new Camera();

function startRec()
{
    $.getJSON("/ctrl/rec?action=start", function( response ) {
        if (response.code == 0) {

        }
    });
}

function stopRec()
{
    $.getJSON("/ctrl/rec?action=stop", function( response ) {
        if (response.code == 0) {

        }
    });
}

function setCemaraId(camera_id)
{
    $.getJSON("/ctrl/set?camera_id=" + camera_id, function(response) {
    });
}

function setReelName(reelname)
{
    $.getJSON("/ctrl/set?reelname=" + reelname, function(response) {
        updateCameraConfig("reelname", "reelname");
    });
}

function showMetaSetupDialog()
{
    $("#meta_setup-dialog").dialog({
        buttons: {
            "OK": function() {
                var cameraId = $("#camera_id").val();
                var reelname = $("#reelname").val();

                setCemaraId(cameraId);
                setReelName(reelname);

                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });


    $.getJSON('/ctrl/get?k=camera_id', function(response) {
        var cameraId = response.value;
        $("#camera_id").val(cameraId);

        $( "#meta_setup-dialog" ).dialog( "open" );
    });

    $.getJSON('/ctrl/get?k=reelname', function(response) {
        var reelname = response.value;
        $("#reelname").val(response.value);

        $( "#meta_setup-dialog" ).dialog( "open" );
    });


}


////////////////////////////////////////////////////////////////////
// Time  Code
////////////////////////////////////////////////////////////////////
function setTimeCodeValueCurrentTime()
{
    $.getJSON("/ctrl/tc?action=current_time", function(response) {
        updateTimeCodeTab();
    });
}

function setTimeCodeValueReset()
{
    $.getJSON("/ctrl/tc?action=reset", function(response) {
        updateTimeCodeTab();
    });
}

function setTimeCodeValueManual(tc)
{
    $.getJSON("/ctrl/tc?action=set&tc=" + tc, function(response) {
        updateTimeCodeTab();
    });
}

function showTimeCodeCurrentTimeDialog()
{
    $("#tc_ct-dialog").dialog({
        buttons: {
        "OK": function() {
            setTimeCodeValueCurrentTime();
            $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
        }
    });
    $( "#tc_ct-dialog" ).dialog( "open" );
}

function showTimeCodeResetDialog()
{
    $("#tc_reset-dialog").dialog({
        buttons: {
        "OK": function() {
            setTimeCodeValueReset();
            $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
        }
    });
    $( "#tc_reset-dialog" ).dialog( "open" );
}

function showTimeCodeManualDialog()
{
    $("#tc_manual-dialog").dialog({
        buttons: {
        "OK": function() {
            var tc_hour = $("#tc_hour").val();
            var tc_min = $("#tc_min").val();
            var tc_sec = $("#tc_sec").val();
            var tc_frame = $("#tc_frame").val();

            if (parseInt(tc_hour) >= 0
                && parseInt(tc_min) >= 0 && parseInt(tc_min) < 60
                && parseInt(tc_sec) >= 0 && parseInt(tc_sec) < 60
                && parseInt(tc_frame) >= 0) {
                setTimeCodeValueManual(tc_hour + ':' + tc_min + ':' + tc_sec + ':' + tc_frame);
            }

            $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
        }
    });

    $.getJSON('/ctrl/tc?action=query', function(response) {
        var tc = response.msg.split(':');
        if (tc.length == 4) {
            $("#tc_hour").val(tc[0]);
            $("#tc_min").val(tc[1]);
            $("#tc_sec").val(tc[2]);
            $("#tc_frame").val(tc[3]);
        }

        $( "#tc_manual-dialog" ).dialog( "open" );
    });
}

function updateTimeCodeValueLable(tc)
{
    $("#tc_value").text('Value : ' + tc)
}

function updateTimeCodeValue()
{
    $.getJSON('/ctrl/tc?action=query', function(response) {
        updateTimeCodeValueLable(response.msg);
    })
}


function updateTimeCodeTab()
{
    updateCameraConfig("tc_source", "tc_source");
    updateCameraConfig("tc_count_up", "tc_count_up");
    updateCameraConfig("tc_hdmi_dispaly", "tc_hdmi_dispaly");
    updateCameraConfig("tc_drop_frame", "tc_drop_frame");
    updateTimeCodeValue();
}

//////////////////////////////////////////////////////////////////
// misc
//////////////////////////////////////////////////////////////////
function formatSdcard()
{
    $.getJSON("/ctrl/card?action=format", function( response ) {
        if (response.code == 0) {

        }
    });
}
function clearSetting()
{
    $.getJSON("/ctrl/set?action=clear", function( response ) {
        if (response.code == 0) {

        }
    });
}

function reboot()
{
    $.getJSON("/ctrl/reboot", function( response ) {
        if (response.code == 0) {

        }
    });
}

function shutdown()
{
    $.getJSON("/ctrl/shutdown", function( response ) {
        if (response.code == 0) {

        }
    });
}

function showLoginDialog()
{
    $("#login-dialog").dialog({
        buttons: {
        "OK": function() {
            var salt = "salt";
            var user = $("#login_user").val();
            var psw = $("#login_password").val();
            var md5 = $.md5(psw + salt);

            $.getJSON("/login?u=" + user + "&h="+ md5, function( response ) {
                if (response.code == 0) {

                }
            });

            $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
        }
    });

    $( "#login-dialog" ).dialog( "open" );
}

function showChangePasswordDialog()
{
    $("#change_pswd-dialog").dialog({
        buttons: {
            "OK": function() {
                var user = $("#https_user").val();
                var oldpswd = $("#https_old_password").val();
                var psw1 = $("#https_new_password_1").val();
                var psw2 = $("#https_new_password_2").val();

                if (psw1 == psw2) {
                    $.getJSON("/login/pswd?user=" + user + "&old="+ oldpswd + "&new=" + psw1, function( response ) {
                        if (response.code == 0) {

                        } else {
                            console.log("change password err!");
                            $( "#err_password-dialog" ).dialog( "open" );
                        }
                    });
                } else {
                    console.log("confirm new password err!");
                    $( "#err_password-dialog" ).dialog( "open" );
                }

                $( this ).dialog( "close" );
            },

            Cancel: function() {
                $( this ).dialog( "close" );
            }
        }
    });

    $( "#change_pswd-dialog" ).dialog( "open" );
}

function postSetConfig(key, value)
{
    if (key == "wb") {
        updateWhiteBalanceSettings();
    } else if (key == "mwb") {
        // when mwb cct is first changed, tint maybe override to 0
        updateCameraConfig("wb_tint", "tint");
    } else if (key == "shutter_time" || key == "iris" || key == "iso") {
        updateEv("exp_ev");
        updateCameraConfig("exp_min_iso", "min_iso");
        updateCameraConfig("exp_max_iso", "max_iso");
        updateCameraConfig("max_exp_sht_time", "max_exp_shutter_time");
    } else if (key == 'iso_ctrl') {
        updateCameraConfig("exp_min_iso", "min_iso");
        updateCameraConfig("exp_max_iso", "max_iso");
        updateCameraConfig("exp_iso", "iso");
    } else if (key == 'max_iso') {
        updateCameraConfig("exp_min_iso", "min_iso");
        updateCameraConfig("exp_iso", "iso");
    } else if (key == 'min_iso') {
        updateCameraConfig("exp_max_iso", "max_iso");
        updateCameraConfig("exp_iso", "iso");
    } else if (key == "compose_mode") {
        updateCameraConfig("resolution", "resolution");
        updateCameraConfig("project_fps", "project_fps");
        updateCameraConfig("vfr", "movvfr");
    } else if (key == "shutter_angle") {
        updateCameraConfig("max_exp_sht_time", "max_exp_shutter_angle");
    } else if (key == "video_system") {
        updateCameraConfig("project_fps", "project_fps");
        updateCameraConfig("split_duration", "split_duration");
    } else if (key == "movvfr" || key == "video_encoder") {
        updateMovieSettings();
    } else if (key == "bitrate_level") {
        updateCameraConfig("proxy_file", "rec_proxy_file");
    } else if (key == "resolution" || key == "project_fps" || key == "record_mode") {
        updateCameraConfig("split_duration", "split_duration");
    } else if (key == "assitool_peak_onoff" || key == "assitool_exposure" || key == "assitool_scope") {
        updateCameraConfig("assit_disp", "assitool_display");
    } else if (key == "tc_drop_frame") {
        updateTimeCodeValue();
    } else if (key == "tc_source") {
        updateTimeCodeTab();
    } else if (key == "focus") {
        updateFocusSettings();
    } else if (key == "caf") {
        updateCameraConfig("focus_caf_sens", "caf_sens");
        updateCameraConfig("focus_live_caf", "live_caf");
    } else if (key == "sht_operation") {
        if (value == "Angle") {
            updateCameraConfig("exp_sht_time", "shutter_angle");
            updateCameraConfig("max_exp_sht_time", "max_exp_shutter_angle");
        } else {
            updateCameraConfig("exp_sht_time", "shutter_time");
            updateCameraConfig("max_exp_sht_time", "max_exp_shutter_time");
        }
    } else if (key == "audio_channel") {
        updateCameraConfig("audio_phantom_power", "audio_phantom_power");
    } else if (key == "lut") {
        updateImageSettings();
        updateCameraConfig("exp_min_iso", "min_iso");
        updateCameraConfig("exp_max_iso", "max_iso");
        updateCameraConfig("exp_iso", "iso");
    } else if (key == "af_mode") {
        updateCameraConfig("focus_area_size", "af_area");
    } else if (key == "vfr_ctrl") {
        updateCameraConfig("vfr", "movvfr");
    }
}

function setConfig(args)
{
    key = args.key;
    value = args.value;
    $.getJSON("/ctrl/set?" + key + "=" + encodeURIComponent(value), function( response ) {
        if (response.code == 0) {
            postSetConfig(key, value);
        } else {
            args.failed();
        }
    });
}

function updateOptionConfig(html_id, response)
{
    // it's a select menu
    var widget = $("#" + html_id)
    var parent = widget.parent();
    var val_in_opt = false;

    widget.detach().empty();
    $.each( response.opts, function( key, value ) {
        //console.log( key + " : " + value );
        value = value.replace("\\","");
        response.value = response.value.replace("\\","");
        widget.append("<option value='"+ value +"'>" + value + "</option>");
        if (response.value == value) {
            val_in_opt = true;
        }
    });

    if (val_in_opt == false) {
        widget.append("<option value='"+ response.value +"'>" + response.value + "</option>");
    }

    widget.val(response.value);

    if (response.ro == 0) {
        widget.attr("disabled", false)
    } else {
        widget.attr("disabled", true)
    }

    widget.selectmenu('refresh', true);

    widget.selectmenu({
        change: function( event, ui ) {
            setConfig({
                key : response.key,
                value : ui.item.value,
                failed:function() {
                    widget.val(response.value);
                    widget.selectmenu('refresh', true);
                }
            })
        }
    });

    widget.appendTo(parent)
}

function updateRangeConfig(html_id, response)
{
    var handle = $( "#" + html_id + "-handle");
    $("#" + html_id).slider({
        step: response.step,
        min: response.min,
        max: response.max,
        value: response.value,

        disabled: response.ro == 1,

        slide: function( event, ui ) {
            handle.text(ui.value);
            setConfig({
                key:response.key,
                value:ui.value,
                failed:function() {

                }
            });
        }
    });

    handle.text(response.value)

    if (response.ro == 0) {
        $("#" + html_id).attr("disabled", false)
    } else {
        $("#" + html_id).attr("disabled", true)
    }
}

function updateCameraConfig(html_id, config_key)
{
    $.getJSON( "/ctrl/get?k=" + config_key, function( response ) {
        if (response.code != 0) {
            return;
        }

        // check option type
        if (response.type == 1) {
            updateOptionConfig(html_id, response);
        } else if (response.type == 2) {
            updateRangeConfig(html_id, response);
        } else {
            console.log("updateCameraConfig not support type")
        }

    });
}

function updateEv(html_id)
{
    $.getJSON( "/ctrl/get?k=ev", function( response ) {
        if (response.code != 0) {
            return;
        }
        updateInfoEvText(response.value, response.ro);

        // check option type
        if (response.type == 1) {
            //updateOptionConfig(html_id, response);
        } else if (response.type == 2) {
            var evMap = new Map();
            evMap.set(-96 , -3.0);
            evMap.set(-86, -2.7);
            evMap.set(-74, -2.3);
            evMap.set(-64 , -2.0);
            evMap.set(-54, -1.7);
            evMap.set(-42, -1.3);
            evMap.set(-32 , -1.0);
            evMap.set(-22 , -0.7);
            evMap.set(-10, -0.3);
            evMap.set(0, 0.0);
            evMap.set(10, 0.3);
            evMap.set(22 , 0.7);
            evMap.set(32, 1.0);
            evMap.set(42, 1.3);
            evMap.set(54, 1.7);
            evMap.set(64, 2.0);
            evMap.set(74, 2.3);
            evMap.set(86, 2.7);
            evMap.set(96, 3.0);

            var widget = $("#" + html_id);
            var parent = widget.parent();

            widget.detach().empty();
            evMap.forEach(function(value, key, map) {
                if (value == 0) {
                    widget.append("<option value="+ value +">" + value + "</option>");
                } else {
                    widget.append("<option value="+ value.toFixed(1) +">" + value.toFixed(1) + "</option>");
                }

                if (response.value == key) {
                    widget.val(response.value == 0? value:value.toFixed(1));
                }
            })

            if (response.ro == 0) {
                widget.attr("disabled", false)
            } else {
                widget.attr("disabled", true)
            }

           widget.selectmenu('refresh', true);

           widget.selectmenu({
                change: function( event, ui ) {
                    for (var [key, value] of evMap.entries()) {
                        if (ui.item.value == value) {
                            setConfig({
                                key:response.key,
                                value:key,
                                failed:function() {

                                }
                            })
                            break;
                        }
                    }
                }
            });
            widget.appendTo(parent)
        } else {
            console.log("updateCameraConfig not suport type")
        }

    });
}

function updateMovieSettings()
{
    updateCameraConfig("encoder", "video_encoder");
    updateCameraConfig("bitrate", "bitrate_level");
    updateCameraConfig("video_rot", "rotation");
    updateCameraConfig("video_mode", "record_mode");
    updateCameraConfig("vid_compose", "compose_mode");
    updateCameraConfig("proxy_file", "rec_proxy_file");
    updateCameraConfig("crop_sensor", "crop_sensor");
    updateCameraConfig("low_jello", "low_jello");
    updateCameraConfig("photo_q", "photo_q");
}

function updateRecordSettings()
{
    updateCameraConfig("resolution", "resolution");
    updateCameraConfig("sys_video_system", "video_system");
    updateCameraConfig("project_fps", "project_fps");
    updateCameraConfig("vfr_ctrl", "vfr_ctrl");
    updateCameraConfig("vfr", "movvfr");
    updateCameraConfig("file_format", "record_file_format");
    updateCameraConfig("split_duration", "split_duration");
    updateCameraConfig("rec_fps", "rec_fps");
    updateCameraConfig("preroll", "preroll");
    updateCameraConfig("raw_over_hdmi", "raw_over_hdmi");
    updateCameraConfig("rec_frame_indicator", "rec_frame_indicator")
}

function updateAudioSettings()
{
    updateCameraConfig("audio_encoder", "primary_audio");
    updateCameraConfig("audio_channel", "audio_channel");
    updateCameraConfig("audio_phantom_power", "audio_phantom_power");
    updateCameraConfig("audio_output_gain", "audio_output_gain");
    updateCameraConfig("audio_level_display", "audio_level_display");
    updateCameraConfig("ain_gain_type", "ain_gain_type");
    updateCameraConfig("audio_input_gain", "audio_input_gain");
    updateCameraConfig("audio_in_l_gain", "audio_in_l_gain");
    updateCameraConfig("audio_in_r_gain", "audio_in_r_gain");
    updateCameraConfig("audio_noise_reduction", "audio_noise_reduction");
}

function updateVideoTimelapse()
{
    updateCameraConfig("video_tl", "enable_video_tl");
    updateCameraConfig("video_tl_interval", "video_tl_interval");
}

function updateExposureSettings()
{
    updateCameraConfig("sys_flicker", "flicker");
    updateEv("exp_ev");
    updateCameraConfig("exp_meter", "meter_mode");

    $.getJSON("/ctrl/get?k=sht_operation", function(response) {
        if (response.code == 0) {
            if (response.type == 1 && response.value == "Angle") {
                updateCameraConfig("exp_sht_time", "shutter_angle");
                updateCameraConfig("max_exp_sht_time", "max_exp_shutter_angle");
            } else {
                updateCameraConfig("exp_sht_time", "shutter_time");
                updateCameraConfig("max_exp_sht_time", "max_exp_shutter_time");
            }
        } else {
            updateCameraConfig("exp_sht_time", "shutter_time");
            updateCameraConfig("max_exp_sht_time", "max_exp_shutter_time");
        }
    })

    updateCameraConfig("exp_iris", "iris");
    updateCameraConfig("exp_iso", "iso");
    updateCameraConfig("exp_min_iso", "min_iso");
    updateCameraConfig("exp_max_iso", "max_iso");
    updateCameraConfig("exp_iso_control", "iso_ctrl");
    updateCameraConfig("sys_sht_op", "sht_operation");
    updateCameraConfig("exp_e_nd", "eND");
    updateCameraConfig("lock_ae_in_rec", "lock_ae_in_rec");
}

function updateWBExpertSettings()
{
    $.getJSON("/ctrl/get?k=wb", function( response ) {
        if (response.value == "Expert") {
            updateCameraConfig("r_gain", "mwb_r");
            updateCameraConfig("g_gain", "mwb_g");
            updateCameraConfig("b_gain", "mwb_b");
            $("#r_gain_label").show();
            $("#g_gain_label").show();
            $("#b_gain_label").show();
            $("#r_gain").show();
            $("#g_gain").show();
            $("#b_gain").show();
        } else {
            $("#r_gain_label").hide();
            $("#g_gain_label").hide();
            $("#b_gain_label").hide();
            $("#r_gain").hide();
            $("#g_gain").hide();
            $("#b_gain").hide();
        }
    });
}

function updateWhiteBalanceSettings()
{
    updateCameraConfig("wb_mode", "wb");
    updateCameraConfig("wb_kelvin", "mwb");
    updateCameraConfig("wb_tint", "tint");
    updateCameraConfig("awb_priority", "wb_priority");
    updateCameraConfig("lock_awb_in_rec", "lock_awb_in_rec");
    updateWBExpertSettings();
}

function updateSystemSettings()
{
    updateCameraConfig("sys_hdmi_res", "hdmi_fmt");
    updateCameraConfig("sys_hdmi_osd", "hdmi_osd");
    updateCameraConfig("sys_wifi_onoff", "wifi");
    updateCameraConfig("sys_auto_off", "auto_off");
    updateCameraConfig("sys_led", "led");
    updateCameraConfig("sys_desqueeze", "desqueeze");
    updateCameraConfig("lcd_backlight", "lcd_backlight");
}

function updateImageSettings()
{
    updateCameraConfig("img_lut", "lut");
    updateCameraConfig("img_shapness", "sharpness");
    updateCameraConfig("img_nr", "noise_reduction");
    updateCameraConfig("img_brightness", "brightness");
    updateCameraConfig("img_contrast", "contrast");
    updateCameraConfig("img_sat", "saturation");
    updateCameraConfig("img_ois", "ois_mode");
    updateCameraConfig("img_vignette", "vignette");
    updateCameraConfig("img_luma_level", "luma_level");
}

function updateAssitoolSettings()
{
    updateCameraConfig("assit_disp", "assitool_display");
    updateCameraConfig("assit_scope", "assitool_scope");
    updateCameraConfig("assit_peak_en", "assitool_peak_onoff");
    updateCameraConfig("assit_peak_color", "assitool_peak_color");
    updateCameraConfig("assit_frame_line", "assitool_frame_line");
    updateCameraConfig("assit_frame_line_color", "assitool_frame_line_color");
    updateCameraConfig("assit_center_mark", "assitool_center_mark");
    updateCameraConfig("assit_center_mark_color", "assitool_center_mark_color");
    updateCameraConfig("assit_expo", "assitool_exposure");
    updateCameraConfig("assit_zebra1", "assitool_zera_th1");
    updateCameraConfig("assit_zebra2", "assitool_zera_th2");
}

function updateFocusSettings()
{
    updateCameraConfig("focus_mode", "focus");
    updateCameraConfig("focus_area", "af_mode");
    updateCameraConfig("focus_caf_enable", "caf");
    updateCameraConfig("focus_caf_sens", "caf_sens");
    updateCameraConfig("focus_area_size", "af_area");
    updateCameraConfig("focus_live_caf", "live_caf");
    updateCameraConfig("mf_assist_preview", "mf_mag");
    updateCameraConfig("mf_assist_recording", "mf_recording");
}

//////////////////////////////////////////////////////////////////
// RTMP
//////////////////////////////////////////////////////////////////
function initStreaming()
{
    $( "#rtmp_bitrate" ).spinner({
        step: 0.1,
        min: 0.2,
        max: 10.0,
        numberFormat: "n",
        stop: function( event, ui ) {
            var bitrate =  $( this ).spinner( "value" ) * 1000 * 1000;
            $.getJSON("/ctrl/stream_setting?index=stream1&bitrate=" + bitrate.toString(),
                function(response) {

                }
            );
        }
    });

    $("#btn_rtmp_start").click( function(event) {
        $.getJSON("/ctrl/rtmp?action=query&index=" + camera.rtmp_index, function( response ) {
            var pushing = false;
            if (response.code == 0) {
                if (response.status == "busy") {
                    pushing = true;
                } else if (response.status == "idle") {
                    pushing = false;
                }
            }

            if (!pushing) {
                var rtmp_url = $("#rtmp_url").val();
                var rtmp_key = $("#rtmp_key").val();

                if (rtmp_url.length <=0 ) {
                    return;
                }

                var query_val = "action=start&url=\"" + rtmp_url +  "\"";
                if (rtmp_key.length > 0 ) {
                    query_val = query_val + "&key=\"" + rtmp_key + "\"";
                }

                $.getJSON("/ctrl/stream_setting?index=stream1&action=query",
                    function(response) {
                        var width = 1280;
                        var asp = response.width / response.height;
                        var size = $("#rtmp_resolution").val();
                        if (size == "Full HD") {
                            width = 1920;
                        } else if (size == "HD") {
                            width = 1280;
                        } else if (size == "WVGA") {
                            width = 848;
                        }
                        var height = parseInt(width / asp);
                        var bitrate =  $("#rtmp_bitrate" ).spinner( "value" ) * 1000 * 1000;
                        $.getJSON("/ctrl/stream_setting?index=stream1&width=" + width.toString() + "&height=" + height.toString() + "&bitrate=" + bitrate.toString(),
                            function(response) {

                            }
                        );

                        $.getJSON("/ctrl/rtmp?" + query_val,
                            function(response) {
                                if (response.code == 0) {
                                    camera.rtmp_index = response.index;
                                }

                                updateStreamingSettings();
                            }
                        );
                    }
                );
            } else {
                $.getJSON("/ctrl/rtmp?action=stop&index=" + camera.rtmp_index,
                    function(response) {
                        if (response.code == 0) {

                        }
                        updateStreamingSettings();
                    }
                );
            }
        });
    });


    $("#btn_srt_start").click( function(event) {
        $.getJSON("/ctrl/srt?action=query&index=" + camera.srt_index, function( response ) {
            var pushing = false;
            if (response.code == 0) {
                if (response.status == "busy") {
                    pushing = true;
                } else if (response.status == "idle") {
                    pushing = false;
                }
            }

            if (!pushing) {
                var url = $("#srt_url").val();

                if (url.length <= 0) {
                    return;
                }

                $.getJSON("/ctrl/stream_setting?index=stream1&action=query",
                    function(response) {
                        var width = 1280;
                        var asp = response.width / response.height;
                        var size = $("#rtmp_resolution").val();
                        if (size == "Full HD") {
                            width = 1920;
                        } else if (size == "HD") {
                            width = 1280;
                        } else if (size == "WVGA") {
                            width = 848;
                        }
                        var height = parseInt(width / asp);
                        var bitrate =  $("#rtmp_bitrate" ).spinner( "value" ) * 1000 * 1000;
                        $.getJSON("/ctrl/stream_setting?index=stream1&width=" + width.toString() + "&height=" + height.toString() + "&bitrate=" + bitrate.toString(),
                            function(response) {

                            }
                        );

                        $.getJSON("/ctrl/srt?action=start&url=\"" + url +  "\"",
                            function(response) {
                                if (response.code == 0) {
                                    camera.srt_index = response.index;
                                }

                                updateStreamingSettings();
                            }
                        );
                    }
                );
            } else {
                $.getJSON("/ctrl/srt?action=stop&index=" + camera.srt_index,
                    function(response) {
                        if (response.code == 0) {

                        }
                        updateStreamingSettings();
                    }
                );
            }
        });
    });

    $('#btn_show_rtmp_key').click(function(event) {
        var type = $('#rtmp_key').prop('type');
        if (type == 'password') {
            $('#rtmp_key').prop('type', 'text');
            $(this).text('Hide')
        } else if (type == 'text') {
            $('#rtmp_key').prop('type', 'password');
            $(this).text('Show')
        }
    });
}

function startRtmpStatTimer()
{
    $('#btn_rtmp_start').everyTime('3s','rtmp_stat', function(){
        updateStreamingSettings();
    });
}


function stopRtmpStatTimer()
{
    $('#btn_rtmp_start').stopTime ();
}

function updateStreamingSettings()
{
    $.getJSON("/ctrl/stream_setting?index=stream1&action=query",
        function(response) {
            // bitrate
            $('#rtmp_bitrate').val(response.bitrate/1000);

            // resolution
            var widget = $("#rtmp_resolution");
            if (response.status == "streaming") {
                // var parent = widget.parent();

                // widget.detach().empty();
                // widget.append("<option value='Full HD'>Full HD</option>");
                // widget.append("<option value='HD'>HD</option>");
                // widget.append("<option value='WVGA'>WVGA</option>");

                if (response.width == 1920) {
                    widget.val('Full HD');
                } else if (response.width == 1280) {
                    widget.val('HD');
                } else if (response.width == 848) {
                    widget.val('WVGA');
                }

                widget.attr('disabled', true);
            } else {
                widget.attr('disabled', false);
            }
            widget.selectmenu('refresh', true);
            // widget.appendTo(parent);
        }
    );

    $.getJSON("/ctrl/rtmp?action=query&index=" + camera.rtmp_index, function( response ) {
        if (response.code == 0) {
            if (response.status == "busy") {
                $("#btn_rtmp_start").text('Stop');

                $("#rtmp_url").attr('disabled', true);
                if (response.url && response.url.length > 0) {
                    $("#rtmp_url").val(response.url)
                }

                $("#rtmp_key").attr('disabled', true);
                if (response.key && response.key.length > 0) {
                    $("#rtmp_key").val(response.key)
                }

                if (response.bw < 0) {
                    $("#rtmp_bw").html('Network : --');
                } else {
                    var bw_value = parseFloat(response.bw).toFixed(1);
                    $("#rtmp_bw").html('Network : ' + bw_value.toString() + ' Mbps');
                }
            } else if (response.status == "idle") {
                $("#btn_rtmp_start").text('Start');
                $("#rtmp_url").attr('disabled', false);
                $("#rtmp_key").attr('disabled', false);

                $("#rtmp_bw").html('Network : 0 Mbps');
            }
        }
    });

    $.getJSON("/ctrl/srt?action=query&index=" + camera.rtmp_index, function( response ) {
        if (response.code == 0) {
            if (response.status == "busy") {
                $("#btn_srt_start").text('Stop');

                $("#srt_url").attr('disabled', true);
                if (response.url && response.url.length > 0) {
                    $("#srt_url").val(response.url)
                }

                if (response.bw < 0) {
                    $("#srt_bw").html('Network : --');
                } else {
                    var bw_value = parseFloat(response.bw).toFixed(1);
                    $("#srt_bw").html('Network : ' + bw_value.toString() + ' Mbps');
                }
            } else if (response.status == "idle") {
                $("#btn_srt_start").text('Start');
                $("#srt_url").attr('disabled', false);

                $("#srt_bw").html('Network : 0 Mbps');
            }
        }
    });
}

function updateFormatCardBtn()
{
    $.getJSON("/ctrl/usb?action=query", function( response ) {
        if ((response.status == 'connected') &&
            (response.role == 'mass storage')) {
            $("#btn_fmt").attr('disabled',true);
        } else {
            $("#btn_fmt").attr('disabled',false);
        }
    });

    $.getJSON("/ctrl/card?action=present", function( response ) {
        if (response.code != 0) {
            $("#btn_fmt").attr('disabled',true);
        } else {
            $("#btn_fmt").attr('disabled',false);
        }
    });
}

// dialogs
function showFormatDialog()
{
    $("#format-dialog").dialog({
        buttons: {
        "Delete all items": function() {
            formatSdcard();
            $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
        }
    });
    $( "#format-dialog" ).dialog( "open" );
}

function showClearSettingsDialog()
{
    $("#clear-dialog").dialog({
        buttons: {
        "Reset settings to default value": function() {
            clearSetting();
            $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
        }
    });
    $( "#clear-dialog" ).dialog( "open" );
}

function showRebootDialog()
{
    $("#reboot-dialog").dialog({
        buttons: {
        "Reboot": function() {
            reboot();
            $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
        }
    });
    $( "#reboot-dialog" ).dialog( "open" );
}

function showPowerOffDialog()
{
    $("#pwr-dialog").dialog({
        buttons: {
        "Power Off": function() {
            shutdown();
            $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
        }
    });
    $( "#pwr-dialog" ).dialog( "open" );
}

function showErrorModeDialog()
{
    $("#err_mode-dialog").dialog({
        buttons: {
        "Switch to Video mode": function() {
            $.getJSON("/ctrl/mode?action=to_rec", function( response ) {
                if (response.code != 0) {

                } else {
                    ensureInRecordingMode();
                }
            });
            $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
        }
    });
    $( "#err_mode-dialog" ).dialog( "open" );
}

function showSessionForbitDialog()
{
    $( "#session-dialog" ).dialog( "open" );
}

// end of Dialog

function resizeStreamViewport()
{
    var previewHeight = $("#preview").height();
    var previewWidth = $("#preview").width();

    var streamHeight = $("#stream").height();
    var streamWidth = $("#stream").width();
    var offset = (previewHeight - streamHeight)/2;

    $("#stream").css('top', offset + 'px');

    //make canvas and stream are of the same width and height
    $("#canvas").css('top', offset + 'px');
    $("#canvas").css('height', streamHeight + 'px');
}

function updateCardStatus()
{
    $.getJSON("/ctrl/card?action=present", function( response ) {
        if (response.code != 0) {
            $("#info_card").css("visibility", "visible");
        } else {
            $("#info_card").css("visibility", "hidden");
        }
    });
}

function updateRecordIndicator(show)
{
    if (show) {
        $("#info_rec_indicator").css("visibility", "visible");
    } else {
        $("#info_rec_indicator").css("visibility", "hidden");
    }
}

function updateRecordBtn()
{
    var btn_rec = $("#btn_rec");
    if (camera.recording) {
        btn_rec.css('-moz-border-radius', '10px');
        btn_rec.css('-webkit-border-radius', '10px');
        btn_rec.css('border-radius', '10px');
    } else {
        btn_rec.css('-moz-border-radius', '30px');
        btn_rec.css('-webkit-border-radius', '30px');
        btn_rec.css('border-radius', '30px');
    }

    $("#btn_meta_setup").prop("disabled", camera.recording);

    $("#btn_tc_manual").prop("disabled", camera.recording);
    $("#btn_tc_time").prop("disabled", camera.recording);
    $("#btn_tc_reset").prop("disabled", camera.recording);

    $("#btn_clr_settings").prop("disabled", camera.recording);
    $("#btn_fmt").prop("disabled", camera.recording);
    $("#btn_rst").prop("disabled", camera.recording);
    $("#btn_pwr_off").prop("disabled", camera.recording);
    $("#btn_upgrade").prop("disabled", camera.recording);
    $("#btn_sync_time").prop("disabled", camera.recording);
}

function updateRecordDuration(duration)
{
    var hour = parseInt(duration / 3600);
    var min = parseInt(parseInt(duration % 3600) / 60);
    var sec = parseInt(parseInt(duration % 3600) % 60);

    var h_str = hour < 10 ? "0" + hour : hour;
    var m_str = min < 10 ? "0" + min : min;
    var s_str = sec < 10 ? "0" + sec : sec;

    $("#info_duration").text(h_str + ":" + m_str + ":" + s_str);
}

function updateRemainLable(remain_minuts)
{
    var minutes = parseInt(remain_minuts);
    if (minutes < 0) minutes = 0;
    if (minutes == 0) {
        $("#info_remain").css("color", "yellow");
        $("#btn_rec").css('background', 'darkred');
        $("#btn_rec").prop("disabled", true);
    } else {
        $("#info_remain").css("color", "white");
        $("#btn_rec").css('background', 'red');
        $("#btn_rec").prop("disabled", false);
    }
    var hour = parseInt(minutes / 60);
    var min = minutes % 60;

    var h_str = hour < 10 ? "0" + hour : hour;
    var m_str = min < 10 ? "0" + min : min;

    $("#info_remain").text(h_str + "h" + m_str + "m");
}

function updateRecRemaining()
{
    $.getJSON("/ctrl/rec?action=remain", function( response ) {
        if (response.code != 0) {
            $("#info_remain").text("00h00m");
            $("#info_remain").css("color", "yellow");
            $("#btn_rec").css('background', 'darkred');
            $("#btn_rec").prop("disabled", true);
        } else {
            updateRemainLable(response.msg);
        }
    });
}

function updateTempLable(temp)
{
    $('#info_temp').text(temp + String.fromCharCode(parseInt(0x2103)))
}

function updateTemp()
{
    $.getJSON("/ctrl/temperature", function(response) {
        if (response.code == 0) {
            updateTempLable(response.msg)
        }
    })
}

function updateBatteryPercentLable(bat)
{
    $('#info_bat').text('BAT:' + bat + '%')
}

function updateBatteryVoltageLable(bat)
{
    $('#info_bat').text('BAT:' + (bat/10.0).toFixed(1) + 'V')
}


function updateBattery()
{
    $.getJSON("/ctrl/get?k=battery_voltage", function( response ) {
        if (response.code != 0) {
            return;
        }
        updateBatteryVoltageLable(response.value);

        if (response.value <= response.max && response.value >= response.min) {
            updateBatteryVoltageLable(response.value);
        } else {
            $.getJSON("/ctrl/get?k=battery", function( response ) {
                if (response.code != 0) {
                    return;
                }

                if (response.value <= response.max && response.value >= response.min) {
                    updateBatteryPercentLable(response.value);
                }
            });

        }
    });
}

function updateLiveText(html_id, config_key, prefix, postfix)
{
    $.getJSON("/ctrl/get?k=" + config_key, function( response ) {
        if (response.code != 0) {
            $("#" + html_id).text(prefix + "-");
            return;
        }

        $("#" + html_id).text(prefix + response.value + postfix);
    });
}

function updateLiveWb()
{
    $.getJSON("/ctrl/get?k=mwb", function( response ) {
        if (response.code != 0) {
            return;
        }

        updateMwb(response.value);
    });
}

function updateMwb(mwb)
{
    $("#info_wb").text( mwb + "K");
}

function updateLiveShtSpeed()
{
    $.getJSON("/ctrl/get?k=live_ae_shutter", function( response ) {
        if (response.code != 0) {
            return;
        }

        updateSht(response.value);
    });
}

function updateLiveShtAngle()
{
    $.getJSON("/ctrl/get?k=live_ae_shutter_angle", function( response ) {
        if (response.code != 0) {
            return;
        }

        updateSht(response.value);
    });
}

function updateLiveSht()
{
    $.getJSON("/ctrl/get?k=sht_operation", function(response) {
        if (response.code == 0) {
            if (response.type == 1 && response.value == "Angle") {
                updateLiveShtAngle();
            } else {
                updateLiveShtSpeed();
            }
        } else {
            updateLiveShtSpeed();
        }
    })
}

function updateSht(sht)
{
    $("#info_sht").text( sht);
}

function updateLiveISO()
{
    $.getJSON("/ctrl/get?k=live_ae_iso", function( response ) {
        if (response.code != 0) {
            return;
        }

        updateISOText(response.value);
    });
}

function updateISOText(iso)
{
    $("#info_iso").text("ISO " + iso);
}

function updateLiveIris()
{
    $.getJSON("/ctrl/get?k=live_ae_fno", function( response ) {
        if (response.code != 0) {
            return;
        }

        updateFno(response.value);
    });
}

function updateFno(fno)
{
    $("#info_iris").text(fno);
}

function updateLiveEv()
{
    $.getJSON("/ctrl/get?k=ev", function( response ) {
        if (response.code != 0) {
            return;
        }

        updateInfoEvText(response.value, response.ro);
    });
}

function updateInfoEvText(ev, ro)
{
    var evMap = new Map();
    evMap.set(-96 , -3.0);
    evMap.set(-86, -2.7);
    evMap.set(-74, -2.3);
    evMap.set(-64 , -2.0);
    evMap.set(-54, -1.7);
    evMap.set(-42, -1.3);
    evMap.set(-32 , -1.0);
    evMap.set(-22 , -0.7);
    evMap.set(-10, -0.3);
    evMap.set(0, 0.0);
    evMap.set(10, 0.3);
    evMap.set(22 , 0.7);
    evMap.set(32, 1.0);
    evMap.set(42, 1.3);
    evMap.set(54, 1.7);
    evMap.set(64, 2.0);
    evMap.set(74, 2.3);
    evMap.set(86, 2.7);
    evMap.set(96, 3.0);

    evMap.forEach(function(value, key, map) {
        if (ev == key) {
            if (ev == 0) {
                $("#info_ev").text("EV" + value);
            } else {
                $("#info_ev").text("EV" + value.toFixed(1));
            }
        }
    })

    if (ro == true) {
        $("#info_ev").hide();
    } else if (ro == false) {
        $("#info_ev").show();
    }
}

function refreshLiveviewInfo(again)
{
    updateLiveSht();
    updateLiveIris();
    updateLiveISO();
    updateLiveWb();
    updateLiveEv();

    if (again) {
        schelduleRefreshLiveviewInfo();
    }
}

function schelduleRefreshMiscInfo()
{
    setTimeout(refreshMiscInfo, 3000);
}

function refreshMiscInfo(again)
{
    updateCardStatus();
    updateFormatCardBtn();
    updateRecRemaining();
    updateTemp();
    updateBattery();

    if (again) {
        schelduleRefreshMiscInfo();
    }
}

function schelduleRefreshLiveviewInfo()
{
    setTimeout(refreshLiveviewInfo, 1000);
}

function ensureInRecordingMode()
{
    $.getJSON("/ctrl/mode", function( response ) {
        if (response.code != 0) {
            retuern;
        }

        var mode = response.msg;
        if (mode.startsWith("rec") == true) {
            $( "#accordion").accordion( "option", "disabled", false);
            updateRecordSettings();
            schelduleRefreshLiveviewInfo(false);
            schelduleRefreshMiscInfo(false);

            if (mode == "rec_ing" || mode == "rec_tl_ing") {
                camera.recording = true;
            } else {
                camera.recording = false;
            }

            $("#btn_rec").attr("disabled", false);
            updateRecordBtn();
            updateRecordIndicator(camera.recording);
            updateRecordDuration(0);
        } else {
            $( "#accordion").accordion( "option", "disabled", true);
            showErrorModeDialog();
        }
    });
}

function checkSession()
{
    $.ajax({
        url  : '/ctrl/session',
      })
      .fail(function(xhr, textStatus, errorThrown) {
        var status = xhr.status;

        console.log(errorThrown);

        if (status == 409) {
            showSessionForbitDialog();
        }
      })
      .done(function(data, statusText, xhr){
        var status = xhr.status;                //200
        if (status == 409) {

        } else if (status  == 200) {
            ensureInRecordingMode();
        } else {

        }
      });
}

function quickSession()
{
    $.getJSON("/ctrl/session?action=quit", function( response ) {

    });
}

function scheduleReconnectEventMonitor()
{
    setTimeout(startEventMonitor, 1000);
}

function restartLiveview()
{
    $.getJSON("/ctrl/get?k=https_on", function( response ) {
        if (response.code == 0 && response.value == "Off") {
            console.log('restart stream ...');
            $("#stream").remove();
            $("#preview").prepend('<img id="stream" src="/mjpeg_stream" />');
            $("#stream").one("load", function() {
                // do stuff
                resizeStreamViewport();
              }).each(function() {
                if(this.complete) $(this).load();
              });
        }
    });
}

function startEventMonitor()
{
    $.getJSON("/ctrl/get?k=https_on", function( response ) {
        if (response.code == 0) {
            var ws
            if (response.value == "Off") {
                ws = new WebSocket("ws://" + window.location.host + ":81/");
            } else {
                ws = new WebSocket("wss://" + window.location.host + ":81/");
            }

            ws.onopen = function() {
                console.log("open")
                checkSession();
                $( "#disconnected-dialog" ).dialog( "close" );

                restartLiveview();
            }

            ws.onmessage = function(evt){
                if (evt.data == "")
                    return;

                var msg = $.parseJSON(evt.data);

                if (msg.what == "ConfigChanged") {
                    console.log(msg);
                    // update the right hand side settings
                    if (msg.key == 'resolution' || msg.key == 'project_fps' || msg.key == 'preroll' || msg.key == 'video_system'
                                 || msg.key == 'record_file_format' || msg.key == 'split_duration' || msg.key == 'rec_fps'
                                 || msg.key == 'raw_over_hdmi' || msg.key == 'rec_frame_indicator') {
                        updateRecordSettings();
                    } else if (msg.key == 'movvfr' || msg.key == 'vfr_ctrl' || msg.key == 'video_encoder' || msg.key == 'bitrate_level'
                            || msg.key == 'rec_proxy_file' || msg.key == 'rotation' || msg.key == 'record_mode' || msg.key == 'compose_mode'
                            || msg.key == 'crop_sensor' || msg.key == 'low_jello' || msg.key == 'photo_q') {
                        updateMovieSettings();
                    } else if (msg.key == 'flicker' || msg.key == 'ev' || msg.key == 'meter_mode' || msg.key == 'iris'
                            || msg.key == 'sht_operation' || msg.key == 'shutter_angle' || msg.key == 'shutter_time'
                            || msg.key == 'max_exp_shutter_angle' || msg.key == 'max_exp_shutter_time'
                            || msg.key == 'iso' || msg.key == 'iso_ctrl' || msg.key == 'min_iso' || msg.key == 'max_iso'
                            || msg.key == 'lock_ae_in_rec' || msg.key == 'eND') {
                        updateExposureSettings();
                    } else if (msg.key == 'wb' || msg.key == 'mwb' || msg.key == 'tint' || msg.key == 'wb_priority' || msg.key == 'lock_awb_in_rec') {
                        updateWhiteBalanceSettings();
                    } else if (msg.key == 'primary_audio' || msg.key == 'audio_channel' || msg.key == 'audio_phantom_power' || msg.key == 'audio_level_display'
                            || msg.key == 'ain_gain_type' || msg.key == 'audio_input_gain' || msg.key == 'audio_output_gain' || msg.key == 'audio_in_l_gain'
                            || msg.key == 'audio_in_r_gain' || msg.key == 'audio_noise_reduction') {
                        updateAudioSettings();
                    } else if ( msg.key == 'lut' || msg.key == 'sharpness' || msg.key == 'noise_reduction' || msg.key == 'brightness'
                            || msg.key == 'contrast' || msg.key == 'saturation' || msg.key == 'ois_mode' || msg.key == 'vignette' || msg.key == 'luma_level') {
                        updateImageSettings();
                    } else if ( msg.key == 'focus' || msg.key == 'af_mode' || msg.key == 'caf' || msg.key == 'caf_sens'
                            || msg.key == 'af_area' || msg.key == 'live_caf' || msg.key == 'mf_mag' || msg.key == 'mf_recording') {
                        updateFocusSettings();
                    } else if (msg.key == 'hdmi_fmt' || msg.key == 'hdmi_osd' || msg.key == 'wifi' || msg.key == 'auto_off'
                            || msg.key == 'led' || msg.key == 'desqueeze' || msg.key == 'lcd_backlight') {
                        updateSystemSettings();
                    } else if (msg.key == 'assitool_display' || msg.key == 'assitool_scope' || msg.key == 'assitool_peak_onoff' || msg.key == 'assitool_peak_color'
                            || msg.key == 'assitool_frame_line' || msg.key == 'assitool_frame_line_color' || msg.key == 'assitool_center_mark'
                            || msg.key == 'assitool_center_mark_color' || msg.key == 'assitool_exposure' || msg.key == 'assitool_zera_th1'
                            || msg.key == 'assitool_zera_th2') {
                        updateAssitoolSettings();
                    }

                    // other live infomation
                    if (msg.key == "live_ae_shutter") {
                        updateSht(msg.value);
                    } else if (msg.key == "live_ae_fno") {
                        updateFno(msg.value);
                    } else if (msg.key == "iris") {
                        updateFno('F' + msg.value);
                    } else if (msg.key == "live_ae_iso") {
                        updateISOText(msg.value);
                    } else if (msg.key == "mwb") {
                        updateMwb(msg.value);
                    } else if (msg.key == "ev") {
                        updateInfoEvText(msg.value);
                    } else if (msg.key == "movfmt") {
                        //restartLiveview();
                    } else if (msg.key == 'battery_voltage') {
                        updateBatteryVoltageLable(msg.value);
                    } else if (msg.key == 'battery') {
                        updateBatteryPercentLable(msg.value);
                    }
                } else if (msg.what == "CardMounted") {
                    updateCardStatus();
                    updateFormatCardBtn();
                } else if (msg.what == "CardUnmounted") {
                    updateCardStatus();
                    updateFormatCardBtn();
                } else if (msg.what == "RecStarted") {
                    console.log('record started');
                    camera.recording = true;
                    updateRecordIndicator(true);
                    updateRecordBtn();

                    updateRecordSettings();
                    updateMovieSettings();
                    updateAudioSettings();
                    updateSystemSettings();
                    updateVideoTimelapse();
                    updateTimeCodeTab();
                } else if (msg.what == "RecStoped") {
                    console.log('record stoped');
                    camera.recording = false;
                    updateRecordDuration(0);
                    updateRecordIndicator(false);
                    updateRecordBtn();

                    updateRecordSettings();
                    updateMovieSettings();
                    updateAudioSettings();
                    updateSystemSettings();
                    updateVideoTimelapse();
                    updateTimeCodeTab();
                } else if (msg.what == "RecUpdateDur") {
                    if (msg.index == 1) {
                        if (msg.value > 0) {
                            updateRecordDuration(msg.value);
                            updateRecordIndicator(true);
                        } else {
                            updateRecordDuration(0);
                            updateRecordIndicator(false);
                        }
                    }
                } else if (msg.what == "RecUpdateRemain") {
                    updateRemainLable(msg.value);
                } else if (msg.what == "TempUpdate") {
                    updateTempLable(msg.value);
                } else if (msg.what == "AiDetection") {
                    drawAiDetectionOnCanvas(msg)
                    // console.log(msg);
                } else if (msg.what == 'ModeChanged') {
                    if (msg.value == 0) {
                        $( "#accordion").accordion( "option", "disabled", false);
                        var status = $("#err_mode-dialog").dialog('isOpen');
                        if (status == true) {
                            $("#err_mode-dialog").dialog("close");
                        }
                    } else {
                        // playback mode
                        $( "#accordion").accordion( "option", "disabled", true);
                        showErrorModeDialog();
                    }
                } else if (msg.what == 'HeadphonePlug') {
                    updateCameraConfig("audio_output_gain", "audio_output_gain");
                } else if (msg.what == 'LtcPlug') {
                    updateCameraConfig("tc_source", "tc_source");
                } else if (msg.what == 'UsbPlug') {
                    updateFormatCardBtn();
                } else {
                    console.log(evt.data);
                }
            }

            ws.onclose = function() {
                ws.close();
                console.log("close");
                scheduleReconnectEventMonitor();
            }

            ws.onerror = function() {
                console.log("error");
                $( "#disconnected-dialog" ).dialog( "open" );
            }

        }
    });
}

function testDrawCanvas(x, y, stopX, stopY) {
    var can = document.getElementById('canvas');
    var ctx = can.getContext('2d');

    $("canvas").mousedown(function(event) {
        startX = event.pageX;
        startY= event.pageY;
        $(this).bind('mousemove', function(e){
            drawLine(startX, startY, e.pageX, e.pageY);
        });
    });
    $("canvas").mouseup(function() {
        $(this).unbind('mousemove');
    });

    function drawLine(x, y, stopX, stopY){
        // ctx.clearRect (0, 0, can.width, can.height);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(stopX, stopY);
        ctx.closePath();
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();
        // console.log("x:" + x + " y:" + y + " stopx:" + stopX + " stopY:" + stopY);
    }
}

// Note: canvas size(1280, 720) is defined in html
function drawAiDetectionOnCanvas(jDetection) {
    var can = document.getElementById('canvas');
    var ctx = can.getContext('2d');

    ctx.clearRect(0,0,1280,720);
    if (jDetection.num == 0) {
        // console.log("NO DETECTION");
    }

    // {what: "AiDetection", num: 1, column: 7, objects: Array(7)}
    var arr = [];
    for (var i=0; i< jDetection.num; i++) {
        objIndex = jDetection.column * i;

        detectObj = new Object();
        detectObj.app = jDetection.objects[objIndex++];
        detectObj.id = jDetection.objects[objIndex++];
        detectObj.type = jDetection.objects[objIndex++];
        detectObj.condident = jDetection.objects[objIndex++];
        detectObj.x = jDetection.objects[objIndex++];
        detectObj.y = jDetection.objects[objIndex++];
        detectObj.width = jDetection.objects[objIndex++];
        detectObj.height = jDetection.objects[objIndex++];
        arr.push(detectObj);
        drawRect(detectObj.app, detectObj.id, detectObj.x, detectObj.y, detectObj.width, detectObj.height)
        drawInfo(detectObj)
        // console.log(detectObj);
    }
    //console.log(arr)

    // drawLine(100, 100, 200, 100);
    // drawLine(100, 200, 130, 200);

    function drawInfo(detectObj) {
        ctx.font = 'italic 17pt Calibri';
        ctx.fillStyle = 'red';
        app = detectObj.app
        id = detectObj.id
        if (app == 0) {
            var info = ""
            var info_fmt = "ai:{0}%";
            info = info_fmt.format(detectObj.condident);
            // if (id == 0) {
            //     var info_fmt = "ai:{0}%";
            //     info = info_fmt.format(detectObj.condident);
            // } else {
            //     var info_fmt = "ai:{0}% id:{1}";
            //     info = info_fmt.format(detectObj.condident, id);
            // }
            ctx.fillText(info, detectObj.x, detectObj.y);
        } else if (app == 1) {
            var info_fmt = "PTZ:{0}%";
            info = info_fmt.format(detectObj.condident);
            ctx.fillText(info, detectObj.x, detectObj.y + detectObj.height);
        } else if (app == 2) {
            info = "";
            if (id == 0) {
                info = "Af: KEY";
            } else {
                var info_fmt = "Af: id:{0}";
                info = info_fmt.format(id);
            }
            ctx.fillText(info, detectObj.x, detectObj.y + detectObj.height);
        } else if (app == 3) {
            var info_fmt = "CROP:{0}%";
            info = info_fmt.format(detectObj.condident);
            ctx.fillText(info, detectObj.x, detectObj.y + detectObj.height);
        } else if (app == 4) {
            info = "Face";
            ctx.fillText(info, detectObj.x, detectObj.y + detectObj.height);
        } else {
            var info_fmt = "?:{0}%";
            info = info_fmt.format(detectObj.condident);
            ctx.fillText(info, detectObj.x, detectObj.y + detectObj.height);
        }
    }

    function drawRect(app, id, x, y, width, height) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        // ctx.fillStyle = 'yellow';
        // ctx.fill();
        ctx.font = 'italic 25pt Calibri';
        if (app == 0) {
            //ai
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'blue';
        } else if (app == 1) {
            //ptz
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'yellow';
        } else if (app == 2) {
            //af
            if (id == 0) {
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'red';
            } else {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'purple';
            }
        } else if (app == 3) {
            //crop
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'blue';
        } else if (app == 4) {
            //face
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'yellow';
        } else {
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'orange';
        }
        ctx.stroke();
    }

    function drawLine(x, y, stopX, stopY) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(stopX, stopY);
        ctx.closePath();
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();
    }
}

String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
             }
          }
       }
   }
   return result;
}

// init
function initUI()
{
    $( "#accordion" ).accordion({
        // collapsible: true,
        heightStyle: "content",
        beforeActivate: function( event, ui ) {
            console.log("show " + ui.newHeader[0].innerText)
            if (ui.newHeader[0].innerText == "Exposure") {
                updateExposureSettings();
            } else if (ui.newHeader[0].innerText == "White Balance") {
                updateWhiteBalanceSettings();
            } else if (ui.newHeader[0].innerText == "System") {
                updateSystemSettings();
            } else if (ui.newHeader[0].innerText == "Image") {
                updateImageSettings();
            } else if (ui.newHeader[0].innerText == "Video") {
                updateMovieSettings();
            } else if (ui.newHeader[0].innerText == "Timelapse") {
                updateVideoTimelapse();
            } else if (ui.newHeader[0].innerText == "Time Code") {
                updateTimeCodeTab();
            } else if (ui.newHeader[0].innerText == "Audio") {
                updateAudioSettings();
            } else if (ui.newHeader[0].innerText == "Assist Tool") {
                updateAssitoolSettings();
            } else if (ui.newHeader[0].innerText == "Focus") {
                updateFocusSettings();
            } else if (ui.newHeader[0].innerText == "Record") {
                updateRecordSettings();
            } else if (ui.newHeader[0].innerText == "Streaming") {
                updateStreamingSettings();
            }

            if (ui.newHeader[0].innerText == "Streaming") {
                startRtmpStatTimer();
            } else {
                stopRtmpStatTimer();
            }
        }
    });

    $( "#progressbar" ).progressbar().hide();
    $(".select_menu").selectmenu();
    $(".slider").slider();
    $("button, input").button();
    $("#btn_fmt").click( function(event) {
        showFormatDialog();
    });
    $("#btn_pwr_off").click( function(event) {
        showPowerOffDialog();
    });
    $("#btn_rst").click( function(event) {
        showRebootDialog();
    });
    $("#btn_clr_settings").click( function(event) {
        showClearSettingsDialog();
    });

    $("#btn_rec").click( function(event) {
        if (camera.recording) {
            stopRec();
        } else {
            startRec();
        }
    });

    //meta setup
    $("#btn_meta_setup").click( function(event) {
        showMetaSetupDialog();
    });

    // time code
    $("#btn_tc_reset").click( function(event) {
        showTimeCodeResetDialog();
    });

    $("#btn_tc_time").click( function(event) {
        showTimeCodeCurrentTimeDialog();
    });

    $("#btn_tc_manual").click( function(event) {
        showTimeCodeManualDialog();
    });

    $("#btn_upgrade").click( function(event) {
        showUpgradeDialog();
    });

    $("#btn_sync_time").click( function(event) {

        var timezone = (0 - new Date().getTimezoneOffset()) / 60;
        if (timezone >= 0) {
            $.getJSON("/datetime?timezone=GMT+" + timezone + ":00", function( response ) {

            });
        } else {
            $.getJSON("/datetime?timezone=GMT" + timezone + ":00", function( response ) {

            });
        }

        var dt = new Date();
        var month = parseInt(dt.getMonth()) + 1;
        $.getJSON("/datetime?date=" + dt.getFullYear() + "-" + month + "-" + dt.getDate()
            + "&time=" + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds(),
            function(response) {}
        );
    });

    $('#btn_maintenance').click(function(event) {
        showLoginDialog();
    });

    $('#btn_web_password').click(function(event) {
        showChangePasswordDialog();
    });

    $( ".dialog-confirm" ).dialog({
        autoOpen:false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
    });

    $(window).resize(function(){
        resizeStreamViewport();
    })


    $('#streaming_tabs').tabs();
    initStreaming();

    // $( "#stream" ).ready(function() {
    //     resizeStreamViewport();
    // });

    // quit session
    $(window).on('beforeunload', function(){
        quickSession();
        return null;
    });
    // testDrawCanvas(100,100, 100, 100)
}
