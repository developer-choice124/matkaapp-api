function matcher(regexp:any) {
    return function (obj:any) {
    var found = false;
    Object.keys(obj).forEach(function(key){
      if ( ! found) {
        if ((typeof obj[key] == 'string') && regexp.exec(obj[key])) {
          found = true;
        }
      }
    });
    return found;
    };
  }


  function filter(teststrings:any,JsonData:any ){
      var FilterDAta:any = [];
      teststrings.forEach(function(needle:any) {
        var re1 = new RegExp("\\b" + needle + "\\b", 'i');
        var matches = JsonData.filter(matcher(re1));
        if(matches){
            FilterDAta.push(matches)
        }
        return FilterDAta;
      });
  }


  export {
      filter
  }