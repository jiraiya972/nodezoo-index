/* Copyright (c) 2014 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
"use strict";


var request = require('request')



module.exports = function index( options ){
  var seneca = this

  options = seneca.util.deepextend({
    elastic: 'http://localhost:9200/',
    base:    'zoo'
  },options)


  seneca.add(
    'role:search,cmd:insert', 
    {
      data: { required$:true, object$:true },
    }, 
    cmd_insert)

  seneca.add(
    'role:search,cmd:search', 
    {
      query: { required$:true, string$:true },
    }, 
    cmd_search)



  function cmd_insert( args, done ) {
    var seneca  = this

    var url = options.elastic+options.base+'/mod/'+args.data.name

    request({
      url:    url,
      method: 'POST',
      json:   args.data
    }, function(err,res,body){
      done(err,body)
    })
  }


  function cmd_search( args, done ) {
    var seneca  = this

    var url = options.elastic+options.base+'/_search?q='+
          encodeURIComponent(args.query)

    console.log(url)

    request({
      url:    url,
      method: 'GET',
    }, function(err,res,body){
      if( err ) return done(err);

      var qr = JSON.parse(body)
      var items = []

      var hits = qr.hits && qr.hits.hits

      if( hits ) {
        for( var i = 0; i < hits.length; i++ ) {
          var hit = hits[i]
          items.push( hit._source )
        }
      }

      return done(null,{items:items})
    })
  }

    
}
