var should = require('chai').should();
var chrome = require('./firefox');
var waitSeconds = 10;
var moduleName = require('./package').name;

var browser;
var headless = true;

describe(moduleName, function(){
    describe('initializes', function(){

        it('a simple instance', function(done){
            this.timeout(waitSeconds * 1000);
            chrome.initialize({
                //headless: headless //i don't think this is supported right now
            }, function(err, instance){
                should.not.exist(err);
                should.exist(instance);
                should.exist(instance.pages);
                should.exist(instance);
                should.exist(instance.newPage);
                browser = instance;
                should.exist(browser);
                done();
            });
        });
    });

    describe('pages', function(){

        it('a single page', function(done){
            this.timeout(waitSeconds * 1000);
            should.exist(browser);
            chrome.newContext(browser, function(err, page){
                should.not.exist(err);
                page.on('console', function(message){
                    try{
                        if(message.type().substr(0, 3) === 'log'){
                            var text = `${message.text()}`;
                            if(text === 'DONE'){ //maybe a
                                page.close().then(function(){
                                    done()
                                }).catch(function(ex){ should.not.exist(ex) });
                            }
                        }
                    }catch(ex){ should.not.exist(ex) }
                });
                page.setContent(`<html>
                        <head>
                            <title>${moduleName} test</title>
                        </head>
                        <body>
                            <script>
                                console.log('DONE');
                            </script>
                        </body>
                    </html>`
                ).catch(function(ex){ should.not.exist(ex) });
            });
        });

        after(function(done){
            browser.close().then(function(){
                done();
            }).catch(function(ex){ should.not.exist(ex) });
        })
    });
});

//promises made mocha super awesome! :P.
var unhandledRejectionExitCode = 0;

process.on("unhandledRejection", function(reason){
    unhandledRejectionExitCode = 1;
    throw reason;
});

process.prependListener("exit", function(code){
    if(code === 0) process.exit(unhandledRejectionExitCode);
});
// /super awesome
