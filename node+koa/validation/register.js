const validator = require('validator');
const isEmpty = require('./isEmpty')

module.exports = function validateRegisterInput(data){
    let errors = {};

    if(!validator.isLength(data.name,{min:2,max:30})){
        errors.name = "名字不能小于2位且不能超过30位"
    }

    return {
        errors,
        isValid:isEmpty(errors)
    }
}