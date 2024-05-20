class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        // DOUBT: Why the above line is needed ?

        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            // DOUBT: What is happening here ?
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}