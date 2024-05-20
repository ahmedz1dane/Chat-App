class ApiResponse {
    constructor(statusCode, data, message = "Success" ){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
        // that means , if the status code is less than
        // 400 success will become true
    }
}


export {ApiResponse}