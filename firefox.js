var puppeteer = require('puppeteer');

var extraArgs = [
    //'--enable-features=NetworkService',
    //'--no-sandbox',
    //'--disable-setuid-sandbox',
    //'--disable-dev-shm-usage',
    //'--disable-web-security',
    //'--disable-features=IsolateOrigins,site-per-process',
    //'--shm-size=3gb', // this solves the issue
]

module.exports = {
    initialize : function(options, cb){
        //return puppeteer instance
        if(options.args) options.args = options.args.concat(extraArgs);
        else options.args = extraArgs;
        puppeteer.launch({
            args : options.args,
            product: 'firefox',
            headless:!options.debug
        }).then(function(instance){
            cb(null, instance);
        }).catch(function(ex){
            cb(ex);
        })
    },
    name: 'chrome',
    newContext : function(instance, cb){
        instance.newPage().then(function(page){
            cb(null, page);
        }).catch(function(ex){
            cb(ex);
        })
    },
    runTests : function(page, tests, testList, cb){
        //todo: inject deps
        var errs = [];
        var done;
        page.on('console', function(message){
            try{
                if(message.type().substr(0, 3) === 'log'){
                    var text = `${message.text()}`;
                    if(text[0] === '['){ //maybe a
                        var data = JSON.parse(text);
                        if(typeof data[0] === 'string'){
                            if(data[0] === 'pass'){
                                done = true;
                                cb(null, data[1]);
                            }
                            if(data[0] === 'fail'){
                                var error = new Error('Test Fail');
                                error.testName = data[0].title;
                                error.duration = data[0].duration;
                                cb(error);
                            }
                        }
                    }
                }
            }catch(ex){
                errs.push(ex);
            }
        });
        var testHTML = tests.as('html');
        page.setContent(`<html>
                <head>
                    <title>peer-pressure test</title>
                </head>
                <body>
                    ${testHTML}
                </body>
            </html>`
        ).then(function(){
        }).catch(function(ex){
            if(ex && !done) cb(ex);
        })
    }
}
