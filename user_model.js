
const mongoose = require('mongoose')
const  UserSchema = mongoose.Schema(
    {
      name : {
          type : String ,
          required : [true,"Must Insert A Name"] ,
          minlength : [3,"Too short  Name"],
          maxlength : [30,"Too long  Name"],
          trim : true
      },
      email : {
        type : String ,
        required : [true,"email is required"],
        unique : [true,"email is already in use"],
      } ,
    },{
      timestamps : true
    }
  )

  module.exports = mongoose.model("TempUser",UserSchema)
