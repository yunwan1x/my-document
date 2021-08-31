$(document).ready(function () {
    const options = Object.assign(window.GT_CONFIG, {
        proxy: 'https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token',
        sha: "",
        saving: false,
        path: "",
        posturl: "",
        editMode: true,
        _accessToke: "",
        user: "",
        content: ""
    })

    const loading = (loading) => {
        if (!loading) {
            $('#spinner-border').hide();
        } else {
            $('#spinner-border').show();
        }
    }

    const queryParse = (search = window.location.search) => {
        if (!search) return {}
        const queryString = search[0] === '?' ? search.substring(1) : search
        const query = {}
        queryString
            .split('&')
            .forEach(queryStr => {
                const [key, value] = queryStr.split('=')
                /* istanbul ignore else */
                if (key) query[decodeURIComponent(key)] = decodeURIComponent(value)
            })

        return query
    }
    const queryHash = (search = window.location.hash) => {
        if (!search) return {}
        const queryString = search[0] === '#' ? search.substring(1) : search
        const query = {}
        queryString
            .split('&')
            .forEach(queryStr => {
                const [key, value] = queryStr.split('=')
                /* istanbul ignore else */
                if (key) query[decodeURIComponent(key)] = decodeURIComponent(value)
            })

        return query
    }
    const dateFormat = function (date, fmt) {
        var o = {
            "M+": date.getMonth() + 1,                 //月份
            "d+": date.getDate(),                    //日
            "h+": date.getHours(),                   //小时
            "m+": date.getMinutes(),                 //分
            "s+": date.getSeconds(),                 //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
    const queryStringify = query => {
        const queryString = Object.keys(query)
            .map(key => `${key}=${encodeURIComponent(query[key] || '')}`)
            .join('&')
        return queryString
    }


    const axiosJSON = axios.create({
        headers: {
            'Accept': 'application/json'
        }
    })
    const axiosGithub = axios.create({
        baseURL: 'https://api.github.com',
        headers: {
            'Accept': 'application/json'
        }
    })

    axiosGithub.interceptors.request.use(function (config) {
        loading(true)
        return config;
    }, function (error) {
        // 对请求错误做些什么

        loading(false)
        return Promise.reject(error);
    });

// 添加响应拦截器
    axiosGithub.interceptors.response.use(function (response) {
        // 对响应数据做点什么
        loading(false)
        return response;
    }, function (error) {
        // 对响应错误做点什么
        loading(false)
        return Promise.reject(error);
    });


    const Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = Base64._utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        },
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = Base64._utf8_decode(output);
            return output;
        },
        // private method for UTF-8 encoding
        _utf8_encode: function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },
        // private method for UTF-8 decoding
        _utf8_decode: function (utftext) {
            var string = "";
            var i = 0;
            let c2 = 0, c = 0, c1 = 0, c3 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        },

    }
    const defaultText = (type) => {
        return (
            `---
layout: post
title: 
categories: GitHub
description: description
keywords: Jekyll, GitHub Pages
topmost: false
---`)
    }

    const GT_ACCESS_TOKEN = 'GT_ACCESS_TOKEN'
    const GT_COMMENT = 'GT_COMMENT'

    const defaultAvatar = '<svg  viewBox="0 0 1024 1024" width="16" height="16" version="1.1" xmlns="http://www.w3.org/2000/svg">\n  <path d="M64 524C64 719.602 189.356 885.926 364.113 947.017 387.65799 953 384 936.115 384 924.767L384 847.107C248.118 863.007 242.674 773.052 233.5 758.001 215 726.501 171.5 718.501 184.5 703.501 215.5 687.501 247 707.501 283.5 761.501 309.956 800.642 361.366 794.075 387.658 787.497 393.403 763.997 405.637 743.042 422.353 726.638 281.774 701.609 223 615.67 223 513.5 223 464.053 239.322 418.406 271.465 381.627 251.142 320.928 273.421 269.19 276.337 261.415 334.458 256.131 394.888 302.993 399.549 306.685 432.663 297.835 470.341 293 512.5 293 554.924 293 592.81 297.896 626.075 306.853 637.426 298.219 693.46 258.054 747.5 262.966 750.382 270.652 772.185 321.292 753.058 381.083 785.516 417.956 802 463.809 802 513.5 802 615.874 742.99 701.953 601.803 726.786 625.381 750.003 640 782.295 640 818.008L640 930.653C640.752 939.626 640 948.664978 655.086 948.665 832.344 888.962 960 721.389 960 524 960 276.576 759.424 76 512 76 264.577 76 64 276.576 64 524Z"></path>\n</svg>'
    const isPhone = window.innerWidth < 500
    const loginButton = {
        name: "login",
        icon: "<div id='login'>登录 github</div>",
        click(element, vditor) {
        },
    }
    const saveButton = {
        name: "save",
        tip: "保存",
        tipPosition: "n",
        icon:'<svg t="1629634645921" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12174" width="32" height="32" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><style type="text/css"></style></defs><path d="M959.937 903.937c0 30.913-25.081 55.996-55.996 55.996L119.996 959.933C89.081 959.933 64 934.85 64 903.937l0-783.94C64 89.082 89.081 64 119.996 64l541.293 0c30.915 0 73.49 17.495 95.659 39.662l163.323 163.323c22.169 22.168 39.665 64.744 39.665 95.658L959.936 903.937zM885.273 885.27 885.273 362.644c0-11.079-9.916-34.998-17.494-42.583L703.874 156.157c-8.168-8.167-30.916-17.496-42.585-17.496l0 242.65c0 30.914-25.081 55.996-55.996 55.996L269.318 437.307c-30.915 0-55.996-25.082-55.996-55.996l0-242.65-74.662 0L138.66 885.27l74.662 0L213.322 642.626c0-30.917 25.081-55.996 55.996-55.996l485.3 0c30.913 0 55.996 25.079 55.996 55.996L810.614 885.27 885.273 885.27zM735.951 885.27 735.951 661.29 287.984 661.29 287.984 885.27 735.951 885.27zM586.629 157.328c0-9.918-8.748-18.667-18.666-18.667L455.971 138.661c-9.917 0-18.665 8.748-18.665 18.667l0 186.652c0 9.919 8.748 18.665 18.665 18.665l111.992 0c9.918 0 18.666-8.746 18.666-18.665L586.629 157.328z" p-id="12175"></path></svg>',
        hotkey: '⌘S',
        async click(element, vditor) {
            if (options.saving) return
            if (isAdmin(options)) {
                options.saving = true;
                try {
                    await savePost(options)
                } catch (e) {
                    showGitHubErrorInfo(e)
                }
            } else {
                options.saving = true;
                error("你不是管理员！")
            }
        },
    }
    const pasterButton={
        name: 'paste url',
        tip: "paste",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" ><path d="M128 184c0-30.879 25.122-56 56-56h136V56c0-13.255-10.745-24-24-24h-80.61C204.306 12.89 183.637 0 160 0s-44.306 12.89-55.39 32H24C10.745 32 0 42.745 0 56v336c0 13.255 10.745 24 24 24h104V184zm32-144c13.255 0 24 10.745 24 24s-10.745 24-24 24-24-10.745-24-24 10.745-24 24-24zm184 248h104v200c0 13.255-10.745 24-24 24H184c-13.255 0-24-10.745-24-24V184c0-13.255 10.745-24 24-24h136v104c0 13.2 10.8 24 24 24zm104-38.059V256h-96v-96h6.059a24 24 0 0 1 16.97 7.029l65.941 65.941a24.002 24.002 0 0 1 7.03 16.971z"/></svg>`,
        tipPosition: "n",
        async click(element){
            let text="https://www.baidu.com"
            try {
                text = await navigator.clipboard.readText();
            } catch (e) {
            }
            if(text.startsWith("http")){
                vditor.insertValue(`[链接](${text})`)
            }else {
                vditor.insertValue(text)
            }
            console.log(text);
        }
    }

    const githubButton = {
        name: '更多',
        tipPosition: "n",
        icon: `<div id="imageLogo">${defaultAvatar}</div>`,
        tip: 'github',
        click(element, vditor) {
        },
        toolbar: [loginButton]
    }
    const toolbars = [ "bold", "italic", "strike", "line", "quote", "list", "ordered-list", "check", "code", "inline-code", "link", "table",]
    const toolbars1=["undo", "redo", "edit-mode", "both", "preview", "outline", "code-theme", "content-theme", "export"]
    const config = {
        toolbarConfig: {
            pin: true,
        },
        counter: {
            enable: false,
            type: "text"
        },

        height: window.innerHeight,
        outline: {
            enable: true
        },
        preview: {
            markdown: {
                codeBlockPreview: false,
                autoSpace: false
            },
            mode: isPhone ? "editor" : "both",
        },
        mode: "ir",
        typewriterMode: true,
        cache: {
            enable: false
        },
        async after() {
            $('#login').on('click', function () {
                login(options)
            })
            if(!isPhone){
                const svg=`data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NTMuNjk2IDIwMC40OTQiPjxwYXRoIGQ9Ik01OC4xMyA1My45NjJjNy4wMiAwIDE1LjEzNS0xLjc1NCAyNC4zNDktNS4yNjR2MjIuNTkzYy0yLjA0OC43MzEtNC45NzIgMS41MzYtOC43NzQgMi40MTQgMS4xNjkgMy4zNjMgMS43NTUgNi41MDcgMS43NTUgOS40MzIgMCA5LjM1OS0yLjgxNCAxNy41MTItOC40NDUgMjQuNDU4LTUuNjMgNi45NDYtMTIuOTA2IDExLjA3OS0yMS44MjcgMTIuMzk0LTUuODQ4Ljg3OC04Ljc3MyA0LjAyMi04Ljc3MyA5LjQzMyAwIDEuOTAxLjk1IDMuODAzIDIuODUyIDUuNzAzIDIuNDg2IDIuNzc5IDYuMTQyIDQuNTM1IDEwLjk2OCA1LjI2NiAyMC45MTMgMy4yMTcgMzEuMzY4IDExLjkxOCAzMS4zNjggMjYuMTAzIDAgMjIuNjY5LTEzLjUyNiAzNC4wMDItNDAuNTgxIDM0LjAwMi0xMS4xMTQgMC0yMC4yNTUtMS45NzQtMjcuNDE5LTUuOTIzQzQuNTMyIDE4OS42IDAgMTgxLjc3NiAwIDE3MS4wOTljMC0xMi4yODMgNi44LTIwLjY5MSAyMC4zOTktMjUuMjI1di0uNDM4Yy00Ljk3Mi0zLjA3MS03LjQ1Ny03Ljc1MS03LjQ1Ny0xNC4wNCAwLTguMTg5IDIuMzQtMTMuMzA5IDcuMDItMTUuMzU0di0uNDM5Yy00LjY4LTEuNjA4LTguODQ5LTUuMjY2LTEyLjUwNC0xMC45NjktNC4wOTUtNi4xNDItNi4xNDMtMTIuNzIzLTYuMTQzLTE5Ljc0MiAwLTEwLjUyOSAzLjcyOS0xOS4zMDMgMTEuMTg4LTI2LjMyMiA3LjE2Ni02LjU4MSAxNS43MjEtOS44NzEgMjUuNjY1LTkuODcxIDcuMTY2LS4wMDEgMTMuODE5IDEuNzU0IDE5Ljk2MiA1LjI2M3ptLjg3NyAxMTUuMzgzYzAtNy40NTktNi4xNDItMTEuMTg4LTE4LjQyNy0xMS4xODgtMTEuODQ1IDAtMTcuNzY4IDMuODc1LTE3Ljc2OCAxMS42MjcgMCA3LjYwMyA2LjQzNiAxMS40MDUgMTkuMzA0IDExLjQwNSAxMS4yNjEuMDAxIDE2Ljg5MS0zLjk0NyAxNi44OTEtMTEuODQ0ek0yNS4yMjYgODUuMTEyYzAgMTAuMDkxIDQuNjA2IDE1LjEzNiAxMy44MTggMTUuMTM2IDguOTIxIDAgMTMuMzgxLTUuMTE5IDEzLjM4MS0xNS4zNTUgMC00LjI0MS0xLjAyMy03Ljg5Ni0zLjA3LTEwLjk2OC0yLjQ4Ni0zLjM2My01LjkyMy01LjA0Ni0xMC4zMTEtNS4wNDYtOS4yMTEtLjAwMS0xMy44MTggNS40MTEtMTMuODE4IDE2LjIzM3pNMTA1LjczOCAzMi42ODRjLTQuMjQgMC03Ljg1OS0xLjYwNy0xMC44NTctNC44MjVzLTQuNDk3LTcuMDE5LTQuNDk3LTExLjQwNmMwLTQuNTM0IDEuNDk5LTguNDA4IDQuNDk3LTExLjYyNlMxMDEuNDk4IDAgMTA1LjczOCAwYzQuMDk1IDAgNy42NDIgMS42MDggMTAuNjQgNC44MjZzNC40OTYgNy4wOTIgNC40OTYgMTEuNjI2YzAgNC4zODgtMS40OTggOC4xODgtNC40OTYgMTEuNDA2cy02LjU0NSA0LjgyNi0xMC42NCA0LjgyNnpNOTMuMjM1IDE0Ny4xOWMuMjkzLTIuOTI0LjQzOC03Ljg5Ni40MzgtMTQuOTE2VjY0LjA1MmMwLTYuODcyLS4xNDYtMTEuNjI1LS40MzgtMTQuMjU4aDI0Ljc4OGMtLjI5MyAyLjc3OS0uNDM5IDcuMzg2LS40MzkgMTMuODJ2NjcuMzQzYzAgNy40NTkuMTQ2IDEyLjg2OS40MzkgMTYuMjMySDkzLjIzNXpNMTYzLjQxMyA0OS43OTRoMTkuMDg0djIxLjI3N2MtLjczMSAwLTIuMDg0LS4wNzItNC4wNTktLjIxOWE3Ni4wMzYgNzYuMDM2IDAgMCAwLTUuNTk0LS4yMmgtOS40MzJ2NDAuODAxYzAgOS43OTkgMy4yMTcgMTQuNjk3IDkuNjUxIDE0LjY5NyA0LjUzNCAwIDguNjI4LTEuMjQyIDEyLjI4NS0zLjcyOXYyMS45MzZjLTUuNDExIDIuOTI2LTExLjkxOSA0LjM4OC0xOS41MjQgNC4zODgtMTAuNjc1IDAtMTguMDU5LTMuODAyLTIyLjE1NC0xMS40MDUtMy4wNy01LjcwNS00LjYwNi0xNC42OTctNC42MDYtMjYuOTgyVjcxLjA3MmguMjJ2LS40MzhsLTMuMjkxLS4yMTljLTEuOTAxIDAtNC4zODcuMjE5LTcuNDU4LjY1N1Y0OS43OTRoMTAuNzQ5VjQxLjI0YzAtNC4wOTUtLjIyLTcuMzg2LS42NTgtOS44NzFoMjUuNDQ1Yy0uNDM4IDIuNzc4LS42NTggNS45MjMtLjY1OCA5LjQzMnY4Ljk5M3pNMjQwLjQ2NCA0OS4xMzZjLTYuMjg4IDAtMTIuODY5IDIuMTk0LTE5Ljc0MiA2LjU4VjE3LjMyOWMwLTguMzM1LjE0Ni0xMy44MTkuNDM4LTE2LjQ1MWgtMjUuMDA3Yy40MzkgMi4zNC42NTggNy44MjMuNjU4IDE2LjQ1MVYxMzMuMzdjMCA2LjcyNi0uMjE5IDExLjMzNC0uNjU4IDEzLjgxOWgyNS40NDVjMC0uNDM5LS4xNDYtMi4yMjktLjQzOC01LjM3NC0uMjkyLTMuMTQ1LS40MzgtNS45Ni0uNDM4LTguNDQ1Vjc5LjQwN2M1LjExOC00LjgyNSAxMC4wOS03LjIzNyAxNC45MTYtNy4yMzcgNS41NTggMCA5Ljc5OSAyLjc3NyAxMi43MjQgOC4zMzQgMi4xOTIgNC4zODggMy4yOSA5Ljg3MiAzLjI5IDE2LjQ1M2wtLjIyIDI5LjYxMmMwIDQuOTc0LS4zNjUgMTEuODQ3LTEuMDk2IDIwLjYyaDI2LjU0MWMtLjU4NC0zLjY1NS0uODc3LTEwLjM4My0uODc3LTIwLjE4MnYtMzAuMDVjMC0xMi43MjQtMi44NTItMjMuNTQ1LTguNTU1LTMyLjQ2Ni02LjQzNS0xMC4yMzctMTUuNDI5LTE1LjM1NS0yNi45ODEtMTUuMzU1ek0zMTguMTI0IDE0OC4wNjhjLTExLjU1NCAwLTIwLjEwNy01LjExOS0yNS42NjUtMTUuMzU2LTQuMzg3LTguMzM1LTYuNTgxLTE5LjIzLTYuNTgxLTMyLjY4NFY2OS45NzZjMC05Ljk0NC0uMjkyLTE2LjY3Mi0uODc3LTIwLjE4MmgyNi4zMjNjLS40MzkgMy4yMTgtLjczMSAxMC4wOTEtLjg3OCAyMC42MmwtLjIxOSAyOS42MTNjMCA4LjMzNS45NSAxNC4zMzIgMi44NTEgMTcuOTg2IDIuMTk1IDQuNTM1IDYuMjE2IDYuODAyIDEyLjA2NSA2LjgwMiA0LjA5NSAwIDguNzAyLTIuNDE0IDEzLjgyLTcuMjM4VjYzLjYxNWMwLTIuNDg2LS4xNDctNS4zMzktLjQzOS04LjU1Ni0uMjk0LTMuMjE4LS40MzgtNC45NzItLjQzOC01LjI2NWgyNS40NDRjLS4yOTEgMi40ODYtLjQzOCA3LjA5My0uNDM4IDEzLjgydjY3LjEyNGMwIDguNjI3LjE0NyAxNC4xMTEuNDM4IDE2LjQ1MWgtMjMuOTA5di03Ljg5NmMtNi43MjggNS44NDktMTMuODkzIDguNzc1LTIxLjQ5NyA4Ljc3NXpNNDE2Ljg0NCAxNDcuODQ3Yy03Ljg5NiAwLTE0LjQ3Ny0yLjg1MS0xOS43NDItOC41NTN2Ny44OTZIMzczLjg1Yy40MzktMi40ODUuNjU5LTcuMDk0LjY1OS0xMy44MTlWMTcuMzI5YzAtOC42MjgtLjIyLTE0LjExMS0uNjU5LTE2LjQ1MWgyNS4wMDdjLS4yOTMgMi42MzItLjQzOCA4LjExNi0uNDM4IDE2LjQ1MXYzOC4xNjljNi43MjYtNC4yNDEgMTMuMzA5LTYuMzYyIDE5Ljc0Mi02LjM2MiAxMS41NTMgMCAyMC42MjEgNS4xMTggMjcuMjAxIDE1LjM1NSA1LjU1NyA4LjkyMSA4LjMzNSAxOS43NDIgOC4zMzUgMzIuNDY2IDAgMTMuMDE1LTIuOTI1IDI0LjM0OC04Ljc3MyAzNC03LjAyMiAxMS4yNjEtMTYuMzgxIDE2Ljg5LTI4LjA4IDE2Ljg5em0tMy4yOTEtNzUuNjc3Yy00LjgyNyAwLTkuODcxIDIuNDEyLTE1LjEzNiA3LjIzN3YzNy45NDljNC42OCA0LjUzMyA5LjI4NiA2LjgwMiAxMy44MTkgNi44MDIgNS43MDIgMCAxMC4wMTgtMy4xNDUgMTIuOTQyLTkuNDM0IDIuMzQxLTQuOTcyIDMuNTEtMTAuODk2IDMuNTEtMTcuNzY4LjAwMS0xNi41MjQtNS4wNDQtMjQuNzg2LTE1LjEzNS0yNC43ODZ6TTExMC4zMjUgMTY4LjIxNmMtMS4zOTItMS44ODktMy4xODItMy4wODItNS42MTYtMy4wODItMi4zMzcgMC00LjU3MyAxLjc5LTQuNTczIDQuMjI2IDAgNi4zMTIgMTQuODYxIDMuNjc3IDE0Ljg2MSAxNi4yNTMgMCA3LjUwNi00LjY3MiAxMi44MjMtMTIuMzI2IDEyLjgyMy01LjE3IDAtOC45NDctMi45ODEtMTEuNTMyLTcuMzA3bDQuNzIzLTQuNjIzYy45OTMgMi44ODQgMy42MjggNS40NjggNi43NiA1LjQ2OCAyLjk4MSAwIDQuODIxLTIuNTM0IDQuODIxLTUuNDE4IDAtMy44NzctMy41NzktNC45Ny02LjUxMS02LjExMi00LjgyMi0xLjk4OC04LjM1Mi00LjQyNC04LjM1Mi0xMC4yMzkgMC02LjIxMyA0LjYyMy0xMS4yMzMgMTAuOTM2LTExLjIzMyAzLjMzIDAgNy45NTIgMS42NDEgMTAuMjM5IDQuMTc1bC0zLjQzIDUuMDY5ek0xMzUuNTcgMTk4LjQzNmMtMTEuNDM0IDAtMTguNTQxLTguNzQ4LTE4LjU0MS0xOS43ODMgMC0xMS4xMzMgNy4zNTctMTkuNjgyIDE4LjU0MS0xOS42ODIgMTEuMTgzIDAgMTguNTM5IDguNTQ5IDE4LjUzOSAxOS42ODIgMCAxMS4wMzUtNy4xMDcgMTkuNzgzLTE4LjUzOSAxOS43ODN6bTAtMzIuMjU3Yy02LjkwOSAwLTEwLjk4NiA2LjExMi0xMC45ODYgMTIuMTc3IDAgNS43NjUgMi44ODQgMTIuODczIDEwLjk4NiAxMi44NzMgOC4xMDEgMCAxMC45ODMtNy4xMDggMTAuOTgzLTEyLjg3MyAwLTYuMDY1LTQuMDc1LTEyLjE3Ny0xMC45ODMtMTIuMTc3ek0xODIuNzMyIDE2OS45MDZjLTIuMDM4LTIuNDg1LTUuMTItMy45NzctOC4yNTItMy45NzctNy4wMDggMC0xMS4wMzQgNi40NjEtMTEuMDM0IDEyLjkyNSAwIDYuMzEyIDQuMTc2IDEyLjYyMyAxMC45ODUgMTIuNjIzIDMuMTMxIDAgNi4yNjMtMS42NDEgOC4zMDEtMy45NzV2OC42OTZjLTIuNzM0IDEuMjk0LTUuNDY4IDIuMjM3LTguNTAxIDIuMjM3LTEwLjUzNiAwLTE4LjM0LTkuMDk2LTE4LjM0LTE5LjQzNCAwLTEwLjYzOCA3LjUwNS0yMC4wMzEgMTguNDktMjAuMDMxIDIuOTMyIDAgNS44MTQuNzk2IDguMzUxIDIuMTg3djguNzQ5ek0xOTQuODU1IDE5Ny40NDJoLTcuMzA2di0zNy40NzdoNy4zMDZ6TTIwNy44MjUgMTg5LjUzOWwtMy4wODIgNy45MDJoLTcuNzA0bDE0LjYxNC0zOC40NzFoNS42NjZsMTQuMjE2IDM4LjQ3MWgtNy44MDVsLTIuODgzLTcuOTAyaC0xMy4wMjJ6bTYuMzEyLTE5LjU4NWgtLjA5OWwtNC4xMjYgMTMuNjIxaDguODk3bC00LjY3Mi0xMy42MjF6TTI0MS4wNzEgMTkxLjA4aDEwLjMzOXY2LjM2MmgtMTcuNjQ1di0zNy40NzdoNy4zMDZ6TTI5My4xNTMgMTY5LjkwNmMtMi4wMzctMi40ODUtNS4xMTktMy45NzctOC4yNTEtMy45NzctNy4wMDggMC0xMS4wMzQgNi40NjEtMTEuMDM0IDEyLjkyNSAwIDYuMzEyIDQuMTc1IDEyLjYyMyAxMC45ODQgMTIuNjIzIDMuMTMyIDAgNi4yNjQtMS42NDEgOC4zMDEtMy45NzV2OC42OTZjLTIuNzMzIDEuMjk0LTUuNDY4IDIuMjM3LTguNDk5IDIuMjM3LTEwLjUzNyAwLTE4LjM0MS05LjA5Ni0xOC4zNDEtMTkuNDM0IDAtMTAuNjM4IDcuNTA1LTIwLjAzMSAxOC40OS0yMC4wMzEgMi45MzIgMCA1LjgxNS43OTYgOC4zNSAyLjE4N3Y4Ljc0OXpNMzE0LjcyMiAxOTguNDM2Yy0xMS40MzMgMC0xOC41NC04Ljc0OC0xOC41NC0xOS43ODMgMC0xMS4xMzMgNy4zNTYtMTkuNjgyIDE4LjU0LTE5LjY4MnMxOC41MzkgOC41NDkgMTguNTM5IDE5LjY4MmMwIDExLjAzNS03LjEwOCAxOS43ODMtMTguNTM5IDE5Ljc4M3ptMC0zMi4yNTdjLTYuOTEgMC0xMC45ODUgNi4xMTItMTAuOTg1IDEyLjE3NyAwIDUuNzY1IDIuODg0IDEyLjg3MyAxMC45ODUgMTIuODczczEwLjk4NS03LjEwOCAxMC45ODUtMTIuODczYy4wMDEtNi4wNjUtNC4wNzYtMTIuMTc3LTEwLjk4NS0xMi4xNzd6TTMzNi44MzMgMTU5Ljk2NWgxMC40MzljMTAuODM0IDAgMTguMDkxIDguMTAyIDE4LjA5MSAxOC43ODcgMCAxMC41MzktNy40NTUgMTguNjg5LTE4LjE0MyAxOC42ODloLTEwLjM4OHYtMzcuNDc2em03LjMwNyAzMS4xMTVoMS4xOTJjOC45OTUgMCAxMi40NzctNC45NzEgMTIuNDc3LTEyLjM3OCAwLTguMTUtNC4xNzUtMTIuMzc1LTEyLjQ3Ny0xMi4zNzVoLTEuMTkydjI0Ljc1M3pNMzc2LjI0MyAxOTcuNDQyaC03LjMwOHYtMzcuNDc3aDcuMzA4ek0zODEuNTU3IDE1OC45NzFoNS4yN2wxOS43MzIgMjYuMTk0aC4wOTl2LTI1LjJoNy4zMDh2MzguMjIzaC01LjI3bC0xOS43MzEtMjYuMTk1aC0uMXYyNS40NDloLTcuMzA4ek00NTIuMzgyIDE3Ny41MTF2Ljk0NGMwIDEwLjU4Ni01LjQxOSAxOS45OC0xNy4wNDggMTkuOTgtMTAuOTM2IDAtMTcuODQ2LTkuMjQ0LTE3Ljg0Ni0xOS41ODIgMC0xMC42ODggNy4xMDgtMTkuODgzIDE4LjI5Mi0xOS44ODMgNi4zNjIgMCAxMS45MjkgMy4yMzEgMTQuODEyIDguOTQ2bC02LjQ2MiAzLjQ3OWMtMS40OTEtMy4zNzktNC42NzItNS45NjQtOC41NDktNS45NjQtNy4wNTkgMC0xMC41MzcgNy4yMDctMTAuNTM3IDEzLjQyMSAwIDYuMjExIDMuNTI4IDEzLjEyIDEwLjU4NiAxMy4xMiA0LjU3MyAwIDguNDAxLTMuOTc2IDguNTUtOC41aC03Ljk1M3YtNS45NjNoMTYuMTU1eiIvPjwvc3ZnPgo=`
                $('.vditor-toolbar').prepend(`<a href='https://yunwan1x.github.io'><img width='64px' style='left: 10px;top:5px;position: absolute;' src='${svg}' /></a> `)
            }
            loading(false)
            try {
                await init(options)
            } catch (e) {
                showGitHubErrorInfo(e)
            }
        },
        toolbar: window.screen.width < 500 ? [
            'headings',
            'edit-mode', saveButton,pasterButton, {
                name: "more2",
                icon:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path d="M5 9h2.31l.32-3h2l-.32 3h2l.32-3h2l-.32 3H15v2h-1.9l-.2 2H15v2h-2.31l-.32 3h-2l.32-3h-2l-.32 3h-2l.32-3H5v-2h1.9l.2-2H5V9m4.1 2-.2 2h2l.2-2M19 6h-2v8h2m0 2h-2v2h2z"/></svg>`,
                toolbar: toolbars
            },{
                name: "more1",
                icon:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path d="M4 2a2 2 0 0 0-2 2v8h2V8h2v4h2V4a2 2 0 0 0-2-2H4m0 2h2v2H4m18 9.5V14a2 2 0 0 0-2-2h-4v10h4a2 2 0 0 0 2-2v-1.5a1.54 1.54 0 0 0-1.5-1.5 1.54 1.54 0 0 0 1.5-1.5M20 20h-2v-2h2v2m0-4h-2v-2h2M5.79 21.61l-1.58-1.22 14-18 1.58 1.22z"/></svg>`,
                toolbar: toolbars1
            }, githubButton] : toolbars.concat(["headings",...toolbars1,saveButton, pasterButton,githubButton])
    }
    const vditor = new Vditor('vditor', config)

    $(window).resize(function () {
        vditor.vditor.element.style.height = window.innerHeight + "px";
    });


    async function init(options) {
        const query = queryParse()
        const hash = queryHash();
        const {path, posturl} = hash
        options.path = path
        options.posturl = posturl
        options.editMode = path ? true : false
        if (query.code) {
            const code = query.code
            delete query.code
            const replacedUrl = `${window.location.origin}${window.location.pathname}${queryStringify(query)}${window.location.hash}`
            history.replaceState(null, null, replacedUrl)
            const res = await axiosJSON.post(options.proxy, {
                code,
                client_id: options.clientID,
                client_secret: options.clientSecret,
            });
            if (res.data && res.data.access_token) {
                setAccessToken(res.data.access_token, options)
                await initUserPost(options)
            } else {
                throw new Error("no access_token")
            }
        } else {
            await initUserPost(options)
        }
    }

    async function getPostContent(options) {
        const {owner, repo} = options
        const {path, editMode, type} = options;
        if (editMode) {
            const res = await axiosGithub.get(`/repos/${owner}/${repo}/contents/${path}`);
            const {data: {content, sha}} = res
            return {content: Base64.decode(content), sha}

        } else {
            return {content: defaultText(type), sha: ""}
        }
    }

    function userLogin(user) {
        const {avatar_url, login} = user;
        const avatar = `<img src="${avatar_url}" width="16" height="16" />`;
        $('#imageLogo').html(avatar)
        $('#login').text("登出 github").click(function () {
            logout(options)
        });
    }

    async function getUserInfo(options) {
        if (!getAccessToken(options)) {
            return null
        }
        const user = getUser(options);
        if (user.login) {
            userLogin(user);
            return user
        } else {
            const res = await axiosGithub.get('/user', {
                headers: {
                    Authorization: `token ${getAccessToken(options)}`
                }
            });
            setUser(options, res.data)
            userLogin(getUser(options))
            return getUser(options)
        }
    }

    function error(msg, timeout, fn) {
        console.error(msg)
        const html = `<div style="background: #dc3545;color: white;padding: 0.5em 1em;border-radius: 3px">${msg.message && msg.message || msg}</div>`
        $('.vditor-tip__content').html(html)
        const parent = $('.vditor-tip__content').parent();
        parent.show()
        // parent.addClass('vditor-tip--show')
        if (!timeout) {
            timeout = 3000
        }
        setTimeout(() => {
            parent.hide()
            options.saving = false
            fn && fn()
        }, timeout)
    }

    function success(msg, timeout, fn) {
        const html = `<div style="color: white;background: #198754;padding: 0.5em 1em;border-radius: 3px">${msg}</div>`
        $('.vditor-tip__content').html(html)
        const parent = $('.vditor-tip__content').parent();
        parent.show()
        // parent.addClass('vditor-tip--show')
        if (!timeout) {
            timeout = 3000
        }
        setTimeout(() => {
            parent.hide()
            options.saving = false
            fn && fn()
        }, timeout)
    }

    //changhui
    async function savePost(options) {
        const {owner, repo} = options
        var {path, editMode, sha, content} = options
        const comment = vditor.getValue();
        const auth = getAccessToken(options)
        if (comment.trim() == content.trim()) {
            throw new Error("内容无变更！")
        }
        let res = ""
        //代表新增
        if (!editMode) {
            var title = ""

            if (/title:\s*(|[^-\s.]+)\s*$/m.test(comment)) {
                title = RegExp.$1
            }
            if (!title) {
                throw new Error("title 不合法！");
            }
            var category = "";
            if (/layout:\s*(\S+)\s*$/m.test(comment)) {
                if (RegExp.$1 == "post") {
                    category = "_posts"
                    path = `${category}/${dateFormat(new Date(), "yyyy-MM-dd")}-${title}.md`
                } else if (RegExp.$1 == "wiki") {
                    category = "_wiki"
                    path = `${category}/${title}.md`
                }
            }
            if (!category) {
                throw new Error("layout: wiki | post");
            }

            if (await getFile(owner, repo, path)) {
                throw new Error(`${path} 已经存在`)
            }
            res = await createFile(owner, repo, path, comment, auth)
            location.replace(`${location.href}#path=${path}`)
            options.editMode = true


        } else {
            if (!sha) throw new Error("文件正在创建中...稍后")
            try {
                res = await saveFile(owner, repo, path, comment, auth, sha)
            } catch (e) {
                const {content = '', sha = ''} = await getFile(owner, repo, path)
                if (sha) {
                    res = await saveFile(owner, repo, path, comment, auth, sha)
                } else {
                    throw e
                }
            }
        }
        if(res.data.content.sha){
            success("保存成功！")
            options.content = comment
            options.sha=res.data.content.sha
        }else {
            throw new Error("文件sha没获取到")
        }

    }

    function showGitHubErrorInfo(fail) {
        if (fail.response) {
            error(fail.response.data && fail.response.data.message || fail.response.data)
        } else {
            error(fail)
        }
    }


    async function createFile(owner, repo, path, comment, auth) {
        const dateStr = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
        const res = await axiosGithub.put(`/repos/${owner}/${repo}/contents/${path}`, {
            message: "create by gitpost " + dateStr,
            content: Base64.encode(comment),
        }, {
            headers: {
                Authorization: `token ${auth}`
            }
        });
        return res;
    }

    async function saveFile(owner, repo, path, comment, auth, sha) {
        const dateStr = dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
        const res = await axiosGithub.put(`/repos/${owner}/${repo}/contents/${path}`, {
            message: "update by gitpost " + dateStr,
            content: Base64.encode(comment),
            sha: sha
        }, {
            headers: {
                Authorization: `token ${auth}`
            }
        });
        return res;
    }

    async function getFile(owner, repo, path) {
        try {
            let fileInfo = await axiosGithub.get(`/repos/${owner}/${repo}/contents/${path}`)
            const {data: {content, sha}} = fileInfo;
            return {content: Base64.decode(content), sha: sha}
        } catch (e) {
        }
        return null;
    }


    function logout(options) {
        options.user = null;
        options._accessToken = null;
        window.localStorage.removeItem(GT_ACCESS_TOKEN)
        window.localStorage.removeItem("GT_USER")
        location.reload()
    }


    function login(options) {
        const {comment} = options
        window.localStorage.setItem(GT_COMMENT, encodeURIComponent(comment))
        window.location.href = getLoginLink(options)
    }


    function getUser(options) {
        const str = options.user || window.localStorage.getItem("GT_USER")
        let user={}
        if(str){
            user=JSON.parse(str);
            const  timeElapsed=new Date().getTime()-(user.loginTime||0)
            //有效期一天
            if(timeElapsed>24*3600*1000){
                return {}
            }
        }
        return user
    }

    function setUser(options, user) {
        user.loginTime=new Date().getTime()
        var str = JSON.stringify(user);
        window.localStorage.setItem("GT_USER", str)
        options.user = str
    }


    function getAccessToken(options) {
        return options._accessToke || window.localStorage.getItem(GT_ACCESS_TOKEN)
    }

    function setAccessToken(token, options) {
        window.localStorage.setItem(GT_ACCESS_TOKEN, token)
        options._accessToken = token
    }

    function getLoginLink(options) {
        const githubOauthUrl = 'https://github.com/login/oauth/authorize'
        const {clientID} = options
        const query = {
            client_id: clientID,
            redirect_uri: window.location.href,
            scope: 'public_repo',

        }
        return `${githubOauthUrl}?${queryStringify(query)}`
    }

    function isAdmin(options) {
        const {admin} = options
        const user = getUser(options)
        return user.login && admin && admin.toLowerCase().includes(user.login.toLowerCase())
    }

    async function initUserPost(options) {
        const user = await getUserInfo(options);
        const {content, sha} = await getPostContent(options);
        vditor.setValue(content)
        options.content = content
        options.sha = sha
    }
})

