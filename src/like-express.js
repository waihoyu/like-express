/*
 *@description:  中间件原理-代码实现
 *@author: Wai HoYu
 *@date: 2019-10-12 10:36:23
 *@version: V1.0.5
*/

const http = require('http');
const slice = Array.prototype.slice;
class LikeExpress{
    constructor(){
        //存放中间件的列表
        this.routes = {
            all:  [],
            get:  [],
            post: []
        }
    }
    register(path){
        const info = {};
        if (typeof path === 'string') {
            info.path = path
            info.stack = slice.call(arguments, 1)
        }else{
            info.path = '/'
            info.stack = slice.call(arguments, 0)
        }
        return info;
    }
    use(){
        const info = this.register.apply(this, arguments);
        this.routes.all.push(info);
    }
    get(){
        const info = this.register.apply(this, arguments);
        this.routes.get.push(info);
    }
    post(){
        const info = this.register.apply(this, arguments);
        this.routes.post.push(info);
    }
    match(method, url){
        let stack = [];
        if (url === '/favicon.ico') {
            return stack;
        }
        let curRoutes = [];
        curRoutes = curRoutes.concat(this.routes.all);
        curRoutes = curRoutes.concat(this.routes[method]);
        curRoutes.forEach(routeInfo => {
            if (url.indexOf(routeInfo.path) === 0) {
                stack = stack.concat(routeInfo.stack);    
            }
        })  
        return stack;     
    }
    handle(req, res, stack){
        const next = () =>{
            const middleware = stack.shift();
            if (middleware) {
                middleware(req, res, next);  
            }
        }
        next();
    }
    callback() {
        return (req, res)=> {
            res.json = (data) => {
                res.setHeader('Content-type','application/json');
                res.end(JSON.stringify(data));
            };
            const url = req.url;
            const method = req.method.toLowerCase();
            const resultList = this.match(method, url);
            this.handle(req, res, resultList);
        }
    }
    listen(...arguments){
        const server = http.createServer(this.callback());
        server.listen(...arguments);
    }
}

//工厂函数
module.exports = ()=>{
    return new LikeExpress()
}
